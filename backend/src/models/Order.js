const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  guestInfo: {
    type: DataTypes.JSON,
    allowNull: true
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  deliveryMethod: {
    type: DataTypes.ENUM('standard', 'express', 'same'),
    allowNull: false
  },
  deliveryAddress: {
    type: DataTypes.JSON,
    allowNull: false
  },
  deliveryInstructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.ENUM('card', 'cash'),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    defaultValue: 'pending'
  },
  estimatedDelivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualDelivery: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "Orders",
  timestamps: true
});

// Associations
const User = require('./User');

Order.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });

module.exports = Order;
