import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import '../styles/pages/Home.css';

export default function Home() {
  const { products, loading, error, fetchProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term)
        )
      );
    }
  }, [products, searchTerm]);

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Fresh Vegetables & Products</h1>
        <p>Quality groceries delivered to your doorstep</p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🛒</span>
          <p>
            {searchTerm
              ? 'No products match your search'
              : 'No products available'}
          </p>
        </div>
      ) : (
        <>
          <div className="results-info">
            Showing {filteredProducts.length} product
            {filteredProducts.length !== 1 ? 's' : ''}
          </div>
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
