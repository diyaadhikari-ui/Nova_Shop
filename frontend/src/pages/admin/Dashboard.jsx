import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalArtworks: 0,
    pendingOrders: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const ordersRes = await api.get('/orders');
      const artworksRes = await api.get('/artworks');

      const orders = ordersRes.data.orders || [];
      const artworks = artworksRes.data.artworks || [];

      const totalRevenue = orders
        .filter((o) => o.payment_status === 'paid')
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

      const pendingOrders = orders.filter((o) => o.status === 'pending').length;

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalArtworks: artworks.length,
        pendingOrders
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Revenue',
      value: `NPR ${stats.totalRevenue.toLocaleString()}`,
      icon: '💰'
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: '📦'
    },
    {
      label: 'Artworks Listed',
      value: stats.totalArtworks,
      icon: '🎨'
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      icon: '⏳'
    }
  ];

  const statusColors = {
    pending: { bg: 'rgba(195, 167, 106, 0.18)', color: '#7a5a18' },
    confirmed: { bg: 'rgba(146, 155, 131, 0.16)', color: '#5f6b51' },
    processing: { bg: 'rgba(139, 125, 115, 0.15)', color: '#66594f' },
    shipped: { bg: 'rgba(146, 155, 131, 0.16)', color: '#5f6b51' },
    delivered: { bg: 'rgba(109, 117, 95, 0.18)', color: '#4f5c42' },
    cancelled: { bg: 'rgba(163, 45, 45, 0.1)', color: '#a32d2d' }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <style>{pageStyle}</style>
        <div className="state-box">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <style>{pageStyle}</style>

      <div className="admin-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Monitor Nova Shop performance, orders, and artwork activity.</p>
        </div>

        <div className="admin-badge">Admin Panel</div>
      </div>

      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{card.icon}</div>

            <div>
              <p>{card.label}</p>
              <h2>{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h3>Recent Orders</h3>
            <p>Latest customer purchases and payment status.</p>
          </div>

          <Link to="/admin/orders">View all</Link>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {['Order', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="strong">#{order.order_number}</td>

                    <td>{order.full_name || 'Customer'}</td>

                    <td className="strong">
                      NPR {parseFloat(order.total_amount).toLocaleString()}
                    </td>

                    <td>
                      <span
                        className="status-pill"
                        style={{
                          background:
                            statusColors[order.status]?.bg ||
                            'rgba(247, 241, 232, 0.9)',
                          color:
                            statusColors[order.status]?.color || '#8b7d73'
                        }}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const pageStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');

  .admin-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(156, 163, 142, 0.18), transparent 30%),
      linear-gradient(135deg, #fffaf3 0%, #f4ede3 55%, #fffdf8 100%);
    padding: 2rem;
    font-family: 'Poppins', sans-serif;
    color: #463f39;
  }

  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 20px;
    margin-bottom: 2rem;
  }

  .admin-header h1 {
    font-family: 'Fredoka', sans-serif;
    font-size: 42px;
    color: #332f2b;
    margin: 0 0 6px;
  }

  .admin-header p {
    color: #8b7d73;
    font-size: 14px;
    margin: 0;
  }

  .admin-badge {
    background: rgba(255, 252, 247, 0.85);
    border: 1px solid rgba(212, 197, 176, 0.65);
    color: #6d755f;
    border-radius: 999px;
    padding: 12px 20px;
    font-size: 13px;
    font-weight: 900;
    box-shadow: 0 12px 28px rgba(61, 54, 48, 0.06);
    white-space: nowrap;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: rgba(255, 252, 247, 0.86);
    border: 1px solid rgba(212, 197, 176, 0.65);
    border-radius: 28px;
    padding: 22px;
    box-shadow: 0 20px 50px rgba(61, 54, 48, 0.08);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: 0.25s ease;
  }

  .stat-card:hover {
    transform: translateY(-4px);
  }

  .stat-icon {
    width: 52px;
    height: 52px;
    border-radius: 18px;
    background: rgba(146, 155, 131, 0.16);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .stat-card p {
    color: #8b7d73;
    font-size: 13px;
    margin: 0 0 6px;
    font-weight: 800;
  }

  .stat-card h2 {
    color: #332f2b;
    font-size: 24px;
    margin: 0;
    font-weight: 900;
  }

  .table-card {
    background: rgba(255, 252, 247, 0.9);
    border: 1px solid rgba(212, 197, 176, 0.65);
    border-radius: 30px;
    overflow: hidden;
    box-shadow: 0 22px 58px rgba(61, 54, 48, 0.09);
    backdrop-filter: blur(12px);
  }

  .table-header {
    padding: 22px 26px;
    border-bottom: 1px solid #e5d8c7;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
  }

  .table-header h3 {
    font-family: 'Fredoka', sans-serif;
    color: #332f2b;
    font-size: 24px;
    margin: 0 0 4px;
  }

  .table-header p {
    margin: 0;
    color: #8b7d73;
    font-size: 13px;
  }

  .table-header a {
    color: #6d755f;
    font-size: 13px;
    font-weight: 900;
    text-decoration: none;
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead {
    background: rgba(247, 241, 232, 0.9);
  }

  th {
    padding: 13px 22px;
    text-align: left;
    color: #8b7d73;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.9px;
    white-space: nowrap;
  }

  td {
    padding: 15px 22px;
    border-bottom: 1px solid #eee3d5;
    color: #675d55;
    font-size: 13px;
    white-space: nowrap;
  }

  .strong {
    color: #332f2b;
    font-weight: 900;
  }

  .status-pill {
    display: inline-block;
    padding: 6px 13px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
    text-transform: capitalize;
  }

  .empty-row {
    text-align: center;
    padding: 3rem;
    color: #8b7d73;
  }

  .state-box {
    max-width: 460px;
    margin: 80px auto;
    text-align: center;
    background: rgba(255, 252, 247, 0.88);
    border: 1px solid rgba(212, 197, 176, 0.65);
    border-radius: 28px;
    padding: 36px;
    color: #8b7d73;
    font-weight: 800;
  }

  @media (max-width: 1050px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 650px) {
    .admin-page {
      padding: 1.3rem;
    }

    .admin-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .admin-header h1 {
      font-size: 34px;
    }
  }
`;

export default Dashboard;