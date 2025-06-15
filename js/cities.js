import { getSupabase } from './supabaseClient.js';

let allCities = [];
const list = document.getElementById('cityList');
const input = document.getElementById('citySearch');

async function load() {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from('cities').select('id,name').order('name');
  if (error) {
    list.innerHTML = '<li class="text-red-500">Failed to load cities</li>';
    return;
  }
  allCities = data;
  render(allCities);
}

function render(arr) {
  list.innerHTML = arr.map(c => `<li class="border p-2 rounded">${c.name}</li>`).join('');
}

input.addEventListener('input', () => {
  const q = input.value.toLowerCase();
  render(allCities.filter(c => c.name.toLowerCase().includes(q)));
});

load();
