const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getAllTransactions, // <-- Ganti dari getTransactions
  getTransactionById, // <-- Tambahkan ini
  getDailyReport,  
  deleteTransactionById,   // <-- Tambahkan ini
} = require('../controllers/transactionController.js'); // Pastikan .js jika ada

// POST /api/transactions
// (Sudah benar)
router.post('/', createTransaction);

// GET /api/transactions
// (Perbaiki nama fungsinya)
router.get('/', getAllTransactions);

// GET /api/transactions/:id
// (Tambahkan route ini)
router.get('/:id', getTransactionById);

// GET /api/transactions/report/daily
// (Tambahkan route ini untuk laporan)
router.get('/report/daily', getDailyReport);

router.delete('/:id', deleteTransactionById);

module.exports = router;