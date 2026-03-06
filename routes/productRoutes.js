const express = require('express');
const {
  getProducts,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const router = express.Router();

router.get('/products', getProducts);
router.get('/product/barcode/:barcode', getProductByBarcode);
router.post('/product', createProduct);
router.put('/product/:id', updateProduct);
router.delete('/product/:id', deleteProduct);

module.exports = router;

