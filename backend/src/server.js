require("dotenv").config();
const app = require("./app");
const { sequelize, connectDB } = require("./config/db");
const User = require("./models/User");
const Product = require("./models/Product");
const Invoice = require("./models/Invoice");
const Order = require("./models/Order");

connectDB();

// Sync database models
const syncDB = async () => {
  try {
    // Force sync to recreate tables with updated schema
    await sequelize.sync({ force: false, alter: true });
    console.log("✅ Database tables synced");
  } catch (error) {
    console.error("❌ DB sync failed:", error.message);
    console.warn("⚠️ Continuing without database sync. API will use mock data.");
  }
};

syncDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
