// auth.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase (use your actual credentials)
export const supabase = createClient(
  'https://vkukjpdjhrgsjznjcpgx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWtqcGRqaHJnc2p6bmpjcGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDYxNzIsImV4cCI6MjA1ODkyMjE3Mn0.IKzl8Lpg6gwV1Y_7jnjSqs2L8LwmoYrqvMGh0D--Gfg'
)

// Add other auth functions...
export async function login(username, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${username}@dendron.dummy`,
    password
  })
  return { data, error }
}
