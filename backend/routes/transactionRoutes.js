// transactionRoutes.js (BARU)

const express = require('express');
const router = express.Router();

// 1. Biarkan import ini untuk fungsi GET, DELETE, dll.
const {
    getAllTransactions,
    getTransactionById,
    getDailyReport, 
    deleteTransactionById,
} = require('../controllers/transactionController.js');

// 2. TAMBAHKAN import ini untuk fungsi create (POST)
const { createOrder } = require('../controllers/orderController.js');

// 3. GANTI baris ini untuk menggunakan fungsi yang benar
router.post('/', createOrder); // <-- INI SOLUSINYA

router.get('/', getAllTransactions);
router.get('/:id', getTransactionById);
router.get('/report/daily', getDailyReport);
router.delete('/:id', deleteTransactionById);

module.exports = router;