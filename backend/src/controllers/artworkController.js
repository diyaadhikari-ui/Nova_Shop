import { query } from '../config/database.js';

/*
|--------------------------------------------------------------------------
| Helper functions
|--------------------------------------------------------------------------
*/

// Converts undefined, null, or an empty string into null.
const emptyToNull = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }

  return value;
};

// Converts an optional value into a number.
const parseOptionalNumber = (value) => {
  const normalizedValue = emptyToNull(value);

  if (normalizedValue === null) {
    return null;
  }

  const numberValue = Number(normalizedValue);

  if (Number.isNaN(numberValue)) {
    return null;
  }

  return numberValue;
};

// Converts multipart/form-data boolean strings into real booleans.
const parseOptionalBoolean = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === 'true' || normalizedValue === '1') {
      return true;
    }

    if (normalizedValue === 'false' || normalizedValue === '0') {
      return false;
    }
  }

  return null;
};

// Converts tags into an array.
const parseOptionalTags = (tags) => {
  if (tags === undefined || tags === null || tags === '') {
    return null;
  }

  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter(Boolean);
  }

  if (typeof tags === 'string') {
    const trimmedTags = tags.trim();

    if (!trimmedTags) {
      return null;
    }

    // Handles JSON array strings such as:
    // '["modern", "nature"]'
    try {
      const parsedTags = JSON.parse(trimmedTags);

      if (Array.isArray(parsedTags)) {
        return parsedTags
          .map((tag) => String(tag).trim())
          .filter(Boolean);
      }
    } catch {
      // If it is not JSON, treat it as comma-separated text.
    }

    return trimmedTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return null;
};

// Checks whether a value is a valid UUID.
const isValidUuid = (value) => {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidPattern.test(value);
};

/*
|--------------------------------------------------------------------------
| GET /api/artworks
|--------------------------------------------------------------------------
*/

