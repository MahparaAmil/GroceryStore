const bcrypt = require("bcrypt");
const { userOps } = require("../services/supabaseService");

/**
 * GET /users - Admin only: Get all users
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await userOps.findAll();
    // Exclude passwords from response
    const safeUsers = users.map(u => {
      const { password, ...user } = u;
      return user;
    });
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

/**
 * GET /users/profile - Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await userOps.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const { password, ...safeUser } = user;
    res.json(safeUser);
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
    const user = await userOps.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const updates = {};

    if (email && email !== user.email) {
      const existingUser = await userOps.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }
      updates.email = email;
    }

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await userOps.update(req.user.id, updates);

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
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
    const user = await userOps.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await userOps.delete(req.user.id);
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

    const user = await userOps.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const updates = {};

    if (email && email !== user.email) {
      const existingUser = await userOps.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }
      updates.email = email;
    }

    if (role) {
      updates.role = role;
    }

    const updatedUser = await userOps.update(id, updates);

    res.json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
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

    const user = await userOps.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await userOps.delete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};
