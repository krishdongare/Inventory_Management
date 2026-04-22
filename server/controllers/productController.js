const Product = require('../models/Product');

// @desc    Get all products (with optional search/filter)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const { search, category, stockStatus, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (stockStatus) query.stockStatus = stockStatus;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('supplier', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplier');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (manager, admin)
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (manager, admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust stock manually (FR2.4)
// @route   PATCH /api/products/:id/stock
// @access  Private (manager, admin, warehouse)
const adjustStock = async (req, res, next) => {
  try {
    const { adjustment, reason } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const newQuantity = product.quantity + Number(adjustment);
    if (newQuantity < 0) {
      return res.status(400).json({ success: false, message: 'Stock cannot go below zero' });
    }

    product.quantity = newQuantity;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Stock adjusted by ${adjustment}. Reason: ${reason || 'Manual override'}`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private (admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product removed from inventory' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock alerts (FR2.3)
// @route   GET /api/products/alerts/low-stock
// @access  Private
const getLowStockAlerts = async (req, res, next) => {
  try {
    const lowStock = await Product.find({
      isActive: true,
      stockStatus: { $in: ['low', 'out_of_stock'] },
    }).populate('supplier', 'name email phone');

    res.status(200).json({ success: true, count: lowStock.length, data: lowStock });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory summary stats
// @route   GET /api/products/stats/summary
// @access  Private
const getInventoryStats = async (req, res, next) => {
  try {
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$stockStatus',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
        },
      },
    ]);

    const totalProducts = await Product.countDocuments({ isActive: true });
    const categories = await Product.distinct('category', { isActive: true });

    res.status(200).json({
      success: true,
      data: { totalProducts, categories: categories.length, stockBreakdown: stats },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  adjustStock,
  deleteProduct,
  getLowStockAlerts,
  getInventoryStats,
};
