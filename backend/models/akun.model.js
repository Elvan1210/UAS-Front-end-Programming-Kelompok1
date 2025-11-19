const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

// DEFINISI SCHEMA: Struktur data user (Admin/Kasir)
const akunSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email wajib diisi'],
    unique: true, // Mencegah pendaftaran email yang sama
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password wajib diisi'],
    minlength: [6, 'Password minimal 6 karakter'] 
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'kasir'],
    default: 'kasir'
  }
}, {
  timestamps: true,
});

// Jalan SEBELUM data disimpan (pre-save).
// Kalau password baru/diedit, langsung di-hash biar aman (gak kebaca manusia).
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

// METHOD: Cek Password saat Login
// Dipanggil manual nanti di Auth Controller.
// Membandingkan password ketikan user vs password hash di database.
akunSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export model, paksa nama collection jadi 'users'
const Akun = mongoose.model('Akun', akunSchema, 'users');

module.exports = Akun;