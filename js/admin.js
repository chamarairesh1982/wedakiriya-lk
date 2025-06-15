import { getSupabase } from './supabaseClient.js';
let supabase;
let fetchedCategories = [];
let cityData = [];
let categoryData = [];
let editingBiz = null;
let editingCity = null;
let editingCat = null;

const loginForm = document.getElementById('loginForm');
const loginBox = document.getElementById('login');
const panel = document.getElementById('adminPanel');
const dash = document.getElementById('dashboard');
const preview = document.getElementById('preview');
const citySel = document.getElementById('citySelect');
const catSel = document.getElementById('catSelect');
const bizBody = document.getElementById('bizBody');
const cancelBizBtn = document.getElementById('cancelEdit');
const cityForm = document.getElementById('cityForm');
const cityBody = document.getElementById('cityBody');
const cancelCityBtn = document.getElementById('cancelCity');
const categoryForm = document.getElementById('categoryForm');
const categoryBody = document.getElementById('categoryBody');
const cancelCategoryBtn = document.getElementById('cancelCategory');

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
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (error) {
    alert(
      `${error.message}\nCheck that the admin_users table exists and that your account is listed as an admin.`
    );
    await supabase.auth.signOut();
    return;
  }
  if (!data) {
    alert('Not an admin user');
    await supabase.auth.signOut();
    return;
  }
  loginBox.style.display = 'none';
  panel.style.display = 'block';
  loadLists();
  loadBusinesses();
}

document.getElementById('logoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  await supabase.auth.signOut();
  location.reload();
});


// SPARQL to fetch all Sri Lankan cities with English labels
const SPARQL_CITIES = `
SELECT DISTINCT ?city ?cityLabel WHERE {
  ?city wdt:P31/wdt:P279* wd:Q515;
        wdt:P17 wd:Q854.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?cityLabel
`;

// Fetch all cities from Wikidata and preview for import
async function fetchAllSriLankaCities() {
  const endpoint =
    'https://query.wikidata.org/sparql?format=json&query=' +
    encodeURIComponent(SPARQL_CITIES);
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('Wikidata fetch failed');
    const json = await res.json();
    const fetched = [
      ...new Set(json.results.bindings.map(b => b.cityLabel.value.trim()))
    ];
    const { data: current, error: cityErr } = await supabase
      .from('cities')
      .select('name');
    if (cityErr) throw cityErr;
    const existing = (current || []).map(c => c.name.trim());
    const newCities = fetched.filter(name => !existing.includes(name));

    preview.innerHTML =
      `<h4>New Cities to Import (${newCities.length})</h4><ul>` +
      newCities.map(c => `<li>${c}</li>`).join('') +
      '</ul>';
    preview.classList.remove('hide');

    const saveBtn = document.getElementById('saveCities');
    saveBtn.onclick = async () => {
      if (!newCities.length) return alert('No new cities to add!');
      const rows = newCities.map(name => ({ name }));
      const { error } = await supabase.from('cities').insert(rows);
      if (error) {
        alert('❌ Error saving cities: ' + error.message);
      } else {
        alert('✅ Successfully imported all cities!');
        preview.classList.add('hide');
        saveBtn.classList.add('hide');
        await loadLists();
      }
    };
    saveBtn.classList.remove('hide');
  } catch (err) {
    preview.innerHTML =
      `<span style="color:red">❌ Error fetching cities: ${err.message}</span>`;
    preview.classList.remove('hide');
  }
}

// Fetch categories from open dataset
async function fetchCategories() {
  const res = await fetch('https://raw.githubusercontent.com/dariusk/corpora/master/data/corporations/industries.json');
  const json = await res.json();
  fetchedCategories = json.industries.slice(0, 30);
  preview.innerHTML = '<h4>Categories</h4><ul>' + fetchedCategories.map(c => `<li>${c}</li>`).join('') + '</ul>';
  preview.classList.remove('hide');
  document.getElementById('saveCategories').classList.remove('hide');
}

async function saveCategories() {
  const rows = fetchedCategories.map(name => ({ name }));
  await supabase.from('categories').insert(rows).select();
  preview.classList.add('hide');
  document.getElementById('saveCategories').classList.add('hide');
  loadLists();
}

