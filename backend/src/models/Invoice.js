const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Invoice = sequelize.define(
  "Invoice",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Made nullable for direct invoice checkout without Order
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "cancelled"),
      defaultValue: "pending",
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
      defaultValue: "pending",
    },
    paymentProvider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentReference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    billingAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    billingCity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    billingZipCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    billingCountry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "Invoices",
    timestamps: true,
  }
);

// Associations
const User = require("./User");

Invoice.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Invoice, { foreignKey: "userId" });
// Removed Order association since orderId can be null for direct checkout

module.exports = Invoice;
