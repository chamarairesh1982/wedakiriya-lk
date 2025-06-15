import { getSupabase } from './supabaseClient.js';

const emailEl = document.getElementById('userEmail');
const listEl = document.getElementById('favoritesList');
const logoutBtn = document.getElementById('logoutBtn');

(async () => {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    location.href = 'login.html';
    return;
  }
  emailEl.textContent = user.email;
  const { data } = await supabase
    .from('favorites')
    .select('listing_id')
    .eq('user_id', user.id);
  const favIds = (data || []).map(r => r.listing_id);
  const services = window.servicesData || [];
  const favs = services.filter(s => favIds.includes(s.id));
  if (!favs.length) {
    listEl.innerHTML = '<li>No favorites yet.</li>';
  } else {
    listEl.innerHTML = favs
      .map(s => `<li class="flex justify-between border-b py-1"><span>${s.name} - ${s.city}</span><button data-id="${s.id}" class="remove text-sm text-red-600">Remove</button></li>`)
      .join('');
    document.querySelectorAll('.remove').forEach(btn => {
      btn.onclick = async () => {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', btn.dataset.id);
        btn.parentElement.remove();
      };
    });
  }
  logoutBtn.onclick = async () => {
    await supabase.auth.signOut();
    location.href = 'index.html';
  };
})();
