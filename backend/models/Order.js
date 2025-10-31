const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Ini adalah schema untuk *item di dalam* keranjang
const OrderItemSchema = new Schema({
  // Kita simpan referensi ke ID produk aslinya
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu', // Sesuaikan 'Menu' dengan nama model produkmu (cth: 'Product' atau 'Menu')
    required: true,
  },
  nama: {
    type: String,
    required: true,
  },
  harga: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  // Simpan fotoUrl saat order dibuat, untuk arsip
  fotoUrl: {
    type: String,
    default: '',
  }
});

// Ini adalah schema untuk "struk" utamanya
const OrderSchema = new Schema(
  {
    // Daftar item yang dibeli
    items: [OrderItemSchema],

    // Total harga dari semua item
    totalPrice: {
      type: Number,
      required: true,
    },

    // Jumlah uang yang dibayar pelanggan
    paymentAmount: {
      type: Number,
      required: true,
    },

    // Jumlah kembalian
    changeAmount: {
      type: Number,
      required: true,
    },

    // Status pesanan, untuk sinkronisasi offline
    status: {
      type: String,
      enum: ['completed', 'pending_sync'], // 'completed' = online, 'pending_sync' = offline
      default: 'completed',
    },

    // (Opsional) Referensi ke user kasir yang membuat order
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Akun', // Sesuaikan 'Akun' dengan nama model usermu
    // },
  },
  {
    timestamps: true, // Otomatis menambah createdAt dan updatedAt
  }
);

// Perhatikan: Mongoose akan membuat collection 'orders' (jamak) di MongoDB
const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;