async function loadLists() {
  const { data: cData } = await supabase.from('cities').select().order('name');
  const { data: catDataRes } = await supabase.from('categories').select().order('name');
  cityData = cData || [];
  categoryData = catDataRes || [];
  citySel.innerHTML = cityData.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  catSel.innerHTML = categoryData.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  cityBody.innerHTML = cityData.map(c => `<tr><td>${c.name}</td><td><button class="editCity" data-id="${c.id}">Edit</button> <button class="delCity" data-id="${c.id}">Delete</button></td></tr>`).join('');
  categoryBody.innerHTML = categoryData.map(c => `<tr><td>${c.name}</td><td><button class="editCat" data-id="${c.id}">Edit</button> <button class="delCat" data-id="${c.id}">Delete</button></td></tr>`).join('');
  dash.textContent = `Total businesses: ${await count('businesses')} | categories: ${categoryData.length} | cities: ${cityData.length}`;
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
  const arr = type === 'city' ? cityData : categoryData;
  const obj = arr.find(c => c.id === id);
  return obj ? obj.name : '';
}

bizBody.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains('edit')) {
    const { data } = await supabase.from('businesses').select('*').eq('id', id).single();
    editingBiz = id;
    bizForm.id.value = id;
    bizForm.name.value = data.name;
    bizForm.owner.value = data.owner || '';
    bizForm.category.value = data.category_id;
    bizForm.contact.value = data.contact || '';
    bizForm.city.value = data.city_id;
    bizForm.description.value = data.description || '';
    cancelBizBtn.classList.remove('hide');
  } else if (e.target.classList.contains('del')) {
    await supabase.from('businesses').delete().eq('id', id);
    loadBusinesses();
    loadLists();
  }
});

cityBody.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains('editCity')) {
    const { data } = await supabase.from('cities').select('*').eq('id', id).single();
    editingCity = id;
    cityForm.id.value = id;
    cityForm.name.value = data.name;
    cancelCityBtn.classList.remove('hide');
  } else if (e.target.classList.contains('delCity')) {
    await supabase.from('cities').delete().eq('id', id);
    loadLists();
  }
});

categoryBody.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains('editCat')) {
    const { data } = await supabase.from('categories').select('*').eq('id', id).single();
    editingCat = id;
    categoryForm.id.value = id;
    categoryForm.name.value = data.name;
    cancelCategoryBtn.classList.remove('hide');
  } else if (e.target.classList.contains('delCat')) {
    await supabase.from('categories').delete().eq('id', id);
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
  if (editingBiz) {
    await supabase.from('businesses').update(payload).eq('id', editingBiz);
  } else {
    await supabase.from('businesses').insert(payload);
  }
  bizForm.reset();
  editingBiz = null;
  cancelBizBtn.classList.add('hide');
  loadBusinesses();
  loadLists();
});

cityForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = Object.fromEntries(new FormData(cityForm));
  if (editingCity) {
    await supabase.from('cities').update({ name: form.name }).eq('id', editingCity);
  } else {
    await supabase.from('cities').insert({ name: form.name });
  }
  cityForm.reset();
  editingCity = null;
  cancelCityBtn.classList.add('hide');
  loadLists();
});

categoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = Object.fromEntries(new FormData(categoryForm));
  if (editingCat) {
    await supabase.from('categories').update({ name: form.name }).eq('id', editingCat);
  } else {
    await supabase.from('categories').insert({ name: form.name });
  }
  categoryForm.reset();
  editingCat = null;
  cancelCategoryBtn.classList.add('hide');
  loadLists();
});

cancelCityBtn.addEventListener('click', () => {
  cityForm.reset();
  editingCity = null;
  cancelCityBtn.classList.add('hide');
});

cancelCategoryBtn.addEventListener('click', () => {
  categoryForm.reset();
  editingCat = null;
  cancelCategoryBtn.classList.add('hide');
});

cancelBizBtn.addEventListener('click', () => {
  bizForm.reset();
  editingBiz = null;
  cancelBizBtn.classList.add('hide');
});

// Export JSON/CSV
async function exportData(type) {
  const { data } = await supabase.from('businesses').select('*');
  if (!data || !data.length) return;
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

document.getElementById('fetchCities').onclick = fetchAllSriLankaCities;
document.getElementById('fetchCategories').onclick = fetchCategories;
document.getElementById('saveCategories').onclick = saveCategories;
document.getElementById('exportJson').onclick = () => exportData('json');
document.getElementById('exportCsv').onclick = () => exportData('csv');

document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) importData(file);
});

init();
