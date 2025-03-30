import { getStoredSession } from './session.js'
import { supabase } from './auth.js'

async function initApp() {
  // Check existing session
  const session = await getStoredSession() || await supabase.auth.getSession()
  
  if (!session?.access_token) {
    window.location.href = '/login.html'
    return
  }

  // Validate session with Supabase
  const { error } = await supabase.auth.getUser(session.access_token)
  if (error) {
    console.error('Session invalid:', error)
    window.location.href = '/login.html'
    return
  }

  // Load app
  console.log('Authenticated user:', session.user)
}

document.addEventListener('DOMContentLoaded', initApp)
