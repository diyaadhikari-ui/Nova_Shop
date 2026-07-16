import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const Home = () => {
  const [featuredArtworks, setFeaturedArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [artworksRes, categoriesRes] = await Promise.all([
        api.get('/artworks?featured=true&limit=4'),
        api.get('/artworks/categories')
      ]);

      setFeaturedArtworks(artworksRes.data.artworks || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (artworkId) => {
    const result = await addToCart(artworkId);

    if (result.success) {
      toast.success('Added to your collection');
    } else {
      toast.error('Please login first');
      navigate('/login');
    }
  };

  const fallbackArt = [
    {
      title: 'Sacred Lotus Mandala',
      image_url:
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80'
    },
    {
      title: 'Tulip Flower',
      image_url:
        'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80'
    },
    {
      title: 'Golden Mandala',
      image_url:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
    }
  ];

  const heroArt = featuredArtworks.length ? featuredArtworks : fallbackArt;

  return (
    <div className="home-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');

        .home-page {
          min-height: 100vh;
          background: #f7f1e8;
          color: #463f39;
          font-family: 'Poppins', sans-serif;
          overflow: hidden;
        }

        .home-page h1,
        .home-page h2,
        .home-page h3 {
          font-family: 'Fredoka', sans-serif;
        }

        .top-strip {
          background: rgba(255, 252, 247, 0.88);
          border-bottom: 1px solid rgba(196, 177, 153, 0.35);
          text-align: center;
          padding: 26px 20px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #8a7868;
          font-size: 12px;
          font-weight: 700;
        }

        .hero {
          position: relative;
          min-height: 720px;
          padding: 92px 7vw 80px;
          display: grid;
          grid-template-columns: 1.02fr 0.98fr;
          align-items: center;
          gap: 70px;
          background:
            radial-gradient(circle at 75% 18%, rgba(196, 177, 153, 0.35), transparent 28%),
            radial-gradient(circle at 15% 78%, rgba(156, 163, 142, 0.24), transparent 30%),
            linear-gradient(135deg, #fffaf3 0%, #f4ede3 52%, #fffdf8 100%);
        }

        .soft-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(2px);
          opacity: 0.65;
          pointer-events: none;
        }

        .orb-one {
          width: 180px;
          height: 180px;
          background: #eadccc;
          top: 90px;
          left: -70px;
        }

        .orb-two {
          width: 260px;
          height: 260px;
          background: #dde1d0;
          right: -100px;
          bottom: 60px;
        }

        .hero-copy {
          position: relative;
          z-index: 2;
          animation: rise 0.8s ease both;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 11px 20px;
          border-radius: 999px;
          background: rgba(232, 222, 209, 0.78);
          color: #5d5148;
          font-size: 12px;
          font-weight: 700;
          box-shadow: inset 0 0 0 1px rgba(196, 177, 153, 0.35);
        }

        .eyebrow span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9ca38e;
          box-shadow: 0 0 0 6px rgba(156, 163, 142, 0.18);
        }

        .hero-title {
          margin: 28px 0 22px;
          font-size: clamp(46px, 5.1vw, 82px);
          line-height: 0.98;
          letter-spacing: -1.8px;
          color: #332f2b;
        }

        .hero-title em {
          font-style: normal;
          color: #8b7d73;
          position: relative;
        }

        .hero-title em::after {
          content: '';
          position: absolute;
          left: 3px;
          right: 3px;
          bottom: 7px;
          height: 12px;
          background: rgba(156, 163, 142, 0.25);
          z-index: -1;
          border-radius: 999px;
        }

        .hero-text {
          max-width: 560px;
          color: #675d55;
          font-size: 17px;
          line-height: 1.9;
          margin: 0 0 34px;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 44px;
        }

        .btn {
          text-decoration: none;
          border-radius: 18px;
          padding: 15px 30px;
          font-size: 14px;
          font-weight: 800;
          transition: 0.28s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-primary {
          background: #929b83;
          color: white;
          box-shadow: 0 16px 34px rgba(146, 155, 131, 0.28);
        }

        .btn-secondary {
          background: rgba(255,255,255,0.72);
          color: #695a4e;
          border: 1px solid #d6c7b5;
        }

        .btn:hover {
          transform: translateY(-3px);
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(100px, 1fr));
          max-width: 600px;
          gap: 16px;
        }

        .stat-card {
          padding: 18px 20px;
          border-radius: 22px;
          background: rgba(255, 252, 247, 0.62);
          border: 1px solid rgba(212, 197, 176, 0.55);
          backdrop-filter: blur(10px);
        }

        .stat-card strong {
          display: block;
          color: #75685f;
          font-size: 28px;
          line-height: 1;
          font-family: 'Fredoka', sans-serif;
        }

        .stat-card small {
          color: #a09387;
          font-weight: 700;
          font-size: 11px;
        }

        .hero-gallery {
          height: 570px;
          position: relative;
          z-index: 2;
        }

        .main-art-card,
        .side-art-card {
          position: absolute;
          overflow: hidden;
          background: rgba(255, 252, 247, 0.86);
          border: 1px solid rgba(212, 197, 176, 0.55);
          box-shadow: 0 28px 70px rgba(61, 54, 48, 0.13);
        }

        .main-art-card {
          left: 0;
          top: 84px;
          width: 360px;
          border-radius: 34px;
          animation: float 5s ease-in-out infinite;
        }

        .side-art-card.one {
          right: 12px;
          top: 10px;
          width: 255px;
          border-radius: 28px;
          animation: float 5.5s ease-in-out infinite 0.4s;
        }

        .side-art-card.two {
          right: 58px;
          bottom: 45px;
          width: 280px;
          border-radius: 28px;
          animation: float 6s ease-in-out infinite 0.8s;
        }

        .art-img {
          width: 100%;
          height: 250px;
          object-fit: cover;
          display: block;
        }

        .side-art-card .art-img {
          height: 165px;
        }

        .art-info {
          padding: 17px 18px 19px;
        }

        .art-info p {
          margin: 0;
          color: #332f2b;
          font-size: 14px;
          font-weight: 800;
        }

        .art-info span {
          display: block;
          color: #9a8b7f;
          font-size: 11px;
          margin-top: 6px;
          font-weight: 700;
        }

        .quote-card {
          position: absolute;
          left: 120px;
          bottom: 0;
          max-width: 270px;
          border-radius: 24px;
          background: #3a302a;
          color: #fff7ee;
          padding: 24px;
          box-shadow: 0 24px 55px rgba(58, 48, 42, 0.22);
        }

        .quote-card p {
          margin: 0;
          font-size: 13px;
          line-height: 1.7;
          color: #f4e8da;
        }

        .quote-card strong {
          display: block;
          margin-top: 12px;
          font-size: 12px;
          color: #d7c7b5;
        }

        .section {
          max-width: 1220px;
          margin: 0 auto;
          padding: 86px 7vw;
        }

        .section-head {
          text-align: center;
          margin-bottom: 44px;
        }

        .section-head h2 {
          font-size: clamp(34px, 3.4vw, 52px);
          margin: 0 0 10px;
          color: #332f2b;
        }

        .section-head p {
          margin: 0;
          color: #8b7d73;
          font-size: 14px;
        }

        .category-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
        }

        .category-btn {
          text-decoration: none;
          color: #5d5148;
          background: rgba(255, 252, 247, 0.8);
          border: 1px solid #d8c7b5;
          border-radius: 999px;
          padding: 12px 24px;
          font-size: 13px;
          font-weight: 800;
          transition: 0.25s ease;
        }

        .category-btn:hover {
          background: #e6ded1;
          transform: translateY(-2px);
        }

        .art-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
        }

        .product-card {
          background: rgba(255, 252, 247, 0.92);
          border: 1px solid rgba(212, 197, 176, 0.55);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 14px 35px rgba(61, 54, 48, 0.07);
          transition: 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 58px rgba(61, 54, 48, 0.12);
        }

        .product-card img {
          width: 100%;
          height: 245px;
          object-fit: cover;
          display: block;
        }

        .product-body {
          padding: 20px;
        }

        .product-category {
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #9ca38e;
          font-weight: 900;
        }

        .product-title {
          display: block;
          margin: 9px 0 15px;
          color: #342f2b;
          font-weight: 800;
          text-decoration: none;
          line-height: 1.35;
        }

        .price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #eadfce;
          padding-top: 15px;
        }

        .price-row strong {
          color: #5d5148;
        }

        .cart-btn {
          border: 0;
          background: #929b83;
          color: white;
          border-radius: 14px;
          padding: 10px 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .story-band {
          margin-top: 40px;
          background: #fffaf3;
          border-top: 1px solid #e5d8c7;
          border-bottom: 1px solid #e5d8c7;
        }

        .story-grid {
          max-width: 1220px;
          margin: 0 auto;
          padding: 92px 7vw;
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 70px;
          align-items: center;
        }

        .story-panel {
          border-radius: 34px;
          padding: 46px;
          background: linear-gradient(135deg, #e8ded1, #d8c9b6);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.55);
        }

        .story-panel h3 {
          font-size: 30px;
          margin: 0 0 12px;
          color: #332f2b;
        }

        .story-panel p {
          color: #5d5148;
          line-height: 1.8;
          margin: 0;
        }

        .story-list {
          display: grid;
          gap: 16px;
        }

        .story-item {
          padding: 18px 20px;
          border-left: 4px solid #929b83;
          background: rgba(247, 241, 232, 0.72);
          border-radius: 18px;
        }

        .story-item h4 {
          margin: 0 0 5px;
          color: #332f2b;
        }

        .story-item p {
          margin: 0;
          color: #817266;
          font-size: 13px;
        }

        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 980px) {
          .hero,
          .story-grid {
            grid-template-columns: 1fr;
          }

          .hero-gallery {
            height: 520px;
          }

          .art-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .hero {
            padding: 62px 22px;
          }

          .stats,
          .art-grid {
            grid-template-columns: 1fr;
          }

          .hero-gallery {
            display: none;
          }

          .section,
          .story-grid {
            padding: 64px 22px;
          }
        }
      `}</style>

      <div className="top-strip">Discover Nepalese Artists</div>

      <section className="hero">
        <div className="soft-orb orb-one" />
        <div className="soft-orb orb-two" />

        <div className="hero-copy">
          <div className="eyebrow">
            <span />
            Support Local Artists
          </div>

          <h1 className="hero-title">
            Beautiful Art,
            <br />
            <em>Meaningful Stories</em>
          </h1>

          <p className="hero-text">
            Curated works from emerging Nepalese artists. Each piece carries
            heritage, culture, and creative vision for spaces that feel personal
            and soulful.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">
              Explore Collection
            </Link>
            <Link to="/products" className="btn btn-secondary">
              Learn More
            </Link>
          </div>

          <div className="stats">
            <div className="stat-card">
              <strong>200+</strong>
              <small>Artworks</small>
            </div>
            <div className="stat-card">
              <strong>40+</strong>
              <small>Artists</small>
            </div>
            <div className="stat-card">
              <strong>3K+</strong>
              <small>Collectors</small>
            </div>
          </div>
        </div>

        <div className="hero-gallery">
          <div className="main-art-card">
            <img
              className="art-img"
              src={heroArt[0]?.image_url}
              alt={heroArt[0]?.title}
            />
            <div className="art-info">
              <p>{heroArt[0]?.title || 'Sacred Lotus Mandala'}</p>
              <span>Featured Artwork</span>
            </div>
          </div>

          <div className="side-art-card one">
            <img
              className="art-img"
              src={heroArt[1]?.image_url}
              alt={heroArt[1]?.title}
            />
            <div className="art-info">
              <p>{heroArt[1]?.title || 'Tulip Flower'}</p>
              <span>Handpicked</span>
            </div>
          </div>

          <div className="side-art-card two">
            <img
              className="art-img"
              src={heroArt[2]?.image_url}
              alt={heroArt[2]?.title}
            />
            <div className="art-info">
              <p>{heroArt[2]?.title || 'Golden Mandala'}</p>
              <span>Collector Favorite</span>
            </div>
          </div>

          <div className="quote-card">
            <p>“Every artwork has a story — from the artist’s hand to your home.”</p>
            <strong>Nova Shop Collection</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Explore by Category</h2>
          <p>Find art that matches your mood, room, and story.</p>
        </div>

        <div className="category-list">
          {categories.length > 0
            ? categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="category-btn"
                >
                  {cat.name} ({cat.artwork_count})
                </Link>
              ))
            : ['Mandala', 'Canvas', 'Traditional', 'Floral', 'Modern'].map(
                (cat) => (
                  <Link key={cat} to="/products" className="category-btn">
                    {cat}
                  </Link>
                )
              )}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Curated Works</h2>
          <p>Hand-picked pieces from our creative community.</p>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '70px 20px',
              color: '#8b7d73'
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                border: '3px solid #d8c7b5',
                borderTopColor: '#929b83',
                borderRadius: '50%',
                margin: '0 auto 18px',
                animation: 'spin 1s linear infinite'
              }}
            />
            Loading beautiful art...
          </div>
        ) : (
          <div className="art-grid">
            {featuredArtworks.map((artwork) => (
              <div key={artwork.id} className="product-card">
                <Link to={`/products/${artwork.slug}`}>
                  <img src={artwork.image_url} alt={artwork.title} />
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

                  <div className="price-row">
                    <strong>
                      NPR {parseFloat(artwork.base_price).toLocaleString()}
                    </strong>

                    <button
                      className="cart-btn"
                      onClick={() => handleAddToCart(artwork.id)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="story-band">
        <div className="story-grid">
          <div className="story-panel">
            <h3>Art with Soul & Purpose</h3>
            <p>
              Nova Shop connects art lovers with Nepalese creators through
              authentic pieces, fair support, and warm visual storytelling.
            </p>
          </div>

          <div className="story-list">
            {[
              ['Supporting Artists', 'Direct partnerships with Nepalese creators.'],
              ['Authentic Stories', 'Each piece carries heritage and meaning.'],
              ['Thoughtful Collection', 'Curated for calm, beautiful spaces.'],
              ['Community First', 'Built for artists and art lovers.']
            ].map(([title, desc]) => (
              <div className="story-item" key={title}>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;