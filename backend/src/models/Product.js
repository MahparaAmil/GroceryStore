const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    picture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    nutritionalInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        calories: null,
        protein: null,
        carbs: null,
        fat: null,
        fiber: null,
      },
    },

    quantityInStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    openFoodFactsId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

module.exports = Product;
