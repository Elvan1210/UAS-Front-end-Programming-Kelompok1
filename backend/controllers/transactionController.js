// controllers/transactionController.js (VERSI BARU YANG SUDAH DIPERBAIKI)

const Order = require('../models/Order.js'); // GANTI DARI 'Transaction' ke 'Order'
const Menu = require('../models/menu.model.js'); // GANTI DARI 'Product' ke 'Menu'

// Fungsi ini TIDAK DIPAKAI LAGI, tapi kita biarkan agar router tidak error
exports.createTransaction = async (req, res) => {
    console.log("PERINGATAN: createTransaction dipanggil, seharusnya createOrder.");
    res.status(500).json({ 
        success: false, 
        message: 'Kesalahan konfigurasi server: createTransaction tidak boleh dipanggil.' 
    });
};

// Get semua transaksi (MEMBACA DARI 'Order')
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Order.find() // GANTI: Membaca dari Order
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: transactions // Frontend Anda mengharapkan objek { success: true, data: ... }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil data transaksi',
      error: error.message
    });
  }
};

// Get transaksi by ID (MEMBACA DARI 'Order')
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Order.findById(req.params.id); // GANTI: Membaca dari Order
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil data transaksi',
      error: error.message
    });
  }
};

// Get laporan harian (MEMBACA DARI 'Order' DAN FIELD YANG BENAR)
exports.getDailyReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const transactions = await Order.find({ // GANTI: Membaca dari Order
      createdAt: { // GANTI: Field 'createdAt' (dari timestamps)
        $gte: today,
        $lt: tomorrow
      }
    });

    // GANTI: Field 'totalPrice'
    const totalSales = transactions.reduce((sum, t) => sum + t.totalPrice, 0); 
    const totalTransactions = transactions.length;

    res.status(200).json({
      success: true,
      data: {
        date: today,
        totalSales,
        totalTransactions,
        transactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil laporan',
      error: error.message
    });
    }
  };

// Hapus transaksi (MENGHAPUS DARI 'Order')
exports.deleteTransactionById = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await Order.findById(transactionId); // GANTI: Membaca dari Order

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan',
      });
    }

    // Kembalikan stok produk (menggunakan model 'Menu')
    for (const item of transaction.items) {
      await Menu.findByIdAndUpdate(item.productId, { // GANTI: Model 'Menu'
        $inc: { stock: item.quantity },
      });
    }

    // Hapus transaksinya
    await Order.findByIdAndDelete(transactionId); // GANTI: Menghapus dari Order

Readres.status(200).json({
      success: true,
      message: 'Transaksi berhasil dihapus dan stok telah dikembalikan',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error menghapus transaksi',
      error: error.message,
    });
  }
};