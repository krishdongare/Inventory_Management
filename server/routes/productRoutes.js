const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  adjustStock,
  deleteProduct,
  getLowStockAlerts,
  getInventoryStats,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/alerts/low-stock', getLowStockAlerts);
router.get('/stats/summary', getInventoryStats);

router
  .route('/')
  .get(getProducts)
  .post(authorize('admin', 'manager'), createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(authorize('admin', 'manager'), updateProduct)
  .delete(authorize('admin'), deleteProduct);

router.patch('/:id/stock', authorize('admin', 'manager', 'warehouse'), adjustStock);

module.exports = router;
