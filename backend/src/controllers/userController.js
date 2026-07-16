import pool from '../config/database.js';

export const getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, full_name, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, username, email, full_name, is_active, created_at FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE users SET is_active = false WHERE id = $1 RETURNING id, username, email, full_name, is_active', [id]);
    res.json({ success: true, message: 'User deactivated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ success: false, message: 'Failed to deactivate user' });
  }
};

export const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE users SET is_active = true WHERE id = $1 RETURNING id, username, email, full_name, is_active', [id]);
    res.json({ success: true, message: 'User reactivated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({ success: false, message: 'Failed to reactivate user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};