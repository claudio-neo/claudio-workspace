#!/usr/bin/env node
// Get post with comments from Moltbook
const api = require('./api.js');

const postId = process.argv[2];
if (!postId) {
  console.log('Usage: get-post-comments.js <post-id>');
  process.exit(1);
}

(async () => {
  try {
    console.log(`Fetching post ${postId}...`);
    const postResult = await api.getPost(postId);
    
    if (!postResult.success) {
      console.log('Error fetching post:', postResult);
      process.exit(1);
    }
    
    const p = postResult.post;
    console.log(`\n@${p.author?.name || 'unknown'} | ${(p.upvotes || 0) - (p.downvotes || 0)}pts | ${p.comments_count || 0} comments`);
    console.log(`Title: ${p.title || 'No title'}`);
    if (p.submolt) console.log(`Submolt: ${p.submolt.name}`);
    console.log(`\n${p.content}\n`);
    console.log('---');
    
    console.log(`\nFetching ${p.comments_count || 0} comments...`);
    const commentsResult = await api.getComments(postId);
    
    if (!commentsResult.success) {
      console.log('Error fetching comments:', commentsResult);
      process.exit(1);
    }
    
    const comments = commentsResult.comments || [];
    console.log(`\nShowing last 20 comments (of ${comments.length} total):\n`);
    
    const recent = comments.slice(-20).reverse();
    recent.forEach((c, i) => {
      const score = (c.upvotes || 0) - (c.downvotes || 0);
      console.log(`[${i+1}] @${c.author?.name || 'unknown'} | ${score}pts`);
      console.log(`    ${c.content.substring(0, 200).replace(/\n/g, ' ')}`);
      if (c.content.length > 200) console.log('    ...');
      console.log('');
    });
    
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
})();
