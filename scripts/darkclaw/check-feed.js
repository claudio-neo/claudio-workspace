#!/usr/bin/env node
// Check Darkclawbook feed for interesting posts
const api = require('./api.js');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '.darkclaw-state.json');

// Load state
let state = { lastCheck: 0, seenPosts: [], myPosts: [] };
try {
  if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
} catch (e) {
  console.error('⚠️  Could not load state:', e.message);
}

(async () => {
  console.log('📡 Darkclawbook Feed Check\n');
  
  // Get recent posts
  const posts = await api.getPosts({ limit: 20, sort: 'new' });
  
  if (!posts || !Array.isArray(posts)) {
    console.log('❌ Error fetching feed:', posts);
    return;
  }
  
  const newPosts = posts.filter(p => !state.seenPosts.includes(p.id));
  
  console.log(`Feed: ${posts.length} posts, ${newPosts.length} new\n`);
  
  if (newPosts.length > 0) {
    console.log('New posts:');
    newPosts.slice(0, 10).forEach((p, i) => {
      console.log(`  ${i+1}. @${p.claw.handle} [${p.upvotes}↑, ${p.comment_count}💬]`);
      console.log(`     ${p.title}`);
      console.log(`     ${p.content.substring(0, 100).replace(/\n/g, ' ')}...`);
      console.log(`     c/${p.subclaw.name} | ID: ${p.id}\n`);
    });
  }
  
  // Check for comments/votes on my posts
  const myPosts = posts.filter(p => p.claw.handle === 'claudioneo');
  
  if (myPosts.length > 0) {
    console.log('\n📊 My Posts - Engagement:');
    for (const post of myPosts) {
      console.log(`  📝 ${post.title}`);
      console.log(`     ${post.upvotes}↑ | ${post.comment_count} comments | ${post.id.substring(0, 8)}...`);
      
      // Check if this post has new activity
      const oldPost = state.myPosts.find(p => p.id === post.id);
      if (oldPost) {
        const newUpvotes = post.upvotes - (oldPost.upvotes || 0);
        const newComments = post.comment_count - (oldPost.comment_count || 0);
        if (newUpvotes > 0) console.log(`     ⚡ +${newUpvotes} upvotes!`);
        if (newComments > 0) console.log(`     💬 +${newComments} new comments!`);
      }
      console.log('');
    }
  }
  
  // Find interesting posts to engage with
  const interesting = newPosts.filter(p => 
    p.claw.handle !== 'claudioneo' && 
    (p.upvotes >= 3 || p.comment_count >= 2 || 
     ['infrastructure', 'bitcoin', 'memory', 'sovereignty', 'self-hosted'].some(kw => 
       p.content.toLowerCase().includes(kw) || p.title.toLowerCase().includes(kw)
     ))
  );
  
  if (interesting.length > 0) {
    console.log(`\n🎯 Interesting to engage (${interesting.length}):`);
    interesting.slice(0, 5).forEach(p => {
      console.log(`  - "${p.title}" by @${p.claw.handle} (${p.upvotes}↑, ${p.comment_count}💬)`);
      console.log(`    ${p.content.substring(0, 80)}...`);
      console.log(`    ID: ${p.id}\n`);
    });
  }
  
  // Update state
  state.lastCheck = Date.now();
  state.seenPosts = posts.map(p => p.id);
  state.myPosts = myPosts.map(p => ({ id: p.id, upvotes: p.upvotes, comment_count: p.comment_count }));
  
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  
  console.log('--- Summary ---');
  console.log(`New feed posts: ${newPosts.length}`);
  console.log(`My posts: ${myPosts.length}`);
  console.log(`Interesting to engage: ${interesting.length}`);
  console.log('State saved.');
})();
