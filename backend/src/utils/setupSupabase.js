require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { supabase } = require('../services/supabaseService');

const seedProducts = async () => {
  try {
    console.log('🌱 Seeding products...\n');

    const products = [
      {
        name: 'Fresh Tomatoes',
        brand: 'Farm Fresh',
        description: 'Ripe red tomatoes',
        price: 2.99,
        category: 'Vegetables',
        quantityInStock: 50,
        picture: '🍅'
      },
      {
        name: 'Organic Carrots',
        brand: 'Green Valley',
        description: 'Fresh orange carrots',
        price: 1.49,
        category: 'Vegetables',
        quantityInStock: 100,
        picture: '🥕'
      },
      {
        name: 'Crispy Lettuce',
        brand: 'Salad Mix',
        description: 'Fresh green lettuce',
        price: 1.99,
        category: 'Vegetables',
        quantityInStock: 40,
        picture: '🥬'
      },
      {
        name: 'Sweet Apples',
        brand: 'Orchard Fresh',
        description: 'Red delicious apples',
        price: 3.99,
        category: 'Fruits',
        quantityInStock: 75,
        picture: '🍎'
      },
      {
        name: 'Yellow Bananas',
        brand: 'Tropical',
        description: 'Fresh ripe bananas',
        price: 0.99,
        category: 'Fruits',
        quantityInStock: 120,
        picture: '🍌'
      },
      {
        name: 'Orange Oranges',
        brand: 'Citrus Grove',
        description: 'Sweet juicy oranges',
        price: 4.99,
        category: 'Fruits',
        quantityInStock: 60,
        picture: '🍊'
      },
      {
        name: 'Purple Grapes',
        brand: 'Vineyard',
        description: 'Fresh purple grapes',
        price: 5.99,
        category: 'Fruits',
        quantityInStock: 45,
        picture: '🍇'
      },
      {
        name: 'Green Peppers',
        brand: 'Farm Fresh',
        description: 'Fresh bell peppers',
        price: 2.49,
        category: 'Vegetables',
        quantityInStock: 35,
        picture: '🫑'
      }
    ];

    // Insert products
    for (const product of products) {
      const { error } = await supabase
        .from('products')
        .insert([{
          ...product,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]);
      
      if (error && error.code !== '23505') { // 23505 is unique constraint error
        console.error(`Error inserting ${product.name}:`, error.message);
      } else if (!error) {
        console.log(`✅ ${product.name}`);
      }
    }

    console.log('\n🚀 Product seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
  }
};

const initSupabase = async () => {
  try {
    console.log('🔧 Initializing Supabase...\n');

    // Test connection
    const { data, error: testError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (testError && testError.code !== 'PGRST116') {
      console.log('⚠️  Note: Tables may need to be created in Supabase dashboard');
    } else {
      console.log('✅ Connected to Supabase');
    }

    // Seed products
    await seedProducts();

    console.log('\n✅ Supabase initialization complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

initSupabase().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
