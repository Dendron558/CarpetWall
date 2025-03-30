// auth.js - Secure Authentication Module
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { storeSession, getStoredSession } from './session.js'

const supabase = createClient(
  'https://vkukjpdjhrgsjznjcpgx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWtqcGRqaHJnc2p6bmpjcGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDYxNzIsImV4cCI6MjA1ODkyMjE3Mn0.IKzl8Lpg6gwV1Y_7jnjSqs2L8LwmoYrqvMGh0D--Gfg'
)

// Security Config
const SECURITY = {
  PASSWORD_MIN_LENGTH: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 15
}

let failedAttempts = {}

// Core Auth Functions
export async function signUp(username, password) {
  if (isLockedOut(username)) return lockoutError(username)
  if (!validateCredentials(username, password)) return invalidCredsError()

  try {
    const { data, error } = await supabase.auth.signUp({
      email: `${username}@dendron.dummy`,
      password,
      options: { data: { username } }
    })

    if (error) {
      recordFailedAttempt(username)
      throw error
    }

    await createProfile(data.user)
    return { data }
  } catch (error) {
    return authError(error)
  }
}

export async function login(username, password) {
  if (isLockedOut(username)) return lockoutError(username)

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
    return authError(error)
  }
}

export async function logout() {
  await supabase.auth.signOut()
  clearAuthStorage()
  window.location.href = '/login.html'
}

// Security Utilities
function validateCredentials(username, password) {
  return (
    /^[a-z0-9_]{3,24}$/i.test(username) &&
    password.length >= SECURITY.PASSWORD_MIN_LENGTH &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[\W_]/.test(password)
  )
}

function recordFailedAttempt(username) {
  failedAttempts[username] = (failedAttempts[username] || 0) + 1
  if (failedAttempts[username] >= SECURITY.MAX_LOGIN_ATTEMPTS) {
    setTimeout(() => delete failedAttempts[username], SECURITY.LOCKOUT_MINUTES * 60 * 1000)
  }
}

function isLockedOut(username) {
  return failedAttempts[username] >= SECURITY.MAX_LOGIN_ATTEMPTS
}

// Error Handlers
function lockoutError(username) {
  return {
    error: {
      message: `Account locked. Try again in ${SECURITY.LOCKOUT_MINUTES} minutes.`,
      code: 'LOCKOUT'
    }
  }
}

function authError(error) {
  console.error('Auth Error:', error)
  return {
    error: {
      message: 'Authentication failed',
      code: error.code || 'AUTH_ERROR'
    }
  }
}
