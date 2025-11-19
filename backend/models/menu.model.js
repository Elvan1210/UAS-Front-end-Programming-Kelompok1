const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// DEFINISI SCHEMA: Struktur data untuk setiap item Menu (Makanan/Minuman)
const menuSchema = new Schema({
  nama: {
    type: String,
    required: true,
    trim: true // Otomatis hapus spasi di awal/akhir input
  },
  harga: {
    type: String, // NOTE: Disimpan sebagai STRING, bukan Number.
    required: true,
    trim: true
  },
  gambar: {
    type: String, // Menyimpan URL atau path file gambarnya
    trim: true,
    default: null
  },
  stock: { 
    type: Number, // Jumlah stok tersedia
    required: true,
    default: 0
  },
  category: {
    type: String, // Kategori menu (Default: 'Makanan')
    required: true,
    default: 'Makanan'
  },
}, 
{
  // OPSI: Mengubah nama field timestamp default (createdAt -> created_at)
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Export model dan paksa nama collection di DB jadi 'menus'
const Menu = mongoose.model('Menu', menuSchema, 'menus');

module.exports = Menu;