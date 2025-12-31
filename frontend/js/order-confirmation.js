// Order confirmation page
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');

  if (!orderId) {
    document.getElementById('order-id').textContent = 'N/A';
    return;
  }

  document.getElementById('order-id').textContent = orderId;
  
  try {
    const token = auth.getToken();
    if (token) {
      const orders = await api.getOrders(token);
      const order = orders.find(o => o.id == orderId);
      
      if (order) {
        document.getElementById('order-total').textContent = `$${parseFloat(order.total).toFixed(2)}`;
        document.getElementById('order-status').textContent = order.orderStatus || 'Processing';
      }
    }
  } catch (error) {
    console.error('Error fetching order details:', error);
  }
});
