const { productOps } = require("../services/supabaseService");
const { fetchProductByBarcode, mergeProductData } = require("../services/openFoodFactsService");

/**
 * GET /products - Get all products
 */
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    console.log(`🔍 [Backend] Fetching products (Page ${page}, Limit ${limit})...`);
    const result = await productOps.getAll({ page, limit });

    console.log(`✅ [Backend] Successfully fetched ${result.data.length} products (Total: ${result.count})`);
    res.json(result);
  } catch (error) {
    console.error("❌ [Backend] Error fetching products:", error);
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * GET /products/:id - Get single product
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productOps.getById(id);

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

    // Ensure Brand Consistency: Upsert brand and get ID
    if (productData.brand) {
      try {
        const { brandOps } = require("../services/supabaseService");
        const brandRecord = await brandOps.upsert({ name: productData.brand });
        if (brandRecord && brandRecord.id) {
          productData.brandId = brandRecord.id;
        }
      } catch (err) {
        console.warn("Failed to auto-link brand:", err.message);
        // Proceed without blocking product creation
      }
    }

    try {
      const product = await productOps.create(productData);
      res.status(201).json({
        message: "Product created successfully",
        product,
      });
    } catch (insertError) {
      // Fallback: If 'brandId' column doesn't exist, retry without it
      const errMsg = insertError.message || '';
      if (errMsg.includes('brandId') && (errMsg.includes('column') || errMsg.includes('schema cache') || errMsg.includes('does not exist'))) {
        console.warn("⚠️ 'brandId' column missing in DB. Retrying creation without linking brand.");
        delete productData.brandId;
        const productFallback = await productOps.create(productData);
        return res.status(201).json({
          message: "Product created successfully (Brand link skipped due to schema mismatch)",
          product: productFallback,
        });
      }
      throw insertError; // Re-throw other errors
    }
  } catch (error) {
    console.error("❌ Error creating product:", error);
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

    let product = await productOps.getById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let updates = {};

    // If refreshFromBarcode is true and barcode is provided, fetch from Open Food Facts
    if (refreshFromBarcode && barcode && barcode.trim() !== "") {
      const offData = await fetchProductByBarcode(barcode);

      if (offData) {
        updates = {
          name: offData.name || product.name,
          brand: offData.brand || product.brand,
          category: offData.category || product.category,
          picture: offData.picture || product.picture,
          nutritionalInfo: { ...product.nutritionalInfo, ...offData.nutritionalInfo },
          openFoodFactsId: offData.openFoodFactsId,
          barcode: barcode,
        };
      } else {
        return res.status(404).json({ message: "Product not found in Open Food Facts API" });
      }
    } else {
      // Manual update
      if (name) updates.name = name;
      if (brand) updates.brand = brand;
      if (picture) updates.picture = picture;
      if (price) updates.price = parseFloat(price);
      if (category) updates.category = category;
      if (nutritionalInfo) updates.nutritionalInfo = nutritionalInfo;
      if (quantityInStock !== undefined) updates.quantityInStock = parseInt(quantityInStock);
      if (description) updates.description = description;
      if (barcode) updates.barcode = barcode;
    }

    product = await productOps.update(id, updates);

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

/**
 * DELETE /products/:id - Delete product (Admin only)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productOps.getById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await productOps.delete(id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

/**
 * GET /products/lookup/:barcode - Lookup product in Open Food Facts
 */
exports.lookupProduct = async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ message: "Barcode is required" });
    }

    const offData = await fetchProductByBarcode(barcode);

    if (!offData) {
      return res.status(404).json({ message: "Product not found in Open Food Facts" });
    }

    res.json(offData);
  } catch (error) {
    res.status(500).json({ message: "Error looking up product", error: error.message });
  }
};
