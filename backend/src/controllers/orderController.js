import { query } from '../config/database.js';

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      shippingFullName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingProvince,
      shippingPostalCode,
      paymentMethod,
      notes,
      items
    } = req.body;

    if (!shippingFullName || !shippingPhone || !shippingAddress || !shippingCity) {
      return res.status(400).json({
        success: false,
        message: 'Shipping information is required'
      });
    }

    let cartItems = [];

    // First try DB cart
    const cartResult = await query(
      `SELECT ci.*, a.title, a.image_url, a.base_price,
              av.final_price, ps.label as size_label,
              fo.name as frame_name
       FROM cart_items ci
       JOIN artworks a ON ci.artwork_id = a.id
       LEFT JOIN artwork_variants av ON ci.variant_id = av.id
       LEFT JOIN print_sizes ps ON av.size_id = ps.id
       LEFT JOIN frame_options fo ON av.frame_id = fo.id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );

    cartItems = cartResult.rows;

    // If DB cart empty, use frontend items
    if (!cartItems.length && items?.length) {
      cartItems = items.map((item) => ({
        artwork_id: item.artworkId,
        variant_id: item.variantId || null,
        title: item.title || 'Artwork',
        image_url: item.image_url || null,
        quantity: Number(item.quantity || 1),
        base_price: Number(item.price || 0),
        final_price: Number(item.price || 0),
        size_label: item.size_label || null,
        frame_name: item.frame_name || null
      }));
    }

    if (!cartItems.length) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const subtotal = cartItems.reduce((sum, item) => {
      const price = Number(item.final_price || item.base_price || 0);
      return sum + price * Number(item.quantity || 1);
    }, 0);

    const shippingFee = subtotal > 5000 ? 0 : 200;
    const totalAmount = subtotal + shippingFee;
    const orderNumber = `NS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const orderResult = await query(
      `INSERT INTO orders (
        order_number, user_id, status, subtotal,
        shipping_fee, total_amount,
        shipping_full_name, shipping_phone,
        shipping_address, shipping_city,
        shipping_province, shipping_postal_code,
        payment_method, payment_status, notes
      ) VALUES (
        $1,$2,'pending',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'unpaid',$13
      ) RETURNING *`,
      [
        orderNumber,
        req.user.id,
        subtotal,
        shippingFee,
        totalAmount,
        shippingFullName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingProvince || '',
        shippingPostalCode || '',
        paymentMethod,
        notes || ''
      ]
    );

    const order = orderResult.rows[0];

    for (const item of cartItems) {
      const unitPrice = Number(item.final_price || item.base_price || 0);

      await query(
        `INSERT INTO order_items (
          order_id, artwork_id, variant_id, title,
          image_url, quantity, unit_price,
          total_price, size_label, frame_name
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          order.id,
          item.artwork_id,
          item.variant_id,
          item.title,
          item.image_url,
          item.quantity,
          unitPrice,
          unitPrice * item.quantity,
          item.size_label,
          item.frame_name
        ]
      );
    }

    await query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        status: order.status,
        paymentStatus: order.payment_status
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// GET /api/orders
export const getMyOrders = async (req, res) => {
  try {
    const ordersResult = await query(
      `SELECT o.*,
        json_agg(json_build_object(
          'id', oi.id,
          'title', oi.title,
          'image_url', oi.image_url,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'size_label', oi.size_label,
          'frame_name', oi.frame_name
        )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, orders: ordersResult.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (!orderResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const itemsResult = await query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [req.params.id]
    );

    res.json({
      success: true,
      order: {
        ...orderResult.rows[0],
        items: itemsResult.rows
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/orders
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (status) {
      conditions.push(`o.status = $${paramIdx++}`);
      params.push(status);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const result = await query(
      `SELECT o.*, u.full_name, u.email,
        json_agg(json_build_object(
          'title', oi.title,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price
        )) as items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       ${whereClause}
       GROUP BY o.id, u.full_name, u.email
       ORDER BY o.created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, orders: result.rows });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const result = await query(
      `UPDATE orders SET status = $1
       WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({ success: true, order: result.rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};