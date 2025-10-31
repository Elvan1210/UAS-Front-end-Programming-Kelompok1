const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  total: {
    type: Number,
    required: true
  },
  payment: {
    type: Number,
    required: true
  },
  change: {
    type: Number,
    required: true
  },
  cashier: {
    type: String,
    required: true
  },
  transactionDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);