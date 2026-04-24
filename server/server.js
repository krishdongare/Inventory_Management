const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// CORS — allow React dev server
app.use(
  cors({
    origin: [
      'https://inventory-management-gamma-lilac.vercel.app', 
      'http://localhost:3000'
    ],
    methods: ["GET", "POST", "PUT", "PATCH" ,"DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.options('*', cors());


// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



// ── Routes ──────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'Inventory Management API is running' })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Central error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
