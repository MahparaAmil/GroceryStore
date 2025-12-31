const Product = require("../models/Product");
const { fetchProductByBarcode, mergeProductData } = require("../services/openFoodFactsService");

/**
 * GET /products - Get all products
 */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

/**
 * GET /products/:id - Get single product
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

/**
 * POST /products - Create new product (Admin only)
 * Supports barcode integration with Open Food Facts API
 */
exports.createProduct = async (req, res) => {
  try {
    const { name, brand, picture, price, category, nutritionalInfo, quantityInStock, description, barcode } = req.body;

    // Validate required fields
    if (!name || !price || !category || quantityInStock === undefined) {
      return res.status(400).json({ 
        message: "Missing required fields: name, price, category, quantityInStock" 
      });
    }

    let productData = {
      name,
      brand,
      picture,
      price: parseFloat(price),
      category,
      nutritionalInfo: nutritionalInfo || {},
      quantityInStock: parseInt(quantityInStock),
      description,
      barcode,
    };

    // If barcode is provided, fetch data from Open Food Facts
    if (barcode && barcode.trim() !== "") {
      const offData = await fetchProductByBarcode(barcode);
      
      if (offData) {
        productData = mergeProductData(productData, offData);
        productData.openFoodFactsId = offData.openFoodFactsId;
      } else {
        // Barcode provided but not found in Open Food Facts
        // Still create product with provided data
        console.warn(`Barcode ${barcode} not found in Open Food Facts API`);
      }
    }

    const product = await Product.create(productData);

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Barcode already exists" });
    }
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

/**
 * PUT /products/:id - Update product (Admin only)
 * Can update using barcode to refresh Open Food Facts data
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, picture, price, category, nutritionalInfo, quantityInStock, description, barcode, refreshFromBarcode } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If refreshFromBarcode is true and barcode is provided, fetch from Open Food Facts
    if (refreshFromBarcode && barcode && barcode.trim() !== "") {
      const offData = await fetchProductByBarcode(barcode);
      
      if (offData) {
        product.name = offData.name || product.name;
        product.brand = offData.brand || product.brand;
        product.category = offData.category || product.category;
        product.picture = offData.picture || product.picture;
        product.nutritionalInfo = { ...product.nutritionalInfo, ...offData.nutritionalInfo };
        product.openFoodFactsId = offData.openFoodFactsId;
        product.barcode = barcode;
      } else {
        return res.status(404).json({ message: "Product not found in Open Food Facts API" });
      }
    } else {
      // Manual update
      if (name) product.name = name;
      if (brand) product.brand = brand;
      if (picture) product.picture = picture;
      if (price) product.price = parseFloat(price);
      if (category) product.category = category;
      if (nutritionalInfo) product.nutritionalInfo = nutritionalInfo;
      if (quantityInStock !== undefined) product.quantityInStock = parseInt(quantityInStock);
      if (description) product.description = description;
      if (barcode) product.barcode = barcode;
    }

    await product.save();

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Barcode already exists" });
    }
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

/**
 * DELETE /products/:id - Delete product (Admin only)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};
