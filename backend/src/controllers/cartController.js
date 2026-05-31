import { query } from '../config/database.js';

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    const result = await query(
      `SELECT ci.id, ci.quantity, ci.artwork_id, ci.variant_id,
              a.title, a.image_url, a.base_price, a.slug,
              av.final_price, ps.label as size_label,
              fo.name as frame_name
       FROM cart_items ci
       JOIN artworks a ON ci.artwork_id = a.id
       LEFT JOIN artwork_variants av ON ci.variant_id = av.id
       LEFT JOIN print_sizes ps ON av.size_id = ps.id
       LEFT JOIN frame_options fo ON av.frame_id = fo.id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );

    const items = result.rows.map(item => ({
      ...item,
      unit_price: item.final_price || item.base_price,
      total_price: (item.final_price || item.base_price) * item.quantity
    }));

    const subtotal = items.reduce(
      (sum, item) => sum + parseFloat(item.total_price), 0
    );

    res.json({
      success: true,
      items,
      subtotal,
      itemCount: items.length
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/cart
export const addToCart = async (req, res) => {
  try {
    const { artworkId, variantId, quantity = 1 } = req.body;

    if (!artworkId) {
      return res.status(400).json({
        success: false,
        message: 'Artwork ID required'
      });
    }

    const artworkResult = await query(
      'SELECT id FROM artworks WHERE id = $1 AND is_active = true',
      [artworkId]
    );

    if (!artworkResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    const existing = await query(
      `SELECT id, quantity FROM cart_items
       WHERE user_id = $1 AND artwork_id = $2
       AND (variant_id = $3 OR
       (variant_id IS NULL AND $3 IS NULL))`,
      [req.user.id, artworkId, variantId || null]
    );

    let result;
    if (existing.rows.length) {
      result = await query(
        `UPDATE cart_items SET quantity = quantity + $1
         WHERE id = $2 RETURNING *`,
        [quantity, existing.rows[0].id]
      );
    } else {
      result = await query(
        `INSERT INTO cart_items
         (user_id, artwork_id, variant_id, quantity)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.user.id, artworkId, variantId || null, quantity]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Added to cart',
      item: result.rows[0]
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/cart/:id
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity required'
      });
    }

    const result = await query(
      `UPDATE cart_items SET quantity = $1
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [quantity, req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.json({ success: true, item: result.rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/cart/:id
export const removeFromCart = async (req, res) => {
  try {
    await query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/cart
export const clearCart = async (req, res) => {
  try {
    await query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};