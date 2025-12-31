// API Configuration
const API_BASE_URL = 'http://localhost:5000';

// API Service
const api = {
  // Auth endpoints
  async signup(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Signup failed');
    return data;
  },

  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async logout() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  },

  // Products endpoints
  async getProducts() {
    const response = await fetch(`${API_BASE_URL}/products`);
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to fetch products');
    return data;
  },

  async getProductById(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to fetch product');
    return data;
  },

  async createProduct(productData, token) {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create product');
    return data;
  },

  async updateProduct(id, productData, token) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update product');
    return data;
  },

  async deleteProduct(id, token) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to delete product');
    }
    return true;
  },

  // Orders endpoints
  async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create order');
    return data;
  },

  async getOrders(token) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to fetch orders');
    return data;
  },

  async updateOrderStatus(orderId, status, token) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Failed to update order status');
    return data;
  },

  // Invoices endpoints
  async getInvoices(token) {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to fetch invoices');
    return data;
  },

  async updateInvoiceStatus(invoiceId, status, token) {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Failed to update invoice status');
    return data;
  },

  // Users endpoints
  async getUsers(token) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to fetch users');
    return data;
  },

  async getProfile(token) {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to fetch profile');
    return data;
  },

  // Admin endpoints
  async getDashboardSummary(token) {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch dashboard');
    return data;
  },

  async getDashboardOrders(token) {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to fetch orders');
    return data;
  }
};

// Auth helper
const auth = {
  setToken(token) {
    localStorage.setItem('token', token);
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  }
};

// Cart helper
const cart = {
  getCart() {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
  },

  saveCart(items) {
    localStorage.setItem('cart', JSON.stringify(items));
    this.updateCartCount();
  },

  addItem(product, quantity = 1) {
    const items = this.getCart();
    const existingItem = items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        picture: product.picture,
        quantity
      });
    }
    this.saveCart(items);
  },

  removeItem(productId) {
    const items = this.getCart().filter(item => item.id !== productId);
    this.saveCart(items);
  },

  updateQuantity(productId, quantity) {
    const items = this.getCart();
    const item = items.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart(items);
    }
  },

  getTotal() {
    return this.getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getCount() {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  },

  clear() {
    this.saveCart([]);
  },

  updateCartCount() {
    const count = this.getCount();
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = count;
    }
  }
};

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
  cart.updateCartCount();
});
