const { invoiceOps, productOps, userOps } = require("../services/supabaseService");
const { v4: uuidv4 } = require("uuid");

const toInvoiceDto = (invoice) => {
  const plain = invoice || {};

  const derivedStatus =
    plain?.paymentStatus === "refunded"
      ? "refunded"
      : plain?.status === "completed"
        ? "paid"
        : plain?.status;

  const items = Array.isArray(plain?.items)
    ? plain.items.map((item) => {
      if (item?.product?.name) return item;
      const name = item?.productName || item?.name;
      if (!name) return item;
      return { ...item, product: { name } };
    })
    : plain?.items;

  return {
    ...plain,
    total: plain?.total ?? plain?.totalAmount,
    status: derivedStatus,
    items,
  };
};

/**
 * Generate unique invoice number
 */
const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

/**
 * GET /invoices - Get all invoices (Admin: all, Customer: own)
 */
exports.getInvoices = async (req, res) => {
  try {
    let invoices;

    if (req.user.role === "admin") {
      // Admin sees all invoices
      invoices = await invoiceOps.getAll();

      // Enrich with user data
      invoices = await Promise.all(
        invoices.map(async (inv) => {
          if (inv.userId) {
            const user = await userOps.findById(inv.userId);
            return { ...inv, user: user ? { id: user.id, email: user.email } : null };
          }
          return inv;
        })
      );
    } else {
      // Customer sees only their invoices
      invoices = await invoiceOps.getByUserId(req.user.id);

      // Enrich with user data
      const user = await userOps.findById(req.user.id);
      invoices = invoices.map(inv => ({
        ...inv,
        user: user ? { id: user.id, email: user.email } : null
      }));
    }

    res.json(invoices.map(toInvoiceDto));
  } catch (error) {
    res.status(500).json({ message: "Error fetching invoices", error: error.message });
  }
};

/**
 * GET /invoices/:id - Get single invoice
 */
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await invoiceOps.getById(id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Check authorization: customer can only see their own, admin can see all
    if (req.user.role === "customer" && invoice.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Enrich with user data
    const user = await userOps.findById(invoice.userId);
    const enrichedInvoice = {
      ...invoice,
      user: user ? { id: user.id, email: user.email } : null
    };

    res.json(toInvoiceDto(enrichedInvoice));
  } catch (error) {
    res.status(500).json({ message: "Error fetching invoice", error: error.message });
  }
};

/**
 * POST /invoices - Create new invoice (Customer creates own, Admin can create for anyone)
 */
