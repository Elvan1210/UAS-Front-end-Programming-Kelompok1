// Pastikan path ke model-model ini benar
const Order = require('../models/Order.js'); 
// Sesuaikan nama 'menu.model.js' jika berbeda (di screenshot 'menu.model.js')
const Menu = require('../models/menu.model.js'); 

// Fungsi untuk membuat satu pesanan baru (saat online)
const createOrder = async (req, res) => {
  try {
    const { items, totalPrice, paymentAmount, changeAmount, paymentMethod } = req.body;

    // Validasi dasar
    if (!items || items.length === 0 || !totalPrice) {
      return res.status(400).json({ message: 'Data pesanan tidak lengkap' });
    }

    // (Opsional: Di sini kamu bisa menambahkan logika untuk mengurangi stok produk)
    // for (const item of items) {
    //   await Menu.findByIdAndUpdate(item.productId, {
    //     $inc: { stok: -item.quantity } // Kurangi stok
    //   });
    // }

    const newOrder = new Order({
      items,
      totalPrice,
      paymentAmount: paymentAmount || 0,
      changeAmount: changeAmount || 0,
      paymentMethod: paymentMethod || 'Tunai',
      status: 'completed', // Status 'completed' karena dibuat saat online
      // createdBy: req.user.id // (Jika kamu pakai middleware autentikasi, aktifkan ini)
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: 'Pesanan berhasil disimpan', order: savedOrder });
  } catch (error) {
    console.error('Error saat membuat pesanan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

// Fungsi untuk menerima BANYAK pesanan (dari antrian offline)
const syncOrders = async (req, res) => {
  try {
    const pendingOrders = req.body.orders; // Berisi array of orders

    if (!pendingOrders || !Array.isArray(pendingOrders) || pendingOrders.length === 0) {
      return res.status(400).json({ message: 'Tidak ada pesanan untuk disinkronisasi' });
    }

    // Insert semua pesanan yang tertunda ke database
    // Kita juga set statusnya jadi 'completed' karena sudah masuk server
    const ordersToSync = pendingOrders.map(order => ({
      ...order,
      status: 'completed',
      // createdBy: req.user.id // (Jika pakai auth)
    }));

    const insertedOrders = await Order.insertMany(ordersToSync);

    // (Opsional: Di sini kamu juga bisa mengurangi stok berdasarkan semua pesanan)
    // ...

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
  // (Kamu bisa tambahkan getOrders, getOrderById, dll di sini nanti)
};