// Checkout page logic
const DELIVERY_FEE = 5.00;
let currentOption = 'login';

document.addEventListener('DOMContentLoaded', () => {
  renderOrderSummary();
  setupOptionButtons();
  setupFormSubmission();
});

function renderOrderSummary() {
  const items = cart.getCart();
  const itemsContainer = document.getElementById('order-items');
  
  itemsContainer.innerHTML = items.map(item => `
    <div class="order-item">
      <span>${item.name}</span>
      <span class="order-item-qty">${item.quantity}</span>
      <span>$${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  const subtotal = cart.getTotal();
  const total = subtotal + DELIVERY_FEE;
  document.getElementById('order-total').textContent = `$${total.toFixed(2)}`;
}

function setupOptionButtons() {
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update active state
      document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      // Update form visibility
      currentOption = e.target.dataset.option;
      document.querySelectorAll('.option-content').forEach(form => form.classList.remove('active'));
      document.getElementById(`${currentOption}-form`).classList.add('active');

      // Clear previous messages
      document.getElementById('message').innerHTML = '';
    });
  });
}

function setupFormSubmission() {
  document.getElementById('submit-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = '';

    try {
      const items = cart.getCart();
      if (items.length === 0) {
        messageDiv.innerHTML = '<div class="error-message">Cart is empty</div>';
        return;
      }

      const subtotal = cart.getTotal();
      const total = subtotal + DELIVERY_FEE;

      let userId = null;
      let guestInfo = null;
      let paymentMethod = 'card';

      if (currentOption === 'login') {
        // Login and checkout
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
          messageDiv.innerHTML = '<div class="error-message">Please enter email and password</div>';
          return;
        }

        const loginResult = await api.login(email, password);
        auth.setToken(loginResult.token);
        auth.setUser(loginResult.user);
        userId = loginResult.user.id;

      } else if (currentOption === 'guest') {
        // Guest checkout
        const name = document.getElementById('guest-name').value;
        const email = document.getElementById('guest-email').value;
        const address = document.getElementById('guest-address').value;
        paymentMethod = document.getElementById('guest-payment').value;

        if (!name || !email || !address || !paymentMethod) {
          messageDiv.innerHTML = '<div class="error-message">Please fill all required fields</div>';
          return;
        }

        guestInfo = { name, email, address };

      } else if (currentOption === 'signup') {
        // Signup and checkout
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const name = document.getElementById('signup-name').value;
        const address = document.getElementById('signup-address').value;
        paymentMethod = document.getElementById('signup-payment').value;

        if (!email || !password || !name || !address || !paymentMethod) {
          messageDiv.innerHTML = '<div class="error-message">Please fill all required fields</div>';
          return;
        }

        const signupResult = await api.signup(email, password);
        auth.setToken(signupResult.token);
        auth.setUser(signupResult.user);
        userId = signupResult.user.id;

        // Store address info for guest users
        guestInfo = { name, address };
      }

      // Create order with correct payment method mapping
      const orderData = {
        userId: userId || null,
        guestInfo: guestInfo || null,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        deliveryFee: DELIVERY_FEE,
        total,
        deliveryMethod: 'standard',
        deliveryAddress: guestInfo?.address || 'N/A',
        deliveryInstructions: '',
        paymentMethod: paymentMethod || 'card'
      };

      const result = await api.createOrder(orderData);
      const orderId = result.order?.id || result.id;
      
      messageDiv.innerHTML = '<div class="success-message">✓ Order created successfully!</div>';
      
      // Clear cart
      cart.clear();
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = `order-confirmation.html?orderId=${orderId}`;
      }, 2000);

    } catch (error) {
      messageDiv.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
      console.error('Error:', error);
    }
  });
}
