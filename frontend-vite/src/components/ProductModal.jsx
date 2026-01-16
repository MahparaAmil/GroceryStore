import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/ProductModal.css';

const ProductModal = ({ product, onClose }) => {
    const { addToCart } = useCart();
    const [activeImage, setActiveImage] = useState(product?.picture);

    if (!product) return null;

    // Combine main picture and gallery into a unique list
    const images = useMemo(() => {
        const rawGallery = Array.isArray(product.gallery) ? product.gallery :
            (product.nutritionalInfo?.gallery ? product.nutritionalInfo.gallery : []);

        const allImages = [product.picture, ...rawGallery].filter(Boolean);
        return [...new Set(allImages)]; // Remove duplicates
    }, [product]);

    // Ensure tags is an array
    const tags = Array.isArray(product.tags) ? product.tags :
        (product.nutritionalInfo?.tags ? product.nutritionalInfo.tags : []);
    // Fallback to nutritionalInfo tags if I move them there

    // Ensure gallery is an array
    const gallery = Array.isArray(product.gallery) ? product.gallery :
        (product.nutritionalInfo?.gallery ? product.nutritionalInfo.gallery : []);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>

                <div className="modal-body">
                    <div className="modal-image-section">
                        <div className="modal-main-image-wrapper">
                            {activeImage && (
                                <img src={activeImage} alt={product.name} className="modal-product-img" />
                            )}
                        </div>

                        {/* Gallery Thumbnails */}
                        {images.length > 1 && (
                            <div className="modal-gallery">
                                {images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={`gallery-thumb ${activeImage === img ? 'active' : ''}`}
                                        onClick={() => setActiveImage(img)}
                                    >
                                        <img src={img} alt={`View ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal-details-section">
                        <span className="modal-brand">{product.brand || 'Fresh Grocery'}</span>
                        <h2 className="modal-title">{product.name}</h2>

                        {/* Tags Badges */}
                        {tags.length > 0 && (
                            <div className="modal-tags">
                                {tags.map(tag => (
                                    <span key={tag} className="tag-badge">{tag}</span>
                                ))}
                            </div>
                        )}

                        <div className="modal-meta">
                            <span className="modal-category">{product.category}</span>
                            {product.stock < 10 && <span className="modal-low-stock">Low Stock: {product.stock} left</span>}
                        </div>

                        <div className="modal-price-section">
                            <span className="modal-price">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
                            {product.barcode && <span className="modal-barcode">Barcode: {product.barcode}</span>}
                        </div>

                        <p className="modal-description">{product.description || 'No description available for this product.'}</p>

                        {product.nutritionalInfo && (
                            <div className="modal-nutrition">
                                <h3>Nutrition Facts (per 100g)</h3>
                                <div className="nutrition-grid">
                                    <div className="nutrition-item">
                                        <span className="label">Calories</span>
                                        <span className="value">{product.nutritionalInfo.calories || '-'}</span>
                                    </div>
                                    <div className="nutrition-item">
                                        <span className="label">Protein</span>
                                        <span className="value">{product.nutritionalInfo.protein || '-'}g</span>
                                    </div>
                                    <div className="nutrition-item">
                                        <span className="label">Carbs</span>
                                        <span className="value">{product.nutritionalInfo.carbs || '-'}g</span>
                                    </div>
                                    <div className="nutrition-item">
                                        <span className="label">Fat</span>
                                        <span className="value">{product.nutritionalInfo.fat || '-'}g</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button
                                className="btn-add-cart-large"
                                onClick={() => {
                                    addToCart(product);
                                    onClose();
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
