require("dotenv").config();
const app = require("./app");
const { supabase, userOps, initializeTables } = require("./services/supabaseService");
const bcrypt = require("bcrypt");

// Initialize Supabase connection
const initSupabase = async () => {
  try {
    console.log("🔗 Connecting to Supabase...");
    
    // Test connection
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    console.log("✅ Supabase connected successfully");
    
    // Create admin user if it doesn't exist
    const adminEmail = "admin@trinity.com";
    const existingAdmin = await userOps.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash("Admin@123", 10);
      await userOps.create({
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        isGuest: false
      });
      console.log("✅ Admin user created: admin@trinity.com / Admin@123");
    } else {
      console.log("✅ Admin user already exists");
    }
    
    return true;
  } catch (error) {
    console.error("❌ Supabase connection failed:", error.message);
    return false;
  }
};

const startServer = async () => {
  const supabaseReady = await initSupabase();
  
  if (!supabaseReady) {
    console.warn("⚠️  Supabase not available. Please check your connection.");
  }

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  });
};

startServer();
