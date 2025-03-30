import { getSession } from '/js/auth.js'

async function initApp() {
  const session = await getSession()
  
  if (!session) {
    window.location.href = '/login.html'
    return
  }
  
  console.log('User logged in:', session.user)
  // Load the rest of your app...
}

initApp()
