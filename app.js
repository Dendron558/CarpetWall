// app.js
import { supabase } from './auth.js'

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    window.location.href = 'login.html'
  } else {
    console.log('User logged in:', session.user)
    // Load your app content here
    document.body.innerHTML = `
      <h1>Welcome to DenDron!</h1>
      <button onclick="logout()">Logout</button>
    `
  }
}

window.logout = async () => {
  await supabase.auth.signOut()
  window.location.href = 'login.html'
}

checkAuth()
