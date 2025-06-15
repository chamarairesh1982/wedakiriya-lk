const PASSWORD = 'wedakiriya';
const loginForm = document.getElementById('loginForm');
const sections = document.getElementById('adminSections');
const logoutBtn = document.getElementById('logoutBtn');
const dash = document.getElementById('dashboard');
const bizTableBody = document.getElementById('bizTableBody');
const bizForm = document.getElementById('bizForm');
const cancelBtn = document.getElementById('cancelEdit');

const defaultServices = window.servicesData || [];
let services = [];

function checkAuth() {
  if (localStorage.getItem('adminAuth')) showAdmin();
}

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  if (e.target.password.value === PASSWORD) {
    localStorage.setItem('adminAuth', 'true');
    showAdmin();
  } else {
    alert('Invalid password');
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('adminAuth');
  location.reload();
});

function loadServices() {
  try {
    const stored = JSON.parse(localStorage.getItem('services'));
    services = Array.isArray(stored) ? stored : defaultServices.slice();
  } catch {
    services = defaultServices.slice();
  }
}

function saveServices() {
  localStorage.setItem('services', JSON.stringify(services));
}

function renderDashboard() {
  if (!dash) return;
  const cities = new Set(services.map(s => s.city));
  const cats = new Set(services.map(s => s.category));
  dash.innerHTML = `
    <p>Total listings: ${services.length}</p>
    <p>Categories: ${cats.size}</p>
    <p>Cities covered: ${cities.size}</p>
  `;
}

function renderTable() {
  if (!bizTableBody) return;
  bizTableBody.innerHTML = services
    .map((s, i) => `
      <tr>
        <td class="border px-1">${s.name}</td>
        <td class="border px-1">${s.city}</td>
        <td class="border px-1">${s.category}</td>
        <td class="border px-1 text-center">
          <button data-index="${i}" class="editBtn text-blue-600">Edit</button>
          <button data-index="${i}" class="delBtn text-red-600 ml-2">Delete</button>
        </td>
      </tr>`)
    .join('');
}

function showAdmin() {
  loginForm.classList.add('hidden');
  sections.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');
  loadServices();
  const cities = JSON.parse(localStorage.getItem('cities') || '[]');
  const cityList = document.getElementById('cityList');
  if (cityList && cities.length) cityList.innerHTML = cities.map(c => `<li>${c}</li>`).join('');
  const categories = JSON.parse(localStorage.getItem('categories') || '[]');
  const catList = document.getElementById('catList');
  if (catList && categories.length) catList.innerHTML = categories.map(c => `<li>${c}</li>`).join('');
  renderTable();
  renderDashboard();
}

async function fetchCities() {
  const res = await fetch('https://countriesnow.space/api/v0.1/countries/cities/q?country=Sri%20Lanka');
  const data = await res.json();
  const list = document.getElementById('cityList');
  localStorage.setItem('cities', JSON.stringify(data.data));
  list.innerHTML = data.data.map(c => `<li>${c}</li>`).join('');
  renderDashboard();
}

async function fetchCategories() {
  const res = await fetch('https://raw.githubusercontent.com/dariusk/corpora/master/data/humans/occupations.json');
  const data = await res.json();
  const categories = data.occupations.slice(0, 20);
  localStorage.setItem('categories', JSON.stringify(categories));
  const list = document.getElementById('catList');
  list.innerHTML = categories.map(c => `<li>${c}</li>`).join('');
  renderDashboard();
}

document.getElementById('fetchCities').addEventListener('click', fetchCities);
document.getElementById('fetchCategories').addEventListener('click', fetchCategories);

if (bizForm) {
  bizForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    const idx = form.index.value;
    const entry = {
      id: form.name.value.toLowerCase().replace(/\s+/g, '-'),
      name: form.name.value,
      city: form.city.value,
      phone: form.phone.value,
      category: form.category.value,
      description: form.description.value,
      featured: form.featured.checked
    };
    if (idx === '') {
      services.push(entry);
    } else {
      services[idx] = entry;
    }
    saveServices();
    renderTable();
    renderDashboard();
    form.reset();
    form.index.value = '';
    cancelBtn.classList.add('hidden');
  });
}

if (cancelBtn) {
  cancelBtn.addEventListener('click', () => {
    bizForm.reset();
    bizForm.index.value = '';
    cancelBtn.classList.add('hidden');
  });
}

if (bizTableBody) {
  bizTableBody.addEventListener('click', e => {
    const idx = e.target.dataset.index;
    if (e.target.classList.contains('editBtn')) {
      const b = services[idx];
      bizForm.name.value = b.name;
      bizForm.city.value = b.city;
      bizForm.phone.value = b.phone;
      bizForm.category.value = b.category;
      bizForm.description.value = b.description;
      bizForm.featured.checked = b.featured;
      bizForm.index.value = idx;
      cancelBtn.classList.remove('hidden');
    } else if (e.target.classList.contains('delBtn')) {
      services.splice(idx, 1);
      saveServices();
      renderTable();
      renderDashboard();
    }
  });
}

checkAuth();
