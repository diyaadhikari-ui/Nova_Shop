import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
  return { accessToken, refreshToken };
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    const existing = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing.rows.length) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, role, is_verified)
       VALUES ($1, $2, $3, 'customer', true) RETURNING *`,
      [fullName.trim(), email.toLowerCase(), passwordHash]
    );

    const user = result.rows[0];
    const tokens = generateTokens(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      },
      ...tokens
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in with Google'
      });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const tokens = generateTokens(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url
      },
      ...tokens
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, full_name, email, role, avatar_url, 
       phone, address, city, created_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url,
        phone: user.phone,
        address: user.address,
        city: user.city,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/refresh
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const result = await query(
      'SELECT id FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const tokens = generateTokens(decoded.userId);
    res.json({ success: true, ...tokens });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};