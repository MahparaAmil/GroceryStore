const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: true, // Made nullable for guest users without passwords
    },

    ordersCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    lastOrderAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    isGuest: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    role: {
      type: DataTypes.ENUM("admin", "customer"),
      defaultValue: "admin",
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

module.exports = User;
