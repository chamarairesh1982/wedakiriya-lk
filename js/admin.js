const PASSWORD = 'wedakiriya';
const loginForm = document.getElementById('loginForm');
const sections = document.getElementById('adminSections');
const logoutBtn = document.getElementById('logoutBtn');

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

function showAdmin() {
  loginForm.classList.add('hidden');
  sections.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');
}

async function fetchCities() {
  const res = await fetch('https://countriesnow.space/api/v0.1/countries/cities/q?country=Sri%20Lanka');
  const data = await res.json();
  const list = document.getElementById('cityList');
  list.innerHTML = data.data.map(c => `<li>${c}</li>`).join('');
}

async function fetchCategories() {
  const categories = ['Tailor','Electrician','Tutor','AC Repair'];
  const list = document.getElementById('catList');
  list.innerHTML = categories.map(c => `<li>${c}</li>`).join('');
}

document.getElementById('fetchCities').addEventListener('click', fetchCities);
document.getElementById('fetchCategories').addEventListener('click', fetchCategories);

checkAuth();
