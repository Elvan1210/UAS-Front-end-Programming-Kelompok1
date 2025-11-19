const Product = require('../models/product.model');

// FUNGSI 1: Ambil semua data produk yang aktif saja
// Mengambil produk yang 'isActive: true' dan diurutkan sesuai abjad nama (A-Z).
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil data produk',
      error: error.message
    });
  }
};

// FUNGSI 2: Ambil detail satu produk berdasarkan ID
// Biasanya dipakai saat mau klik detail produk atau mau mengisi form edit.
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil data produk',
      error: error.message
    });
  }
};

// FUNGSI 3: Tambah produk baru ke database
// Menerima input nama, harga, stok, kategori, dan gambar.
exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock, category, image } = req.body;
    
    const product = new Product({
      name,
      price,
      stock,
      category,
      image
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error menambah produk',
      error: error.message
    });
  }
};

// FUNGSI 4: Update data produk yang sudah ada
// Mengubah data produk berdasarkan ID yang dikirim.
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, stock, category, image, isActive } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, stock, category, image, isActive },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Produk berhasil diupdate',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error update produk',
      error: error.message
    });
  }
};

// FUNGSI 5: Hapus produk secara 'Soft Delete'
// NOTE: Data TIDAK dihapus dari database, cuma status 'isActive' diubah jadi false biar tidak muncul di aplikasi.
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Produk berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error menghapus produk',
      error: error.message
    });
  }
};