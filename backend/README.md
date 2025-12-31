# 🖥️ Grocery Store Backend

Node.js/Express backend for the Grocery Store e-commerce application.

## 📁 Backend Structure

```
backend/
├── src/
│   ├── server.js               (Entry point)
│   ├── app.js                  (Express app setup)
│   │
│   ├── config/
│   │   └── db.js              (Database connection)
│   │
│   ├── models/                 (Sequelize models)
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Invoice.js
│   │
│   ├── controllers/            (Business logic)
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── invoiceController.js
│   │   └── reportController.js
│   │
│   ├── routes/                 (API endpoints)
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── invoiceRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── reportRoutes.js
│   │
│   ├── services/               (Reusable logic)
│   │   ├── openFoodFactsService.js
│   │   ├── paypalService.js
│   │   └── reportsService.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── adminOnly.js
│   │
│   └── utils/
│       ├── createAdmin.js
│       ├── resetAdminPassword.js
│       ├── dbTest.js
│       └── WebDb.js
│
├── package.json
├── package-lock.json
├── .env
└── .gitignore
```

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Environment Setup
Create `.env` file:
```
DATABASE_URL=postgres://user:password@host:port/database
JWT_SECRET=your_secret_key_here
PORT=5000
```

### Start Development Server
```bash
npm run dev
```

Server runs on: `http://localhost:5000`
API Docs: `http://localhost:5000/api-docs`

## 📊 API Endpoints

### Total: 28 Endpoints

**Authentication (2)**
- `POST /auth/signup` - Register
- `POST /auth/login` - Login

**Users (6)**
- `GET /users` - All users (admin)
- `GET /users/profile` - Current profile
- `PUT /users/profile` - Update profile
- `DELETE /users/profile` - Delete account
- `PUT /users/{id}` - Update user (admin)
- `DELETE /users/{id}` - Delete user (admin)

**Products (5)**
- `GET /products` - All products
- `GET /products/{id}` - Single product
- `POST /products` - Create (admin)
- `PUT /products/{id}` - Update (admin)
- `DELETE /products/{id}` - Delete (admin)

**Invoices (6)**
- `GET /invoices` - Get invoices
- `GET /invoices/{id}` - Single invoice
- `GET /invoices/user/{userId}` - User invoices (admin)
- `POST /invoices` - Create invoice
- `PUT /invoices/{id}` - Update (admin)
- `DELETE /invoices/{id}` - Delete (admin)

**Payments (1)**
- `POST /payments/paypal/webhook` - Webhook handler

**Reports (7)**
- `GET /reports` - All KPIs
- `GET /reports/sales` - Sales metrics
- `GET /reports/average-transaction` - Avg transaction
- `GET /reports/top-products` - Top products
- `GET /reports/active-customers` - Active customers
- `GET /reports/low-stock` - Low stock products
- `GET /reports/revenue-by-category` - Revenue breakdown

## 🔐 Authentication

All protected endpoints require JWT token:
```
Authorization: Bearer {token}
```

Get token from login:
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trinity.com","password":"Admin@123"}'
```

## 🔑 Admin Credentials

```
Email:    admin@trinity.com
Password: Admin@123
```

Reset password:
```bash
node src/utils/resetAdminPassword.js
```

## 📚 Database

### Tables
- **users** - User accounts (admin/customer)
- **products** - Inventory items
- **invoices** - Orders with payment tracking

### Auto-Sync
Database tables automatically created/updated on startup.

### Test Connection
```bash
node src/utils/dbTest.js
```

## 🛠️ Commands

```bash
# Development
npm run dev                # Start with nodemon (watches files)
npm start                  # Production start

# Utilities
node src/utils/resetAdminPassword.js    # Reset admin password
node src/utils/dbTest.js                # Test DB connection
node src/utils/createAdmin.js           # Create admin user
```

## 🌐 API Testing

### Swagger UI
Open: `http://localhost:5000/api-docs`

Steps:
1. Click 🔒 Authorize
2. Get token from POST /auth/login
3. Paste: `Bearer {token}`
4. Test endpoints

### cURL Examples

