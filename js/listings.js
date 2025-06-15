import { getSupabase } from './supabaseClient.js';
let supabase;

async function init() {
  supabase = await getSupabase();
  await loadFilters();
  attachEvents();
  await fetchListings();
}

async function loadFilters() {
  const { data: catData } = await supabase.from('listings').select('category');
  const categories = [...new Set((catData || []).map(c => c.category).filter(Boolean))];
  const catSel = document.getElementById('category');
  catSel.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    catSel.appendChild(opt);
  });

  const { data: locData } = await supabase.from('listings').select('location');
  const locations = [...new Set((locData || []).map(l => l.location).filter(Boolean))];
  const locSel = document.getElementById('location');
  locSel.innerHTML = '<option value="">All Locations</option>';
  locations.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = l;
    locSel.appendChild(opt);
  });
}

function attachEvents() {
  document.getElementById('filterBtn').addEventListener('click', fetchListings);
  ['search','category','location','minPrice','maxPrice'].forEach(id => {
    document.getElementById(id).addEventListener('change', fetchListings);
  });
}

function buildQuery() {
  let query = supabase.from('listings').select('*');
  const search = document.getElementById('search').value.trim();
  const category = document.getElementById('category').value;
  const location = document.getElementById('location').value;
  const min = parseFloat(document.getElementById('minPrice').value);
  const max = parseFloat(document.getElementById('maxPrice').value);

  if (category) query = query.eq('category', category);
  if (location) query = query.eq('location', location);
  if (!isNaN(min)) query = query.gte('price', min);
  if (!isNaN(max)) query = query.lte('price', max);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  return query;
}

async function fetchListings() {
  const { data } = await buildQuery();
  renderResults(data || []);
}

function renderResults(items) {
  const container = document.getElementById('results');
  container.innerHTML = '';
  if (!items.length) {
    container.innerHTML = '<p class="text-center text-muted">No listings found</p>';
    return;
  }
  items.forEach(item => {
    container.insertAdjacentHTML('beforeend', `
      <div class="service-card shadow">
        <h3 class="card-title">${item.title}</h3>
        <p class="card-text">${item.location} - Rs.${item.price}</p>
        <p class="small">${item.description || ''}</p>
        <a href="service.html?id=${item.id}" class="btn-outline-primary mt-auto">View</a>
      </div>
    `);
  });
}

document.addEventListener('DOMContentLoaded', init);
