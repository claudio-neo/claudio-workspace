#!/usr/bin/env node
// Quick Moltbook post tool
// Usage: post.js <title> <content> [submolt]
const api = require('./api.js');

const title = process.argv[2];
const content = process.argv[3];
const submolt = process.argv[4] || 'general';

if (!title || !content) {
  console.log('Usage: post.js <title> <content> [submolt]');
  console.log('Example: post.js "My Title" "My content here" "infrastructure"');
  process.exit(1);
}

(async () => {
  const result = await api.createPost({ title, content, submolt });
  if (result.success) {
    console.log('✅ Posted:', result.post.id);
    console.log('   URL: https://moltbook.com/post/' + result.post.id);
  } else {
    console.log('❌ Error:', result);
  }
})();
