import { getSupabase } from './supabaseClient.js';

let supabase;
const loginBox = document.getElementById('login');
const loginForm = document.getElementById('loginForm');
const dash = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logoutBtn');

init();

async function init(){
  supabase = await getSupabase();
  const { data:{ session } } = await supabase.auth.getSession();
  if(session) await checkAdmin();
}

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if(error){ alert(error.message); return; }
  await checkAdmin();
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.reload();
});

async function checkAdmin(){
  const { data:{ user } } = await supabase.auth.getUser();
  if(!user) return;
  const { data, error } = await supabase.from('admin_users').select('id').eq('user_id', user.id).single();
  if(error || !data){
    alert('Not an admin user');
    await supabase.auth.signOut();
    return;
  }
  loginBox.style.display = 'none';
  dash.style.display = 'block';
  await loadAnalytics();
  await loadReports();
}

async function loadAnalytics(){
  const [listingsRes, usersRes, reportsRes] = await Promise.all([
    supabase.from('listings').select('id,category,location,is_active,created_at'),
    supabase.from('users').select('id', { count:'exact', head:true }),
    supabase.from('reports').select('id', { count:'exact', head:true })
  ]);

  const listings = listingsRes.data || [];
  const totalListings = listings.length;
  const activeListings = listings.filter(l=>l.is_active).length;
  const now = new Date();
  const week = new Date(now); week.setDate(now.getDate()-7);
  const month = new Date(now); month.setMonth(now.getMonth()-1);
  const weekCount = listings.filter(l=> new Date(l.created_at) >= week).length;
  const monthCount = listings.filter(l=> new Date(l.created_at) >= month).length;

  document.getElementById('stat-listings').textContent = `Total listings: ${totalListings}`;
  document.getElementById('stat-users').textContent = `Total users: ${usersRes.count || 0}`;
  document.getElementById('stat-reports').textContent = `Total reports: ${reportsRes.count || 0}`;
  document.getElementById('stat-active-listings').textContent = `Active listings: ${activeListings}`;
  document.getElementById('stat-new-listings').textContent = `New listings this week: ${weekCount} / month: ${monthCount}`;

  const byCat = {};
  const byLoc = {};
  listings.forEach(l=>{
    const c = l.category || 'Other';
    const loc = l.location || 'Other';
    byCat[c] = (byCat[c]||0)+1;
    byLoc[loc] = (byLoc[loc]||0)+1;
  });

  new Chart(document.getElementById('categoryChart'), {
    type:'pie',
    data:{ labels:Object.keys(byCat), datasets:[{ data:Object.values(byCat) }] }
  });

  new Chart(document.getElementById('locationChart'), {
    type:'bar',
    data:{ labels:Object.keys(byLoc), datasets:[{ data:Object.values(byLoc), backgroundColor:'#2563eb' }] },
    options:{ scales:{ y:{ beginAtZero:true } } }
  });
}

async function loadReports(){
  const { data } = await supabase.from('reports').select('*').eq('status','open').order('created_at',{ascending:false});
  const tbody = document.querySelector('#moderation-table tbody');
  tbody.innerHTML = '';
  for(const r of data || []){
    const { data: listing } = await supabase.from('listings').select('title').eq('id', r.listing_id).single();
    const { data: user } = await supabase.from('users').select('email').eq('id', r.user_id).single();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${listing ? listing.title : r.listing_id}</td>
      <td>${user ? user.email : r.user_id}</td>
      <td>${r.reason || ''}</td>
      <td>${new Date(r.created_at).toLocaleDateString()}</td>
      <td>
        <button class="view" data-id="${r.listing_id}">View</button>
        <button class="approve" data-id="${r.id}">Approve</button>
        <button class="remove" data-id="${r.listing_id}">Remove</button>
      </td>`;
    tbody.appendChild(tr);
  }
}

document.getElementById('moderation-table').addEventListener('click', async e => {
  const id = e.target.dataset.id;
  if(e.target.classList.contains('view')){
    window.open(`service.html?id=${id}`,'_blank');
  } else if(e.target.classList.contains('approve')){
    if(confirm('Mark report as resolved?')){
      await supabase.from('reports').update({ status:'resolved' }).eq('id', id);
      loadReports();
    }
  } else if(e.target.classList.contains('remove')){
    if(confirm('Remove this listing?')){
      await supabase.from('listings').update({ is_active:false }).eq('id', id);
      await supabase.from('reports').update({ status:'resolved' }).eq('listing_id', id);
      loadReports();
    }
  }
});
