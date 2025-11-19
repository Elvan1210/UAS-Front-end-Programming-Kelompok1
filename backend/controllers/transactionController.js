const Order = require('../models/Order.js'); 
const Menu = require('../models/menu.model.js'); 

// Fungsi ini cuma disimpan supaya tidak perlu ubah-ubah file Router. 
// Logika transaksi baru ada di 'createOrder' (file orderController).
exports.createTransaction = async (req, res) => {
    console.log("PERINGATAN: createTransaction dipanggil, seharusnya createOrder.");
    res.status(500).json({ 
        success: false, 
        message: 'Kesalahan konfigurasi server: createTransaction tidak boleh dipanggil.' 
    });
};

// FUNGSI 1: Ambil semua riwayat transaksi
// Mengambil data dari model 'Order' dan diurutkan dari yang paling baru (Newest First).
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Order.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: transactions 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil data transaksi',
      error: error.message
    });
  }
};

// FUNGSI 2: Lihat detail satu transaksi
// Dipakai kalau mau lihat detail pesanan (misal: struk digital).
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Order.findById(req.params.id); 
    
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

// FUNGSI 3: Laporan Harian (Rekap Kasir)
// Menghitung total uang masuk dari jam 00:00 sampai 23:59 hari ini.
exports.getDailyReport = async (req, res) => {
  try {
    // Set range waktu hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Cari transaksi dalam rentang waktu tersebut
    const transactions = await Order.find({ 
      createdAt: { 
        $gte: today,
        $lt: tomorrow
      }
    });

    // Hitung total omzet
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

// FUNGSI 4: Hapus Transaksi & Restore Stok (PENTING!)
// Kalau transaksi dihapus, stok barang yang tadinya terbeli AKAN DIKEMBALIKAN ke menu.
exports.deleteTransactionById = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await Order.findById(transactionId); 

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan',
      });
    }

    // LOOPING: Kembalikan stok setiap item ke model 'Menu' sebelum transaksi dihapus
    for (const item of transaction.items) {
      await Menu.findByIdAndUpdate(item.productId, { 
        $inc: { stock: item.quantity }, // $inc menambah stok yang ada
      });
    }

    // Hapus data riwayat ordernya
    await Order.findByIdAndDelete(transactionId); 

    res.status(200).json({
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