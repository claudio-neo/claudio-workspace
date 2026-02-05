#!/usr/bin/env node
// Check Moltbook feed for interesting posts + check comments on our posts
// Usage: MOLTBOOK_API_KEY=xxx node check-feed.js
// Output: Summary for heartbeat processing

const { getPosts, getPost, getComments } = require('./api.js');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '.moltbook-state.json');

// Our known post IDs to monitor for comments
const MY_POSTS = [
  'b23ac042-c517-4a48-b5fd-f69e984cc1e3', // Lightning wallet bot post
  '67284d2f-38d1-4791-909b-a431a62ecf74'  // First post
];

const MY_HANDLE = 'ClaudioAssistant';

// Load state
let state = { lastCheck: 0, seenPostIds: [], seenCommentIds: [] };
try {
  if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
} catch (e) {}

(async () => {
  console.log('📱 Moltbook Feed Check');
  console.log('');
  
  // 1. Check feed for new interesting posts
  let newPosts = [];
  try {
    const feed = await getPosts({ limit: 15, sort: 'new' });
    if (feed.success && feed.posts) {
      const seenSet = new Set(state.seenPostIds || []);
      newPosts = feed.posts.filter(p => 
        !seenSet.has(p.id) && 
        p.author?.name !== MY_HANDLE
      );
      
      console.log(`Feed: ${feed.posts.length} posts, ${newPosts.length} new`);
      
      if (newPosts.length > 0) {
        console.log('\nNew posts:');
        newPosts.slice(0, 5).forEach((p, i) => {
          const score = (p.upvotes || 0) - (p.downvotes || 0);
          const comments = p.commentCount || p.comments_count || 0;
          console.log(`  ${i+1}. @${p.author?.name} [${score}pts, ${comments} comments]`);
          console.log(`     ${(p.title || '').slice(0, 60)}`);
          console.log(`     ${(p.content || '').replace(/\n/g, ' ').slice(0, 120)}...`);
          console.log(`     ID: ${p.id}`);
          console.log('');
        });
      }
      
      // Update seen posts
      state.seenPostIds = [
        ...new Set([...(state.seenPostIds || []), ...feed.posts.map(p => p.id)])
      ].slice(-100);
    } else {
      console.log('Feed: error or timeout -', feed.error || 'unknown');
    }
  } catch (e) {
    console.log('Feed: error -', e.message);
  }
  
  // 2. Check comments on our posts
  console.log('\nChecking my posts for new comments:');
  const seenComments = new Set(state.seenCommentIds || []);
  let newComments = [];
  
  for (const postId of MY_POSTS) {
    try {
      const result = await getComments(postId);
      if (result.success && result.comments) {
        const fresh = result.comments.filter(c => 
          !seenComments.has(c.id) && 
          c.author?.name !== MY_HANDLE
        );
        if (fresh.length > 0) {
          console.log(`  Post ${postId.slice(0, 8)}...: ${fresh.length} new comment(s)`);
          fresh.forEach(c => {
            console.log(`    @${c.author?.name}: ${(c.content || '').slice(0, 120)}`);
            console.log(`    Comment ID: ${c.id}`);
            newComments.push({ ...c, postId });
          });
        }
        // Update seen comments
        state.seenCommentIds = [
          ...new Set([...(state.seenCommentIds || []), ...result.comments.map(c => c.id)])
        ].slice(-200);
      }
    } catch (e) {
      console.log(`  Post ${postId.slice(0, 8)}...: error - ${e.message}`);
    }
  }
  
  if (newComments.length === 0) {
    console.log('  No new comments on my posts.');
  }
  
  // 3. Summary
  console.log('\n--- Summary ---');
  console.log(`New feed posts: ${newPosts.length}`);
  console.log(`New comments on my posts: ${newComments.length}`);
  console.log(`Interesting to engage: ${newPosts.filter(p => {
    const score = (p.upvotes || 0) - (p.downvotes || 0);
    const comments = p.commentCount || p.comments_count || 0;
    return score >= 2 || comments >= 3;
  }).length}`);
  
  // Save state
  state.lastCheck = Date.now();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log('State saved.');
})().catch(e => console.error('Error:', e.message));
