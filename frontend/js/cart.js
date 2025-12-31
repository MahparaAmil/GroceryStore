// Cart page logic
const DELIVERY_FEE = 5.00;

function renderCart() {
  const items = cart.getCart();
  const container = document.getElementById('cart-items');

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty</p>
        <a href="../index.html" style="color: #2d9d4e;">Continue Shopping</a>
      </div>
    `;
    updateSummary();
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="cart-item">
      <img 
        src="${item.picture || 'https://via.placeholder.com/80?text=No+Image'}" 
        alt="${item.name}" 
        class="cart-item-image"
        onerror="this.src='https://via.placeholder.com/80?text=No+Image'"
      >
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-brand">${item.brand}</div>
        <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)} each</div>
      </div>
      <div class="cart-item-actions">
        <button class="quantity-btn minus-btn" data-id="${item.id}">−</button>
        <input 
          type="number" 
          class="quantity-input" 
          value="${item.quantity}" 
          min="1" 
          data-id="${item.id}"
        >
        <button class="quantity-btn plus-btn" data-id="${item.id}">+</button>
        <span style="min-width: 70px; text-align: right; font-weight: 600;">
          $${(item.price * item.quantity).toFixed(2)}
        </span>
        <button class="remove-btn" data-id="${item.id}">Remove</button>
      </div>
    </div>
  `).join('');

  // Event listeners
  document.querySelectorAll('.minus-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const input = document.querySelector(`.quantity-input[data-id="${id}"]`);
      const newQty = Math.max(1, parseInt(input.value) - 1);
      cart.updateQuantity(id, newQty);
      renderCart();
    });
  });

  document.querySelectorAll('.plus-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const input = document.querySelector(`.quantity-input[data-id="${id}"]`);
      const newQty = parseInt(input.value) + 1;
      cart.updateQuantity(id, newQty);
      renderCart();
    });
  });

  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = parseInt(e.target.dataset.id);
      const newQty = Math.max(1, parseInt(e.target.value) || 1);
      cart.updateQuantity(id, newQty);
      renderCart();
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      cart.removeItem(id);
      renderCart();
    });
  });

  updateSummary();
}

function updateSummary() {
  const subtotal = cart.getTotal();
  const total = subtotal + DELIVERY_FEE;

  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('delivery-fee').textContent = `$${DELIVERY_FEE.toFixed(2)}`;
  document.getElementById('total').textContent = `$${total.toFixed(2)}`;

  const checkoutBtn = document.getElementById('checkout-btn');
  checkoutBtn.disabled = cart.getCart().length === 0;
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();

  document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.getCart().length > 0) {
      window.location.href = 'checkout.html';
    }
  });
});
