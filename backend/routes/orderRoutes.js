const express = require('express');
const router = express.Router();
// Pastikan path ke controller-mu benar
const { createOrder, syncOrders } = require('../controllers/orderController.js'); 

// (Opsional: Nanti kamu bisa tambahkan middleware autentikasi di sini)
// const authMiddleware = require('../middleware/authMiddleware');
// router.use(authMiddleware); // <-- Untuk melindungi semua rute order

// Rute untuk membuat satu pesanan (saat online)
// Alamat lengkapnya akan jadi: POST /api/orders/
router.post('/', createOrder);

// Rute untuk sinkronisasi banyak pesanan (dari antrian offline)
// Alamat lengkapnya akan jadi: POST /api/orders/sync
router.post('/sync', syncOrders);

// (Nanti kamu bisa tambahkan rute GET di sini untuk melihat riwayat pesanan)
// router.get('/', getOrders); 

module.exports = router;

