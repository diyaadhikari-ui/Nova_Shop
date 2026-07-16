import pool from '../config/database.js';

export const getArtists = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, bio, created_at FROM artists ORDER BY created_at DESC');
    res.json({ success: true, artists: result.rows });
  } catch (error) {
    console.error('Get artists error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch artists' });
  }
};

export const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, name, email, bio, created_at FROM artists WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Artist not found' });
    }
    res.json({ success: true, artist: result.rows[0] });
  } catch (error) {
    console.error('Get artist by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch artist' });
  }
};

export const createArtist = async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }
    const result = await pool.query(
      'INSERT INTO artists (name, email, bio) VALUES ($1, $2, $3) RETURNING id, name, email, bio, created_at',
      [name, email, bio || null]
    );
    res.status(201).json({ success: true, message: 'Artist created successfully', artist: result.rows[0] });
  } catch (error) {
    console.error('Create artist error:', error);
    res.status(500).json({ success: false, message: 'Failed to create artist' });
  }
};

export const updateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, bio } = req.body;
    const result = await pool.query(
      'UPDATE artists SET name = COALESCE($1, name), email = COALESCE($2, email), bio = COALESCE($3, bio) WHERE id = $4 RETURNING id, name, email, bio, created_at',
      [name || null, email || null, bio || null, id]
    );
    res.json({ success: true, message: 'Artist updated successfully', artist: result.rows[0] });
  } catch (error) {
    console.error('Update artist error:', error);
    res.status(500).json({ success: false, message: 'Failed to update artist' });
  }
};

export const deleteArtist = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM artists WHERE id = $1', [id]);
    res.json({ success: true, message: 'Artist deleted successfully' });
  } catch (error) {
    console.error('Delete artist error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete artist' });
  }
};