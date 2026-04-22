const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getSalesStats,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats/sales', authorize('admin', 'manager', 'sales'), getSalesStats);

router
  .route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id').get(getOrder);
router.patch('/:id/status', authorize('admin', 'manager'), updateOrderStatus);

module.exports = router;
