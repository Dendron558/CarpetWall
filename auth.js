// auth.js - Debug Enabled
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  'https://vkukjpdjhrgsjznjcpgx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWtqcGRqaHJnc2p6bmpjcGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDYxNzIsImV4cCI6MjA1ODkyMjE3Mn0.IKzl8Lpg6gwV1Y_7jnjSqs2L8LwmoYrqvMGh0D--Gfg',
  {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Debug Mode
window._supabase = supabase // Expose to console for testing

export async function login(username, password) {
  console.log('[DEBUG] Attempting login with:', username)
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@dendron.dummy`,
      password
    })

    console.log('[DEBUG] Login response:', { data, error })

    if (error) throw error

    // Manually store session
    localStorage.setItem('sb_session', JSON.stringify({
      ...data.session,
      expires_at: Date.now() + (data.session.expires_in * 1000)
    }))

    console.log('[DEBUG] Session stored, redirecting...')
    window.location.href = '/feed.html' // Absolute path
    return { data }

  } catch (error) {
    console.error('[DEBUG] Login failed:', error)
    return { error }
  }
}

// Add this to test session in console
export function debugSession() {
  return JSON.parse(localStorage.getItem('sb_session'))
}
