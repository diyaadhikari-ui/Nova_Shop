import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { items, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('esewa');

  const [form, setForm] = useState({
    shippingFullName: user?.fullName || '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingProvince: '',
    shippingPostalCode: ''
  });

  const shippingFee = subtotal > 5000 ? 0 : 200;
  const total = subtotal + shippingFee;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Cart is empty');
      navigate('/cart');
      return;
    }

    if (
      !form.shippingFullName ||
      !form.shippingPhone ||
      !form.shippingAddress ||
      !form.shippingCity
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      const orderItems = items.map((item) => ({
        artworkId: item.artwork_id || item.artworkId || item.id,
        quantity: item.quantity || 1,
        price: Number(item.price || item.unit_price || item.total_price || 0)
      }));

      const orderRes = await api.post('/orders', {
        ...form,
        paymentMethod,
        items: orderItems
      });

      const order = orderRes.data.order;

      if (paymentMethod === 'esewa') {
        const paymentRes = await api.post('/payment/initiate', {
          orderId: order.id
        });

        const { paymentData, esewaUrl } = paymentRes.data;

        const formEl = document.createElement('form');
        formEl.method = 'POST';
        formEl.action = esewaUrl;

        Object.entries(paymentData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          formEl.appendChild(input);
        });

        document.body.appendChild(formEl);
        formEl.submit();
        return;
      }

      if (paymentMethod === 'stripe') {
        const stripeRes = await api.post('/payment/stripe/create-checkout-session', {
          orderId: order.id
        });

        if (stripeRes.data.url) {
          window.location.href = stripeRes.data.url;
          return;
        }

        toast.error('Stripe checkout URL not found');
        return;
      }

      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const paymentMethods = [
    {
      id: 'esewa',
      label: 'eSewa',
      sub: 'Digital wallet payment',
      icon: '🌿'
    },
    {
      id: 'stripe',
      label: 'Stripe',
      sub: 'Pay securely with card',
      icon: '💳'
    },
    {
      id: 'cod',
      label: 'Cash on Delivery',
      sub: 'Pay when artwork arrives',
      icon: '📦'
    }
  ];

  return (
    <div className="checkout-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');

        .checkout-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(156, 163, 142, 0.18), transparent 30%),
            linear-gradient(135deg, #fffaf3 0%, #f4ede3 55%, #fffdf8 100%);
          font-family: 'Poppins', sans-serif;
          color: #463f39;
          padding: 52px 7vw 80px;
        }

        .checkout-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .breadcrumb {
          color: #9a8b7f;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 26px;
        }

        .breadcrumb strong {
          color: #332f2b;
        }

        .checkout-header {
          margin-bottom: 34px;
        }

        .checkout-header h1 {
          font-family: 'Fredoka', sans-serif;
          font-size: clamp(36px, 4vw, 56px);
          color: #332f2b;
          margin: 0 0 8px;
        }

        .checkout-header p {
          margin: 0;
          color: #8b7d73;
          font-size: 14px;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 28px;
          align-items: start;
        }

        .soft-card {
          background: rgba(255, 252, 247, 0.86);
          border: 1px solid rgba(212, 197, 176, 0.65);
          border-radius: 28px;
          padding: 26px;
          box-shadow: 0 20px 50px rgba(61, 54, 48, 0.08);
        }

        .soft-card + .soft-card {
          margin-top: 18px;
        }

        .card-title {
          font-family: 'Fredoka', sans-serif;
          font-size: 22px;
          color: #332f2b;
          margin: 0 0 22px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group.full {
          grid-column: span 2;
        }

        label {
          display: block;
          color: #8b7d73;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid #d8c7b5;
          background: rgba(255,255,255,0.78);
          color: #332f2b;
          outline: none;
          font-size: 14px;
        }

        input:focus {
          border-color: #929b83;
          box-shadow: 0 0 0 4px rgba(146, 155, 131, 0.14);
        }

        .payment-option {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          border-radius: 20px;
          border: 1px solid #e1d3c1;
          background: rgba(255,255,255,0.62);
          cursor: pointer;
          margin-top: 12px;
        }

        .payment-option.active {
          border-color: #929b83;
          background: rgba(146, 155, 131, 0.13);
        }

        .payment-icon {
          width: 46px;
          height: 46px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #929b83;
          color: white;
          font-size: 20px;
        }

        .payment-title {
          font-size: 14px;
          font-weight: 800;
          color: #332f2b;
        }

        .payment-sub {
          font-size: 12px;
          color: #8b7d73;
        }

        .check {
          margin-left: auto;
          color: #929b83;
          font-weight: 900;
        }

        .summary {
          position: sticky;
          top: 24px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 14px;
          color: #675d55;
          margin-bottom: 12px;
        }

        .summary-row strong {
          color: #332f2b;
        }

        .summary-item {
          border-bottom: 1px solid #eadfce;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }

        .divider {
          height: 1px;
          background: #e5d8c7;
          margin: 16px 0;
        }

        .total-row {
          font-size: 18px;
          font-weight: 900;
          color: #332f2b;
        }

        .checkout-btn {
          width: 100%;
          border: none;
          background: #929b83;
          color: white;
          padding: 15px;
          border-radius: 18px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          margin-top: 20px;
        }

        .checkout-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }

          .summary {
            position: static;
          }
        }

        @media (max-width: 600px) {
          .checkout-page {
            padding: 40px 22px 70px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full {
            grid-column: span 1;
          }
        }
      `}</style>

      <div className="checkout-container">
        <div className="breadcrumb">
          Cart → <strong>Checkout</strong> → Confirmation
        </div>

        <div className="checkout-header">
          <h1>Complete Your Order</h1>
          <p>Almost there — your selected Nepalese artwork is ready to be delivered.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="checkout-grid">
            <div>
              <div className="soft-card">
                <h3 className="card-title">1. Shipping Information</h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      name="shippingFullName"
                      value={form.shippingFullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      name="shippingPhone"
                      value={form.shippingPhone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>City *</label>
                    <input
                      name="shippingCity"
                      value={form.shippingCity}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Province</label>
                    <input
                      name="shippingProvince"
                      value={form.shippingProvince}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group full">
                    <label>Street Address *</label>
                    <input
                      name="shippingAddress"
                      value={form.shippingAddress}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="soft-card">
                <h3 className="card-title">2. Payment Method</h3>

                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`payment-option ${paymentMethod === method.id ? 'active' : ''}`}
                  >
                    <div className="payment-icon">{method.icon}</div>

                    <div>
                      <div className="payment-title">{method.label}</div>
                      <div className="payment-sub">{method.sub}</div>
                    </div>

                    {paymentMethod === method.id && <div className="check">✓</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="soft-card summary">
              <h3 className="card-title">Order Summary</h3>

              {items.map((item) => (
                <div key={item.id} className="summary-item">
                  <div className="summary-row">
                    <span>{item.title} × {item.quantity}</span>
                    <strong>
                      NPR {Number(item.total_price || item.price || 0).toLocaleString()}
                    </strong>
                  </div>
                </div>
              ))}

              <div className="summary-row">
                <span>Subtotal</span>
                <strong>NPR {subtotal.toLocaleString()}</strong>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <strong>{shippingFee === 0 ? 'Free' : `NPR ${shippingFee}`}</strong>
              </div>

              <div className="divider" />

              <div className="summary-row total-row">
                <span>Total</span>
                <span>NPR {total.toLocaleString()}</span>
              </div>

              <button type="submit" disabled={loading} className="checkout-btn">
                {loading
                  ? 'Processing...'
                  : paymentMethod === 'esewa'
                  ? 'Pay with eSewa'
                  : paymentMethod === 'stripe'
                  ? 'Pay with Stripe'
                  : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;