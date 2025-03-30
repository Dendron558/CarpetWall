// Add this to your existing auth.js
export async function signUp(username, password) {
  // Validate input
  if (!username || !password) {
    return { error: { message: 'Username and password required' } }
  }

  const { data, error } = await supabase.auth.signUp({
    email: `${username}@dendron.dummy`,
    password,
    options: {
      data: { username } // Store username in user_metadata
    }
  })

  if (error) return { error }
  
  // Create profile in your database
  await supabase
    .from('profiles')
    .insert({ id: data.user.id, username })
    
  return { data }
}
