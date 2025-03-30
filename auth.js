import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase
const supabase = createClient(
  'https://vkukjpdjhrgsjznjcpgx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWtqcGRqaHJnc2p6bmpjcGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDYxNzIsImV4cCI6MjA1ODkyMjE3Mn0.IKzl8Lpg6gwV1Y_7jnjSqs2L8LwmoYrqvMGh0D--Gfg',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
)

// USER REGISTRATION
export async function signUp(username, password) {
  // Validate username
  if (!/^[a-z0-9_]{3,24}$/i.test(username)) {
    return { error: 'Username must be 3-24 alphanumeric characters' }
  }

  // Check if username exists
  const { data: exists } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()

  if (exists) return { error: 'Username already taken' }

  // Create account
  const { data, error } = await supabase.auth.signUp({
    email: `${username}@dendron.dummy`,
    password,
    options: {
      data: { username }
    }
  })

  if (error) return { error: error.message }

  // Create profile
  await supabase
    .from('profiles')
    .insert({ 
      id: data.user.id, 
      username,
      created_at: new Date().toISOString()
    })

  return { data }
}

// USER LOGIN
export async function login(username, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${username}@dendron.dummy`,
    password
  })

  if (error) return { error: error.message }
  
  // Store minimal session data
  localStorage.setItem('dendron_session', JSON.stringify({
    user: {
      id: data.user.id,
      username: data.user.user_metadata.username
    },
    expires_at: Date.now() + (data.session.expires_in * 1000)
  }))

  return { data }
}

// USER LOGOUT (FULLY WORKING VERSION)
export async function logout() {
  // 1. Sign out from Supabase
  await supabase.auth.signOut()
  
  // 2. Clear local session
  localStorage.removeItem('dendron_session')
  
  // 3. Redirect to login page
  window.location.href = 'login.html'
}

// GET CURRENT USER
export function getCurrentUser() {
  const sessionStr = localStorage.getItem('dendron_session')
  if (!sessionStr) return null
  
  try {
    const session = JSON.parse(sessionStr)
    return session.expires_at > Date.now() ? session.user : null
  } catch {
    return null
  }
}

// Export essential functions
export { supabase, getCurrentUser, logout }
