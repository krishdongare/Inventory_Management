const mongoose = require('mongoose');

/**
 * Product Schema — tracks inventory items (FR2.x)
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    minimumThreshold: {
      type: Number,
      required: [true, 'Minimum threshold is required'],
      min: [0, 'Threshold cannot be negative'],
      default: 10,
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Price cannot be negative'],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Computed field — updated whenever quantity changes
    stockStatus: {
      type: String,
      enum: ['healthy', 'low', 'out_of_stock'],
      default: 'healthy',
    },
  },
  { timestamps: true }
);

// Auto-compute stock status before save (FR2.2, FR2.3)
productSchema.pre('save', function (next) {
  if (this.quantity <= 0) {
    this.stockStatus = 'out_of_stock';
  } else if (this.quantity <= this.minimumThreshold) {
    this.stockStatus = 'low';
  } else {
    this.stockStatus = 'healthy';
  }
  next();
});

// Virtual: is low stock alert needed?
productSchema.virtual('needsReorder').get(function () {
  return this.quantity <= this.minimumThreshold;
});

module.exports = mongoose.model('Product', productSchema);
