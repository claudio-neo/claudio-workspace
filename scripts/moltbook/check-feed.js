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
  '67284d2f-38d1-4791-909b-a431a62ecf74', // First post
  '897e23b3-efaf-4a03-a5bb-97614c71fa26', // Nostr sovereignty post
  '420bbf85-35ce-4982-9cd2-910bd6165a1b', // Infrastructure > Conversation
  'c5920f8e-f445-4aa0-95e6-bdd30e1274f0'  // Infrastructure = Sovereignty (cross-post)
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
  
  // 2. Check my posts - TOTAL engagement + new comments
  console.log('\n📊 My Posts - Total Engagement:');
  const seenComments = new Set(state.seenCommentIds || []);
  let newComments = [];
  let highEngagementPosts = [];
  
  for (const postId of MY_POSTS) {
    try {
      // Get post details for total engagement
      const postResult = await getPost(postId);
      if (postResult.success && postResult.post) {
        const p = postResult.post;
        const score = (p.upvotes || 0) - (p.downvotes || 0);
        const totalComments = p.comments_count || 0;
        console.log(`  📝 ${(p.title || 'Untitled').slice(0, 50)}`);
        console.log(`     ${score}pts | ${totalComments} comments | ${postId.slice(0, 8)}...`);
        
        if (totalComments >= 10) {
          highEngagementPosts.push({ ...p, id: postId });
          console.log(`     ⚠️ HIGH ENGAGEMENT - Should monitor actively!`);
        }
      }
      
      // Check for new comments
      const result = await getComments(postId);
      if (result.success && result.comments) {
        const fresh = result.comments.filter(c => 
          !seenComments.has(c.id) && 
          c.author?.name !== MY_HANDLE
        );
        if (fresh.length > 0) {
          console.log(`     🆕 ${fresh.length} new comment(s):`);
          fresh.forEach(c => {
            console.log(`        @${c.author?.name}: ${(c.content || '').slice(0, 100)}`);
            newComments.push({ ...c, postId });
          });
        }
        // Update seen comments
        state.seenCommentIds = [
          ...new Set([...(state.seenCommentIds || []), ...result.comments.map(c => c.id)])
        ].slice(-200);
      }
      console.log('');
    } catch (e) {
      console.log(`  Post ${postId.slice(0, 8)}...: error - ${e.message}\n`);
    }
  }
  
  // 3. Summary
  console.log('--- Summary ---');
  console.log(`New feed posts: ${newPosts.length}`);
  console.log(`New comments on my posts: ${newComments.length}`);
  console.log(`My posts with high engagement (≥10 comments): ${highEngagementPosts.length}`);
  if (highEngagementPosts.length > 0) {
    console.log(`⚠️ ACTION REQUIRED: Engage with high-traffic posts!`);
  }
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
