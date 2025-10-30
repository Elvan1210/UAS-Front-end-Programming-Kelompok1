const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const akunSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email wajib diisi'],
    unique: true, 
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password wajib diisi'],
    minlength: [6, 'Password minimal 6 karakter'] 
  }
}, {
  timestamps: true, 
});

akunSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

akunSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Akun = mongoose.model('Akun', akunSchema, 'users');

module.exports = Akun;