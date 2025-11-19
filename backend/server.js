const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

// 1. KONFIGURASI ENVIRONMENT
// Membaca variabel rahasia dari file .env (seperti password DB, API Key)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
let server; 

// 2. KONFIGURASI CLOUDINARY
// Setup penyimpanan gambar online (agar tidak membebani server sendiri)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// 3. GLOBAL MIDDLEWARE
// cors: Mengizinkan Frontend (beda domain) untuk mengakses Backend ini.
app.use(cors());
// express.json: Agar server bisa membaca data format JSON yang dikirim Frontend.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// fileUpload: Menangani upload gambar sementara sebelum dikirim ke Cloudinary.
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));


// 4. KONEKSI DATABASE (MONGODB)
const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
.then(() => {
  console.log("✅ Koneksi ke MongoDB (Kantin_UAS) berhasil!");
})
.catch((err) => {
  console.error("❌ Error koneksi MongoDB:", err);
});

// Listener tambahan jika koneksi putus di tengah jalan
const connection = mongoose.connection;
connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// 5. IMPORT ROUTE
// Mengambil peta jalan (routes) dari file terpisah
const akunRouter = require('./routes/akun');
const menuRouter = require('./routes/menu');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// 6. BASE ENDPOINTS
// Cek apakah server nyala
app.get('/', (req, res) => {
  res.json({ 
    message: "Halo! Server Backend Kasir berjalan!",
    version: "1.0.0",
    endpoints: {
      akun: "/api/akun",
      menu: "/menu",
      orders: "/api/orders",
      products: "/api/products",
      transactions: "/api/transactions"
    }
  });
});

// Cek kesehatan server (biasanya buat monitoring)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// 7. MOUNTING ROUTES (PENDAFTARAN JALUR)
// Menghubungkan URL dengan file route yang sesuai
app.use('/api/akun', akunRouter);          // Login & Register
app.use('/menu', menuRouter);              // Manajemen Menu Makanan
app.use('/api/orders', orderRoutes);       // Transaksi & Sync Offline
app.use('/api/products', productRoutes);   // Produk (Jualan Barang)
app.use('/api/transactions', transactionRoutes); // Laporan & Riwayat

// 8. ERROR HANDLING (PENANGANAN ERROR)
// Middleware terakhir: Menangkap error apapun yang lolos dari controller
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Terjadi kesalahan pada server!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handler untuk alamat/URL yang tidak terdaftar (404)
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Endpoint tidak ditemukan!' 
  });
});

// 9. MENJALANKAN SERVER
server = app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${uri ? 'Configured' : 'Not Configured'}`);
});

// 10. GRACEFUL SHUTDOWN (KEAMANAN)
// Menangani error fatal agar server mati dengan benar (tidak zombie process)

// Jika ada Promise error yang tidak di-catch
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Jika server dimatikan paksa (misal: Ctrl+C atau server restart)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('✅ Server closed');
      // Tutup koneksi database dulu sebelum mati total
      mongoose.connection.close(false, () => {
        console.log('✅ MongoDB connection closed');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
});