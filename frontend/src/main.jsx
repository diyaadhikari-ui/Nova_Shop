import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Inventory from './pages/admin/Inventory'
import AdminOrders from './pages/admin/Orders'
import './index.css'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import NovaAI from './components/ai/NovaAI'

import Home from './pages/shop/Home'
import Products from './pages/shop/Products'
import ProductDetail from './pages/shop/ProductDetail'
import Cart from './pages/shop/Cart'
import Checkout from './pages/shop/Checkout'
import OrderConfirmation from './pages/shop/OrderConfirmation'
import Profile from './pages/shop/Profile'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" />
  if (!isAdmin()) return <Navigate to="/" />
  return children
}

const Layout = ({ children }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <Navbar />

    <main style={{ flex: 1 }}>
      {children}
    </main>

    <Footer />
    <NovaAI />
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" />

          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/products" element={<Layout><Products /></Layout>} />
            <Route path="/products/:slug" element={<Layout><ProductDetail /></Layout>} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/profile" element={
              <Layout>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </Layout>
            } />

            <Route path="/cart" element={
              <Layout>
                <ProtectedRoute><Cart /></ProtectedRoute>
              </Layout>
            } />

            <Route path="/checkout" element={
              <Layout>
                <ProtectedRoute><Checkout /></ProtectedRoute>
              </Layout>
            } />

            <Route path="/order-confirmation/:id" element={
              <Layout>
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              </Layout>
            } />

            <Route path="/payment/success" element={
              <Layout>
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              </Layout>
            } />

            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout><Dashboard /></AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/inventory" element={
              <AdminRoute>
                <AdminLayout><Inventory /></AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/orders" element={
              <AdminRoute>
                <AdminLayout><AdminOrders /></AdminLayout>
              </AdminRoute>
            } />

            <Route path="*" element={
              <Layout>
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                  <h2 style={{ color: '#2a1f14' }}>
                    404 — Page not found
                  </h2>
                  <a href="/" style={{ color: '#E07B39' }}>
                    Go Home
                  </a>
                </div>
              </Layout>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)