import { getSupabase } from './supabaseClient.js';

export async function loadOffer() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('offers')
    .select('title,description')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const el = document.getElementById('offer-of-day');
  if (!el) return;
  if (error || !data) {
    el.textContent = 'No offer available today.';
    return;
  }
  el.innerHTML = `<h3 class="text-xl font-semibold mb-1">${data.title}</h3><p>${data.description}</p>`;
}
