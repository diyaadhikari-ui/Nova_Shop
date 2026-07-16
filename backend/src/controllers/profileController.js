import pool from "../config/database.js";

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, full_name, email, phone, address, city, role, avatar_url
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      role: user.role,
      avatarUrl: user.avatar_url
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, address, city } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET full_name = $1,
           phone = $2,
           address = $3,
           city = $4
       WHERE id = $5
       RETURNING id, full_name, email, phone, address, city, role, avatar_url`,
      [fullName, phone, address, city, userId]
    );

    const user = result.rows[0];

    res.json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      role: user.role,
      avatarUrl: user.avatar_url
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      `UPDATE users
       SET avatar_url = $1
       WHERE id = $2
       RETURNING id, full_name, email, phone, address, city, role, avatar_url`,
      [avatarUrl, userId]
    );

    const user = result.rows[0];

    res.json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      role: user.role,
      avatarUrl: user.avatar_url
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload profile photo" });
  }
};