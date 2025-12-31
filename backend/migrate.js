const { sequelize } = require("./src/config/db");
const axios = require("axios");

// Sample products with barcodes and fallback images from public sources
const SAMPLE_PRODUCTS = [
  { barcode: "5449000050127", name: "Coca-Cola", price: 2.99, stock: 100, fallbackImage: "https://images.unsplash.com/photo-1554866585-d1b128e0cd5d?w=400&h=400&fit=crop" },
  { barcode: "5000112110022", name: "Cadbury Dairy Milk", price: 3.49, stock: 80, fallbackImage: "https://images.unsplash.com/photo-1599599810694-f3ee39e00e5d?w=400&h=400&fit=crop" },
  { barcode: "8718191007055", name: "Unilever Ice Cream", price: 5.99, stock: 45, fallbackImage: "https://images.unsplash.com/photo-1563805042-7684c019e157?w=400&h=400&fit=crop" },
  { barcode: "3017627007675", name: "Danone Yogurt", price: 1.99, stock: 150, fallbackImage: "https://images.unsplash.com/photo-1488365014519-606cdcd6e6e0?w=400&h=400&fit=crop" },
  { barcode: "4006066000139", name: "Haribo Gold Bears", price: 1.99, stock: 120, fallbackImage: "https://images.unsplash.com/photo-1599599810694-f3ee39e00e5d?w=400&h=400&fit=crop" },
  { barcode: "8710908567419", name: "Lay's Classic Chips", price: 2.49, stock: 200, fallbackImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop" },
  { barcode: "5906788050066", name: "Knorr Chicken Stock", price: 2.29, stock: 60, fallbackImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop" },
  { barcode: "5056068400022", name: "Twinings Tea Bags", price: 3.99, stock: 50, fallbackImage: "https://images.unsplash.com/photo-1597318471645-e64fdbf0c7da?w=400&h=400&fit=crop" },
  { barcode: "5000016000400", name: "Heinz Baked Beans", price: 1.49, stock: 180, fallbackImage: "https://images.unsplash.com/photo-1599599810776-e36a3ef42d73?w=400&h=400&fit=crop" },
  { barcode: "5010753000066", name: "Stella Artois Beer", price: 6.99, stock: 40, fallbackImage: "https://images.unsplash.com/photo-1608270861620-7c5f14cf3bef?w=400&h=400&fit=crop" },
];

async function fetchProductFromOpenFoodFacts(barcode) {
  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { timeout: 5000 }
    );

    if (response.status === 404 || !response.data || response.data.status === 0) {
      return null;
    }

    return {
      name: response.data.product_name || null,
      brand: response.data.brands || null,
      category: response.data.categories || null,
      picture: response.data.image_url || response.data.image_front_url || null,
      barcode: barcode,
      openFoodFactsId: response.data.id || barcode,
      nutritionalInfo: {
        calories: response.data.nutriments?.energy_kcal_100g || null,
        protein: response.data.nutriments?.proteins_100g || null,
        carbs: response.data.nutriments?.carbohydrates_100g || null,
        fat: response.data.nutriments?.fat_100g || null,
        fiber: response.data.nutriments?.fiber_100g || null,
      },
    };
  } catch (error) {
    console.warn(`⚠️  Could not fetch barcode ${barcode}: ${error.message}`);
    return null;
  }
}

async function migrate() {
  try {
    const User = require("./src/models/User");
    const Product = require("./src/models/Product");
    const Invoice = require("./src/models/Invoice");
    const Order = require("./src/models/Order");
    
    // Sync with fresh schema
    await sequelize.sync({ force: true });
    console.log("📊 Database tables recreated");
    
    // Seed products with OpenFoodFacts data and fallback images
    let successCount = 0;
    let fallbackCount = 0;
    
    for (const item of SAMPLE_PRODUCTS) {
      try {
        console.log(`🔍 Fetching data for barcode ${item.barcode}...`);
        
        // Try to fetch from OpenFoodFacts
        const offData = await fetchProductFromOpenFoodFacts(item.barcode);
        
        // Use OpenFoodFacts image if available, otherwise use fallback
        const imageUrl = offData?.picture || item.fallbackImage;
        
        if (imageUrl) {
          await Product.create({
            name: offData?.name || item.name,
            brand: offData?.brand || "Premium Brand",
            category: offData?.category || "Grocery",
            picture: imageUrl,
            barcode: item.barcode,
            openFoodFactsId: offData?.openFoodFactsId,
            nutritionalInfo: offData?.nutritionalInfo || {
              calories: null,
              protein: null,
              carbs: null,
              fat: null,
              fiber: null,
            },
            price: item.price,
            quantityInStock: item.stock,
            description: offData?.name || item.name,
          });
          
          if (offData?.picture) {
            console.log(`✅ Added: ${offData.name} (from OpenFoodFacts)`);
            successCount++;
          } else {
            console.log(`✅ Added: ${item.name} (with fallback image)`);
            fallbackCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error adding product: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Migration complete!`);
    console.log(`   📦 ${successCount} products from OpenFoodFacts API`);
    console.log(`   🖼️  ${fallbackCount} products with fallback images`);
    console.log(`   📊 Total: ${successCount + fallbackCount} products seeded`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

require("dotenv").config();
migrate();
