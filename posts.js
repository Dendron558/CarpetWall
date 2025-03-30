// Create Post
async function createPost(content) {
  const user = await supabase.auth.getUser();
  return await supabase.from('posts').insert({
    user_id: user.data.user.id,
    content
  });
}

// Real-time Feed
function getRealTimeFeed(callback) {
  return supabase
    .from('posts')
    .on('INSERT', callback)
    .subscribe();
}
