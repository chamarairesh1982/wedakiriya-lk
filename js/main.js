AOS.init({ once: true });
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const container = document.getElementById('serviceContainer');
const featuredContainer = document.getElementById('featuredContainer');
const loadMoreTrigger = document.getElementById('loadMoreTrigger');
const icons = { tailor: '✂️', electrician: '⚡', tutor: '📚', ac: '🛠' };
const perPage = 8;
let services = window.servicesData || [];
let filtered = [];
let currentPage = 1;
let observer;

renderFeatured();
applyFilters();

function createCard(s, featured = false) {
  return `<div class="col">
    <div class="card h-100 service-card shadow-sm rounded-3 ${featured ? 'featured-card' : ''}" data-name="${s.name.toLowerCase()}" data-city="${s.city.toLowerCase()}" data-category="${s.category}" data-id="${s.id}">
      <div class="service-icon mb-2">${icons[s.category] || '🔧'}</div>
      <div class="card-body text-center">
        <h5 class="card-title">${s.name}</h5>
        <p class="card-text">${s.city}</p>
        <a href="tel:${s.phone}" class="d-block small mb-3"><span class="me-1">📞</span>${s.phone}</a>
        <div class="contact-btns d-flex justify-content-center gap-2">
          <a href="https://wa.me/94${s.phone.substring(1)}" target="_blank" class="btn btn-success btn-sm flex-fill flex-sm-auto">📱 WhatsApp Now</a>
          <a href="service.html?id=${s.id}" class="btn btn-outline-primary btn-sm flex-fill flex-sm-auto">View Details</a>
        </div>
      </div>
    </div>
  </div>`;
}

function getFiltered() {
  const q = searchInput.value.toLowerCase();
  const active = document.querySelector('.category-btn.active');
  const cat = active ? active.dataset.filter : 'all';
  return services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q);
    const matchesCat = cat === 'all' || s.category === cat;
    return matchesSearch && matchesCat && !s.featured;
  });
}

function renderFeatured() {
  const featured = services.filter(s => s.featured).slice(0, 4);
  if (!featuredContainer) return;
  featuredContainer.innerHTML = '';
  featured.forEach(s => featuredContainer.insertAdjacentHTML('beforeend', createCard(s, true)));
}

function renderNextPage(reset = false) {
  if (reset) container.innerHTML = '';
  const start = (currentPage - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);
  if (pageItems.length === 0 && reset) {
    container.innerHTML = '<div class="col-12 text-center text-muted">No services match your search. Try another city or category.</div>';
    loadMoreTrigger.classList.add('d-none');
    return;
  }
  pageItems.forEach(s => container.insertAdjacentHTML('beforeend', createCard(s)));
  if (currentPage * perPage >= filtered.length) {
    loadMoreTrigger.classList.add('d-none');
    if (observer) observer.disconnect();
  } else {
    loadMoreTrigger.classList.remove('d-none');
  }
}

function setupObserver() {
  if (observer) observer.disconnect();
  if (currentPage * perPage >= filtered.length) return;
  observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      observer.unobserve(loadMoreTrigger);
      currentPage++;
      renderNextPage();
      setupObserver();
    }
  });
  observer.observe(loadMoreTrigger);
}

function applyFilters() {
  filtered = getFiltered();
  currentPage = 1;
  renderNextPage(true);
  setupObserver();
}

if (searchInput) searchInput.addEventListener('input', applyFilters);
categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
  });
});
