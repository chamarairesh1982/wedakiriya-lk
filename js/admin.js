import { getSupabase } from './supabaseClient.js';

let supabase;
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const sections = document.getElementById('adminSections');

async function init() {
  supabase = await getSupabase();
  const { data } = await supabase.auth.getSession();
  if (data.session) {
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
    showAdmin();
  }
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.reload();
});

function showAdmin() {
  loginForm.classList.add('hidden');
  sections.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');
  loadOffers();
  loadCities();
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

async function loadListings() {
  const { data } = await supabase.from('businesses').select('id,name,city');
  const list = document.getElementById('listingList');
  list.innerHTML = data.map(l => `<li class="flex justify-between"><span>${l.name} - ${l.city}</span><button data-id="${l.id}" class="del-listing text-red-600">Delete</button></li>`).join('');
}

document.getElementById('newListingForm').addEventListener('submit', async e => {
  e.preventDefault();
  const { name, city } = e.target;
  await supabase.from('businesses').insert({ name: name.value, city: city.value });
  e.target.reset();
  loadListings();
});

document.getElementById('listingList').addEventListener('click', async e => {
  if (e.target.classList.contains('del-listing')) {
    await supabase.from('businesses').delete().eq('id', e.target.dataset.id);
    loadListings();
  }
});

init();
