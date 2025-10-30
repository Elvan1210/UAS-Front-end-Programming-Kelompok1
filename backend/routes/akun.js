const router = require('express').Router();
const Akun = require('../models/akun.model');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }
    const userExists = await Akun.findOne({ email: email });
    if (userExists) {
      return res.status(400).json({ message: 'Email ini sudah terdaftar.' });
    }
    const newAkun = new Akun({
      email,
      password,
    });
    await newAkun.save();
    res.status(201).json({
      message: 'Registrasi berhasil!',
      userId: newAkun._id,
      email: newAkun.email,
    });
  } catch (error) {
    console.error('Error saat Registrasi:', error);
    res
      .status(500)
      .json({ message: 'Terjadi kesalahan di server.', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    const user = await Akun.findOne({ email: email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      res.status(200).json({
        message: 'Login berhasil!',
        email: user.email,
        token: token,
      });
    } else {
      res.status(401).json({ message: 'Email atau password salah.' });
    }
  } catch (error) {
    console.error('Error saat Login:', error);
    res
      .status(500)
      .json({ message: 'Terjadi kesalahan di server.', error: error.message });
  }
});

module.exports = router;