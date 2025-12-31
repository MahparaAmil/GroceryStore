const Invoice = require("../models/Invoice");
const User = require("../models/User");
const Product = require("../models/Product");

const toInvoiceDto = (invoice) => {
  const plain = invoice?.toJSON ? invoice.toJSON() : invoice;

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
      invoices = await Invoice.findAll({
        include: [{ model: User, attributes: ["id", "email"] }],
        order: [["createdAt", "DESC"]],
      });
    } else {
      // Customer sees only their invoices
      invoices = await Invoice.findAll({
        where: { userId: req.user.id },
        include: [{ model: User, attributes: ["id", "email"] }],
        order: [["createdAt", "DESC"]],
      });
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
    const invoice = await Invoice.findByPk(id, {
      include: [{ model: User, attributes: ["id", "email"] }],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Check authorization: customer can only see their own, admin can see all
    if (req.user.role === "customer" && invoice.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(toInvoiceDto(invoice));
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
    const user = await User.findByPk(targetUserId);
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

      const product = await Product.findByPk(item.productId);
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
      product.quantityInStock -= itemQuantity;
      if (product.quantityInStock < 0) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ${product.name}` 
        });
      }
      await product.save();
    }

    const invoice = await Invoice.create({
      userId: targetUserId,
      invoiceNumber: generateInvoiceNumber(),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      items: processedItems,
      billingAddress,
      billingCity,
      billingZipCode,
      billingCountry,
      notes,
      paymentMethod: paymentMethod || "cash_on_delivery",
      status: "completed",
    });

    const populatedInvoice = await Invoice.findByPk(invoice.id, {
      include: [{ model: User, attributes: ["id", "email"] }],
    });

    res.status(201).json({
      message: "Invoice created successfully",
      invoice: populatedInvoice,
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

    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Update fields if provided
    if (status) invoice.status = status;
    if (paymentStatus) {
      invoice.paymentStatus = paymentStatus;
      if (paymentStatus === "completed") {
        invoice.paidAt = new Date();
      }
    }
    if (paymentReference) invoice.paymentReference = paymentReference;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (billingAddress) invoice.billingAddress = billingAddress;
    if (billingCity) invoice.billingCity = billingCity;
    if (billingZipCode) invoice.billingZipCode = billingZipCode;
    if (billingCountry) invoice.billingCountry = billingCountry;
    if (notes) invoice.notes = notes;

    await invoice.save();

    const updatedInvoice = await Invoice.findByPk(id, {
      include: [{ model: User, attributes: ["id", "email"] }],
    });

    res.json({
      message: "Invoice updated successfully",
      invoice: toInvoiceDto(updatedInvoice),
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

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const normalized = String(status || "").toLowerCase();

    if (normalized === "paid") {
      invoice.status = "completed";
      invoice.paymentStatus = "completed";
      invoice.paidAt = new Date();
    } else if (normalized === "pending") {
      invoice.status = "pending";
      invoice.paymentStatus = "pending";
      invoice.paidAt = null;
    } else if (normalized === "cancelled") {
      invoice.status = "cancelled";
    } else if (normalized === "refunded") {
      invoice.paymentStatus = "refunded";
      invoice.status = "cancelled";
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }

    await invoice.save();

    const updated = await Invoice.findByPk(id, {
      include: [{ model: User, attributes: ["id", "email"] }],
    });

    res.json({
      message: "Invoice status updated successfully",
      invoice: toInvoiceDto(updated),
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

    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.paymentStatus === "completed") {
      return res.status(400).json({ message: "Cannot delete paid invoices" });
    }

    // Restore stock for deleted invoice
    if (invoice.items && Array.isArray(invoice.items)) {
      for (const item of invoice.items) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          product.quantityInStock += item.quantity;
          await product.save();
        }
      }
    }

    await invoice.destroy();

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

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const invoices = await Invoice.findAll({
      where: { userId: userId },
      include: [{ model: User, attributes: ["id", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json(invoices.map(toInvoiceDto));
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
    let guestUser = await User.findOne({ where: { email: guestEmail } });

    if (!guestUser) {
      // Create new guest user
      guestUser = await User.create({
        email: guestEmail,
        password: null, // No password for guests
        role: "customer",
        isGuest: true,
      });
    }

    // Calculate total and verify products
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({ message: "Each item must have productId and quantity" });
      }

      const product = await Product.findByPk(item.productId);
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
      product.quantityInStock -= itemQuantity;
      if (product.quantityInStock < 0) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ${product.name}` 
        });
      }

      await product.save();
    }

    // Create invoice
    const invoice = await Invoice.create({
      orderId: null, // Direct invoice without separate order
      userId: guestUser.id,
      invoiceNumber: generateInvoiceNumber(),
      totalAmount: totalAmount.toFixed(2),
      items: processedItems,
      billingAddress: billingAddress || null,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: paymentMethod || "cash_on_delivery",
    });

    // Update user order count
    guestUser.ordersCount += 1;
    guestUser.lastOrderAt = new Date();
    await guestUser.save();

    res.status(201).json({
      message: "Guest checkout successful",
      invoice: toInvoiceDto(invoice),
      userId: guestUser.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing guest checkout", error: error.message });
  }
};
