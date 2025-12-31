const { sequelize } = require("../config/db");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Supabase DB connection successful");
    process.exit();
  } catch (err) {
    console.error("❌ Supabase DB connection failed:", err.message);
  }
})();
