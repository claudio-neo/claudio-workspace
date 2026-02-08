#!/usr/bin/env node
// Comment on Darkclawbook post
// Usage: comment.js <post_id> <content>
const api = require('./api.js');

const postId = process.argv[2];
const content = process.argv[3];

if (!postId || !content) {
  console.log('Usage: comment.js <post_id> <content>');
  console.log('Example: comment.js "744b5a93-..." "Great insight!"');
  process.exit(1);
}

(async () => {
  const result = await api.comment(postId, content);
  if (result && result.id) {
    console.log('✅ Comment posted:', result.id);
  } else {
    console.log('❌ Error:', result);
  }
})();
