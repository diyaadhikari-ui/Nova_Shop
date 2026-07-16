import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: '#1a1410',
      color: 'rgba(255,255,255,0.6)',
      padding: '3rem 2rem 1.5rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1.4fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Brand */}
        <div>
          <h3 style={{
            color: '#fff',
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '12px'
          }}>
            Nova Shop
          </h3>
          <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
            Bringing Nepalese wall décor to homes around the world.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 style={{
            color: '#fff',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '12px'
          }}>
            Explore
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <Link to="/products" style={{
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: '13px'
            }}>
              New Arrivals
            </Link>
            <Link to="/products" style={{
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: '13px'
            }}>
              Collections
            </Link>
            <Link to="/products?featured=true" style={{
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: '13px'
            }}>
              Featured Prints
            </Link>
          </div>
        </div>

        {/* Support */}
        <div>
          <h4 style={{
            color: '#fff',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '12px'
          }}>
            Support
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <Link to="/" style={{
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: '13px'
            }}>
              Help Center
            </Link>
            <Link to="/orders" style={{
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: '13px'
            }}>
              Track Order
            </Link>
            <Link to="/" style={{
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: '13px'
            }}>
              Contact Us
            </Link>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h4 style={{
            color: '#fff',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '12px'
          }}>
            Newsletter
          </h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              placeholder="Your email"
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.08)',
                border: '0.5px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                color: '#fff',
                outline: 'none'
              }}
            />
            <button style={{
              background: '#E07B39',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              cursor: 'pointer'
            }}>
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '0.5px solid rgba(255,255,255,0.1)',
        paddingTop: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '12px' }}>
          © 2026 Nova Shop. All rights reserved.
        </span>
        <span style={{ fontSize: '12px' }}>
          Privacy Policy · Terms of Service
        </span>
      </div>
    </footer>
  );
};

export default Footer;