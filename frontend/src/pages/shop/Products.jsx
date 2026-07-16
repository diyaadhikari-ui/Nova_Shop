import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const Products = () => {
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchArtworks();
  }, [category, search, page]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchArtworks = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (category) params.append('category', category);
      if (search) params.append('search', search);

      params.append('page', page);
      params.append('limit', 12);

      const res = await api.get(`/artworks?${params}`);

      setArtworks(res.data.artworks || []);
      setPagination(res.data.pagination || {});
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/artworks/categories');
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error('Categories error:', error);
    }
  };

  const handleAddToCart = async (artworkId) => {
    const result = await addToCart(artworkId);

    if (result.success) {
      toast.success('Added to cart!');
    } else {
      toast.error('Please login first');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const value = e.target.search.value;

    setSearchParams((prev) => {
      if (value) prev.set('search', value);
      else prev.delete('search');

      prev.delete('page');
      return prev;
    });
  };

  const handleCategory = (slug) => {
    setSearchParams((prev) => {
      if (slug) prev.set('category', slug);
      else prev.delete('category');

      prev.delete('page');
      return prev;
    });
  };

  return (
    <div className="products-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');

        .products-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(156, 163, 142, 0.18), transparent 30%),
            linear-gradient(135deg, #fffaf3 0%, #f4ede3 55%, #fffdf8 100%);
          font-family: 'Poppins', sans-serif;
          color: #463f39;
          padding: 56px 7vw 90px;
        }

        .products-container {
          max-width: 1220px;
          margin: 0 auto;
        }

        .products-header {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 24px;
          align-items: end;
          margin-bottom: 32px;
        }

        .products-header h1 {
          font-family: 'Fredoka', sans-serif;
          font-size: clamp(38px, 4vw, 58px);
          color: #332f2b;
          margin: 0 0 8px;
          letter-spacing: -1px;
        }

        .products-header p {
          color: #8b7d73;
          font-size: 14px;
          margin: 0;
        }

        .collection-badge {
          background: rgba(255, 252, 247, 0.8);
          border: 1px solid rgba(212, 197, 176, 0.65);
          border-radius: 999px;
          padding: 12px 20px;
          color: #6d755f;
          font-size: 13px;
          font-weight: 900;
          box-shadow: 0 12px 28px rgba(61, 54, 48, 0.06);
        }

        .filter-card {
          background: rgba(255, 252, 247, 0.86);
          border: 1px solid rgba(212, 197, 176, 0.65);
          border-radius: 30px;
          padding: 22px;
          box-shadow: 0 20px 50px rgba(61, 54, 48, 0.08);
          backdrop-filter: blur(12px);
          margin-bottom: 34px;
        }

        .search-form {
          display: flex;
          gap: 12px;
          margin-bottom: 18px;
        }

        .search-input {
          flex: 1;
          border: 1px solid #d8c7b5;
          border-radius: 18px;
          background: rgba(255,255,255,0.76);
          padding: 15px 18px;
          color: #332f2b;
          outline: none;
          font-size: 14px;
          transition: 0.25s ease;
        }

        .search-input:focus {
          border-color: #929b83;
          box-shadow: 0 0 0 4px rgba(146, 155, 131, 0.14);
        }

        .search-btn {
          border: none;
          background: #929b83;
          color: white;
          border-radius: 18px;
          padding: 0 26px;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(146, 155, 131, 0.25);
        }

        .category-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .category-btn {
          border: 1px solid #d8c7b5;
          background: rgba(255,255,255,0.66);
          color: #5d5148;
          padding: 10px 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .category-btn:hover {
          transform: translateY(-2px);
        }

        .category-btn.active {
          background: #929b83;
          border-color: #929b83;
          color: white;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 26px;
        }

        .product-card {
          background: rgba(255, 252, 247, 0.9);
          border: 1px solid rgba(212, 197, 176, 0.65);
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 18px 42px rgba(61, 54, 48, 0.08);
          transition: 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 28px 65px rgba(61, 54, 48, 0.13);
        }

        .image-wrap {
          position: relative;
          overflow: hidden;
        }

        .product-img {
          width: 100%;
          height: 265px;
          object-fit: cover;
          display: block;
          transition: 0.45s ease;
        }

        .product-card:hover .product-img {
          transform: scale(1.06);
        }

        .limited-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #929b83;
          color: white;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          box-shadow: 0 12px 24px rgba(61, 54, 48, 0.18);
        }

        .product-body {
          padding: 22px;
        }

        .product-category {
          color: #929b83;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .product-title {
          display: block;
          color: #332f2b;
          font-size: 17px;
          font-weight: 900;
          line-height: 1.35;
          text-decoration: none;
          margin-bottom: 18px;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-top: 16px;
          border-top: 1px solid #eadfce;
        }

        .price-label {
          color: #9a8b7f;
          font-size: 12px;
          font-weight: 700;
        }

        .price {
          color: #332f2b;
          font-size: 16px;
          font-weight: 900;
          margin-top: 2px;
        }

        .add-btn {
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 16px;
          background: #929b83;
          color: white;
          cursor: pointer;
          font-size: 22px;
          font-weight: 700;
          box-shadow: 0 12px 26px rgba(146, 155, 131, 0.28);
          transition: 0.25s ease;
        }

        .add-btn:hover {
          transform: translateY(-2px) scale(1.04);
        }

        .state-box {
          text-align: center;
          padding: 80px 20px;
          background: rgba(255, 252, 247, 0.78);
          border: 1px solid rgba(212, 197, 176, 0.65);
          border-radius: 30px;
          color: #8b7d73;
          font-weight: 800;
        }

        .pagination {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 44px;
          flex-wrap: wrap;
        }

        .page-btn {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          border: 1px solid #d8c7b5;
          background: rgba(255,255,255,0.72);
          color: #5d5148;
          font-weight: 900;
          cursor: pointer;
        }

        .page-btn.active {
          background: #929b83;
          border-color: #929b83;
          color: white;
        }

        @media (max-width: 950px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .products-header {
            grid-template-columns: 1fr;
          }

          .collection-badge {
            width: fit-content;
          }
        }

        @media (max-width: 640px) {
          .products-page {
            padding: 40px 22px 70px;
          }

          .search-form {
            flex-direction: column;
          }

          .search-btn {
            padding: 14px 20px;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="products-container">
        <div className="products-header">
          <div>
            <h1>Contemporary Prints</h1>
            <p>
              {pagination.total || 0} artworks in our curated Nepalese collection.
            </p>
          </div>

          <div className="collection-badge">
            ✨ Curated Local Art
          </div>
        </div>

        <div className="filter-card">
          <form onSubmit={handleSearch} className="search-form">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search artworks, styles, artists..."
              className="search-input"
            />

            <button type="submit" className="search-btn">
              Search
            </button>
          </form>

          <div className="category-row">
            <button
              onClick={() => handleCategory('')}
              className={!category ? 'category-btn active' : 'category-btn'}
            >
              All
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat.slug)}
                className={category === cat.slug ? 'category-btn active' : 'category-btn'}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="state-box">Loading artworks...</div>
        ) : artworks.length === 0 ? (
          <div className="state-box">No artworks found.</div>
        ) : (
          <div className="products-grid">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="product-card">
                <Link to={`/products/${artwork.slug}`} className="image-wrap">
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="product-img"
                  />

                  {artwork.is_limited_edition && (
                    <span className="limited-badge">
                      Limited Edition
                    </span>
                  )}
                </Link>

                <div className="product-body">
                  <div className="product-category">
                    {artwork.category_name}
                  </div>

                  <Link
                    to={`/products/${artwork.slug}`}
                    className="product-title"
                  >
                    {artwork.title}
                  </Link>

                  <div className="product-footer">
                    <div>
                      <div className="price-label">Starting from</div>

                      <div className="price">
                        NPR {parseFloat(artwork.base_price).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(artwork.id)}
                      className="add-btn"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="pagination">
            {Array.from(
              { length: pagination.totalPages },
              (_, i) => i + 1
            ).map((p) => (
              <button
                key={p}
                onClick={() =>
                  setSearchParams((prev) => {
                    prev.set('page', p);
                    return prev;
                  })
                }
                className={p === page ? 'page-btn active' : 'page-btn'}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;