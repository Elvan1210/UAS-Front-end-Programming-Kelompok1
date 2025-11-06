const express = require('express');
const router = express.Router();
const { createOrder, syncOrders } = require('../controllers/orderController.js'); 

router.post('/', createOrder);

router.post('/sync', syncOrders);

module.exports = router;

