import { useState, useCallback } from 'react';
import { productsAPI } from '../services/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productsAPI.getAll(filters);
      setProducts(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch products';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productsAPI.getById(id);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch product';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productsAPI.create(data);
      setProducts((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create product';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await productsAPI.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete product';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    createProduct,
    deleteProduct,
  };
};
