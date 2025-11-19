const Order = require('../models/Order.js'); 
const Menu = require('../models/menu.model.js'); 

// FUNGSI 1: Membuat satu transaksi pesanan baru (Single Order)
// Dipanggil saat kasir menyelesaikan satu pembayaran.
const createOrder = async (req, res) => {
  try {
    const { items, totalPrice, paymentAmount, changeAmount, paymentMethod } = req.body;

    // Cek apakah data barang dan harga valid
    if (!items || items.length === 0 || !totalPrice) {
      return res.status(400).json({ message: 'Data pesanan tidak lengkap' });
    }

    // Siapkan object order baru dengan status 'completed'
    const newOrder = new Order({
      items,
      totalPrice,
      paymentAmount: paymentAmount || 0,
      changeAmount: changeAmount || 0,
      paymentMethod: paymentMethod || 'Tunai',
      status: 'completed',     
    });

    // Simpan ke database
    const savedOrder = await newOrder.save();
    res.status(201).json({ message: 'Pesanan berhasil disimpan', order: savedOrder });
  } catch (error) {
    console.error('Error saat membuat pesanan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

// FUNGSI 2: Sinkronisasi banyak pesanan sekaligus (Bulk Insert)
// Dipanggil biasanya saat aplikasi kembali online untuk mengupload data offline.
const syncOrders = async (req, res) => {
  try {
    const pendingOrders = req.body.orders;

    // Cek apakah ada array pesanan yang dikirim
    if (!pendingOrders || !Array.isArray(pendingOrders) || pendingOrders.length === 0) {
      return res.status(400).json({ message: 'Tidak ada pesanan untuk disinkronisasi' });
    }

    // Pastikan semua data yang masuk statusnya 'completed'
    const ordersToSync = pendingOrders.map(order => ({
      ...order,
      status: 'completed',
    }));

    // Masukkan semua data sekaligus ke database (lebih efisien daripada loop save satu-satu)
    const insertedOrders = await Order.insertMany(ordersToSync);

    res.status(201).json({ 
      message: `${insertedOrders.length} pesanan berhasil disinkronisasi`,
      syncedOrders: insertedOrders 
    });
  } catch (error) {
    console.error('Error saat sinkronisasi pesanan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

module.exports = {
  createOrder,
  syncOrders,
};