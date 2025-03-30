// auth.js - Complete Authentication Module
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase
export const supabase = createClient(
  'https://vkukjpdjhrgsjznjcpgx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWtqcGRqaHJnc2p6bmpjcGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDYxNzIsImV4cCI6MjA1ODkyMjE3Mn0.IKzl8Lpg6gwV1Y_7jnjSqs2L8LwmoYrqvMGh0D--Gfg'
)

// Session Management
export function getSession() {
  return JSON.parse(localStorage.getItem('sb_session'))
}

// User Registration
export async function signUp(username, password) {
  // Validate input
  if (!username || !password) {
    return { error: { message: 'Username and password required' } }
  }

  if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
    return { error: { message: 'Username must be 3-24 characters (letters, numbers, _)' } }
  }

  if (password.length < 12) {
    return { error: { message: 'Password must be at least 12 characters' } }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: `${username}@dendron.dummy`,
      password,
      options: {
        data: { username }
      }
    })

    if (error) return { error }
    
    // Create profile
    await supabase
      .from('profiles')
      .insert({ 
        id: data.user.id, 
        username,
        created_at: new Date().toISOString()
      })
    
    return { data }
  } catch (error) {
    return { error: { message: 'Registration failed. Try a different username.' } }
  }
}

// User Login
export async function login(username, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@dendron.dummy`,
      password
    })

    if (error) return { error }

    // Store session
    localStorage.setItem('sb_session', JSON.stringify({
      ...data.session,
      expires_at: Date.now() + (data.session.expires_in * 1000)
    }))

    return { data }
  } catch (error) {
    return { error: { message: 'Login failed. Check your credentials.' } }
  }
}

// User Logout
export async function logout() {
  await supabase.auth.signOut()
  localStorage.removeItem('sb_session')
}
