import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = filter ? `?status=${filter}` : '';
      const res = await api.get(`/orders${params}`);
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated!');
      fetchOrders();
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const statuses = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ];

  const statusColors = {
    pending: { bg: 'rgba(195, 167, 106, 0.18)', color: '#7a5a18' },
    confirmed: { bg: 'rgba(146, 155, 131, 0.16)', color: '#5f6b51' },
    processing: { bg: 'rgba(139, 125, 115, 0.15)', color: '#66594f' },
    shipped: { bg: 'rgba(146, 155, 131, 0.16)', color: '#5f6b51' },
    delivered: { bg: 'rgba(109, 117, 95, 0.18)', color: '#4f5c42' },
    cancelled: { bg: 'rgba(163, 45, 45, 0.1)', color: '#a32d2d' },
    refunded: { bg: 'rgba(247, 241, 232, 0.9)', color: '#8b7d73' }
  };

  return (
    <div className="orders-page">
      <style>{pageStyle}</style>

      <div className="orders-header">
        <div>
          <h1>Orders Management</h1>
          <p>View, filter, and update all customer artwork orders.</p>
        </div>

        <div className="admin-badge">
          {orders.length} Orders
        </div>
      </div>

      <div className="filter-card">
        <button
          onClick={() => setFilter('')}
          className={!filter ? 'filter-btn active' : 'filter-btn'}
        >
          All Orders
        </button>

        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={filter === status ? 'filter-btn active' : 'filter-btn'}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="state-box">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="state-box">No orders found</div>
      ) : (
        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {[
                    'Order #',
                    'Customer',
                    'Items',
                    'Total',
                    'Payment',
                    'Status',
                    'Update Status',
                    'Date'
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="strong">#{order.order_number}</td>

                    <td>
                      <div className="customer-name">
                        {order.full_name || 'Customer'}
                      </div>
                      <div className="customer-email">
                        {order.email}
                      </div>
                    </td>

                    <td>{order.items?.length || 0} items</td>

                    <td className="strong">
                      NPR {parseFloat(order.total_amount).toLocaleString()}
                    </td>

                    <td>
                      <span
                        className={
                          order.payment_status === 'paid'
                            ? 'payment-pill paid'
                            : 'payment-pill unpaid'
                        }
                      >
                        {order.payment_status}
                      </span>
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

                    <td>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order.id, e.target.value)
                        }
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const pageStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');

  .orders-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(156, 163, 142, 0.18), transparent 30%),
      linear-gradient(135deg, #fffaf3 0%, #f4ede3 55%, #fffdf8 100%);
    padding: 2rem;
    font-family: 'Poppins', sans-serif;
    color: #463f39;
  }

  .orders-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 20px;
    margin-bottom: 2rem;
  }

  .orders-header h1 {
    font-family: 'Fredoka', sans-serif;
    font-size: 42px;
    color: #332f2b;
    margin: 0 0 6px;
  }

  .orders-header p {
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

  .filter-card {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    background: rgba(255, 252, 247, 0.86);
    border: 1px solid rgba(212, 197, 176, 0.65);
    border-radius: 28px;
    padding: 18px;
    margin-bottom: 2rem;
    box-shadow: 0 20px 50px rgba(61, 54, 48, 0.08);
    backdrop-filter: blur(12px);
  }

  .filter-btn {
    border: 1px solid #d8c7b5;
    background: rgba(255,255,255,0.68);
    color: #5d5148;
    padding: 10px 18px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    text-transform: capitalize;
    transition: 0.25s ease;
  }

  .filter-btn:hover {
    transform: translateY(-2px);
  }

  .filter-btn.active {
    background: #929b83;
    border-color: #929b83;
    color: white;
    box-shadow: 0 12px 26px rgba(146, 155, 131, 0.24);
  }

  .table-card {
    background: rgba(255, 252, 247, 0.9);
    border: 1px solid rgba(212, 197, 176, 0.65);
    border-radius: 30px;
    overflow: hidden;
    box-shadow: 0 22px 58px rgba(61, 54, 48, 0.09);
    backdrop-filter: blur(12px);
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
    padding: 13px 16px;
    text-align: left;
    color: #8b7d73;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.9px;
    white-space: nowrap;
  }

  td {
    padding: 15px 16px;
    border-bottom: 1px solid #eee3d5;
    color: #675d55;
    font-size: 13px;
    white-space: nowrap;
  }

  .strong {
    color: #332f2b;
    font-weight: 900;
  }

  .customer-name {
    color: #332f2b;
    font-weight: 900;
    margin-bottom: 3px;
  }

  .customer-email {
    color: #9a8b7f;
    font-size: 11px;
  }

  .payment-pill,
  .status-pill {
    display: inline-block;
    padding: 6px 13px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
    text-transform: capitalize;
  }

  .payment-pill.paid {
    background: rgba(109, 117, 95, 0.18);
    color: #4f5c42;
  }

  .payment-pill.unpaid {
    background: rgba(195, 167, 106, 0.18);
    color: #7a5a18;
  }

  select {
    padding: 8px 12px;
    border: 1px solid #d8c7b5;
    border-radius: 12px;
    background: rgba(255,255,255,0.78);
    color: #5d5148;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    outline: none;
    font-family: 'Poppins', sans-serif;
  }

  select:focus {
    border-color: #929b83;
    box-shadow: 0 0 0 4px rgba(146, 155, 131, 0.14);
  }

  .state-box {
    text-align: center;
    padding: 4rem;
    color: #8b7d73;
    font-weight: 800;
    background: rgba(255, 252, 247, 0.86);
    border: 1px solid rgba(212, 197, 176, 0.65);
    border-radius: 28px;
    box-shadow: 0 20px 50px rgba(61, 54, 48, 0.08);
  }

  @media (max-width: 760px) {
    .orders-page {
      padding: 1.3rem;
    }

    .orders-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .orders-header h1 {
      font-size: 34px;
    }
  }
`;

export default Orders;