exports.createInvoice = async (req, res) => {
  try {
    const { userId, items, billingAddress, billingCity, billingZipCode, billingCountry, notes, paymentMethod } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required and must not be empty" });
    }

    // Authorization: customer can only create for themselves
    const targetUserId = req.user.role === "admin" && userId ? userId : req.user.id;

    if (req.user.role === "customer" && userId && userId !== req.user.id) {
      return res.status(403).json({ message: "Customers can only create invoices for themselves" });
    }

    // Verify user exists
    const user = await userOps.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate total and verify products
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({ message: "Each item must have productId and quantity" });
      }

      const product = await productOps.getById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      const itemPrice = parseFloat(product.price);
      const itemQuantity = parseInt(item.quantity);
      const subtotal = itemPrice * itemQuantity;

      processedItems.push({
        productId: product.id,
        productName: product.name,
        quantity: itemQuantity,
        price: itemPrice,
        subtotal: subtotal,
      });

      totalAmount += subtotal;

      // Decrease stock
      const newStock = product.quantityInStock - itemQuantity;
      if (newStock < 0) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product.name}`
        });
      }
      await productOps.update(product.id, { quantityInStock: newStock });
    }

    const invoice = await invoiceOps.create({
      id: Math.floor(Math.random() * 1000000000), // Safe Int
      userId: targetUserId,
      invoiceNumber: generateInvoiceNumber(),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      items: processedItems,
      billingAddress: billingAddress || null,
      billingCity: billingCity || null,
      billingZipCode: billingZipCode || null,
      billingCountry: billingCountry || null,
      notes: notes || null,
      paymentMethod: paymentMethod || "cash_on_delivery",
      status: "completed",
      paymentStatus: "pending",
    });

    // Enrich with user data
    const enrichedInvoice = {
      ...invoice,
      user: { id: user.id, email: user.email }
    };

    res.status(201).json({
      message: "Invoice created successfully",
      invoice: enrichedInvoice,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating invoice", error: error.message });
  }
};

/**
 * PUT /invoices/:id - Update invoice (Admin only)
 */
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, paymentReference, paymentMethod, billingAddress, billingCity, billingZipCode, billingCountry, notes } = req.body;

    const invoice = await invoiceOps.getById(id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Build update object
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === "completed") {
        updateData.paidAt = new Date().toISOString();
      }
    }
    if (paymentReference) updateData.paymentReference = paymentReference;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (billingAddress) updateData.billingAddress = billingAddress;
    if (billingCity) updateData.billingCity = billingCity;
    if (billingZipCode) updateData.billingZipCode = billingZipCode;
    if (billingCountry) updateData.billingCountry = billingCountry;
    if (notes) updateData.notes = notes;

    const updatedInvoice = await invoiceOps.update(id, updateData);

    // Enrich with user data
    const user = await userOps.findById(updatedInvoice.userId);
    const enrichedInvoice = {
      ...updatedInvoice,
      user: user ? { id: user.id, email: user.email } : null
    };

    res.json({
      message: "Invoice updated successfully",
      invoice: toInvoiceDto(enrichedInvoice),
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating invoice", error: error.message });
  }
};

/**
 * PATCH /invoices/:id/status - Update invoice status (Admin only)
 */
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const invoice = await invoiceOps.getById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const normalized = String(status || "").toLowerCase();
    const updateData = {};

    if (normalized === "paid") {
      updateData.status = "completed";
      updateData.paymentStatus = "completed";
      updateData.paidAt = new Date().toISOString();
    } else if (normalized === "pending") {
      updateData.status = "pending";
      updateData.paymentStatus = "pending";
      updateData.paidAt = null;
    } else if (normalized === "cancelled") {
      updateData.status = "cancelled";
    } else if (normalized === "refunded") {
      updateData.paymentStatus = "refunded";
      updateData.status = "cancelled";
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await invoiceOps.update(id, updateData);

    // Enrich with user data
    const user = await userOps.findById(updated.userId);
    const enrichedInvoice = {
      ...updated,
      user: user ? { id: user.id, email: user.email } : null
    };

    res.json({
      message: "Invoice status updated successfully",
      invoice: toInvoiceDto(enrichedInvoice),
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating invoice status", error: error.message });
  }
};

/**
 * DELETE /invoices/:id - Delete invoice (Admin only, only if not paid)
 */
exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await invoiceOps.getById(id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.paymentStatus === "completed") {
      return res.status(400).json({ message: "Cannot delete paid invoices" });
    }

    // Restore stock for deleted invoice
    if (invoice.items && Array.isArray(invoice.items)) {
      for (const item of invoice.items) {
        const product = await productOps.getById(item.productId);
        if (product) {
          const newStock = product.quantityInStock + item.quantity;
          await productOps.update(product.id, { quantityInStock: newStock });
        }
      }
    }

    await invoiceOps.delete(id);

    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting invoice", error: error.message });
  }
};

/**
 * GET /invoices/user/:userId - Get all invoices for a specific user (Admin only)
 */
exports.getUserInvoices = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userOps.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const invoices = await invoiceOps.getByUserId(userId);

    // Enrich with user data
    const enrichedInvoices = invoices.map(inv => ({
      ...inv,
      user: { id: user.id, email: user.email }
    }));

    res.json(enrichedInvoices.map(toInvoiceDto));
  } catch (error) {
    res.status(500).json({ message: "Error fetching user invoices", error: error.message });
  }
};

/**
 * POST /invoices/guest-checkout - Create invoice as guest (no auth required)
 */
exports.guestCheckout = async (req, res) => {
  try {
    const { items, guestEmail, guestName, billingAddress, paymentMethod } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required and must not be empty" });
    }

    if (!guestEmail || !guestName) {
      return res.status(400).json({ message: "Guest email and name are required" });
    }

    // Check if guest email already exists
    let guestUser = await userOps.findByEmail(guestEmail);

    if (!guestUser) {
      // Create new guest user
      guestUser = await userOps.create({
        email: guestEmail,
        password: null,
        role: "customer",
        isGuest: true,
        ordersCount: 0,
        lastOrderAt: null
      });
    }

    // Calculate total and verify products
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({ message: "Each item must have productId and quantity" });
      }

      const product = await productOps.getById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      const itemPrice = parseFloat(product.price);
      const itemQuantity = parseInt(item.quantity);
      const subtotal = itemPrice * itemQuantity;

      processedItems.push({
        productId: product.id,
        productName: product.name,
        quantity: itemQuantity,
        price: itemPrice,
        subtotal: subtotal,
      });

      totalAmount += subtotal;

      // Decrease stock
      const newStock = product.quantityInStock - itemQuantity;
      if (newStock < 0) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product.name}`
        });
      }
      await productOps.update(product.id, { quantityInStock: newStock });
    }

    // Create invoice
    const invoice = await invoiceOps.create({
      id: Math.floor(Math.random() * 1000000000), // Safe Int
      orderId: null,
      userId: guestUser.id,
      invoiceNumber: generateInvoiceNumber(),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      items: processedItems,
      billingAddress: billingAddress || null,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: paymentMethod || "cash_on_delivery",
    });

    // Update user order count
    await userOps.update(guestUser.id, {
      ordersCount: (guestUser.ordersCount || 0) + 1,
      lastOrderAt: new Date().toISOString()
    });

    res.status(201).json({
      message: "Guest checkout successful",
      invoice: toInvoiceDto(invoice),
      userId: guestUser.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing guest checkout", error: error.message });
  }
};
