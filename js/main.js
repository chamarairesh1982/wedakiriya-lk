// filtering and animations
AOS.init();
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');

function filterCards() {
  const q = searchInput ? searchInput.value.toLowerCase() : '';
  const activeBtn = document.querySelector('.category-btn.active');
  const catFilter = activeBtn ? activeBtn.dataset.filter : 'all';

  document.querySelectorAll('.service-card').forEach(card => {
    const name = card.dataset.name;
    const city = card.dataset.city;
    const cat = card.dataset.category;
    const matchesSearch = name.includes(q) || city.includes(q);
    const matchesCat = catFilter === 'all' || cat === catFilter;
    card.parentElement.style.display = matchesSearch && matchesCat ? '' : 'none';
  });
}

if (searchInput) {
  searchInput.addEventListener('input', filterCards);
}

categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterCards();
  });
});

