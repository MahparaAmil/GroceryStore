const axios = require("axios");

const OPEN_FOOD_FACTS_API = "https://world.openfoodfacts.org/api/v0/product";

// Helper to extract nutritional info
const extractNutritionalInfo = (product) => {
  if (!product.nutriments) return {};
  // Handle both _100g and raw keys
  const n = product.nutriments;
  return {
    calories: n["energy-kcal_100g"] || n["energy-kcal"] || 0,
    protein: n.proteins_100g || n.proteins || 0,
    carbs: n.carbohydrates_100g || n.carbohydrates || 0,
    fat: n.fat_100g || n.fat || 0,
    sugar: n.sugars_100g || n.sugars || 0,
    fiber: n.fiber_100g || n.fiber || 0,
    salt: n.salt_100g || n.salt || 0,
  };
};

// Helper to clean tags (remove language prefixes like 'en:')
const extractTags = (product) => {
  const rawTags = product.labels_tags || product._keywords || [];

  return rawTags
    .map(tag => tag.split(':')[1] || tag) // Remove 'en:' prefix
    .map(tag => tag.toLowerCase().trim().replace(/-/g, ' ')) // Normalize
    .filter(tag => tag.length > 2) // Filter very short tags
    .slice(0, 5) // Take top 5 tags instead of strict filtering
    .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)); // Capitalize
};

// Helper to extract gallery images
const extractGallery = (product) => {
  const gallery = [];
  if (product.image_url) gallery.push(product.image_url);
  if (product.image_front_url && !gallery.includes(product.image_front_url)) gallery.push(product.image_front_url);
  if (product.image_ingredients_url) gallery.push(product.image_ingredients_url);
  if (product.image_nutrition_url) gallery.push(product.image_nutrition_url);

  return gallery.slice(0, 4); // Limit to 4 images
};

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
    const product = response.data.product;
    const brandName = product.brands ? product.brands.split(',')[0].trim() : 'Unknown Brand';

    const productData = {
      name: product.product_name || null,
      brand: brandName,
      category: product.categories_tags ? product.categories_tags[0].split(':')[1] : null,
      picture: product.image_url || null,
      nutritionalInfo: extractNutritionalInfo(product),
      openFoodFactsId: product.id || barcode,
      barcode: barcode,
      tags: extractTags(product),
      gallery: extractGallery(product),
    };

    return productData;
  } catch (error) {
    console.error(`Error fetching from Open Food Facts API for barcode ${barcode}:`, error.message);
    return null;
  }
};

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

/**
 * Fetch products by category from Open Food Facts
 * @param {string} category - Category tag to search for
 * @param {number} limit - Number of products to fetch
 * @param {number} page - Page number to fetch
 * @returns {Promise<Array>} List of formatted product objects
 */
exports.fetchProductsByCategory = async (category, limit = 20, page = 1) => {
  try {
    const response = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl`, {
      params: {
        action: 'process',
        tagtype_0: 'categories',
        tag_contains_0: 'contains',
        tag_0: category,
        json: 1,
        page_size: limit,
        page: page, // Add pagination support
        sort_by: 'popularity',
      },
      headers: {
        'User-Agent': 'GroceryStoreApp/1.0 (dev@example.com) - Educational Project'
      },
      timeout: 30000, // Increase timeout to 30s
    });

    if (!response.data || !response.data.products) {
      return [];
    }

    return response.data.products.map(p => {
      const brandName = p.brands ? p.brands.split(',')[0].trim() : 'Unknown Brand';
      return {
        name: p.product_name || p.product_name_en || 'Unknown Product',
        brand: brandName,
        category: category,
        picture: p.image_url || p.image_front_url || null,
        nutritionalInfo: extractNutritionalInfo(p),
        openFoodFactsId: p.id || p.code,
        barcode: p.code,
        description: p.generic_name || p.generic_name_en || `Delicious ${category} item`,
        tags: extractTags(p),
        gallery: extractGallery(p),
      };
    }).filter(p => p.name && p.picture); // Only return products with name and image
  } catch (error) {
    console.error(`Error fetching category ${category} (page ${page}) from OpenFoodFacts:`, error.message);
    return [];
  }
};

/**
 * Fetch products by BRAND from Open Food Facts
 * @param {string} brand - Brand name to search for
 * @param {number} limit - Number of products to fetch
 * @returns {Promise<Array>} List of formatted product objects
 */
exports.fetchProductsByBrand = async (brand, limit = 50) => {
  try {
    const response = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl`, {
      params: {
        action: 'process',
        tagtype_0: 'brands',
        tag_contains_0: 'contains',
        tag_0: brand,
        json: 1,
        page_size: limit,
        sort_by: 'popularity',
      },
      headers: {
        'User-Agent': 'GroceryStoreApp/1.0 (dev@example.com) - Educational Project'
      },
      timeout: 30000,
    });

    if (!response.data || !response.data.products) {
      return [];
    }

    return response.data.products.map(p => {
      try {
        const brandName = p.brands ? p.brands.split(',')[0].trim() : brand;
        const categoryTag = p.categories_tags && p.categories_tags.length > 0
          ? p.categories_tags[0].split(':')[1] || 'Groceries'
          : 'Groceries';

        return {
          name: p.product_name || p.product_name_en || 'Unknown Product',
          brand: brandName,
          category: categoryTag,
          picture: p.image_url || p.image_front_url || null,
          nutritionalInfo: extractNutritionalInfo(p),
          openFoodFactsId: p.id || p.code,
          barcode: p.code || `OFF-${Math.random().toString(36).substr(2, 9)}`,
          description: p.generic_name || p.generic_name_en || `Delicious ${brandName} product`,
          tags: extractTags(p),
          gallery: extractGallery(p),
        };
      } catch (err) {
        return null; // Skip malformed items
      }
    }).filter(p => p && p.name && p.picture); // Filter nulls and partials
  } catch (error) {
    console.error(`Error fetching brand ${brand} from OpenFoodFacts:`, error.message);
    return [];
  }
};
