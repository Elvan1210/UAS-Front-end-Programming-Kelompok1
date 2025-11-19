const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// SCHEMA ANAK (Sub-document): Detail per item yang dibeli
// Ini bukan tabel terpisah, tapi tertanam di dalam Order.
const OrderItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',    required: true, // Referensi ke ID menu asli
  },
  nama: {
    type: String,
    required: true, // Nama & Harga disimpan lagi di sini (snapshot) agar kalau menu asli berubah, data histori tetap aman.
  },
  harga: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  fotoUrl: {
    type: String,
    default: '',
  }
});

// SCHEMA UTAMA: Data satu transaksi penuh (Nota)
const OrderSchema = new Schema(
  {
    items: [OrderItemSchema], // Array berisi list makanan yang dibeli

    totalPrice: {
      type: Number,
      required: true,
    },

    paymentAmount: {
      type: Number,
      required: true,
    },

    changeAmount: {
      type: Number,
      required: true, // Uang kembalian
    },

    // Metode Bayar (Tunai/QRIS, dll)
    // Dibuat required: false & default 'N/A' supaya data lama yang belum punya field ini tidak error.
    paymentMethod: {
      type: String,
      required: false, 
      default: 'N/A'  
    },

    // STATUS TRANSAKSI (Penting untuk Sync Offline-Online)
    // 'pending_sync' = Transaksi terjadi saat OFFLINE dan belum naik ke server.
    // 'completed' = Transaksi sudah aman tersimpan di server.
    status: {
      type: String,
      enum: ['completed', 'pending_sync'], 
      default: 'completed',
    },

    
  },
  {
    timestamps: true, // Otomatis mencatat waktu transaksi (createdAt)
  }
);

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;