import { getSupabase } from './supabaseClient.js';
let supabase;
let cities = [];
let categories = [];
let editing = null;

const loginForm = document.getElementById('loginForm');
const loginBox = document.getElementById('login');
const panel = document.getElementById('adminPanel');
const dash = document.getElementById('dashboard');
const preview = document.getElementById('preview');
const citySel = document.getElementById('citySelect');
const catSel = document.getElementById('catSelect');
const bizBody = document.getElementById('bizBody');
const cancelBtn = document.getElementById('cancelEdit');

async function init() {
  supabase = await getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await checkAdmin();
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  const { error } = await (await getSupabase()).auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);
  await checkAdmin();
});

async function checkAdmin() {
  const user = (await supabase.auth.getUser()).data.user;
  const { data } = await supabase.from('admin_users').select('id').eq('user_id', user.id).single();
  if (!data) { alert('Not an admin user'); await supabase.auth.signOut(); return; }
  loginBox.style.display = 'none';
  panel.style.display = 'block';
  loadLists();
  loadBusinesses();
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.reload();
});

// Fetch Sri Lankan cities from Wikidata
async function fetchCities() {
  const query = `SELECT ?cityLabel WHERE { ?city wdt:P31/wdt:P279* wd:Q515; wdt:P17 wd:Q854. SERVICE wikibase:label { bd:serviceParam wikibase:language 'en'. } }`;
  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query);
  const res = await fetch(url);
  const json = await res.json();
  cities = json.results.bindings.map(b => b.cityLabel.value);
  preview.innerHTML = '<h4>Cities</h4><ul>' + cities.map(c => `<li>${c}</li>`).join('') + '</ul>';
  preview.classList.remove('hide');
  document.getElementById('saveCities').classList.remove('hide');
}

async function saveCities() {
  const rows = cities.map(name => ({ name }));
  await supabase.from('cities').insert(rows).select();
  preview.classList.add('hide');
  document.getElementById('saveCities').classList.add('hide');
  loadLists();
}

// Fetch categories from open dataset
async function fetchCategories() {
  const res = await fetch('https://raw.githubusercontent.com/dariusk/corpora/master/data/business/business_types.json');
  const json = await res.json();
  categories = json.business_types.slice(0, 30);
  preview.innerHTML = '<h4>Categories</h4><ul>' + categories.map(c => `<li>${c}</li>`).join('') + '</ul>';
  preview.classList.remove('hide');
  document.getElementById('saveCategories').classList.remove('hide');
}

async function saveCategories() {
  const rows = categories.map(name => ({ name }));
  await supabase.from('categories').insert(rows).select();
  preview.classList.add('hide');
  document.getElementById('saveCategories').classList.add('hide');
  loadLists();
}

async function loadLists() {
  const { data: cityData } = await supabase.from('cities').select();
  const { data: catData } = await supabase.from('categories').select();
  citySel.innerHTML = cityData.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  catSel.innerHTML = catData.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  dash.textContent = `Total businesses: ${await count('businesses')} | categories: ${catData.length} | cities: ${cityData.length}`;
}

async function count(tbl) {
  const { count } = await supabase.from(tbl).select('*', { count: 'exact', head: true });
  return count || 0;
}

async function loadBusinesses() {
  const { data } = await supabase.from('businesses').select('id,name,owner,contact,description,city_id,categories:id(category_id),category:category_id,cities:id(city_id)').order('created_at', { ascending: false });
  bizBody.innerHTML = data.map(b => `<tr>
    <td>${b.name}</td>
    <td data-id="${b.city_id}">${getName(b.city_id, 'city')}</td>
    <td data-id="${b.category_id}">${getName(b.category_id, 'cat')}</td>
    <td>${b.owner || ''}</td>
    <td><button data-id="${b.id}" class="edit">Edit</button> <button data-id="${b.id}" class="del">Delete</button></td>
  </tr>`).join('');
}

function getName(id, type) {
  const sel = type === 'city' ? citySel : catSel;
  const opt = sel.querySelector(`option[value="${id}"]`);
  return opt ? opt.textContent : '';
}

bizBody.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains('edit')) {
    const { data } = await supabase.from('businesses').select('*').eq('id', id).single();
    editing = id;
    bizForm.id.value = id;
    bizForm.name.value = data.name;
    bizForm.owner.value = data.owner || '';
    bizForm.category.value = data.category_id;
    bizForm.contact.value = data.contact || '';
    bizForm.city.value = data.city_id;
    bizForm.description.value = data.description || '';
    cancelBtn.classList.remove('hide');
  } else if (e.target.classList.contains('del')) {
    await supabase.from('businesses').delete().eq('id', id);
    loadBusinesses();
    loadLists();
  }
});

bizForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = Object.fromEntries(new FormData(bizForm));
  const payload = {
    name: form.name,
    owner: form.owner,
    category_id: form.category,
    contact: form.contact,
    city_id: form.city,
    description: form.description
  };
  if (editing) {
    await supabase.from('businesses').update(payload).eq('id', editing);
  } else {
    await supabase.from('businesses').insert(payload);
  }
  bizForm.reset();
  editing = null;
  cancelBtn.classList.add('hide');
  loadBusinesses();
  loadLists();
});

cancelBtn.addEventListener('click', () => {
  bizForm.reset();
  editing = null;
  cancelBtn.classList.add('hide');
});

// Export JSON/CSV
async function exportData(type) {
  const { data } = await supabase.from('businesses').select('*');
  if (type === 'json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    download(blob, 'businesses.json');
  } else {
    const csv = [Object.keys(data[0]).join(',')].concat(data.map(r => Object.values(r).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    download(blob, 'businesses.csv');
  }
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

async function importData(file) {
  const text = await file.text();
  let rows;
  if (file.type.includes('json')) {
    rows = JSON.parse(text);
  } else {
    const [head, ...rest] = text.trim().split(/\r?\n/);
    const cols = head.split(',');
    rows = rest.map(r => Object.fromEntries(r.split(',').map((v,i) => [cols[i], v])));
  }
  await supabase.from('businesses').insert(rows);
  loadBusinesses();
  loadLists();
}

// Event listeners

document.getElementById('fetchCities').onclick = fetchCities;
document.getElementById('saveCities').onclick = saveCities;
document.getElementById('fetchCategories').onclick = fetchCategories;
document.getElementById('saveCategories').onclick = saveCategories;
document.getElementById('exportJson').onclick = () => exportData('json');
document.getElementById('exportCsv').onclick = () => exportData('csv');

document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) importData(file);
});

init();
