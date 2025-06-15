import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

let client;
export async function getSupabase() {
  if (client) return client;
  const cfgRes = await fetch('/wedakiriya-lk/config.json');
  const cfg = await cfgRes.json();
  client = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  return client;
}
