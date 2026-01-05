# Vite React Frontend - Complete Setup Guide

## 📖 Overview

Your grocery store frontend has been completely converted to a modern **Vite + React** project with:
- ✅ All HTML pages converted to React components with hooks
- ✅ Custom hooks for auth, cart, and product management
- ✅ Full API integration with Axios
- ✅ Responsive design with CSS Grid & Flexbox
- ✅ Protected admin routes
- ✅ Local storage persistence for cart

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd frontend-vite
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local` if your backend runs on a different port:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5000` (Vite will suggest the actual port)

### 4. Start Backend (in another terminal)

```bash
cd backend
npm start
```

## 📂 Project Structure

### Pages (Converted from HTML)

| HTML File | React Component | Features |
|-----------|-----------------|----------|
| `index.html` | `Home.jsx` | Product browsing, search filter |
| `pages/cart.html` | `Cart.jsx` | Cart management, summary |
| `pages/checkout.html` | `Checkout.jsx` | Order form with validation |
| `pages/order-confirmation.html` | `OrderConfirmation.jsx` | Order details display |
| `pages/admin-login.html` | `AdminLogin.jsx` | Admin authentication |
| `pages/admin-dashboard.html` | `AdminDashboard.jsx` | Product CRUD management |

### Components

| Component | Purpose |
|-----------|---------|
| `Navbar.jsx` | Navigation with cart badge |
| `ProductCard.jsx` | Product display card |
| `CartItem.jsx` | Cart item with quantity controls |
| `CheckoutForm.jsx` | Shipping form with validation |

### Custom Hooks

```jsx
// Authentication
const { user, login, logout, isAdmin, loading, error } = useAuth();

// Shopping Cart
const { cartItems, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();

// Products
const { products, loading, error, fetchProducts, createProduct, deleteProduct } = useProducts();
```

### API Service

```jsx
import { authAPI, productsAPI, ordersAPI } from './services/api';

// All requests automatically include auth token
```

## 🔄 Conversion Details

### HTML → React

**Before (HTML):**
```html
<div class="products-grid" id="products-container">
  <p>Loading products...</p>
</div>
<script src="js/products.js"></script>
```

**After (React with Hooks):**
```jsx
function Home() {
  const { products, loading, error, fetchProducts } = useProducts();
  
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="products-grid">
      {loading ? <p>Loading...</p> : products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

### Vanilla JS → React Hooks

**Before (products.js):**
```javascript
fetch('http://localhost:5000/products')
  .then(r => r.json())
  .then(data => {
    document.getElementById('products-container').innerHTML = ...
  });
```

**After (useProducts hook):**
```javascript
const { products, loading, fetchProducts } = useProducts();

useEffect(() => {
  fetchProducts();
}, []);
```

## 💾 State Management

### Cart Persistence
```jsx
// Automatically saved to localStorage
const { cartItems, addToCart } = useCart();
// Cart persists on page reload
```

### Authentication
```jsx
const { user, login } = useAuth();
// Token stored in localStorage, included in all API requests
```

## 🎨 Styling

All styles are in `src/styles/`:
- Component styles: `Navbar.css`, `ProductCard.css`, etc.
- Page styles: `pages/Home.css`, `pages/Cart.css`, etc.
- Global: `index.css`, `App.css`

**Color Scheme:**
- Primary: `#27ae60` (Green)
- Danger: `#e74c3c` (Red)
- Background: `#f5f5f5` (Light Gray)

## 🔐 Protected Routes

Admin routes are protected with authentication:

```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute isAdmin={isAdmin}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

Unauthorized users are redirected to `/admin/login`

## 📡 API Integration

### Available Endpoints

```javascript
// Auth
authAPI.login(email, password)
authAPI.signup(email, password)
authAPI.logout()

// Products
productsAPI.getAll()
productsAPI.getById(id)
productsAPI.create(data)
productsAPI.delete(id)

// Orders
ordersAPI.create(data)
ordersAPI.getById(id)
```

### Automatic Token Injection

```javascript
// All requests automatically include:
// Authorization: Bearer {token}

