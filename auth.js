import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  'https://vkukjpdjhrgsjznjcpgx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWtqcGRqaHJnc2p6bmpjcGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDYxNzIsImV4cCI6MjA1ODkyMjE3Mn0.IKzl8Lpg6gwV1Y_7jnjSqs2L8LwmoYrqvMGh0D--Gfg'
)

// USERNAME SYSTEM
export async function signUp(username, password) {
  // 1. Validate input
  if (!/^[a-z0-9_]{3,24}$/i.test(username)) {
    return { error: 'Username must be 3-24 alphanumeric characters' }
  }

  // 2. Check if username exists
  const { data: exists } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()

  if (exists) return { error: 'Username already taken' }

  // 3. Create auth account (using dummy email)
  const { data, error } = await supabase.auth.signUp({
    email: `${username}@dendron.dummy`,
    password,
    options: {
      data: { username } // Store in user_metadata
    }
  })

  if (error) return { error: error.message }

  // 4. Create profile
  await supabase
    .from('profiles')
    .insert({ 
      id: data.user.id, 
      username 
    })

  return { data }
}

export async function login(username, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${username}@dendron.dummy`,
    password
  })

  if (error) return { error: error.message }
  
  // Store session
  localStorage.setItem('dendron_session', JSON.stringify({
    user: {
      id: data.user.id,
      username: data.user.user_metadata.username
    },
    expires_at: Date.now() + (data.session.expires_in * 1000)
  }))

  return { data }
}

export async function logout() {
  await supabase.auth.signOut()
  localStorage.removeItem('dendron_session')
}

export function getCurrentUser() {
  const session = JSON.parse(localStorage.getItem('dendron_session'))
  return session?.expires_at > Date.now() ? session.user : null
}
