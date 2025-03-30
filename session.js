// session.js - Secure Session Management
const SESSION_KEY = 'dendron_secure_session'

export function storeSession(session) {
  if (!session) return false
  
  const sessionData = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: Date.now() + (session.expires_in * 1000),
    user: {
      id: session.user.id,
      username: session.user.user_metadata?.username
    }
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
  return true
}

export function getStoredSession() {
  const sessionStr = localStorage.getItem(SESSION_KEY)
  if (!sessionStr) return null

  try {
    const session = JSON.parse(sessionStr)
    return session.expires_at > Date.now() ? session : null
  } catch {
    return null
  }
}

export function clearAuthStorage() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.clear()
}
