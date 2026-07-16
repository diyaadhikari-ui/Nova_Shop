import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', label: 'Analytics', icon: '📊' },
    { path: '/admin/inventory', label: 'Inventory', icon: '🖼️' },
    { path: '/admin/orders', label: 'Orders', icon: '📦' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      minHeight: '100vh'
    }}>
      <div style={{
        background: '#1a1410',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '20px 16px',
          borderBottom: '0.5px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            color: '#fff',
            fontSize: '15px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#E07B39' }}>🎨</span>
            Nova Shop
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '11px',
            marginTop: '4px'
          }}>
            Admin Panel
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                color: location.pathname === item.path
                  ? '#fff'
                  : 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                fontSize: '13px',
                background: location.pathname === item.path
                  ? 'rgba(255,255,255,0.1)'
                  : 'transparent'
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{
          padding: '16px',
          borderTop: '0.5px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '12px',
            marginBottom: '8px'
          }}>
            {user?.fullName}
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: '0.5px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.6)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Logout
          </button>
        </div>
      </div>
      <div style={{
        background: '#f5f4f2',
        overflow: 'auto'
      }}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;