import { getSupabase } from './supabaseClient.js';

let supabase;
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const sections = document.getElementById('adminSections');
let editingId = null;

async function init() {
  supabase = await getSupabase();
  const { data } = await supabase.auth.getSession();
  if (data.session && await isAdmin(data.session.user.id)) {
    showAdmin();
  } else {
    loginForm.classList.remove('hidden');
  }
}

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert(error.message);
  } else {
    const { data } = await supabase.auth.getSession();
    if (data.session && await isAdmin(data.session.user.id)) {
      showAdmin();
    } else {
      alert('Not authorized');
    }
  }
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.reload();
});

async function isAdmin(uid) {
  const { data } = await supabase.from('users').select('is_admin').eq('id', uid).maybeSingle();
  return data && data.is_admin;
}

function showAdmin() {
  loginForm.classList.add('hidden');
  sections.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');
  loadOffers();
  loadCities();
  loadCategories();
  loadListings();
}

async function loadOffers() {
  const { data } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
  const list = document.getElementById('offerList');
  list.innerHTML = data.map(o => `<li class="flex justify-between"><span>${o.title}</span><button data-id="${o.id}" class="del-offer text-red-600">Delete</button></li>`).join('');
}

document.getElementById('newOfferForm').addEventListener('submit', async e => {
  e.preventDefault();
  const title = e.target.title.value;
  const description = e.target.description.value;
  await supabase.from('offers').insert({ title, description });
  e.target.reset();
  loadOffers();
});

document.getElementById('offerList').addEventListener('click', async e => {
  if (e.target.classList.contains('del-offer')) {
    await supabase.from('offers').delete().eq('id', e.target.dataset.id);
    loadOffers();
  }
});

async function loadCities() {
  const { data } = await supabase.from('cities').select('*').order('name');
  const list = document.getElementById('cityAdminList');
  list.innerHTML = data.map(c => `<li class="flex justify-between"><span>${c.name}</span><button data-id="${c.id}" class="del-city text-red-600">Delete</button></li>`).join('');
}

document.getElementById('newCityForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = e.target.name.value;
  await supabase.from('cities').insert({ name });
  e.target.reset();
  loadCities();
});

document.getElementById('cityAdminList').addEventListener('click', async e => {
  if (e.target.classList.contains('del-city')) {
    await supabase.from('cities').delete().eq('id', e.target.dataset.id);
    loadCities();
  }
});

async function loadCategories() {
  const { data } = await supabase.from('categories').select('*').order('name');
  const list = document.getElementById('categoryAdminList');
  list.innerHTML = data.map(c => `<li class="flex justify-between"><span>${c.icon || ''} ${c.name}</span><button data-id="${c.id}" class="del-cat text-red-600">Delete</button></li>`).join('');
}

document.getElementById('newCategoryForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = e.target.name.value;
  const icon = e.target.icon.value;
  await supabase.from('categories').insert({ name, icon });
  e.target.reset();
  loadCategories();
});

document.getElementById('categoryAdminList').addEventListener('click', async e => {
  if (e.target.classList.contains('del-cat')) {
    await supabase.from('categories').delete().eq('id', e.target.dataset.id);
    loadCategories();
  }
});

async function loadListings() {
  const { data } = await supabase.from('businesses').select('*');
  const list = document.getElementById('listingList');
  list.innerHTML = data.map(l => `<li class="flex justify-between"><span>${l.name} - ${l.city}</span><div><button data-id="${l.id}" class="edit-listing text-blue-600 mr-2">Edit</button><button data-id="${l.id}" class="del-listing text-red-600">Delete</button></div></li>`).join('');
}

document.getElementById('newListingForm').addEventListener('submit', async e => {
  e.preventDefault();
  const { name, city, phone, category, description, featured } = e.target;
  const data = {
    name: name.value,
    city: city.value,
    phone: phone.value,
    category: category.value,
    description: description.value,
    featured: featured.checked
  };
  if (editingId) {
    await supabase.from('businesses').update(data).eq('id', editingId);
    editingId = null;
  } else {
    await supabase.from('businesses').insert(data);
  }
  e.target.reset();
  e.target.querySelector('button[type="submit"]').textContent = 'Save';
  loadListings();
});

document.getElementById('listingList').addEventListener('click', async e => {
  if (e.target.classList.contains('del-listing')) {
    await supabase.from('businesses').delete().eq('id', e.target.dataset.id);
    loadListings();
  } else if (e.target.classList.contains('edit-listing')) {
    const { data } = await supabase.from('businesses').select('*').eq('id', e.target.dataset.id).maybeSingle();
    if (data) {
      const form = document.getElementById('newListingForm');
      form.name.value = data.name || '';
      form.city.value = data.city || '';
      form.phone.value = data.phone || '';
      form.category.value = data.category || '';
      form.description.value = data.description || '';
      form.featured.checked = data.featured || false;
      editingId = data.id;
      form.querySelector('button[type="submit"]').textContent = 'Update';
    }
  }
});

init();
