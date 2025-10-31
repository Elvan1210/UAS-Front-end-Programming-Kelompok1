const Transaction = require('../models/transaction.model');
const Product = require('../models/product.model');

// Buat transaksi baru
exports.createTransaction = async (req, res) => {
  try {
    const { items, total, payment, change, cashier } = req.body;

    // Validasi stock
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Produk ${item.name} tidak ditemukan`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock ${product.name} tidak mencukupi`
        });
      }
    }

    // Kurangi stock
    for (let item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Simpan transaksi
    const transaction = new Transaction({
      items,
      total,
      payment,
      change,
      cashier
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error membuat transaksi',
      error: error.message
    });
  }
};

// Get semua transaksi
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('items.productId')
      .sort({ createdAt: -1 });
    
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

// Get transaksi by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('items.productId');
    
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

// Get laporan harian
exports.getDailyReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const transactions = await Transaction.find({
      transactionDate: {
        $gte: today,
        $lt: tomorrow
      }
    });

    const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
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

exports.deleteTransactionById = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan',
      });
    }

    // Kembalikan stok produk
    for (const item of transaction.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    // Hapus transaksinya
    await Transaction.findByIdAndDelete(transactionId);

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