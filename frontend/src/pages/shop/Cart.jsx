import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
  const { items, subtotal, updateQuantity, removeItem, loading } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const shippingFee = subtotal > 5000 ? 0 : 200;
  const total = subtotal + shippingFee;

  return (
    <div className="cart-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');

        .cart-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(156, 163, 142, 0.18), transparent 30%),
            linear-gradient(135deg, #fffaf3 0%, #f4ede3 55%, #fffdf8 100%);
          font-family: 'Poppins', sans-serif;
          color: #463f39;
          padding: 52px 7vw 80px;
        }

        .cart-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .cart-title {
          font-family: 'Fredoka', sans-serif;
          font-size: clamp(36px, 4vw, 56px);
          color: #332f2b;
          margin: 0 0 8px;
        }

        .cart-subtitle {
          color: #8b7d73;
          font-size: 14px;
          margin-bottom: 34px;
        }

        .cart-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 28px;
          align-items: start;
        }

        .cart-card,
        .summary-card,
        .empty-card {
          background: rgba(255, 252, 247, 0.86);
          border: 1px solid rgba(212, 197, 176, 0.65);
          border-radius: 28px;
          box-shadow: 0 20px 50px rgba(61, 54, 48, 0.08);
          backdrop-filter: blur(12px);
        }

        .cart-card {
          display: flex;
          gap: 18px;
          padding: 18px;
          align-items: center;
          margin-bottom: 16px;
          transition: 0.25s ease;
        }

        .cart-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 24px 58px rgba(61, 54, 48, 0.11);
        }

        .cart-img {
          width: 96px;
          height: 96px;
          object-fit: cover;
          border-radius: 20px;
          flex-shrink: 0;
        }

        .item-info {
          flex: 1;
        }

        .item-title {
          font-size: 16px;
          font-weight: 800;
          color: #332f2b;
          margin-bottom: 6px;
        }

        .item-meta {
          color: #9a8b7f;
          font-size: 12px;
          margin-bottom: 14px;
        }

        .qty-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .qty-btn {
          width: 32px;
          height: 32px;
          border-radius: 12px;
          border: 1px solid #d8c7b5;
          background: rgba(255,255,255,0.75);
          color: #332f2b;
          cursor: pointer;
          font-size: 16px;
          font-weight: 800;
        }

        .qty-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .qty-number {
          min-width: 24px;
          text-align: center;
          font-weight: 800;
          color: #332f2b;
        }

        .price-box {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .price {
          color: #332f2b;
          font-weight: 900;
          font-size: 15px;
        }

        .remove-btn {
          border: none;
          background: rgba(163, 45, 45, 0.08);
          color: #a32d2d;
          padding: 8px 12px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
        }

        .summary-card {
          padding: 26px;
          position: sticky;
          top: 24px;
        }

        .summary-title {
          font-family: 'Fredoka', sans-serif;
          font-size: 24px;
          margin: 0 0 22px;
          color: #332f2b;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
          color: #675d55;
          font-size: 14px;
        }

        .summary-row strong {
          color: #332f2b;
        }

        .shipping-note {
          background: rgba(146, 155, 131, 0.12);
          color: #6d755f;
          padding: 10px 12px;
          border-radius: 14px;
          font-size: 12px;
          margin: 12px 0;
        }

        .divider {
          height: 1px;
          background: #e5d8c7;
          margin: 18px 0;
        }

        .total-row {
          font-size: 18px;
          font-weight: 900;
          color: #332f2b;
        }

        .checkout-btn {
          width: 100%;
          background: #929b83;
          color: white;
          border: none;
          padding: 15px;
          border-radius: 18px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          margin-top: 20px;
          box-shadow: 0 16px 34px rgba(146, 155, 131, 0.28);
        }

        .continue-link {
          display: block;
          text-align: center;
          margin-top: 14px;
          color: #8b7d73;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }

        .empty-card {
          max-width: 520px;
          margin: 70px auto;
          padding: 48px 30px;
          text-align: center;
        }

        .empty-icon {
          font-size: 58px;
          margin-bottom: 18px;
        }

        .empty-card h2 {
          font-family: 'Fredoka', sans-serif;
          font-size: 30px;
          color: #332f2b;
          margin: 0 0 10px;
        }

        .empty-card p {
          color: #8b7d73;
          margin-bottom: 24px;
        }

        .primary-link {
          display: inline-block;
          background: #929b83;
          color: white;
          padding: 14px 28px;
          border-radius: 18px;
          text-decoration: none;
          font-weight: 800;
        }

        .loading {
          text-align: center;
          padding: 80px;
          color: #8b7d73;
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .cart-grid {
            grid-template-columns: 1fr;
          }

          .summary-card {
            position: static;
          }
        }

        @media (max-width: 620px) {
          .cart-page {
            padding: 40px 22px 70px;
          }

          .cart-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .cart-img {
            width: 100%;
            height: 220px;
          }

          .price-box {
            width: 100%;
            align-items: flex-start;
          }
        }
      `}</style>

      {!isLoggedIn ? (
        <div className="empty-card">
          <div className="empty-icon">🛒</div>
          <h2>Please login to view your cart</h2>
          <p>Your saved artworks will appear here after login.</p>
          <Link to="/login" className="primary-link">
            Login
          </Link>
        </div>
      ) : loading ? (
        <div className="loading">Loading your cart...</div>
      ) : items.length === 0 ? (
        <div className="empty-card">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some beautiful Nepalese art to your collection.</p>
          <Link to="/products" className="primary-link">
            Browse Artworks
          </Link>
        </div>
      ) : (
        <div className="cart-container">
          <h1 className="cart-title">My Cart</h1>
          <p className="cart-subtitle">
            Review your selected artworks before checkout.
          </p>

          <div className="cart-grid">
            <div>
              {items.map((item) => (
                <div key={item.id} className="cart-card">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="cart-img"
                  />

                  <div className="item-info">
                    <div className="item-title">{item.title}</div>

                    <div className="item-meta">
                      {item.size_label && `${item.size_label}`}
                      {item.frame_name && ` · ${item.frame_name}`}
                    </div>

                    <div className="qty-row">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="qty-btn"
                      >
                        −
                      </button>

                      <span className="qty-number">{item.quantity}</span>

                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="price-box">
                    <div className="price">
                      NPR {parseFloat(item.total_price).toLocaleString()}
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal ({items.length} items)</span>
                <strong>NPR {subtotal.toLocaleString()}</strong>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <strong>
                  {shippingFee === 0 ? 'Free' : `NPR ${shippingFee}`}
                </strong>
              </div>

              {shippingFee > 0 && (
                <div className="shipping-note">
                  Free shipping on orders above NPR 5,000.
                </div>
              )}

              <div className="divider" />

              <div className="summary-row total-row">
                <span>Total</span>
                <span>NPR {total.toLocaleString()}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="checkout-btn"
              >
                Proceed to Checkout
              </button>

              <Link to="/products" className="continue-link">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;