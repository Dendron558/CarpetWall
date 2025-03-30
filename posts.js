// posts.js - Feed Functionality
import { supabase, getCurrentUser } from './auth.js'

export async function loadPosts() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      created_at,
      profiles (username)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading posts:', error)
    return
  }

  const container = document.getElementById('posts-container')
  container.innerHTML = posts.map(post => `
    <div class="post">
      <strong>@${post.profiles.username}</strong>
      <p>${post.content}</p>
      <small>${new Date(post.created_at).toLocaleString()}</small>
    </div>
  `).join('')
}

export async function createPost() {
  const user = getCurrentUser()
  const content = document.getElementById('post-content').value.trim()
  
  if (!content) return

  const { error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content
    })

  if (error) {
    console.error('Error creating post:', error)
    return
  }

  document.getElementById('post-content').value = ''
  loadPosts() // Refresh feed
}
