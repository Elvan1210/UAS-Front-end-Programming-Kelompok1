const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController'); // Import logika dari controller

// ROUTE 1: Ambil Semua Produk
// Method: GET
// URL: /api/products/
// Fungsi: Mengambil daftar semua produk yang aktif untuk ditampilkan di halaman kasir.
router.get('/', productController.getAllProducts);

// ROUTE 2: Ambil Detail Satu Produk
// Method: GET
// URL: /api/products/:id
// Fungsi: Mengambil data 1 produk spesifik (biasanya dipakai saat mau edit produk).
router.get('/:id', productController.getProductById);

// ROUTE 3: Tambah Produk Baru
// Method: POST
// URL: /api/products/
// Fungsi: Menerima data JSON untuk membuat produk baru.
router.post('/', productController.createProduct);

// ROUTE 4: Update Produk
// Method: PUT
// URL: /api/products/:id
// Fungsi: Mengupdate informasi produk yang sudah ada.
router.put('/:id', productController.updateProduct);

// ROUTE 5: Hapus Produk (Soft Delete)
// Method: DELETE
// URL: /api/products/:id
// Fungsi: Mengubah status produk menjadi tidak aktif (tidak benar-benar dihapus dari DB).
router.delete('/:id', productController.deleteProduct);

module.exports = router;