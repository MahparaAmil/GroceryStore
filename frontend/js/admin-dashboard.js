const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
const INVOICE_STATUSES = ['pending', 'paid', 'cancelled', 'refunded'];

let adminToken = null;
let productsCache = [];
let editingProductId = null;
let productFormMode = 'create';
let messageTimeoutId = null;

let messageContainer;
let productForm;
let productFormError;
let productFormTitle;
let productModePill;
let productFormSubmit;
let productFormReset;
let productsTableBody;
let ordersTableBody;
let invoicesTableBody;

document.addEventListener('DOMContentLoaded', () => {
  if (!auth.isAuthenticated() || !auth.isAdmin()) {
    window.location.href = 'admin-login.html';
    return;
  }

  cacheElements();
  setupTabs();
  setupLogout();
  setupProductManagement();
  setupOrderAndInvoiceActions();
  loadDashboard();
});

function cacheElements() {
  messageContainer = document.getElementById('message');
  productForm = document.getElementById('product-form');
  productFormError = document.getElementById('product-form-error');
  productFormTitle = document.getElementById('product-form-title');
  productModePill = document.getElementById('product-mode-pill');
  productFormSubmit = document.getElementById('product-form-submit');
  productFormReset = document.getElementById('product-form-reset');
  productsTableBody = document.getElementById('products-tbody');
  ordersTableBody = document.getElementById('orders-tbody');
  invoicesTableBody = document.getElementById('invoices-tbody');
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const tabName = event.target.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      event.target.classList.add('active');
      document.querySelectorAll('.tab-content').forEach((content) => content.classList.remove('active'));
      document.getElementById(tabName).classList.add('active');
    });
  });
}

function setupLogout() {
  const logoutButton = document.getElementById('logout-btn');
  if (!logoutButton) return;
  logoutButton.addEventListener('click', () => {
    api.logout();
    auth.logout();
    window.location.href = 'admin-login.html';
  });
}

function setupProductManagement() {
  if (!productForm) return;

  const newProductButton = document.getElementById('add-product-btn');
  const refreshButton = document.getElementById('refresh-products-btn');

  if (newProductButton) newProductButton.addEventListener('click', () => enterCreateMode());
  if (refreshButton) refreshButton.addEventListener('click', refreshProducts);
  if (productFormReset) {
    productFormReset.addEventListener('click', (event) => {
      event.preventDefault();
      enterCreateMode();
    });
  }
  if (productsTableBody) {
    productsTableBody.addEventListener('click', handleProductTableClick);
  }

  productForm.addEventListener('submit', handleProductFormSubmit);
  enterCreateMode();
}

function setupOrderAndInvoiceActions() {
  if (ordersTableBody) {
    ordersTableBody.addEventListener('click', handleOrderActionClick);
  }
  if (invoicesTableBody) {
    invoicesTableBody.addEventListener('click', handleInvoiceActionClick);
  }
}

async function loadDashboard() {
  try {
    adminToken = auth.getToken();

    const summary = await api.getDashboardSummary(adminToken);
    document.getElementById('stat-orders').textContent = summary.totalOrders || 0;
    document.getElementById('stat-invoices').textContent = summary.totalInvoices || 0;
    document.getElementById('stat-users').textContent = summary.totalUsersWithOrders || 0;

    const users = await api.getUsers(adminToken);
    const guestUsers = users.filter((u) => u.isGuest).length;
    document.getElementById('stat-guests').textContent = guestUsers;
    renderUsers(users);

    const orders = await api.getDashboardOrders(adminToken);
    renderOrders(orders);

    const invoices = await api.getInvoices(adminToken);
    renderInvoices(invoices);

    const products = await api.getProducts();
    productsCache = products;
    renderProducts(products);
  } catch (error) {
    console.error(error);
    showMessage('error', `Error loading dashboard: ${error.message}`);
  }
}

