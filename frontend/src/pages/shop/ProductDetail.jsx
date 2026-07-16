import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sizes, setSizes] = useState([]);
  const [frames, setFrames] = useState([]);

  useEffect(() => {
    fetchArtwork();
    fetchOptions();
  }, [slug]);

  const fetchArtwork = async () => {
    try {
      const res = await api.get(`/artworks/${slug}`);
      setArtwork(res.data.artwork);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [sizesRes, framesRes] = await Promise.all([
        api.get('/artworks/print-sizes'),
        api.get('/artworks/frame-options')
      ]);

      setSizes(sizesRes.data.sizes || []);
      setFrames(framesRes.data.frames || []);
    } catch (error) {
      console.error('Options error:', error);
    }
  };

  const calculatePrice = () => {
    if (!artwork) return 0;

    let price = parseFloat(artwork.base_price);

    if (selectedSize) price += parseFloat(selectedSize.price_modifier);
    if (selectedFrame) price += parseFloat(selectedFrame.price_modifier);

    return price;
  };

  const handleAddToCart = async () => {
    const result = await addToCart(artwork.id, null, quantity);

    if (result.success) {
      toast.success('Added to cart!');
    } else {
      toast.error('Please login first');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="detail-page">
        <style>{pageStyle}</style>
        <div className="state-card">Loading artwork...</div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="detail-page">
        <style>{pageStyle}</style>
        <div className="state-card">Artwork not found</div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <style>{pageStyle}</style>

      <div className="detail-container">
        <div className="detail-grid">
          <div className="image-panel">
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className="main-image"
            />

            {artwork.is_limited_edition && (
              <div className="floating-badge">Limited Edition</div>
            )}
          </div>

          <div className="info-panel">
            <div className="tags">
              <span>{artwork.category_name}</span>

              {artwork.is_limited_edition && (
                <span className="limited">Collector Piece</span>
              )}
            </div>

            <h1>{artwork.title}</h1>

            <div className="price">
              NPR {calculatePrice().toLocaleString()}
            </div>

            <p className="description">
              {artwork.description}
            </p>

            <div className="option-section">
              <div className="option-title">Print Size</div>

              <div className="option-list">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() =>
                      setSelectedSize(selectedSize?.id === size.id ? null : size)
                    }
                    className={selectedSize?.id === size.id ? 'option-btn active' : 'option-btn'}
                  >
                    {size.label}
                    {size.price_modifier > 0 &&
                      ` +NPR ${parseFloat(size.price_modifier).toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-section">
              <div className="option-title">Frame</div>

              <div className="option-list">
                {frames.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() =>
                      setSelectedFrame(selectedFrame?.id === frame.id ? null : frame)
                    }
                    className={selectedFrame?.id === frame.id ? 'option-btn active' : 'option-btn'}
                  >
                    {frame.name}
                    {frame.price_modifier > 0 &&
                      ` +NPR ${parseFloat(frame.price_modifier).toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="quantity-section">
              <div className="option-title">Quantity</div>

              <div className="quantity-box">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  −
                </button>

                <span>{quantity}</span>

                <button onClick={() => setQuantity((q) => q + 1)}>
                  +
                </button>
              </div>
            </div>

            <button onClick={handleAddToCart} className="cart-button">
              🛒 Add to Cart — NPR {calculatePrice().toLocaleString()}
            </button>

            {artwork.artist_bio && (
              <div className="artist-box">
                <div className="option-title">About the Artist</div>

                <p>{artwork.artist_bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const pageStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');

  .detail-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(156, 163, 142, 0.18), transparent 30%),
      linear-gradient(135deg, #fffaf3 0%, #f4ede3 55%, #fffdf8 100%);
    font-family: 'Poppins', sans-serif;
    color: #463f39;
    padding: 56px 7vw 90px;
  }

  .detail-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 56px;
    align-items: start;
  }

  .image-panel {
    position: sticky;
    top: 30px;
    background: rgba(255, 252, 247, 0.82);
    border: 1px solid rgba(212, 197, 176, 0.65);
    border-radius: 34px;
    padding: 18px;
    box-shadow: 0 24px 60px rgba(61, 54, 48, 0.1);
  }

  .main-image {
    width: 100%;
    max-height: 650px;
    object-fit: cover;
    display: block;
    border-radius: 26px;
  }

  .floating-badge {
    position: absolute;
    top: 34px;
    right: 34px;
    background: #929b83;
    color: white;
    padding: 9px 16px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 900;
    box-shadow: 0 14px 28px rgba(61, 54, 48, 0.18);
  }

  .info-panel {
    background: rgba(255, 252, 247, 0.88);
    border: 1px solid rgba(212, 197, 176, 0.65);
    border-radius: 34px;
    padding: 34px;
    box-shadow: 0 24px 60px rgba(61, 54, 48, 0.08);
    backdrop-filter: blur(12px);
  }

  .tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .tags span {
    background: rgba(232, 222, 209, 0.82);
    color: #675d55;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
  }

  .tags .limited {
    background: rgba(146, 155, 131, 0.16);
    color: #5f6b51;
  }

  .info-panel h1 {
    font-family: 'Fredoka', sans-serif;
    font-size: clamp(34px, 4vw, 54px);
    color: #332f2b;
    margin: 0 0 12px;
    line-height: 1.05;
    letter-spacing: -1px;
  }

  .price {
    color: #5d5148;
    font-size: 26px;
    font-weight: 900;
    margin-bottom: 18px;
  }

  .description {
    color: #675d55;
    line-height: 1.8;
    font-size: 14px;
    margin: 0 0 28px;
  }

  .option-section {
    margin-bottom: 22px;
  }

  .option-title {
    color: #8b7d73;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }

  .option-list {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .option-btn {
    border: 1px solid #d8c7b5;
    background: rgba(255,255,255,0.7);
    color: #5d5148;
    padding: 10px 16px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    transition: 0.25s ease;
  }

  .option-btn:hover {
    transform: translateY(-2px);
  }

  .option-btn.active {
    background: #929b83;
    border-color: #929b83;
    color: white;
  }

  .quantity-section {
    display: flex;
    align-items: center;
    gap: 18px;
    margin: 26px 0;
  }

  .quantity-box {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .quantity-box button {
    width: 36px;
    height: 36px;
    border-radius: 14px;
    border: 1px solid #d8c7b5;
    background: rgba(255,255,255,0.75);
    color: #332f2b;
    cursor: pointer;
    font-size: 17px;
    font-weight: 900;
  }

  .quantity-box span {
    min-width: 30px;
    text-align: center;
    font-weight: 900;
    color: #332f2b;
  }

  .cart-button {
    width: 100%;
    border: none;
    background: #929b83;
    color: white;
    padding: 16px;
    border-radius: 20px;
    font-size: 15px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 16px 34px rgba(146, 155, 131, 0.28);
    transition: 0.25s ease;
  }

  .cart-button:hover {
    transform: translateY(-2px);
  }

  .artist-box {
    background: rgba(247, 241, 232, 0.78);
    border: 1px solid #e5d8c7;
    border-radius: 24px;
    padding: 20px;
    margin-top: 26px;
  }

  .artist-box p {
    color: #675d55;
    font-size: 13px;
    line-height: 1.7;
    margin: 0;
  }

  .state-card {
    max-width: 480px;
    margin: 80px auto;
    text-align: center;
    background: rgba(255, 252, 247, 0.88);
    border: 1px solid rgba(212, 197, 176, 0.65);
    border-radius: 28px;
    padding: 36px;
    color: #8b7d73;
    font-weight: 800;
  }

  @media (max-width: 950px) {
    .detail-grid {
      grid-template-columns: 1fr;
    }

    .image-panel {
      position: static;
    }
  }

  @media (max-width: 600px) {
    .detail-page {
      padding: 40px 22px 70px;
    }

    .info-panel {
      padding: 24px;
    }

    .quantity-section {
      align-items: flex-start;
      flex-direction: column;
    }
  }
`;

export default ProductDetail;