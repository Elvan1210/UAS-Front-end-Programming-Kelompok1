const router = require('express').Router();
const Akun = require('../models/akun.model');
const jwt = require('jsonwebtoken');

// --- FUNGSI BARU: Generate Token ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// ==========================================================
// A. MIDDLEWARE PROTEKSI (BARU)
// ==========================================================
// Middleware ini akan mengecek token dan menempelkan 'req.user'
// Ini akan kita pakai untuk melindungi rute
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Ambil token dari header (mis: "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Cari user di DB berdasarkan ID dari token
      req.user = await Akun.findById(decoded.id).select('-password');
      next(); // Lanjut ke rute berikutnya
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware ini mengecek apakah user adalah ADMIN
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Lanjut karena dia admin
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// ==========================================================
// B. ENDPOINT REGISTER KASIR (DIMODIFIKASI)
// ==========================================================
// (Permintaan 2 & 3: Hanya admin yang bisa register kasir)
// Endpoint ini sekarang dilindungi oleh 'protect' dan 'admin'
router.post('/register-kasir', protect, admin, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }
    const userExists = await Akun.findOne({ email: email });
    if (userExists) {
      return res.status(400).json({ message: 'Email ini sudah terdaftar.' });
    }
    
    // Buat akun baru, 'role' akan otomatis 'kasir' (dari default di model)
    const newAkun = new Akun({
      email,
      password,
      // 'role' tidak perlu di-set, otomatis 'kasir'
    });
    
    await newAkun.save();
    res.status(201).json({
      message: 'Registrasi kasir berhasil!',
      userId: newAkun._id,
      email: newAkun.email,
      role: newAkun.role,
    });
  } catch (error) {
    console.error('Error saat Registrasi Kasir:', error);
    res.status(500).json({ message: 'Terjadi kesalahan di server.', error: error.message });
  }
});


// ==========================================================
// C. ENDPOINT LOGIN (DIMODIFIKASI)
// ==========================================================
// (Permintaan 1: Frontend perlu tahu role user)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    const user = await Akun.findOne({ email: email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      // --- PERUBAHAN DI SINI ---
      // Sekarang kita kirim 'role' juga ke frontend
      res.status(200).json({
        message: 'Login berhasil!',
        email: user.email,
        token: token,
        role: user.role // <-- PENTING UNTUK FRONTEND
      });
      // --- AKHIR PERUBAHAN ---

    } else {
      res.status(401).json({ message: 'Email atau password salah.' });
    }
  } catch (error) {
    console.error('Error saat Login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan di server.', error: error.message });
  }
});

router.post('/setup-first-admin', async (req, res) => {
  try {
    // 1. Cek apakah sudah ada admin
    const adminExists = await Akun.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Setup gagal. Admin sudah ada.' });
    }

    // 2. Jika belum ada, buat admin baru
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    const newAdmin = new Akun({
      email,
      password,
      role: 'admin'
    });

    await newAdmin.save();
    res.status(201).json({
      message: 'Admin pertama berhasil dibuat!',
      email: newAdmin.email,
      role: newAdmin.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error saat setup admin', error: error.message });
  }
});


module.exports = router;