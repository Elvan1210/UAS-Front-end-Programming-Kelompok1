const Product = require('../models/product.model');

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