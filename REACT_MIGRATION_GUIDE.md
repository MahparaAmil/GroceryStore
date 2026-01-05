# React Frontend Setup Guide

## Converting from Static HTML to React

Your new React frontend is located in the `frontend-react/` directory and replaces the static `frontend/` folder.

### Key Improvements

1. **Component-Based Architecture**: Modular, reusable components
2. **State Management**: React Context for auth and cart
3. **Routing**: React Router for seamless navigation
4. **Performance**: Optimized re-renders and code splitting
5. **Maintainability**: Cleaner code organization

### Directory Structure

```
frontend-react/
├── public/                 # Static files
├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── services/         # API integration
│   ├── context/          # State management
│   ├── styles/           # CSS files
│   ├── App.js            # Main component
│   └── index.js          # Entry point
├── package.json          # Dependencies
└── README.md             # Documentation
```

### Quick Start

1. **Install Dependencies**
   ```bash
   cd frontend-react
   npm install
   ```

2. **Setup Environment**
   Create `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

3. **Run Development Server**
   ```bash
   npm start
   ```
   Opens at http://localhost:3000

4. **Build for Production**
   ```bash
   npm run build
   ```
   Creates optimized build in `build/` directory

### Component Mapping (Old → New)

#### Pages
- `index.html` → `pages/Home.js`
- `pages/cart.html` → `pages/Cart.js`
- `pages/checkout.html` → `pages/Checkout.js`
- `pages/order-confirmation.html` → `pages/OrderConfirmation.js`
- `pages/admin-login.html` → `pages/AdminLogin.js`
- `pages/admin/admin-dashboard.html` → `pages/AdminDashboard.js`

#### Components
- Navbar from all pages → `components/Navbar.js`
- Footer from all pages → `components/Footer.js`
- Product cards → `components/ProductCard.js`

#### Services
- `js/api.js` (vanilla fetch) → `services/api.js` (Axios)

#### Context
- Cart logic → `context/CartContext.js`
- Auth logic → `context/AuthContext.js`

### Migration Checklist

- [x] Create React project structure
- [x] Set up Context API for state management
- [x] Create reusable components
- [x] Implement routing with React Router
- [x] Convert API service to Axios
- [x] Create all pages
- [x] Add responsive styling
- [ ] Test all functionality
- [ ] Deploy to production

### Next Steps

1. **Test the application**: Ensure all features work correctly
2. **Add features**: Implement search, filters, product details page
3. **Enhance admin dashboard**: Add product edit functionality
4. **Integrate payments**: Complete payment flow with PayPal
5. **Add authentication**: User account creation and management
6. **Deploy**: Move to production server

### Running Backend & Frontend Together

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend-react
npm start
```

### Troubleshooting

**CORS Issues:**
Make sure backend is running and `REACT_APP_API_URL` is correct

**Port Already in Use:**
Change port: `PORT=3001 npm start`

**Dependencies Issues:**
Clear and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Features Overview

✅ Product browsing
✅ Shopping cart (localStorage persistence)
✅ Checkout process
✅ Order confirmation
✅ Admin authentication
✅ Admin product management
✅ Responsive design
✅ Error handling
✅ Loading states

### API Endpoints Used

- `GET /products` - List all products
- `POST /auth/login` - Admin login
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)

See `src/services/api.js` for full API documentation.
