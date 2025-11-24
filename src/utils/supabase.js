
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Try multiple common env names for the public key to reduce setup friction
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Helpful message without leaking secrets
  // Ensure root .env contains VITE_SUPABASE_URL and a public anon key, then restart Vite
  console.error(
    '[Supabase] Missing VITE_SUPABASE_URL or public key. Set them in the root .env and restart dev server.'
  );
}

const client = createClient(supabaseUrl, supabaseKey);

export const supabase = client;
export default client;
        