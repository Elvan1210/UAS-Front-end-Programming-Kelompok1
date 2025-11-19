const mongoose = require('mongoose');

// DEFINISI SCHEMA: Model Produk (Barang Jualan)
// Ini adalah struktur data untuk koleksi 'products' di database.
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: String,
    default: 'Umum'
  },
  image: {
    type: String,
    default: null // Menyimpan string URL/path gambar, bukan file aslinya
  },
  // FITUR SOFT DELETE:
  // Field ini menentukan apakah produk muncul di aplikasi atau tidak.
  // Jika false = dihapus (disembunyikan), bukan hilang permanen dari DB.
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Otomatis mencatat waktu dibuat (createdAt) & diedit (updatedAt)
});

module.exports = mongoose.model('Product', productSchema);