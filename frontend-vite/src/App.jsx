import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import LoginTest from './pages/LoginTest';
import './styles/App.css';

function ProtectedRoute({ children, isAdmin }) {
  // Check localStorage directly for most reliable auth check
  const savedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  let isUserAdmin = false;
  if (savedUser && token) {
    try {
      const userData = JSON.parse(savedUser);
      isUserAdmin = userData.role === 'admin';
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
  }
  
  console.log('🛡️ ProtectedRoute check:');
  console.log('  Token:', token ? 'EXISTS' : 'MISSING');
  console.log('  User:', savedUser ? 'EXISTS' : 'MISSING');
  console.log('  Is admin:', isUserAdmin);
  console.log('  Allowing access:', isUserAdmin ? 'YES' : 'NO');
  
  return isUserAdmin ? children : <Navigate to="/admin/login" />;
}

function App() {
  const { isAdmin } = useAuth();
  const [isAdminCurrent, setIsAdminCurrent] = useState(isAdmin);

  // Check isAdmin status whenever the route changes (via a listener)
  useEffect(() => {
    const checkAdminStatus = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setIsAdminCurrent(userData.role === 'admin');
        } catch (e) {
          setIsAdminCurrent(false);
        }
      } else {
        setIsAdminCurrent(false);
      }
    };

    // Check on component mount
    checkAdminStatus();

    // Also update when isAdmin from hook changes
    setIsAdminCurrent(isAdmin);
  }, [isAdmin]);

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
              <Route path="/login-test" element={<LoginTest />} />

              {/* Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute isAdmin={isAdminCurrent}>
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
