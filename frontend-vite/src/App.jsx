import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './styles/App.css';

function ProtectedRoute({ children, isAdmin }) {
  return isAdmin ? children : <Navigate to="/admin/login" />;
}

function App() {
  const { isAdmin } = useAuth();

  return (
    <Router>
      <CartProvider>
        <div className="app-wrapper">
          <Navbar />
          <main className="app-main">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute isAdmin={isAdmin}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
