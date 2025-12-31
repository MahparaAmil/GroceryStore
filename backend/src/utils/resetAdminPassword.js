const bcrypt = require("bcrypt");
const User = require("../models/User");

(async () => {
  try {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const result = await User.update(
      { password: hashedPassword },
      { where: { email: "admin@trinity.com" } }
    );

    if (result[0] === 0) {
      console.log("❌ Admin user not found");
    } else {
      console.log("✅ Admin password reset to: Admin@123");
    }
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();
