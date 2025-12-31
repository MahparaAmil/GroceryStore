// Admin login logic
document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in as admin
  if (auth.isAuthenticated() && auth.isAdmin()) {
    window.location.href = 'admin-dashboard.html';
    return;
  }

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = '';

    try {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const result = await api.login(email, password);
      
      auth.setToken(result.token);
      auth.setUser(result.user);

      if (result.user.role !== 'admin') {
        messageDiv.innerHTML = '<div class="error-message">Access denied. Admin role required.</div>';
        auth.logout();
        return;
      }

      messageDiv.innerHTML = '<div class="success-message">✓ Login successful. Redirecting...</div>';
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 1000);

    } catch (error) {
      messageDiv.innerHTML = `<div class="error-message">Login failed: ${error.message}</div>`;
    }
  });
});
