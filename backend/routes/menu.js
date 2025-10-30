// File: backend/routes/menu.js

const router = require('express').Router();
const Menu = require('../models/menu.model'); // Pastikan pakai 'const'

// === 1. CREATE (Tambah Menu) ===
router.post('/add', async (req, res) => {
  try {
    const { nama, harga, gambar } = req.body;
    if (!nama || !harga) {
      return res.status(400).json({ message: 'Nama dan harga wajib diisi.' });
    }

    const newMenu = new Menu({ nama, harga, gambar });
    await newMenu.save();
    res.status(201).json({ message: 'Menu berhasil ditambahkan!' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// === 2. READ ALL (Lihat Semua Menu) ===
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.find(); 
    res.status(200).json(menus);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// === 3. READ ONE (Lihat Detail Menu - untuk Edit) ===
router.get('/:id', async (req, res) => {
    try {
        const menu = await Menu.findById(req.params.id);
        if (!menu) {
            return res.status(404).json({ message: 'Menu tidak ditemukan.' });
        }
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// === 4. UPDATE (Edit Menu) ===
router.put('/update/:id', async (req, res) => {
  try {
    const { nama, harga, gambar } = req.body;

    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.id,
      { nama, harga, gambar },
      { new: true } 
    );

    if (!updatedMenu) {
      return res.status(404).json({ message: 'Menu tidak ditemukan.' });
    }
    res.status(200).json({ message: 'Menu berhasil di-update!', menu: updatedMenu });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// === 5. DELETE (Hapus Menu) ===
router.delete('/:id', async (req, res) => {
  try {
    const deletedMenu = await Menu.findByIdAndDelete(req.params.id);

    if (!deletedMenu) {
      return res.status(404).json({ message: 'Menu tidak ditemukan.' });
    }
    res.status(200).json({ message: 'Menu berhasil dihapus.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;