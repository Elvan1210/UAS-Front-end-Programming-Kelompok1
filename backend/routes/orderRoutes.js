const express = require('express');
const router = express.Router();
// Import controller yang sudah dibuat tadi
const { createOrder, syncOrders } = require('../controllers/orderController.js'); 

// ROUTE 1: Buat Pesanan Baru (Online/Real-time)
// URL: POST /api/orders/
// Dipanggil saat kasir klik "Bayar" dan internet sedang nyala.
router.post('/', createOrder);

// ROUTE 2: Sinkronisasi Data Offline
// URL: POST /api/orders/sync
// Dipanggil otomatis saat aplikasi mendeteksi internet kembali nyala.
// Menerima ARRAY pesanan yang tertunda selama offline.
router.post('/sync', syncOrders);

module.exports = router;