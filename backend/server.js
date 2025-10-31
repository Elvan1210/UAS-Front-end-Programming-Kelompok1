const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware umum
app.use(cors());
app.use(express.json());

// 🔹 Koneksi MongoDB
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ Koneksi ke MongoDB (Kantin_UAS) berhasil!");
})
.catch((err) => {
  console.error("❌ Error koneksi MongoDB:", err);
});

const connection = mongoose.connection;
connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// 🔹 Import routes yang sudah ada
const akunRouter = require('./routes/akun');
const menuRouter = require('./routes/menu');
const orderRoutes = require('./routes/orderRoutes');

// 🔹 Import routes baru untuk Kasir
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// 🔹 Routes utama
app.get('/', (req, res) => {
  res.json({ 
    message: "Halo! Server Backend Kasir berjalan!",
    version: "1.0.0",
    endpoints: {
      akun: "/akun",
      menu: "/menu",
      orders: "/api/orders",
      products: "/api/products",
      transactions: "/api/transactions"
    }
  });
});

// 🔹 Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// 🔹 Daftarkan semua routes
app.use('/akun', akunRouter);
app.use('/menu', menuRouter);
app.use('/api/orders', orderRoutes);

// 🔹 Routes baru untuk sistem kasir
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);

// 🔹 Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Terjadi kesalahan pada server!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 🔹 Handle 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Endpoint tidak ditemukan!' 
  });
});

// 🔹 Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${uri ? 'Configured' : 'Not Configured'}`);
});

// 🔹 Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Tutup server dengan graceful shutdown
  server.close(() => process.exit(1));
});

// 🔹 Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});