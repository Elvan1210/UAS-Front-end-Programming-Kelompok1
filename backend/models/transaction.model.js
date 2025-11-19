const mongoose = require('mongoose');

// DEFINISI SCHEMA: Struktur data Transaksi Penjualan
const transactionSchema = new mongoose.Schema({
  // Array berisi daftar barang yang dibeli dalam satu struk
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menus', // Relasi ke data induk Produk
      required: true
    },
    // SNAPSHOT DATA: 
    // Nama & Harga disimpan ulang di sini.
    // Tujuannya: Jika di masa depan nama/harga di database induk berubah,
    // riwayat transaksi lama TETAP SESUAI dengan harga saat pembelian terjadi.
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number // Hasil kali price * quantity
  }],
  
  // Total belanjaan (Grand Total)
  total: {
    type: Number,
    required: true
  },
  
  // Uang yang dibayarkan pelanggan
  payment: {
    type: Number,
    required: true
  },
  
  // Uang kembalian
  change: {
    type: Number,
    required: true
  },
  
  // Identitas Kasir (Audit Trail)
  // Menyimpan nama/ID siapa yang memproses transaksi ini.
  cashier: {
    type: String,
    required: true
  },
  
  // Tanggal Transaksi
  transactionDate: {
    type: Date,
    default: Date.now // Default ke waktu saat ini
  }
}, {
  timestamps: true // Mencatat createdAt & updatedAt secara otomatis
});

module.exports = mongoose.model('Transaction', transactionSchema);