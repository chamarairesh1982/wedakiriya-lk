document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => navMenu.classList.toggle('hidden'));
  }
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#navMenu a').forEach(a => {
    if (a.getAttribute('href') === path) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
});