const response = await productsAPI.getAll();
// Token is automatically added from localStorage
```

## 🧪 Testing Pages

### 1. Home Page (Product Browsing)
- [ ] Products load correctly
- [ ] Search filters products
- [ ] Add to cart works

### 2. Cart Page
- [ ] Items display correctly
- [ ] Quantity can be updated
- [ ] Items can be removed
- [ ] Cart total updates

### 3. Checkout
- [ ] Form validation works
- [ ] Order is created
- [ ] User is redirected to confirmation

### 4. Admin Dashboard
- [ ] Login required to access
- [ ] Products display in table
- [ ] Add product form works
- [ ] Delete product works

## 📦 Production Build

```bash
npm run build
```

Generates optimized files in `dist/`:
- Minified JS/CSS
- Code splitting
- Asset optimization

Deploy `dist/` folder to your hosting:
```bash
# Example with Vercel
vercel deploy dist/

# Example with Netlify
netlify deploy --prod --dir dist/
```

## 🔧 Configuration

### Vite Config (`vite.config.js`)
- React plugin enabled
- Port: 3000
- Development and production configs

### Environment Variables
Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000
```

## 🎯 Key Features Implemented

✅ **Component-Based:** Reusable, modular components
✅ **React Hooks:** Modern functional component syntax
✅ **Custom Hooks:** Encapsulated business logic
✅ **Client Routing:** React Router v6 for SPAs
✅ **API Integration:** Axios with interceptors
✅ **State Management:** Lightweight with React Context
✅ **Form Validation:** Checkout form validation
✅ **Responsive Design:** Mobile-first approach
✅ **Error Handling:** User-friendly error messages
✅ **Loading States:** Visual feedback during data fetching

## 🚨 Common Issues

### CORS Error
**Solution:** Ensure backend is running and CORS is enabled
```javascript
// Check backend has CORS headers
res.header('Access-Control-Allow-Origin', '*');
```

### Cart Not Persisting
**Solution:** Browser might be blocking localStorage. Check:
- Incognito mode doesn't persist
- Check browser console for errors

### Admin Login Not Working
**Solution:** Check if:
- Backend auth endpoint is working
- VITE_API_URL is correct
- User credentials are correct

## 📚 File Reference

**Pages:**
- [Home.jsx](src/pages/Home.jsx) - Product listing with search
- [Cart.jsx](src/pages/Cart.jsx) - Shopping cart management
- [Checkout.jsx](src/pages/Checkout.jsx) - Order placement
- [OrderConfirmation.jsx](src/pages/OrderConfirmation.jsx) - Order status
- [AdminLogin.jsx](src/pages/AdminLogin.jsx) - Admin authentication
- [AdminDashboard.jsx](src/pages/AdminDashboard.jsx) - Admin product management

**Components:**
- [Navbar.jsx](src/components/Navbar.jsx) - Navigation bar
- [ProductCard.jsx](src/components/ProductCard.jsx) - Product display
- [CartItem.jsx](src/components/CartItem.jsx) - Cart item with controls
- [CheckoutForm.jsx](src/components/CheckoutForm.jsx) - Checkout form

**Hooks:**
- [useAuth.js](src/hooks/useAuth.js) - Authentication logic
- [useCart.js](src/hooks/useCart.js) - Cart state management
- [useProducts.js](src/hooks/useProducts.js) - Product data fetching

**Services:**
- [api.js](src/services/api.js) - Axios API client

## 🔄 Next Steps

1. **Test All Pages** - Verify each page works correctly
2. **Add Features:**
   - Product detail page
   - Product filtering/sorting
   - User account management
   - Order history
   - Reviews and ratings
3. **Optimize Performance:**
   - Code splitting
   - Lazy loading
   - Image optimization
4. **Security:**
   - HTTPS in production
   - Secure token storage
   - CSRF protection
5. **Analytics:**
   - Track user behavior
   - Monitor errors
   - Performance metrics

## ✅ Checklist

- [ ] Dependencies installed
- [ ] .env.local created
- [ ] Development server starts
- [ ] Backend is running
- [ ] Home page loads products
- [ ] Cart functionality works
- [ ] Checkout form validates
- [ ] Admin login works
- [ ] Admin can add/delete products
- [ ] Build completes without errors

## 📞 Support

If you encounter issues:
1. Check the error message in browser console
2. Verify backend is running on correct port
3. Check environment variables
4. Inspect network requests in DevTools
5. Review component props and state

## 🎉 You're Ready!

Your React + Vite frontend is ready to use! Start with:

```bash
npm install
npm run dev
```

Then open `http://localhost:5000` in your browser.

Happy coding! 🚀
