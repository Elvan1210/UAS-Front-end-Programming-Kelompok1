const Order = require('../models/Order.js'); 
const Menu = require('../models/menu.model.js'); 

const createOrder = async (req, res) => {
  try {
    const { items, totalPrice, paymentAmount, changeAmount, paymentMethod } = req.body;

    if (!items || items.length === 0 || !totalPrice) {
      return res.status(400).json({ message: 'Data pesanan tidak lengkap' });
    }

    const newOrder = new Order({
      items,
      totalPrice,
      paymentAmount: paymentAmount || 0,
      changeAmount: changeAmount || 0,
      paymentMethod: paymentMethod || 'Tunai',
      status: 'completed',     
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: 'Pesanan berhasil disimpan', order: savedOrder });
  } catch (error) {
    console.error('Error saat membuat pesanan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const syncOrders = async (req, res) => {
  try {
    const pendingOrders = req.body.orders;

    if (!pendingOrders || !Array.isArray(pendingOrders) || pendingOrders.length === 0) {
      return res.status(400).json({ message: 'Tidak ada pesanan untuk disinkronisasi' });
    }

    const ordersToSync = pendingOrders.map(order => ({
      ...order,
      status: 'completed',
    }));

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