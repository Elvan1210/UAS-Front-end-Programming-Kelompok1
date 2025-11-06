const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuSchema = new Schema({
  nama: {
    type: String,
    required: true,
    trim: true
  },
  harga: {
    type: String, 
    required: true,
    trim: true
  },
  gambar: {
    type: String,
    trim: true,
    default: null
  },
  stock: { 
    type: Number, 
    required: true,
    default: 0
  },
  category: {
    type: String,
    required: true,
    default: 'Makanan'
  },
}, 
{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Menu = mongoose.model('Menu', menuSchema, 'menus');

module.exports = Menu;