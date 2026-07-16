import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav style={{
      background: '#1a1410',
      padding: '0 2rem',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <Link to="/" style={{
        color: '#fff',
        textDecoration: 'none',
        fontSize: '18px',
        fontWeight: '500',
        letterSpacing: '0.5px'
      }}>
        Nova Shop
      </Link>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link to="/products" style={{
          color: 'rgba(255,255,255,0.7)',
          textDecoration: 'none',
          fontSize: '14px'
        }}>
          Gallery
        </Link>

        <Link to="/products?category=contemporary" style={{
          color: 'rgba(255,255,255,0.7)',
          textDecoration: 'none',
          fontSize: '14px'
        }}>
          Collections
        </Link>

        {isAdmin() && (
          <Link to="/admin" style={{
            color: '#E07B39',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            Admin
          </Link>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.2rem'
      }}>
        <Link to="/products" style={{ color: 'rgba(255,255,255,0.7)' }}>
          🔍
        </Link>

        <Link to="/cart" style={{
          color: 'rgba(255,255,255,0.7)',
          position: 'relative',
          textDecoration: 'none'
        }}>
          🛒
          {itemCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#E07B39',
              color: '#fff',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '500'
            }}>
              {itemCount}
            </span>
          )}
        </Link>

        {isLoggedIn ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              👤 {user?.fullName?.split(' ')[0]}
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                minWidth: '170px',
                zIndex: 1001,
                overflow: 'hidden'
              }}>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '10px 16px',
                    color: '#2a1f14',
                    textDecoration: 'none',
                    fontSize: '13px'
                  }}
                >
                  Profile
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '10px 16px',
                    color: '#2a1f14',
                    textDecoration: 'none',
                    fontSize: '13px'
                  }}
                >
                  My Orders
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    color: '#A32D2D',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" style={{
            color: 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;