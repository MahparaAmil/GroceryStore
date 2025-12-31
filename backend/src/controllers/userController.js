const bcrypt = require("bcrypt");
const User = require("../models/User");

/**
 * GET /users - Admin only: Get all users
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

/**
 * GET /users/profile - Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

/**
 * PUT /users/profile - Update current user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== user.id) {
        return res.status(409).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
};

/**
 * DELETE /users/profile - Delete current user account
 */
exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting account" });
  }
};

/**
 * PUT /users/:id - Admin only: Update user by ID
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== user.id) {
        return res.status(409).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (role) {
      user.role = role;
    }

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};

/**
 * DELETE /users/:id - Admin only: Delete user by ID
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};
