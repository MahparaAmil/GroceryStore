const { orderOps, invoiceOps, userOps } = require('../services/supabaseService');
const { v4: uuidv4 } = require('uuid');

// Generate unique order number
const generateOrderNumber = () => {
  return 'TR' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Calculate estimated delivery time
const calculateEstimatedDelivery = (method) => {
  const now = new Date();
  switch (method) {
    case 'same':
      return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    case 'express':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'standard':
      return new Date(now.getTime() + 72 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 72 * 60 * 60 * 1000);
  }
};

/**
 * POST /orders - Create new order
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      guestInfo,
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryMethod,
      deliveryAddress,
      deliveryInstructions,
      paymentMethod
    } = req.body;

    let resolvedUserId = userId || null;

    // If guest checkout, create temporary guest user
    if (!userId && guestInfo) {
      try {
        const guestUser = await userOps.create({
          id: uuidv4(),
          email: guestInfo.email || `guest-${Date.now()}@guest.com`,
          password: null,
          role: 'customer',
          isGuest: true,
          ordersCount: 0,
          lastOrderAt: null
        });
        resolvedUserId = guestUser.id;
      } catch (error) {
        console.error('Error creating guest user:', error);
      }
    }

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    // Update user tracking
    if (resolvedUserId) {
      try {
        const user = await userOps.findById(resolvedUserId);
        await userOps.update(resolvedUserId, {
          ordersCount: (user.ordersCount || 0) + 1,
          lastOrderAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }

    // Create order
    const order = await orderOps.create({
      id: uuidv4(),
      orderNumber: generateOrderNumber(),
      userId: resolvedUserId,
      guestInfo: guestInfo || null,
      items,
      subtotal,
      deliveryFee,
      total,
      status: 'pending',
      deliveryMethod,
      deliveryAddress,
      deliveryInstructions: deliveryInstructions || '',
      paymentMethod,
      paymentStatus: 'pending'
    });

    // Create invoice
    try {
      const invoice = await invoiceOps.create({
        id: uuidv4(),
        orderId: order.id,
        userId: resolvedUserId,
        invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        totalAmount: total,
        items,
        status: paymentMethod === 'cash' ? 'pending' : 'completed',
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'completed',
        paymentMethod
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

/**
 * GET /orders - Get all orders (Admin: all, Customer: own)
 */
exports.getOrders = async (req, res) => {
  try {
    let orders;
    
    if (req.user.role === 'admin') {
      orders = await orderOps.getAll();
    } else {
      orders = await orderOps.getByUserId(req.user.id);
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

/**
 * GET /orders/:id - Get single order
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderOps.getById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check access
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

/**
 * PUT /orders/:id - Update order (Admin only)
 */
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await orderOps.getById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const updatedOrder = await orderOps.update(id, updates);

    res.json({
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

/**
 * DELETE /orders/:id - Delete order (Admin only)
 */
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderOps.getById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await orderOps.delete(id);

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};

// Compatibility exports for legacy routes
exports.getAllOrders = exports.getOrders;
exports.getOrdersByUserId = async (req, res) => {
  req.user = { id: req.params.userId, role: 'customer' };
  return exports.getOrders(req, res);
};
exports.updateOrderStatus = async (req, res) => {
  req.params.id = req.params.orderId;
  return exports.updateOrder(req, res);
};
