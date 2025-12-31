const axios = require("axios");

const OPEN_FOOD_FACTS_API = "https://world.openfoodfacts.org/api/v0/product";

/**
 * Fetch product data from Open Food Facts API by barcode
 * @param {string} barcode - Product barcode
 * @returns {Promise<Object>} Product data or null if not found
 */
exports.fetchProductByBarcode = async (barcode) => {
  try {
    if (!barcode || barcode.trim() === "") {
      throw new Error("Barcode is required");
    }

    const response = await axios.get(`${OPEN_FOOD_FACTS_API}/${barcode}.json`, {
      timeout: 5000,
    });

    if (response.status === 404 || !response.data || response.data.status === 0) {
      return null;
    }

    // Extract and format the relevant data
    const productData = {
      name: response.data.product_name || null,
      brand: response.data.brands || null,
      category: response.data.categories || null,
      picture: response.data.image_url || null,
      nutritionalInfo: extractNutritionalInfo(response.data),
      openFoodFactsId: response.data.id || barcode,
      barcode: barcode,
    };

    return productData;
  } catch (error) {
    console.error(`Error fetching from Open Food Facts API for barcode ${barcode}:`, error.message);
    return null;
  }
};

/**
 * Extract nutritional information from Open Food Facts response
 * @param {Object} productData - Product data from API
 * @returns {Object} Formatted nutritional info
 */
function extractNutritionalInfo(productData) {
  const nutrition = {};

  // Extract per 100g nutritional values
  const nutriments = productData.nutriments || {};

  nutrition.calories = nutriments.energy_kcal_100g || null;
  nutrition.protein = nutriments.proteins_100g || null;
  nutrition.carbs = nutriments.carbohydrates_100g || null;
  nutrition.fat = nutriments.fat_100g || null;
  nutrition.fiber = nutriments.fiber_100g || null;

  return nutrition;
}

/**
 * Merge Open Food Facts data with existing product data
 * Preserves user-entered data, only fills missing fields
 * @param {Object} existingData - User-entered product data
 * @param {Object} offData - Data from Open Food Facts
 * @returns {Object} Merged product data
 */
exports.mergeProductData = (existingData, offData) => {
  return {
    name: existingData.name || offData.name,
    brand: existingData.brand || offData.brand,
    category: existingData.category || offData.category,
    picture: existingData.picture || offData.picture,
    nutritionalInfo: {
      ...offData.nutritionalInfo,
      ...existingData.nutritionalInfo,
    },
    price: existingData.price || null,
    quantityInStock: existingData.quantityInStock || 0,
    description: existingData.description || null,
    barcode: offData.barcode,
    openFoodFactsId: offData.openFoodFactsId,
  };
};
