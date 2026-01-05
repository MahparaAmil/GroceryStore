# Fresh Grocery Store - Vite React Frontend

A modern, fast React frontend for an e-commerce grocery store built with Vite.

## 🚀 Quick Start

### Installation

```bash
cd frontend-vite
npm install
```

### Development

```bash
npm run dev
```

The app will start at `http://localhost:3000`

### Build

```bash
npm run build
```

Creates an optimized production build in the `dist/` directory.

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Navbar.jsx
│   ├── ProductCard.jsx
│   ├── CartItem.jsx
│   └── CheckoutForm.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── OrderConfirmation.jsx
│   ├── AdminLogin.jsx
│   └── AdminDashboard.jsx
├── hooks/              # Custom React hooks
│   ├── useAuth.js
│   ├── useCart.js
│   └── useProducts.js
├── services/           # API integration
│   └── api.js
├── styles/             # CSS files
│   ├── index.css
│   ├── App.css
│   ├── Navbar.css
│   ├── ProductCard.css
│   ├── CartItem.css
│   ├── CheckoutForm.css
│   └── pages/
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## 📚 Key Features

✅ **Product Browsing** - Browse and search products
✅ **Shopping Cart** - Add/remove items with persistent storage
✅ **Checkout** - Complete order with form validation
✅ **Order Tracking** - View order confirmation and details
✅ **Admin Dashboard** - Manage products (CRUD operations)
✅ **Authentication** - Secure admin login
✅ **Responsive Design** - Mobile-friendly interface
✅ **Modern UI** - Clean, intuitive design with Vite

## 🔧 Configuration

Create a `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
```

## 🎣 Custom Hooks

### useAuth()
Manages user authentication and admin access.

```jsx
const { user, login, logout, isAdmin, loading, error } = useAuth();
```

### useCart()
Manages shopping cart state with localStorage persistence.

```jsx
const { cartItems, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
```

### useProducts()
Handles product data fetching and management.

```jsx
const { products, loading, error, fetchProducts, createProduct, deleteProduct } = useProducts();
```

## 🌐 API Integration

All API calls use Axios with automatic token injection for authenticated requests.

**API Service (`src/services/api.js`):**
- Auth endpoints (login, signup, logout)
- Products CRUD operations
- Orders management
- Invoices and reports

## 💾 State Management

Uses React Hooks and Context for lightweight state management:
- `useAuth()` - Global authentication
- `useCart()` - Shopping cart with localStorage
- `useProducts()` - Product management

## 🎨 Styling

- CSS with CSS Grid and Flexbox
- Mobile-first responsive design
- Consistent color scheme (Green: #27ae60, Red: #e74c3c)
- Smooth transitions and animations

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

Build for production:
```bash
npm run build
```

Deploy the `dist/` folder to your hosting service.

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000` | Backend API URL |

## 🛠️ Technology Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling (Flexbox, Grid)

## 🤝 Integration with Backend

Ensure your backend is running at `http://localhost:5000` or update `VITE_API_URL`.

Backend should have these endpoints:
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /products` - Fetch products
- `POST /products` - Create product (admin)
- `DELETE /products/:id` - Delete product (admin)
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)

## 📄 License

This project is part of the Fresh Grocery Store application.

## 🆘 Troubleshooting

**CORS Issues:**
- Ensure backend is running and VITE_API_URL is correct
- Check CORS headers on backend

**Port Already in Use:**
```bash
npm run dev -- --port 3001
```

**Dependencies Issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Next Steps

- [ ] Add product filtering and sorting
- [ ] Implement product detail page
- [ ] Add product reviews and ratings
- [ ] Complete payment integration
- [ ] Add user account management
- [ ] Implement order history
- [ ] Add wishlist feature
- [ ] Email notifications
