const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create order + validate stock (FR1.1–FR1.4)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { customer, items, notes } = req.body;

    // Validate stock for each item (FR1.3)
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}`,
        });
      }
      // Snapshot price and name at order time
      item.unitPrice = product.unitPrice;
      item.productName = product.name;
    }

    // Calculate total
    const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

    const order = await Order.create({
      customer,
      items,
      totalAmount,
      notes,
      processedBy: req.user._id,
      status: 'confirmed',
    });

    // Deduct stock (FR2.1)
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity },
      });
      // Trigger stockStatus recalculation
      const p = await Product.findById(item.product);
      await p.save();
    }

    // Populate for response
    await order.populate('processedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order confirmed successfully', // FR1.4
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('processedBy', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (manager, admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order stats / sales report (FR3.1 - historical data for forecasting)
// @route   GET /api/orders/stats/sales
// @access  Private (manager, admin, sales)
const getSalesStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const stats = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          ordersCount: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({ success: true, data: { dailyStats: stats, topProducts } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, getOrder, updateOrderStatus, getSalesStats };
