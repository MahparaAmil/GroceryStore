import React, { useMemo, useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { Link } from 'react-router-dom';
import '../styles/Brands.css';

const Brands = () => {
    const { products, loading, fetchProducts } = useProducts();
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const brands = useMemo(() => {
        const brandMap = {};
        products.forEach(p => {
            const b = p.brand || 'Unknown';
            if (!brandMap[b]) {
                brandMap[b] = { name: b, count: 0, image: p.picture };
            }
            brandMap[b].count++;
        });
        return Object.values(brandMap).sort((a, b) => b.count - a.count); // Most popular first
    }, [products]);

    const filteredBrands = brands.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="brands-loading">Loading Brands...</div>;

    return (
        <div className="brands-page">
            <div className="brands-header">
                <h1>Explore Brands</h1>
                <p>Discover your favorite producers</p>
                <input
                    type="text"
                    placeholder="Search brands..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="brand-search"
                />
            </div>

            <div className="brands-grid">
                {filteredBrands.map(brand => (
                    <Link to={`/products?brand=${encodeURIComponent(brand.name)}`} key={brand.name} className="brand-card-link">
                        <div className="brand-card">
                            <div className="brand-logo-placeholder">
                                {brand.image ? <img src={brand.image} alt={brand.name} /> : <span>{brand.name[0]}</span>}
                            </div>
                            <h3>{brand.name}</h3>
                            <span className="product-count">{brand.count} Products</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Brands;
