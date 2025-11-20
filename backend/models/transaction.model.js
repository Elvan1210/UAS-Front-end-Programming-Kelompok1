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
    name: String,
    price: Number,
    quantity: Number,
    
    // === BAGIAN PENTING: FIELD NOTES DITAMBAHKAN ===
    notes: { 
      type: String, 
      default: '' // Default kosong jika tidak ada catatan
    },
    
    subtotal: Number 
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
  
  // Identitas Kasir
  cashier: {
    type: String,
    required: true
  },
  
  // Tanggal Transaksi
  transactionDate: {
    type: Date,
    default: Date.now 
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Transaction', transactionSchema);