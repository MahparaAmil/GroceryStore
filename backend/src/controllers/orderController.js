const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Generate unique order number
const generateOrderNumber = () => {
  return 'TR' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Calculate estimated delivery time based on method
const calculateEstimatedDelivery = (method) => {
  const now = new Date();
  switch (method) {
    case 'same':
      return new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
    case 'express':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    case 'standard':
      return new Date(now.getTime() + 72 * 60 * 60 * 1000); // 3 days
    default:
      return new Date(now.getTime() + 72 * 60 * 60 * 1000);
  }
};

// Generate unique invoice number
const generateInvoiceNumber = () => {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Create new order
const createOrder = async (req, res) => {
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

    // If this is a guest order, ensure we have a user record to link to (so user table is updated)
    if (!resolvedUserId && guestInfo?.email) {
      const normalizedEmail = String(guestInfo.email).trim().toLowerCase();
      const [guestUser] = await User.findOrCreate({
        where: { email: normalizedEmail },
        defaults: {
          email: normalizedEmail,
          password: await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10),
          role: 'customer',
          isGuest: true
        }
      });
      resolvedUserId = guestUser.id;
    }

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    // Update user tracking fields (for both logged-in and guest users if we have a user id)
    if (resolvedUserId) {
      try {
        await User.increment('ordersCount', { by: 1, where: { id: resolvedUserId } });
        await User.update({ lastOrderAt: new Date() }, { where: { id: resolvedUserId } });
      } catch (userUpdateError) {
        console.error('Error updating user order tracking:', userUpdateError);
      }
    }

    // Create order
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: resolvedUserId,
      guestInfo: guestInfo || null,
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryMethod,
      deliveryAddress,
      deliveryInstructions: deliveryInstructions || '',
      paymentMethod,
      estimatedDelivery: calculateEstimatedDelivery(deliveryMethod)
    });

    // Generate invoice for the order
    try {
      if (resolvedUserId) {
        const invoiceItems = Array.isArray(items)
          ? items.map((item) => {
              const productId = item.productId ?? item.id;
              const productName = item.productName ?? item.name;
              const quantity = item.quantity;
              const price = item.price;
              const computedSubtotal =
                item.subtotal ?? (typeof price === 'number' && typeof quantity === 'number' ? price * quantity : item.subtotal);
              return {
                ...item,
                productId,
                productName,
                subtotal: computedSubtotal,
                product: productName ? { name: productName } : item.product
              };
            })
          : items;

        await Invoice.create({
          invoiceNumber: generateInvoiceNumber(),
          userId: resolvedUserId,
          totalAmount: total,
          items: invoiceItems,
          paymentStatus: paymentMethod === 'cash' ? 'pending' : 'completed',
          paymentMethod: paymentMethod,
          status: paymentMethod === 'cash' ? 'pending' : 'completed'
        });
      }
    } catch (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      // Continue even if invoice creation fails
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery,
        total: order.total
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// Get all orders (for admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Get orders by user ID
const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch user orders' });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update status and actual delivery time if delivered
    const updateData = { status };
    if (status === 'delivered') {
      updateData.actualDelivery = new Date();
    }
    
    await order.update(updateData);
    
    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrdersByUserId,
  getOrderById,
  updateOrderStatus
};
