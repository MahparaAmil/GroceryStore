# Fresh Grocery Store - Frontend

A clean, simple, human-made frontend for the grocery store application. Built with vanilla HTML, CSS, and JavaScript.

## Features

### Public Site
- **Products Page** - Browse all products with images, names, brands, and prices
- **Shopping Cart** - Add/remove items, adjust quantities, view totals
- **Checkout** - Three checkout options:
  1. Login & checkout for existing users
  2. Guest checkout (no account needed)
  3. Sign up & checkout (create new account)
- **Order Confirmation** - View order details after successful checkout

### Admin Site
- **Admin Login** - Secure authentication required
- **Dashboard** - Overview statistics:
  - Total orders count
  - Total invoices count
  - Total users count
  - Guest users count
- **Tabs**:
  - Orders - View all orders with status
  - Invoices - View all invoices
  - Users - View all users (registered and guest)
  - Products - View all products

## File Structure

```
frontend/
├── index.html                 # Products page
├── css/
│   └── style.css             # All styles (minimal, clean design)
├── js/
│   ├── api.js                # API service & auth helpers
│   ├── products.js           # Products page logic
│   ├── cart.js               # Shopping cart logic
│   ├── checkout.js           # Checkout page logic
│   ├── order-confirmation.js # Order confirmation logic
│   ├── admin-login.js        # Admin login logic
│   └── admin-dashboard.js    # Admin dashboard logic
└── pages/
    ├── cart.html             # Shopping cart page
    ├── checkout.html         # Checkout page
    ├── order-confirmation.html # Confirmation page
    ├── admin-login.html      # Admin login page
    └── admin/
        └── admin-dashboard.html # Admin dashboard
```

## Setup

### Requirements
- Backend API running on `http://localhost:5000`
- Modern web browser with localStorage support

### Running Locally
1. Open `index.html` in a web browser
2. Or use a local server (recommended):
   ```bash
   cd frontend
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

### Configuration
Edit the `API_BASE_URL` in `js/api.js` if your backend runs on a different port:
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

## Design

- **Color Scheme**: White background, soft green (#2d9d4e) for buttons
- **UI**: Simple, minimal design
- **Tables**: Clean, readable data display
- **Buttons**: Soft green with hover effects
- **No animations**: Plain, functional interface
- **No external UI libraries**: Pure CSS

## API Integration

All API calls are in `js/api.js`:
- Auth: signup, login, logout
- Products: getProducts, getProductById
- Orders: createOrder, getOrders
- Invoices: getInvoices
- Users: getUsers, getProfile
- Admin: getDashboardSummary, getDashboardOrders

## Authentication

- Tokens stored in `localStorage`
- User data stored in `localStorage`
- Admin routes protected (redirect to login if not authenticated/authorized)
- Guest checkout doesn't require login

## Local Storage

- `token` - JWT authentication token
- `user` - Current user object
- `cart` - Shopping cart items

## Admin Access

1. Click "Admin" button in navbar
2. Login with admin credentials
3. Access restricted to users with `role: 'admin'`

## Browser Compatibility

Works in all modern browsers (Chrome, Firefox, Safari, Edge)
