AOS.init({ once: true });
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const container = document.getElementById('serviceContainer');
const pagination = document.getElementById('pagination');
const icons = { tailor: '✂️', electrician: '⚡', tutor: '📚', ac: '🛠' };
const perPage = 8;
let services = [];
let filtered = [];
let currentPage = 1;

fetch('data/services.json')
  .then(r => r.json())
  .then(data => { services = data; applyFilters(); });

function createCard(s) {
  return `<div class="col">
    <div class="card h-100 service-card" data-name="${s.name.toLowerCase()}" data-city="${s.city.toLowerCase()}" data-category="${s.category}" data-id="${s.id}">
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
    return matchesSearch && matchesCat;
  });
}

function renderList() {
  container.innerHTML = '';
  const start = (currentPage - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);
  pageItems.forEach(s => container.insertAdjacentHTML('beforeend', createCard(s)));
}

function renderPagination() {
  pagination.innerHTML = '';
  const totalPages = Math.ceil(filtered.length / perPage);
  if (totalPages <= 1) return;
  let html = `<li class="page-item${currentPage === 1 ? ' disabled' : ''}"><a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">Previous</a></li>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item${i === currentPage ? ' active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  html += `<li class="page-item${currentPage === totalPages ? ' disabled' : ''}"><a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">Next</a></li>`;
  pagination.innerHTML = html;
  pagination.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const p = parseInt(a.dataset.page);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        currentPage = p;
        renderList();
        renderPagination();
        window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' });
      }
    });
  });
}

function applyFilters() {
  filtered = getFiltered();
  currentPage = 1;
  renderList();
  renderPagination();
}

if (searchInput) searchInput.addEventListener('input', applyFilters);
categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
  });
});
