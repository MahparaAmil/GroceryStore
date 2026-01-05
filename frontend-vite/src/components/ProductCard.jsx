import { useCart } from '../context/CartContext';
import '../styles/ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // Ensure price is a number for cart calculations
    const productWithPrice = {
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
    };
    addToCart(productWithPrice);
  };

  const isOutOfStock = product.stock === 0;
  
  // Check if image is a URL (http, https, /, or data URI)
  const isImageUrl = product.picture && (
    product.picture.startsWith('http') || 
    product.picture.startsWith('/') || 
    product.picture.startsWith('data:')
  );

  return (
    <div className="product-card">
      <div className="product-image">
        {isImageUrl ? (
          <img src={product.picture} alt={product.name} />
        ) : (
          <div className="product-placeholder">{product.picture || '🥕'}</div>
        )}
      </div>
      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-footer">
          <div className="product-price-section">
            <span className="product-price">${product.price.toFixed(2)}</span>
            {product.stock !== undefined && (
              <span className={`product-stock ${isOutOfStock ? 'out-of-stock' : ''}`}>
                {isOutOfStock ? 'Out of Stock' : `Stock: ${product.stock}`}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            className="add-to-cart-btn"
            disabled={isOutOfStock}
            title={isOutOfStock ? 'Product out of stock' : 'Add to cart'}
          >
            {isOutOfStock ? '✕ Out' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
