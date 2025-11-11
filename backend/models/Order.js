const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',     required: true,
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
  fotoUrl: {
    type: String,
    default: '',
  }
});

const OrderSchema = new Schema(
  {
    items: [OrderItemSchema],

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
      required: true,
    },

    paymentMethod: {
      type: String,
      required: false, // Kita buat 'false' agar data lama tidak error
      default: 'N/A'  // Beri default 'N/A'
    },

    status: {
      type: String,
      enum: ['completed', 'pending_sync'], 
      default: 'completed',
    },

    
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;

