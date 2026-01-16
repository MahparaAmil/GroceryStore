import React, { useMemo, useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { Link } from 'react-router-dom';
import '../styles/Brands.css'; // Reusing Brands styles for consistency

const Categories = () => {
    const { products, loading, fetchProducts } = useProducts();
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const categories = useMemo(() => {
        const catMap = {};
        products.forEach(p => {
            const c = p.category || 'Uncategorized';
            if (!catMap[c]) {
                catMap[c] = { name: c, count: 0, image: p.picture };
            }
            catMap[c].count++;
        });
        return Object.values(catMap).sort((a, b) => b.count - a.count);
    }, [products]);

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="brands-loading">Loading Categories...</div>;

    return (
        <div className="brands-page"> {/* Reusing class for layout */}
            <div className="brands-header">
                <h1>Explore Categories</h1>
                <p>Browse products by aisle</p>
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="brand-search"
                />
            </div>

            <div className="brands-grid">
                {filteredCategories.map(cat => (
                    <Link to={`/products?category=${encodeURIComponent(cat.name)}`} key={cat.name} className="brand-card-link">
                        <div className="brand-card">
                            <div className="brand-logo-placeholder">
                                {/* Use product image as category thumbnail if available, else first letter */}
                                {cat.image ? <img src={cat.image} alt={cat.name} /> : <span>{cat.name[0]}</span>}
                            </div>
                            <h3>{cat.name}</h3>
                            <span className="product-count">{cat.count} Products</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Categories;
