import { getSupabase } from './supabaseClient.js';
const status = document.getElementById('authStatus');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

(async () => {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    location.href = 'dashboard.html';
    return;
  }
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    status.textContent = 'Logging in...';
    const { error } = await supabase.auth.signInWithPassword({
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    });
    status.textContent = error ? error.message : 'Logged in!';
    if (!error) setTimeout(() => location.href = 'dashboard.html', 800);
  });

  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    status.textContent = 'Signing up...';
    const { error } = await supabase.auth.signUp({
      email: document.getElementById('sEmail').value,
      password: document.getElementById('sPassword').value
    });
    status.textContent = error ? error.message : 'Check your inbox for verification link.';
  });
})();