**Create Product (Admin)**
```bash
TOKEN="your_token_here"

curl -X POST http://localhost:5000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Organic Apples",
    "brand": "FarmFresh",
    "price": 4.99,
    "category": "Fruits",
    "quantityInStock": 100,
    "picture": "https://example.com/apple.jpg",
    "nutritionalInfo": {
      "calories": 52,
      "protein": 0.3,
      "carbs": 14,
      "fat": 0.2,
      "fiber": 2.4
    }
  }'
```

**Create Invoice**
```bash
curl -X POST http://localhost:5000/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {"productId": 1, "quantity": 2}
    ],
    "billingAddress": "123 Main St",
    "billingCity": "Boston",
    "billingZipCode": "02101",
    "billingCountry": "USA"
  }'
```

## 🔍 Key Features

### 1. Open Food Facts Integration
Fetch product data by barcode:
```json
POST /products
{
  "barcode": "3045320063411",
  "quantityInStock": 100,
  "price": 12.99
}
```

### 2. Stock Management
- Auto-deduct on purchase
- Auto-restore on deletion
- Validation before purchase

### 3. Payment Tracking
- Status: pending, completed, failed, refunded
- PayPal webhook integration
- Payment reference storage

### 4. Analytics (6 KPIs)
1. Total Sales
2. Average Transaction
3. Top Products
4. Active Customers
5. Low Stock
6. Revenue by Category

## 🔒 Security

- ✅ JWT authentication
- ✅ bcrypt password hashing
- ✅ Role-based access control
- ✅ Helmet HTTP headers
- ✅ CORS enabled
- ✅ SQL injection prevention
- ✅ Input validation
- ✅ Secure error handling

## 📊 Database Schema

### Users
```
id, email (unique), password, role, createdAt, updatedAt
```

### Products
```
id, name, brand, price, picture, category, nutritionalInfo (JSON),
quantityInStock, barcode (unique), description, openFoodFactsId,
createdAt, updatedAt
```

### Invoices
```
id, userId (FK), invoiceNumber (unique), totalAmount, items (JSON),
status, paymentProvider, paymentStatus, paymentReference, paymentMethod,
paidAt, billingAddress, billingCity, billingZipCode, billingCountry,
notes, createdAt, updatedAt
```

## 🧪 Testing

### Health Check
```bash
GET http://localhost:5000/api-docs
```

### Test All CRUD Operations
1. Signup at POST /auth/signup
2. Login at POST /auth/login
3. Get products: GET /products
4. Create invoice: POST /invoices
5. View reports: GET /reports

## ⚙️ Technology Stack

- **Node.js** - Runtime
- **Express.js** - Framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Swagger** - Documentation
- **Axios** - HTTP client

## 📈 Performance Tips

- Database connection pooling enabled
- Eager loading with Sequelize
- Proper indexing on unique fields
- JWT token caching ready
- Pagination ready endpoints

## 🐛 Troubleshooting

### Database Connection Failed
```bash
node src/utils/dbTest.js
```

### Port Already in Use
```bash
lsof -i :5000
kill -9 <PID>
npm run dev
```

### Token Invalid
- Login again
- Token expires in 1 hour
- Check Authorization header format

### Admin Password Reset
```bash
node src/utils/resetAdminPassword.js
# New password: Admin@123
```

## 📝 Logs

Logs appear in terminal with Morgan HTTP request logging:
```
GET /products 200 12.345 ms - 2500
```

## 🔗 Related Documentation

- `/README.md` - Main project documentation
- `/API_DOCUMENTATION.md` - Complete API reference
- `/ENDPOINT_REFERENCE.md` - Endpoint summary
- `/IMPLEMENTATION_CHECKLIST.md` - Features checklist

## 📞 Support

For issues:
1. Check `.env` configuration
2. Run `node src/utils/dbTest.js`
3. Review `API_DOCUMENTATION.md`
4. Check terminal logs

## ✅ Status

**Status**: ✅ Production Ready

- 28 endpoints implemented
- All CRUD operations working
- Authentication complete
- Database synced
- Error handling done

---

**Backend Path**: `/home/mahpara/Documents/GroceryStore/backend/`
**API Docs**: `http://localhost:5000/api-docs`
**Port**: 5000
