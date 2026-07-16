import pool from '../config/database.js';

export const getInventory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title as artwork, sku, stock_quantity as stock, min_stock_level as reorderLevel, base_price as price FROM artworks ORDER BY title ASC`
    );
    res.json({ success: true, inventory: result.rows });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
  }
};

export const getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, title as artwork, sku, stock_quantity as stock, min_stock_level as reorderLevel, base_price as price FROM artworks WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    res.json({ success: true, item: result.rows[0] });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory item' });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, reorderLevel } = req.body;
    
    const existing = await pool.query('SELECT id FROM artworks WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }
    
    const result = await pool.query(
      `UPDATE artworks SET stock_quantity = COALESCE($1, stock_quantity), min_stock_level = COALESCE($2, min_stock_level) WHERE id = $3 RETURNING id, title as artwork, sku, stock_quantity as stock, min_stock_level as reorderLevel, base_price as price`,
      [stock !== undefined ? stock : null, reorderLevel !== undefined ? reorderLevel : null, id]
    );
    
    res.json({ success: true, message: 'Inventory updated successfully', item: result.rows[0] });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ success: false, message: 'Failed to update inventory' });
  }
};

export const getLowStockItems = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title as artwork, sku, stock_quantity as stock, min_stock_level as reorderLevel FROM artworks WHERE stock_quantity <= min_stock_level ORDER BY stock_quantity ASC`
    );
    res.json({ success: true, items: result.rows });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch low stock items' });
  }
};

export const getOutOfStockItems = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title as artwork, sku, stock_quantity as stock FROM artworks WHERE stock_quantity = 0 ORDER BY title ASC`
    );
    res.json({ success: true, items: result.rows });
  } catch (error) {
    console.error('Get out of stock items error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch out of stock items' });
  }
};