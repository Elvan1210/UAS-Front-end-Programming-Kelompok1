const router = require('express').Router();
const Menu = require('../models/menu.model');
const cloudinary = require('cloudinary').v2;
const fs = require('fs'); 

router.post('/add', async (req, res) => {
  try {
    const { nama, harga, category, stock } = req.body; 
    let gambarURL = null;

    if (!nama || !harga || !category || !stock) {
      return res.status(400).json({ message: 'Nama, harga, kategori, dan stok wajib diisi.' });
    }

    if (req.files && req.files.gambar) {
      const file = req.files.gambar;
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'kasir-umkm-menu',
      });
      gambarURL = result.secure_url;
      fs.unlinkSync(file.tempFilePath);
    }
    
    const newMenu = new Menu({ 
      nama, 
      harga, 
      category,
      stock,
      gambar: gambarURL
    });
    
    await newMenu.save();
    res.status(201).json({ 
        message: 'Menu berhasil ditambahkan!', 
        menu: newMenu
    });

  } catch (error) {
    console.error('Error saat menambah menu:', error);
    res.status(500).json({ 
        message: 'Server error saat menambah menu (termasuk upload gambar)', 
        error: error.message 
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const menus = await Menu.find(); 
    res.status(200).json(menus);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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

router.put('/update/:id', async (req, res) => {
  try {
    const { nama, harga, category, stock } = req.body;
    let updatedData = { nama, harga, category, stock };

    if (req.files && req.files.gambar) {
        const file = req.files.gambar;
        
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'kasir-umkm-menu',
        });
        
        updatedData.gambar = result.secure_url;
        
        fs.unlinkSync(file.tempFilePath);
        
    } else if (req.body.gambar === '') {
                updatedData.gambar = null;
    }
    
    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.id,
      updatedData, 
      { new: true } 
    );

    if (!updatedMenu) {
      return res.status(404).json({ message: 'Menu tidak ditemukan.' });
    }
    res.status(200).json({ message: 'Menu berhasil di-update!', menu: updatedMenu });

  } catch (error) {
    console.error('Error saat update menu:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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