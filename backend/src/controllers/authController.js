const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userOps } = require("../services/supabaseService");

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await userOps.findByEmail(email);
    if (existingUser) {
      if (!existingUser.isGuest) {
        return res.status(409).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const updated = await userOps.update(existingUser.id, {
        password: hashedPassword,
        isGuest: false,
        role: "customer"
      });

      const token = jwt.sign(
        { id: updated.id, role: updated.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(201).json({
        message: "Signup successful",
        token,
        user: {
          id: updated.id,
          email: updated.email,
          role: updated.role,
        },
      });
    }

    const user = await userOps.create({
      email,
      password,
      role: "customer",
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Signup failed" });
  }
};

exports.logout = async (req, res) => {
  try {
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await userOps.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await userOps.verifyPassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed" });
  }
};

exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userOps.findByEmail(email);
    
    if (!user) {
      return res.json({
        exists: false,
        isGuest: false,
        message: "Email not found. You can create an account or checkout as guest."
      });
    }

    return res.json({
      exists: true,
      isGuest: user.isGuest,
      message: user.isGuest 
        ? "This email was used for a guest checkout. You can now create an account or continue as guest."
        : "This email is already registered. Please login."
    });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ message: "Failed to check email" });
  }
};