import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import '../styles/Navbar.css';

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🛒 Fresh Grocery
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Products
          </Link>
          <Link to="/cart" className="nav-link cart-link">
            Cart 
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nav-link admin-btn">
              Dashboard
            </Link>
          )}
          {!user ? (
            <Link to="/admin/login" className="nav-link admin-btn">
              Admin
            </Link>
          ) : (
            <button onClick={handleLogout} className="nav-link logout-btn">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
