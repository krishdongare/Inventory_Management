# InvenTrack — Inventory Management System
> MERN Stack · MVC Architecture · Based on SE SRS Document (Feb 2026)

## Project Structure
```
inventory-app/
├── server/                      # Express backend (MVC)
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── controllers/             # C — Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── supplierController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT protect + RBAC authorize
│   │   └── errorHandler.js      # Central error handler
│   ├── models/                  # M — Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Supplier.js
│   │   ├── Order.js
│   │   └── Transaction.js
│   ├── routes/                  # V (router layer)
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── supplierRoutes.js
│   │   └── userRoutes.js
│   └── server.js                # Entry point
├── client/                      # React frontend
│   ├── public/index.html
│   └── src/
│       ├── context/AuthContext.js
│       ├── components/
│       │   ├── Navbar.js
│       │   └── PrivateRoute.js
│       ├── pages/
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Dashboard.js
│       │   ├── Inventory.js
│       │   ├── Orders.js
│       │   ├── Suppliers.js
│       │   └── Users.js
│       ├── utils/api.js
│       ├── App.js
│       └── index.js
├── package.json
└── .env.example
```

## Prerequisites
- Node.js >= 18
- MongoDB (local or MongoDB Atlas)

## Setup

### 1. Clone and install backend dependencies
```bash
cd inventory-app
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

### 3. Install frontend dependencies
```bash
cd client
npm install
cd ..
```

### 4. Run in development (both servers)
```bash
npm run dev:full
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## API Endpoints

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login & get JWT |
| GET | /api/auth/me | Private | Get current user |
| PUT | /api/auth/updatepassword | Private | Change password |

### Products (Inventory)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | /api/products | Private | List all (search, filter, paginate) |
| POST | /api/products | Manager/Admin | Create product |
| GET | /api/products/:id | Private | Get one |
| PUT | /api/products/:id | Manager/Admin | Update |
| DELETE | /api/products/:id | Admin | Soft delete |
| PATCH | /api/products/:id/stock | Warehouse+ | Manual stock adjustment (FR2.4) |
| GET | /api/products/alerts/low-stock | Private | Low stock alerts (FR2.3) |
| GET | /api/products/stats/summary | Private | Inventory stats |

### Orders
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | /api/orders | Private | List orders |
| POST | /api/orders | Private | Create order (validates stock FR1.3) |
| GET | /api/orders/:id | Private | Get one |
| PATCH | /api/orders/:id/status | Manager/Admin | Update status |
| GET | /api/orders/stats/sales | Manager/Admin/Sales | Sales report (FR3.1) |

### Suppliers
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | /api/suppliers | Private | List suppliers |
| POST | /api/suppliers | Manager/Admin | Create |
| PUT | /api/suppliers/:id | Manager/Admin | Update |
| DELETE | /api/suppliers/:id | Admin | Soft delete |

### Users (Admin only)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | /api/users | Admin | List all users |
| PUT | /api/users/:id | Admin | Update role/status |
| DELETE | /api/users/:id | Admin | Deactivate user |

## Roles & Permissions
| Role | Capabilities |
|------|-------------|
| admin | Full access — all CRUD, user management |
| manager | Inventory CRUD, orders, suppliers |
| warehouse | View inventory, adjust stock |
| sales | View inventory, create/view orders |

## SRS Requirements Implemented
- FR1.x — Order processing & validation ✅
- FR2.x — Inventory & stock monitoring ✅
- FR2.3 — Low stock alerts ✅
- FR2.4 — Manual stock override ✅
- FR3.1 — Historical sales data for forecasting hook ✅
- FR4.x — Payment/transaction schema ✅
- NFR1.1 — Passwords hashed (bcrypt) ✅
- NFR1.2 — RBAC on all routes ✅
- NFR1.3 — Input validation via Mongoose ✅
- NFR4.1 — Modular MVC architecture ✅
