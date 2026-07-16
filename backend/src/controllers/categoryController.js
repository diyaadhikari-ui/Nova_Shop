import pool from '../config/database.js';

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, slug, description, created_at FROM categories ORDER BY name ASC');
    res.json({ success: true, categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, name, slug, description, created_at FROM categories WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category: result.rows[0] });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-');
    const result = await pool.query(
      'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING id, name, slug, description, created_at',
      [name, categorySlug, description || null]
    );
    res.status(201).json({ success: true, message: 'Category created successfully', category: result.rows[0] });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;
    const result = await pool.query(
      'UPDATE categories SET name = COALESCE($1, name), slug = COALESCE($2, slug), description = COALESCE($3, description) WHERE id = $4 RETURNING id, name, slug, description, created_at',
      [name || null, slug || null, description || null, id]
    );
    res.json({ success: true, message: 'Category updated successfully', category: result.rows[0] });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};