export const getArtworks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      featured
    } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(
      Math.max(parseInt(limit, 10) || 12, 1),
      100
    );

    const offset = (parsedPage - 1) * parsedLimit;

    const conditions = ['a.is_active = true'];
    const params = [];

    let paramIdx = 1;

    if (category) {
      conditions.push(`c.slug = $${paramIdx}`);
      params.push(category);
      paramIdx++;
    }

    if (minPrice !== undefined && minPrice !== '') {
      const parsedMinPrice = Number(minPrice);

      if (Number.isNaN(parsedMinPrice) || parsedMinPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Minimum price must be a valid positive number'
        });
      }

      conditions.push(`a.base_price >= $${paramIdx}`);
      params.push(parsedMinPrice);
      paramIdx++;
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      const parsedMaxPrice = Number(maxPrice);

      if (Number.isNaN(parsedMaxPrice) || parsedMaxPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Maximum price must be a valid positive number'
        });
      }

      conditions.push(`a.base_price <= $${paramIdx}`);
      params.push(parsedMaxPrice);
      paramIdx++;
    }

    if (search) {
      conditions.push(
        `(a.title ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`
      );

      params.push(`%${search.trim()}%`);
      paramIdx++;
    }

    if (featured === 'true') {
      conditions.push('a.is_featured = true');
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*)
       FROM artworks a
       LEFT JOIN categories c ON a.category_id = c.id
       ${whereClause}`,
      params
    );

    const artworksResult = await query(
      `SELECT
         a.id,
         a.title,
         a.slug,
         a.description,
         a.artist_bio,
         a.base_price,
         a.image_url,
         a.is_limited_edition,
         a.edition_count,
         a.is_featured,
         a.tags,
         a.created_at,
         c.name AS category_name,
         c.slug AS category_slug,
         COALESCE(AVG(r.rating), 0) AS avg_rating,
         COUNT(r.id) AS review_count
       FROM artworks a
       LEFT JOIN categories c
         ON a.category_id = c.id
       LEFT JOIN reviews r
         ON a.id = r.artwork_id
         AND r.is_approved = true
       ${whereClause}
       GROUP BY a.id, c.name, c.slug
       ORDER BY a.created_at DESC
       LIMIT $${paramIdx}
       OFFSET $${paramIdx + 1}`,
      [...params, parsedLimit, offset]
    );

    const total = parseInt(countResult.rows[0].count, 10);

    return res.status(200).json({
      success: true,
      artworks: artworksResult.rows,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (error) {
    console.error('Get artworks error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/artworks/:slug
|--------------------------------------------------------------------------
*/

export const getArtworkBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await query(
      `SELECT
         a.*,
         c.name AS category_name,
         c.slug AS category_slug,
         COALESCE(AVG(r.rating), 0) AS avg_rating,
         COUNT(r.id) AS review_count
       FROM artworks a
       LEFT JOIN categories c
         ON a.category_id = c.id
       LEFT JOIN reviews r
         ON a.id = r.artwork_id
         AND r.is_approved = true
       WHERE a.slug = $1
         AND a.is_active = true
       GROUP BY a.id, c.name, c.slug`,
      [slug]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    const artwork = result.rows[0];

    const variantsResult = await query(
      `SELECT
         av.*,
         ps.label AS size_label,
         ps.width_cm,
         ps.height_cm,
         fo.name AS frame_name
       FROM artwork_variants av
       JOIN print_sizes ps
         ON av.size_id = ps.id
       JOIN frame_options fo
         ON av.frame_id = fo.id
       WHERE av.artwork_id = $1
         AND av.is_active = true`,
      [artwork.id]
    );

    const reviewsResult = await query(
      `SELECT
         r.*,
         u.full_name,
         u.avatar_url
       FROM reviews r
       JOIN users u
         ON r.user_id = u.id
       WHERE r.artwork_id = $1
         AND r.is_approved = true
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [artwork.id]
    );

    return res.status(200).json({
      success: true,
      artwork: {
        ...artwork,
        variants: variantsResult.rows,
        reviews: reviewsResult.rows
      }
    });
  } catch (error) {
    console.error('Get artwork error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/categories
|--------------------------------------------------------------------------
*/

export const getCategories = async (req, res) => {
  try {
    const result = await query(
      `SELECT
         c.*,
         COUNT(a.id) AS artwork_count
       FROM categories c
       LEFT JOIN artworks a
         ON c.id = a.category_id
         AND a.is_active = true
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.name`
    );

    return res.status(200).json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    console.error('Get categories error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/frame-options
|--------------------------------------------------------------------------
*/

export const getFrameOptions = async (req, res) => {
  try {
    const result = await query(
      `SELECT *
       FROM frame_options
       WHERE is_active = true
       ORDER BY price_modifier`
    );

    return res.status(200).json({
      success: true,
      frames: result.rows
    });
  } catch (error) {
    console.error('Get frame options error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/print-sizes
|--------------------------------------------------------------------------
*/

export const getPrintSizes = async (req, res) => {
  try {
    const result = await query(
      `SELECT *
       FROM print_sizes
       WHERE is_active = true
       ORDER BY price_modifier`
    );

    return res.status(200).json({
      success: true,
      sizes: result.rows
    });
  } catch (error) {
    console.error('Get print sizes error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/admin/artworks
|--------------------------------------------------------------------------
*/

export const createArtwork = async (req, res) => {
  try {
    const {
      title,
      description,
      artistBio,
      categoryId,
      basePrice,
      isLimitedEdition,
      editionCount,
      tags,
      isFeatured
    } = req.body;

    const normalizedTitle = emptyToNull(title);
    const normalizedDescription = emptyToNull(description);
    const normalizedArtistBio = emptyToNull(artistBio);
    const normalizedCategoryId = emptyToNull(categoryId);
    const normalizedBasePrice = parseOptionalNumber(basePrice);
    const normalizedEditionCount = parseOptionalNumber(editionCount);
    const normalizedTags = parseOptionalTags(tags) || [];

    const normalizedLimitedEdition =
      parseOptionalBoolean(isLimitedEdition) ?? false;

    const normalizedFeatured =
      parseOptionalBoolean(isFeatured) ?? false;

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : emptyToNull(req.body.imageUrl);

    if (!normalizedTitle) {
      return res.status(400).json({
        success: false,
        message: 'Artwork title is required'
      });
    }

    if (normalizedBasePrice === null) {
      return res.status(400).json({
        success: false,
        message: 'A valid base price is required'
      });
    }

    if (normalizedBasePrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Base price cannot be negative'
      });
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Artwork image is required'
      });
    }

    if (
      normalizedCategoryId !== null &&
      !isValidUuid(normalizedCategoryId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    if (
      normalizedEditionCount !== null &&
      normalizedEditionCount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Edition count cannot be negative'
      });
    }

    const slugBase = normalizedTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Adds time to help prevent duplicate slug errors.
    const slug = `${slugBase}-${Date.now()}`;

    const sku = `NS-${Date.now()}`;

    const createdBy = req.user?.id;

    if (!createdBy) {
      return res.status(401).json({
        success: false,
        message: 'User authentication is required'
      });
    }

    const result = await query(
      `INSERT INTO artworks (
         title,
         slug,
         description,
         artist_bio,
         category_id,
         base_price,
         is_limited_edition,
         edition_count,
         tags,
         is_featured,
         image_url,
         sku,
         created_by
       )
       VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12, $13
       )
       RETURNING *`,
      [
        normalizedTitle,
        slug,
        normalizedDescription,
        normalizedArtistBio,
        normalizedCategoryId,
        normalizedBasePrice,
        normalizedLimitedEdition,
        normalizedEditionCount,
        normalizedTags,
        normalizedFeatured,
        imageUrl,
        sku,
        createdBy
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Artwork created successfully',
      artwork: result.rows[0]
    });
  } catch (error) {
    console.error('Create artwork error:', error);

    if (error.code === '22P02') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category or user ID'
      });
    }

    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'The selected category does not exist'
      });
    }

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'An artwork with the same slug or SKU already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/admin/artworks/:id
|--------------------------------------------------------------------------
*/

export const updateArtwork = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID'
      });
    }

    const {
      title,
      description,
      artistBio,
      categoryId,
      basePrice,
      isLimitedEdition,
      editionCount,
      tags,
      isFeatured,
      isActive
    } = req.body;

    /*
     * Important fix:
     * categoryId may arrive as an empty string from FormData.
     * PostgreSQL UUID columns cannot accept "".
     * emptyToNull converts it to null so COALESCE keeps the old category.
     */
    const normalizedTitle = emptyToNull(title);
    const normalizedDescription = emptyToNull(description);
    const normalizedArtistBio = emptyToNull(artistBio);
    const normalizedCategoryId = emptyToNull(categoryId);
    const normalizedBasePrice = parseOptionalNumber(basePrice);
    const normalizedEditionCount = parseOptionalNumber(editionCount);
    const normalizedTags = parseOptionalTags(tags);

    const normalizedLimitedEdition =
      parseOptionalBoolean(isLimitedEdition);

    const normalizedFeatured =
      parseOptionalBoolean(isFeatured);

    const normalizedActive =
      parseOptionalBoolean(isActive);

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : emptyToNull(req.body.imageUrl);

    if (
      normalizedCategoryId !== null &&
      !isValidUuid(normalizedCategoryId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    if (
      basePrice !== undefined &&
      basePrice !== null &&
      basePrice !== '' &&
      normalizedBasePrice === null
    ) {
      return res.status(400).json({
        success: false,
        message: 'Base price must be a valid number'
      });
    }

    if (
      normalizedBasePrice !== null &&
      normalizedBasePrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Base price cannot be negative'
      });
    }

    if (
      editionCount !== undefined &&
      editionCount !== null &&
      editionCount !== '' &&
      normalizedEditionCount === null
    ) {
      return res.status(400).json({
        success: false,
        message: 'Edition count must be a valid number'
      });
    }

    if (
      normalizedEditionCount !== null &&
      normalizedEditionCount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Edition count cannot be negative'
      });
    }

    const result = await query(
      `UPDATE artworks
       SET
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
       WHERE id = $12
       RETURNING *`,
      [
        normalizedTitle,             // $1
        normalizedDescription,       // $2
        normalizedArtistBio,         // $3
        normalizedCategoryId,        // $4
        normalizedBasePrice,         // $5
        normalizedLimitedEdition,    // $6
        normalizedEditionCount,      // $7
        normalizedTags,              // $8
        normalizedFeatured,          // $9
        imageUrl,                     // $10
        normalizedActive,            // $11
        id                            // $12
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Artwork updated successfully',
      artwork: result.rows[0]
    });
  } catch (error) {
    console.error('Update artwork error:', error);

    if (error.code === '22P02') {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork or category ID'
      });
    }

    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'The selected category does not exist'
      });
    }

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'An artwork with the same information already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/admin/artworks/:id
|--------------------------------------------------------------------------
*/

export const deleteArtwork = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID'
      });
    }

    const result = await query(
      `UPDATE artworks
       SET is_active = false
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Artwork removed from store'
    });
  } catch (error) {
    console.error('Delete artwork error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};