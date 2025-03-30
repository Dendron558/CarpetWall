// auth.js - DenDron Authentication (Production-Ready)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase with YOUR credentials
const supabase = createClient(
  'https://vkukjpdjhrgsjznjcpgx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWtqcGRqaHJnc2p6bmpjcGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDYxNzIsImV4cCI6MjA1ODkyMjE3Mn0.IKzl8Lpg6gwV1Y_7jnjSqs2L8LwmoYrqvMGh0D--Gfg'
)

// Security Config
const PASSWORD_MIN_LENGTH = 12
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes

// Track failed attempts (in memory)
let failedAttempts = {}

// ========================
// CORE AUTH FUNCTIONS
// ========================

/**
 * Secure User Registration
 */
async function signUp(username, password) {
  if (isLockedOut(username)) {
    return { 
      error: { 
        message: `Too many attempts. Try again in ${LOCKOUT_TIME/60000} minutes.` 
      } 
    }
  }

  if (!validateCredentials(username, password)) {
    return { error: { message: 'Invalid credentials' } }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: `${username}@dendron.dummy`,
      password,
      options: {
        data: { username },
        captchaToken: await getCaptchaToken() // Add hCaptcha/reCAPTCHA later
      }
    })

    if (error) {
      recordFailedAttempt(username)
      throw error
    }

    await createProfile(data.user)
    return { data }

  } catch (error) {
    console.error('Signup Error:', error)
    return { error }
  }
}

/**
 * Secure Login with Attack Prevention
 */
async function login(username, password) {
  if (isLockedOut(username)) {
    return { 
      error: { 
        message: `Account temporarily locked. Try again later.` 
      } 
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@dendron.dummy`,
      password
    })

    if (error) {
      recordFailedAttempt(username)
      throw error
    }

    resetFailedAttempts(username)
    await storeSession(data.session)
    return { data }

  } catch (error) {
    console.error('Login Error:', error)
    return { 
      error: { 
        message: 'Invalid login', 
        details: error.message 
      } 
    }
  }
}

/**
 * Secure Logout
 */
async function logout() {
  await supabase.auth.signOut()
  localStorage.clear()
  sessionStorage.clear()
  window.location.href = '/login.html'
}

// ========================
// SECURITY UTILITIES
// ========================

function validateCredentials(username, password) {
  return (
    /^[a-z0-9_]{3,24}$/i.test(username) &&
    password.length >= PASSWORD_MIN_LENGTH &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[\W_]/.test(password)
  )
}

function recordFailedAttempt(username) {
  failedAttempts[username] = (failedAttempts[username] || 0) + 1
  
  if (failedAttempts[username] >= MAX_LOGIN_ATTEMPTS) {
    setTimeout(() => {
      delete failedAttempts[username]
    }, LOCKOUT_TIME)
  }
}

function resetFailedAttempts(username) {
  delete failedAttempts[username]
}

function isLockedOut(username) {
  return failedAttempts[username] >= MAX_LOGIN_ATTEMPTS
}

async function storeSession(session) {
  localStorage.setItem('dendron_session', JSON.stringify({
    ...session,
    expires_at: Date.now() + (session.expires_in * 1000)
  }))
}

async function getSession() {
  // Check valid local session first
  const localSession = JSON.parse(localStorage.getItem('dendron_session') || '{}')
  if (localSession.expires_at > Date.now()) {
    return localSession
  }

  // Fallback to Supabase
  const { data, error } = await supabase.auth.getSession()
  if (data.session) await storeSession(data.session)
  return data.session || null
}

async function createProfile(user) {
  return await supabase.from('profiles').upsert({
    id: user.id,
    username: user.user_metadata.username,
    last_login: new Date().toISOString()
  })
}

// ========================
// EXPORTS
// ========================
export {
  supabase,
  signUp,
  login,
  logout,
  getSession,
  validateCredentials
}
