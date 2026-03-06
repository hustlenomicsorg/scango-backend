const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder
} = require('../controllers/orderController');

const router = express.Router();

router.post('/order', createOrder);
router.get('/orders', getOrders);
router.get('/order/:id', getOrder);

module.exports = router;

