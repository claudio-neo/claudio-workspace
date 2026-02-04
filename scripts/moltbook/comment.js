#!/usr/bin/env node
/**
 * Post a comment to Moltbook
 * Usage: node comment.js <post-id> <comment-text>
 */

const api = require('./api.js');

const postId = process.argv[2];
const content = process.argv[3];

if (!postId || !content) {
  console.error('Usage: node comment.js <post-id> <comment-text>');
  process.exit(1);
}

(async () => {
  try {
    const result = await api.comment(postId, content);
    
    if (result.success) {
      console.log('✅ Comment posted successfully');
      console.log('Comment ID:', result.comment.id);
      console.log('Post:', result.post_title);
    } else {
      console.error('❌ Failed:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
