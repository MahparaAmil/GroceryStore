// Products page logic
const PLACEHOLDER_SVG = `
  <svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
    <rect width='100%' height='100%' fill='#f3f4f6' />
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
          font-family='Arial, sans-serif' font-size='16' fill='#9ca3af'>
      Image unavailable
    </text>
  </svg>
`;

const PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(PLACEHOLDER_SVG)}`;

const getProductImage = (picture) => {
  if (!picture) return PLACEHOLDER_IMAGE;
  if (/^https?:\/\/via\.placeholder\.com/i.test(picture)) {
    return PLACEHOLDER_IMAGE;
  }
  return picture;
};

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('products-container');

  try {
    const products = await api.getProducts();
    
    if (!products || products.length === 0) {
      container.innerHTML = '<p>No products available.</p>';
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="product-card">
        <img 
          src="${getProductImage(product.picture)}" 
          alt="${product.name}" 
          class="product-image"
          onerror="this.src='${PLACEHOLDER_IMAGE}'"
        >
        <div class="product-name">${product.name}</div>
        <div class="product-brand">${product.brand}</div>
        <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
        
        <div class="product-quantity">
          <button class="quantity-btn minus-btn" data-id="${product.id}">−</button>
          <input 
            type="number" 
            class="quantity-input" 
            value="1" 
            min="1" 
            data-id="${product.id}"
          >
          <button class="quantity-btn plus-btn" data-id="${product.id}">+</button>
        </div>

        <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-brand="${product.brand}" data-price="${product.price}" data-picture="${product.picture}">
          Add to Cart
        </button>
      </div>
    `).join('');

    // Event listeners
    document.querySelectorAll('.minus-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const input = document.querySelector(`.quantity-input[data-id="${e.target.dataset.id}"]`);
        input.value = Math.max(1, parseInt(input.value) - 1);
      });
    });

    document.querySelectorAll('.plus-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const input = document.querySelector(`.quantity-input[data-id="${e.target.dataset.id}"]`);
        input.value = parseInt(input.value) + 1;
      });
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = parseInt(e.target.dataset.id);
        const quantity = parseInt(document.querySelector(`.quantity-input[data-id="${productId}"]`).value);
        
        const product = {
          id: productId,
          name: e.target.dataset.name,
          brand: e.target.dataset.brand,
          price: parseFloat(e.target.dataset.price),
          picture: e.target.dataset.picture
        };

        cart.addItem(product, quantity);
        
        // Reset quantity
        document.querySelector(`.quantity-input[data-id="${productId}"]`).value = 1;
        
        // Visual feedback
        const originalText = e.target.textContent;
        e.target.textContent = '✓ Added!';
        setTimeout(() => {
          e.target.textContent = originalText;
        }, 1000);
      });
    });

  } catch (error) {
    container.innerHTML = `<p style="color: red;">Error loading products: ${error.message}</p>`;
    console.error('Error:', error);
  }
});
