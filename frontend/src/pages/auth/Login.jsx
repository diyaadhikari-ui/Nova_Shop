import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post('/auth/login', form);

      login(res.data.user, res.data.accessToken, res.data.refreshToken);

      toast.success('Welcome back!');

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');

        .auth-page {
          min-height: calc(100vh - 56px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Poppins', sans-serif;
          background:
            radial-gradient(circle at top left, rgba(156, 163, 142, 0.2), transparent 30%),
            linear-gradient(135deg, #fffaf3 0%, #f4ede3 55%, #fffdf8 100%);
        }

        .auth-visual {
          background:
            radial-gradient(circle at 20% 20%, rgba(146,155,131,0.22), transparent 28%),
            linear-gradient(145deg, #3a302a 0%, #2f2924 55%, #4b4038 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .auth-visual::after {
          content: '';
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: rgba(232, 222, 209, 0.08);
          right: -90px;
          bottom: -90px;
        }

        .logo-box {
          width: 92px;
          height: 92px;
          border-radius: 28px;
          background: #929b83;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
          box-shadow: 0 24px 55px rgba(0,0,0,0.22);
        }

        .auth-visual h2 {
          font-family: 'Fredoka', sans-serif;
          color: #fffaf3;
          font-size: 34px;
          margin: 0 0 10px;
        }

        .auth-visual p {
          color: rgba(255,250,243,0.66);
          font-size: 14px;
          line-height: 1.7;
          max-width: 340px;
          margin: 0;
        }

        .auth-form-side {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
        }

        .auth-card {
          width: 100%;
          max-width: 410px;
          background: rgba(255, 252, 247, 0.88);
          border: 1px solid rgba(212, 197, 176, 0.65);
          border-radius: 34px;
          padding: 34px;
          box-shadow: 0 24px 60px rgba(61, 54, 48, 0.1);
          backdrop-filter: blur(12px);
        }

        .tabs {
          display: flex;
          background: rgba(247, 241, 232, 0.9);
          border: 1px solid #e5d8c7;
          border-radius: 18px;
          padding: 5px;
          margin-bottom: 28px;
        }

        .tab,
        .tab-link {
          flex: 1;
          text-align: center;
          padding: 11px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
        }

        .tab {
          background: #929b83;
          color: #fff;
          box-shadow: 0 10px 22px rgba(146, 155, 131, 0.25);
        }

        .tab-link {
          color: #8b7d73;
        }

        .auth-card h2 {
          font-family: 'Fredoka', sans-serif;
          font-size: 34px;
          color: #332f2b;
          margin: 0 0 8px;
        }

        .subtitle {
          color: #8b7d73;
          font-size: 14px;
          margin: 0 0 26px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        label {
          display: block;
          color: #8b7d73;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.7px;
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
          transition: 0.25s ease;
        }

        input:focus {
          border-color: #929b83;
          box-shadow: 0 0 0 4px rgba(146, 155, 131, 0.14);
        }

        .submit-btn {
          width: 100%;
          border: none;
          background: #929b83;
          color: white;
          padding: 15px;
          border-radius: 18px;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          margin-top: 8px;
          margin-bottom: 18px;
          box-shadow: 0 16px 34px rgba(146, 155, 131, 0.28);
          transition: 0.25s ease;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .bottom-text {
          text-align: center;
          font-size: 13px;
          color: #8b7d73;
        }

        .bottom-text a {
          color: #6d755f;
          font-weight: 900;
          text-decoration: none;
        }

        @media (max-width: 850px) {
          .auth-page {
            grid-template-columns: 1fr;
          }

          .auth-visual {
            padding: 3rem 2rem;
          }
        }

        @media (max-width: 520px) {
          .auth-form-side {
            padding: 2rem 1.2rem;
          }

          .auth-card {
            padding: 26px;
            border-radius: 28px;
          }
        }
      `}</style>

      <div className="auth-visual">
        <div className="logo-box">
          <svg width="58" height="58" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="18" fill="#fffaf3" />
            <polygon
              points="40,14 62,58 18,58"
              fill="none"
              stroke="#929b83"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <polygon points="40,26 52,48 28,48" fill="#929b83" opacity="0.35" />
            <circle cx="40" cy="11" r="4" fill="#929b83" />
          </svg>
        </div>

        <h2>Nova Shop</h2>
        <p>Modern Nepalese wall décor crafted for warm, soulful spaces.</p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="tabs">
            <div className="tab">Login</div>

            <Link to="/register" className="tab-link">
              Create Account
            </Link>
          </div>

          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to continue collecting beautiful art.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Signing in...' : 'Sign In to Nova Shop'}
            </button>
          </form>

          <div className="bottom-text">
            Don&apos;t have an account?{' '}
            <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;