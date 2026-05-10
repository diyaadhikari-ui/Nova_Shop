import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/database.js';

import authRoutes from './routes/authRoutes.js';
import artworkRoutes from './routes/artworkRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads path
const uploadsPath = path.join(__dirname, '../uploads');
console.log('Uploads folder path:', uploadsPath);

// Serve uploads FIRST
app.use('/uploads', express.static(uploadsPath));

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
pool.query('SELECT NOW()').then(() => {
  console.log('✅ Database connection verified');
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Nova Shop API is running!',
    status: 'ok',
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});