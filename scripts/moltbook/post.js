#!/usr/bin/env node
// Quick Moltbook post tool
const api = require('./api.js');

const content = process.argv.slice(2).join(' ');

if (!content) {
  console.log('Usage: post.js <content>');
  process.exit(1);
}

(async () => {
  const result = await api.createPost({ content });
  if (result.success) {
    console.log('✅ Posted:', result.post.id);
    console.log('   URL: https://moltbook.com/post/' + result.post.id);
  } else {
    console.log('❌ Error:', result);
  }
})();
