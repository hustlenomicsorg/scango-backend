const express = require('express');
const {
  getProducts,
  getProductByBarcode,
  createProduct
} = require('../controllers/productController');

const router = express.Router();

router.get('/products', getProducts);
router.get('/product/:barcode', getProductByBarcode);
router.post('/product', createProduct);

module.exports = router;