function renderOrders(orders) {
  if (!ordersTableBody) return;
  if (!orders || orders.length === 0) {
    ordersTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No orders found</td></tr>';
    return;
  }

  ordersTableBody.innerHTML = orders
    .map((order) => {
      const orderId = order.orderId || order.id;
      const userEmail = order.userEmail || order.User?.email || 'Guest';
      const itemCount = order.items?.length || 0;
      const total = order.totalAmount || order.total || 0;
      const status = (order.paymentStatus || order.status || 'pending').toLowerCase();
      const dateStr = order.orderDate || order.createdAt;
      const selectableStatuses = ORDER_STATUSES.includes(status) ? ORDER_STATUSES : [status, ...ORDER_STATUSES];
      const options = selectableStatuses
        .filter((value, index, array) => array.indexOf(value) === index)
        .map((value) => `
          <option value="${value}" ${value === status ? 'selected' : ''}>${formatLabel(value)}</option>
        `)
        .join('');

      return `
        <tr>
          <td>#${orderId}</td>
          <td>${userEmail}</td>
          <td>${itemCount}</td>
          <td>$${parseFloat(total).toFixed(2)}</td>
          <td><span class="status-badge status-${status}">${formatLabel(status)}</span></td>
          <td>${new Date(dateStr).toLocaleDateString()}</td>
          <td>
            <div class="table-actions">
              <select class="status-select" data-order-select="${orderId}">
                ${options}
              </select>
              <button class="table-action-btn edit" data-action="update-order" data-id="${orderId}">Update</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderInvoices(invoices) {
  if (!invoicesTableBody) return;
  if (!invoices || invoices.length === 0) {
    invoicesTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No invoices found</td></tr>';
    return;
  }

  invoicesTableBody.innerHTML = invoices
    .map((invoice) => {
      const status = (invoice.paymentStatus || 'pending').toLowerCase();
      const selectableStatuses = INVOICE_STATUSES.includes(status) ? INVOICE_STATUSES : [status, ...INVOICE_STATUSES];
      const options = selectableStatuses
        .filter((value, index, array) => array.indexOf(value) === index)
        .map((value) => `
          <option value="${value}" ${value === status ? 'selected' : ''}>${formatLabel(value)}</option>
        `)
        .join('');

      return `
        <tr>
          <td>#${invoice.id}</td>
          <td>#${invoice.orderId || 'N/A'}</td>
          <td>$${parseFloat(invoice.totalAmount).toFixed(2)}</td>
          <td><span class="status-badge status-${status}">${formatLabel(status)}</span></td>
          <td>${new Date(invoice.createdAt).toLocaleDateString()}</td>
          <td>
            <div class="table-actions">
              <select class="status-select" data-invoice-select="${invoice.id}">
                ${options}
              </select>
              <button class="table-action-btn edit" data-action="update-invoice" data-id="${invoice.id}">Update</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderUsers(users) {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;
  if (!users || users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No users found</td></tr>';
    return;
  }

  tbody.innerHTML = users
    .map((user) => `
      <tr>
        <td>#${user.id}</td>
        <td>${user.email}</td>
        <td>${user.isGuest ? 'Guest' : 'Registered'}</td>
        <td>${user.role === 'admin' ? 'Admin' : 'User'}</td>
        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
      </tr>
    `)
    .join('');
}

function renderProducts(products) {
  if (!productsTableBody) return;
  updateProductCount(products?.length || 0);

  if (!products || products.length === 0) {
    productsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No products found</td></tr>';
    return;
  }

  productsTableBody.innerHTML = products
    .map((product) => `
      <tr data-product-row="${product.id}">
        <td>#${product.id}</td>
        <td>${product.name}</td>
        <td>${product.brand}</td>
        <td>$${parseFloat(product.price).toFixed(2)}</td>
        <td>${product.quantityInStock || 0}</td>
        <td>${product.category}</td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn edit" data-action="edit" data-id="${product.id}">Edit</button>
            <button class="table-action-btn delete" data-action="delete" data-id="${product.id}">Delete</button>
          </div>
        </td>
      </tr>
    `)
    .join('');

  highlightProductRow(editingProductId);
}

function enterCreateMode() {
  productFormMode = 'create';
  editingProductId = null;
  if (productForm) productForm.reset();
  if (productFormError) productFormError.textContent = '';
  const idInput = document.getElementById('product-id');
  if (idInput) idInput.value = '';
  updateProductFormCopy();
  clearProductSelection();
  const nameInput = document.getElementById('product-name');
  if (nameInput) nameInput.focus();
}

function enterEditMode(product) {
  if (!product) return;
  productFormMode = 'edit';
  editingProductId = product.id;
  updateProductFormCopy();

  document.getElementById('product-id').value = product.id;
  document.getElementById('product-name').value = product.name || '';
  document.getElementById('product-brand').value = product.brand || '';
  document.getElementById('product-category').value = product.category || '';
  document.getElementById('product-price').value = product.price || '';
  document.getElementById('product-stock').value = product.quantityInStock ?? '';
  document.getElementById('product-picture').value = product.picture || '';
  document.getElementById('product-description').value = product.description || '';

  if (productFormError) productFormError.textContent = '';
  highlightProductRow(product.id);
  const nameInput = document.getElementById('product-name');
  if (nameInput) nameInput.focus();
}

function updateProductFormCopy() {
  if (productFormTitle) {
    productFormTitle.textContent = productFormMode === 'edit' ? 'Update Product' : 'Add Product';
  }
  if (productModePill) {
    productModePill.textContent = productFormMode === 'edit' ? 'Editing' : 'Create';
  }
  if (productFormSubmit) {
    productFormSubmit.textContent = productFormMode === 'edit' ? 'Save Changes' : 'Save Product';
  }
}

function clearProductSelection() {
  document.querySelectorAll('[data-product-row]').forEach((row) => row.classList.remove('is-editing'));
}

function highlightProductRow(productId) {
  clearProductSelection();
  if (!productId) return;
  const row = document.querySelector(`[data-product-row="${productId}"]`);
  if (row) row.classList.add('is-editing');
}

function getProductFormData() {
  return {
    name: document.getElementById('product-name').value.trim(),
    brand: document.getElementById('product-brand').value.trim(),
    category: document.getElementById('product-category').value.trim(),
    price: parseFloat(document.getElementById('product-price').value),
    quantityInStock: parseInt(document.getElementById('product-stock').value, 10),
    picture: document.getElementById('product-picture').value.trim() || null,
    description: document.getElementById('product-description').value.trim() || null,
  };
}

async function handleProductFormSubmit(event) {
  event.preventDefault();
  if (!productForm) return;

  const token = adminToken || auth.getToken();
  if (!token) {
    if (productFormError) productFormError.textContent = 'You are not authorized to perform this action.';
    return;
  }

  const productData = getProductFormData();
  if (!productData.name || !productData.brand || !productData.category) {
    if (productFormError) productFormError.textContent = 'Name, brand, and category are required.';
    return;
  }

  if (Number.isNaN(productData.price) || Number.isNaN(productData.quantityInStock)) {
    if (productFormError) productFormError.textContent = 'Please provide valid price and stock values.';
    return;
  }

  if (productData.quantityInStock < 0) {
    if (productFormError) productFormError.textContent = 'Stock cannot be negative.';
    return;
  }

  if (productFormSubmit) {
    productFormSubmit.disabled = true;
    productFormSubmit.textContent = 'Saving...';
  }

  try {
    if (productFormMode === 'edit' && editingProductId) {
      await api.updateProduct(editingProductId, productData, token);
      showMessage('success', 'Product updated successfully.');
    } else {
      await api.createProduct(productData, token);
      showMessage('success', 'Product created successfully.');
    }

    await refreshProducts();
    enterCreateMode();
  } catch (error) {
    if (productFormError) productFormError.textContent = error.message;
  } finally {
    if (productFormSubmit) {
      productFormSubmit.disabled = false;
      productFormSubmit.textContent = productFormMode === 'edit' ? 'Save Changes' : 'Save Product';
    }
  }
}

async function refreshProducts() {
  try {
    const products = await api.getProducts();
    productsCache = products;
    renderProducts(products);
  } catch (error) {
    showMessage('error', `Failed to refresh products: ${error.message}`);
  }
}

function handleProductTableClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const productId = parseInt(button.dataset.id, 10);
  const product = productsCache.find((p) => p.id === productId);

  if (button.dataset.action === 'edit') {
    enterEditMode(product);
  } else if (button.dataset.action === 'delete') {
    handleProductDelete(productId, product);
  }
}

async function handleProductDelete(productId, product) {
  if (!productId) return;
  const confirmed = window.confirm(`Delete ${product?.name || 'this product'}? This cannot be undone.`);
  if (!confirmed) return;

  try {
    await api.deleteProduct(productId, adminToken || auth.getToken());
    showMessage('success', 'Product deleted successfully.');
    await refreshProducts();
    if (editingProductId === productId) {
      enterCreateMode();
    }
  } catch (error) {
    showMessage('error', error.message);
  }
}

function handleOrderActionClick(event) {
  const button = event.target.closest('button[data-action="update-order"]');
  if (!button) return;
  const orderId = button.dataset.id;
  const select = ordersTableBody.querySelector(`select[data-order-select="${orderId}"]`);
  if (!select) return;
  updateOrderStatus(orderId, select.value, button);
}

function handleInvoiceActionClick(event) {
  const button = event.target.closest('button[data-action="update-invoice"]');
  if (!button) return;
  const invoiceId = button.dataset.id;
  const select = invoicesTableBody.querySelector(`select[data-invoice-select="${invoiceId}"]`);
  if (!select) return;
  updateInvoiceStatus(invoiceId, select.value, button);
}

async function updateOrderStatus(orderId, status, button) {
  if (!orderId || !status) return;
  button.disabled = true;
  button.textContent = 'Updating...';
  try {
    await api.updateOrderStatus(orderId, status, adminToken || auth.getToken());
    showMessage('success', `Order status updated to ${formatLabel(status)}.`);
    const orders = await api.getDashboardOrders(adminToken || auth.getToken());
    renderOrders(orders);
  } catch (error) {
    showMessage('error', error.message);
  } finally {
    button.disabled = false;
    button.textContent = 'Update';
  }
}

async function updateInvoiceStatus(invoiceId, status, button) {
  if (!invoiceId || !status) return;
  button.disabled = true;
  button.textContent = 'Updating...';
  try {
    await api.updateInvoiceStatus(invoiceId, status, adminToken || auth.getToken());
    showMessage('success', `Invoice status updated to ${formatLabel(status)}.`);
    const invoices = await api.getInvoices(adminToken || auth.getToken());
    renderInvoices(invoices);
  } catch (error) {
    showMessage('error', error.message);
  } finally {
    button.disabled = false;
    button.textContent = 'Update';
  }
}

function updateProductCount(count) {
  const label = document.getElementById('product-count-label');
  if (!label) return;
  label.textContent = count === 0 ? 'No products yet' : `${count} catalog item${count === 1 ? '' : 's'}`;
}

function formatLabel(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function showMessage(type, text) {
  if (!messageContainer) return;
  const className = type === 'error' ? 'error-message' : 'success-message';
  messageContainer.innerHTML = `<div class="${className}">${text}</div>`;
  if (messageTimeoutId) clearTimeout(messageTimeoutId);
  messageTimeoutId = setTimeout(() => {
    if (messageContainer) {
      messageContainer.innerHTML = '';
    }
  }, 4000);
}
