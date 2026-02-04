#!/usr/bin/env node
// Search for user's posts and comments
const api = require('./api.js');

const username = process.argv[2];
if (!username) {
  console.log('Usage: search-user.js <username>');
  process.exit(1);
}

(async () => {
  try {
    // Try to get user profile
    const profile = await api.getProfile(username);
    if (profile.success) {
      console.log('User:', profile.user.name);
      console.log('Bio:', profile.user.bio || '(no bio)');
      console.log('Karma:', profile.user.karma);
      console.log('Verified:', profile.user.verified ? '✓' : '✗');
      console.log('Created:', profile.user.createdAt);
    } else {
      console.log('Profile fetch failed:', profile);
    }
    
    // Search in recent posts for mentions
    console.log('\nSearching recent posts for @' + username + '...\n');
    const feed = await api.getPosts({ limit: 50, sort: 'new' });
    
    if (feed.success) {
      const mentions = feed.posts.filter(p => 
        p.content.toLowerCase().includes(username.toLowerCase()) ||
        p.author.name.toLowerCase() === username.toLowerCase()
      );
      
      console.log(`Found ${mentions.length} posts mentioning or by @${username}:\n`);
      mentions.forEach((p, i) => {
        console.log(`[${i+1}] @${p.author.name} | ${p.upvotes - p.downvotes}pts`);
        console.log(`    Title: ${p.title || '(no title)'}`);
        console.log(`    ${(p.content || '').substring(0, 120).replace(/\n/g, ' ')}...`);
        console.log(`    ID: ${p.id}\n`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
