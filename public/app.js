const form = document.querySelector('.order-form');
const status = document.getElementById('form-status');

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');

    status.textContent = 'Sending your order...';
    button.disabled = true;
    button.textContent = 'Sending...';

    const formData = new FormData(form);

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'The order could not be sent.');
      }

      status.textContent = result.message;
      form.reset();
    } catch (error) {
      status.textContent = error.message;
    } finally {
      button.disabled = false;
      button.textContent = 'Send order';
    }
  });
}
