const { sequelize } = require("../config/db");
require("../models/User");

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Tables created");
    process.exit();
  } catch (err) {
    console.error(err);
  }
})();
