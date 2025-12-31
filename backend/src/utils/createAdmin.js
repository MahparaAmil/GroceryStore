const bcrypt = require("bcrypt");
const User = require("../models/User");

(async () => {
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await User.create({
    email: "admin@trinity.com",
    password: hashedPassword,
    role: "admin",
  });

  console.log("✅ Admin user created");
  process.exit();
})();
