const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// SCHEMA ANAK: Detail per item
const OrderItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu', 
    required: true, 
  },
  nama: { type: String, required: true },
  harga: { type: Number, required: true },
  quantity: { type: Number, required: true },
  
  // === BAGIAN PENTING: PASTIKAN INI ADA ===
  // Ini tempat menyimpan link gambar (Cloudinary) selamanya
  fotoUrl: { type: String, default: '' },
  notes: { type: String, default: '' }
});

// SCHEMA UTAMA
const OrderSchema = new Schema(
  {
    items: [OrderItemSchema], 
    totalPrice: { type: Number, required: true },
    paymentAmount: { type: Number, required: true },
    changeAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: false, default: 'N/A' },
    status: {
      type: String,
      enum: ['completed', 'pending_sync'], 
      default: 'completed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);