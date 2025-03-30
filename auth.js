import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_KEY'
);

// Sign Up
async function signUp(username, password) {
  const { data, error } = await supabase.auth.signUp({
    email: `${username}@dendron.dummy`, // Bypass email requirement
    password,
    options: {
      data: { username }
    }
  });
  // Create profile entry
  await supabase.from('profiles').insert({ 
    id: data.user.id, 
    username 
  });
}

// Login
async function login(username, password) {
  return await supabase.auth.signInWithPassword({
    email: `${username}@dendron.dummy`,
    password
  });
}
