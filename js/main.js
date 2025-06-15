import { getSupabase } from "./supabaseClient.js";
import { loadOffer } from "./offer.js";
AOS.init({ once: true });
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const container = document.getElementById('serviceContainer');
const featuredContainer = document.getElementById('featuredContainer');
const loadMoreTrigger = document.getElementById('loadMoreTrigger');
let supabase;
let userFavorites = [];
const icons = { tailor: '✂️', electrician: '⚡', tutor: '📚', ac: '🛠' };
const perPage = 8;
let services = window.servicesData || [];
let filtered = [];
let currentPage = 1;
let observer;

renderFeatured();
(async () => {
  supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", user.id);
    userFavorites = (data || []).map(r => r.listing_id);
  }
})();
applyFilters();

function createCard(s, featured = false) {
  return `<div class="col">
    <div class="card h-100 service-card shadow-sm rounded-3 ${featured ? 'featured-card' : ''}" data-name="${s.name.toLowerCase()}" data-city="${s.city.toLowerCase()}" data-category="${s.category}" data-id="${s.id}">
        <div class="text-right pr-2 pt-2"><button class="fav-btn" data-id="${s.id}" aria-label="Save">${userFavorites.includes(s.id)?"&#9733;":"&#9734;"}</button></div>
      <div class="service-icon mb-2">${icons[s.category] || '🔧'}</div>
      <div class="card-body text-center">
        <h5 class="card-title">${s.name}</h5>
        <p class="card-text">${s.city}</p>
        <a href="tel:${s.phone}" class="d-block small mb-3"><span class="me-1">📞</span>${s.phone}</a>
        <div class="contact-btns d-flex justify-content-center gap-2">
          <a href="https://wa.me/94${s.phone.substring(1)}" target="_blank" class="btn btn-success btn-sm flex-fill flex-sm-auto">📱 ${t('whatsapp_now')}</a>
          <a href="service.html?id=${s.id}" class="btn btn-outline-primary btn-sm flex-fill flex-sm-auto">${t('view_details')}</a>
          <button type="button" class="btn btn-secondary btn-sm flex-fill flex-sm-auto share-btn" data-id="${s.id}">${t('share')}</button>
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
  attachShareListeners();
}

function renderNextPage(reset = false) {
  if (reset) container.innerHTML = '';
  const start = (currentPage - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);
  if (pageItems.length === 0 && reset) {
    container.innerHTML = `<div class="col-12 text-center text-muted">${t('no_results')}</div>`;
    loadMoreTrigger.classList.add('d-none');
    return;
  }
  pageItems.forEach(s => container.insertAdjacentHTML('beforeend', createCard(s)));
  attachShareListeners();
  if (currentPage * perPage >= filtered.length) {
    loadMoreTrigger.classList.add('d-none');
    if (observer) observer.disconnect();
  } else {
    loadMoreTrigger.classList.remove('d-none');
  }
}

function setupObserver() {
  if (observer) observer.disconnect();
  attachFavListeners();
  attachShareListeners();
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
function attachFavListeners(){
  document.querySelectorAll(".fav-btn").forEach(btn=>{
    btn.onclick=async()=>{
      if(!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if(!user){ alert("Please login first"); return; }
      const id = btn.dataset.id;
      const exists = userFavorites.includes(id);
      if(exists){
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id);
        userFavorites = userFavorites.filter(f=>f!==id);
        btn.innerHTML="&#9734;";
      }else{
        await supabase.from("favorites").insert({ user_id:user.id, listing_id:id });
        userFavorites.push(id);
        btn.innerHTML="&#9733;";
      }
    };
  });
}

function attachShareListeners(){
  document.querySelectorAll('.share-btn').forEach(btn=>{
    btn.onclick=()=>{
      const id=btn.dataset.id;
      const s=services.find(x=>x.id===id);
      const url=`${location.origin}/service.html?id=${id}`;
      if(navigator.share){
        navigator.share({ title:s.name, text:s.description, url });
      }else{
        const link=`https://wa.me/?text=${encodeURIComponent(s.name+' - '+url)}`;
        window.open(link,'_blank');
      }
    };
  });
}

categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
  });
});
document.addEventListener("DOMContentLoaded", loadOffer);
