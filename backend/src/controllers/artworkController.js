import { query } from '../config/database.js';

// GET /api/artworks
export const getArtworks = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, category,
      minPrice, maxPrice, search, featured
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = ['a.is_active = true'];
    const params = [];
    let paramIdx = 1;

    if (category) {
      conditions.push(`c.slug = $${paramIdx++}`);
      params.push(category);
    }
    if (minPrice) {
      conditions.push(`a.base_price >= $${paramIdx++}`);
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      conditions.push(`a.base_price <= $${paramIdx++}`);
      params.push(parseFloat(maxPrice));
    }
    if (search) {
      conditions.push(`(a.title ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }
    if (featured === 'true') {
      conditions.push('a.is_featured = true');
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM artworks a
       LEFT JOIN categories c ON a.category_id = c.id
       ${whereClause}`,
      params
    );

    const artworksResult = await query(
      `SELECT a.id, a.title, a.slug, a.description,
              a.base_price, a.image_url, a.is_limited_edition,
              a.edition_count, a.is_featured, a.tags, a.created_at,
              c.name as category_name, c.slug as category_slug,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(r.id) as review_count
       FROM artworks a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN reviews r ON a.id = r.artwork_id
       AND r.is_approved = true
       ${whereClause}
       GROUP BY a.id, c.name, c.slug
       ORDER BY a.created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, parseInt(limit), offset]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      artworks: artworksResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get artworks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/artworks/:slug
export const getArtworkBySlug = async (req, res) => {
  try {
    const result = await query(
      `SELECT a.*, c.name as category_name, c.slug as category_slug,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(r.id) as review_count
       FROM artworks a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN reviews r ON a.id = r.artwork_id
       AND r.is_approved = true
       WHERE a.slug = $1 AND a.is_active = true
       GROUP BY a.id, c.name, c.slug`,
      [req.params.slug]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    const artwork = result.rows[0];

    const variantsResult = await query(
      `SELECT av.*, ps.label as size_label,
              ps.width_cm, ps.height_cm,
              fo.name as frame_name
       FROM artwork_variants av
       JOIN print_sizes ps ON av.size_id = ps.id
       JOIN frame_options fo ON av.frame_id = fo.id
       WHERE av.artwork_id = $1 AND av.is_active = true`,
      [artwork.id]
    );

    const reviewsResult = await query(
      `SELECT r.*, u.full_name, u.avatar_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.artwork_id = $1 AND r.is_approved = true
       ORDER BY r.created_at DESC LIMIT 10`,
      [artwork.id]
    );

    res.json({
      success: true,
      artwork: {
        ...artwork,
        variants: variantsResult.rows,
        reviews: reviewsResult.rows
      }
    });

  } catch (error) {
    console.error('Get artwork error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, COUNT(a.id) as artwork_count
       FROM categories c
       LEFT JOIN artworks a ON c.id = a.category_id
       AND a.is_active = true
       WHERE c.is_active = true
       GROUP BY c.id ORDER BY c.name`
    );
    res.json({ success: true, categories: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/frame-options
export const getFrameOptions = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM frame_options WHERE is_active = true ORDER BY price_modifier'
    );
    res.json({ success: true, frames: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/print-sizes
export const getPrintSizes = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM print_sizes WHERE is_active = true ORDER BY price_modifier'
    );
    res.json({ success: true, sizes: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/admin/artworks
export const createArtwork = async (req, res) => {
  try {
    const {
      title, description, artistBio,
      categoryId, basePrice, isLimitedEdition,
      editionCount, tags, isFeatured
    } = req.body;

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.imageUrl;

    if (!title || !basePrice || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Title, price and image are required'
      });
    }

    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const sku = `NS-${Date.now()}`;

    const result = await query(
      `INSERT INTO artworks
       (title, slug, description, artist_bio, category_id,
        base_price, is_limited_edition, edition_count, tags,
        is_featured, image_url, sku, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [title, slug, description, artistBio, categoryId,
        basePrice, isLimitedEdition || false, editionCount,
        tags || [], isFeatured || false, imageUrl, sku, req.user.id]
    );

    res.status(201).json({ success: true, artwork: result.rows[0] });

  } catch (error) {
    console.error('Create artwork error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/artworks/:id
export const updateArtwork = async (req, res) => {
  try {
    const {
      title, description, artistBio, categoryId,
      basePrice, isLimitedEdition, editionCount,
      tags, isFeatured, isActive
    } = req.body;

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.imageUrl;

    const result = await query(
      `UPDATE artworks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        artist_bio = COALESCE($3, artist_bio),
        category_id = COALESCE($4, category_id),
        base_price = COALESCE($5, base_price),
        is_limited_edition = COALESCE($6, is_limited_edition),
        edition_count = COALESCE($7, edition_count),
        tags = COALESCE($8, tags),
        is_featured = COALESCE($9, is_featured),
        image_url = COALESCE($10, image_url),
        is_active = COALESCE($11, is_active)
       WHERE id = $12 RETURNING *`,
      [title, description, artistBio, categoryId, basePrice,
        isLimitedEdition, editionCount, tags, isFeatured,
        imageUrl, isActive, req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    res.json({ success: true, artwork: result.rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/admin/artworks/:id
export const deleteArtwork = async (req, res) => {
  try {
    await query(
      'UPDATE artworks SET is_active = false WHERE id = $1',
      [req.params.id]
    );
    res.json({ success: true, message: 'Artwork removed from store' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};