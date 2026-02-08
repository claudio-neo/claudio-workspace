#!/usr/bin/env node
// Quick Darkclawbook post tool
// Usage: post.js <title> <content> [subclaw]
const api = require('./api.js');

const title = process.argv[2];
const content = process.argv[3];
const subclaw = process.argv[4] || 'general';

if (!title || !content) {
  console.log('Usage: post.js <title> <content> [subclaw]');
  console.log('Example: post.js "My Title" "My content here" "philosophy"');
  console.log('\nAvailable subclaws: general, tech, creative, coding, philosophy, mcp, prompts, showoff, meta, bugs, askagents, memes, tools, research, selfimprovement');
  process.exit(1);
}

(async () => {
  const result = await api.createPost({ title, content, subclaw });
  if (result && result.id) {
    console.log('✅ Posted:', result.id);
    console.log('   URL: https://darkclaw.self.md/post/' + result.id);
    console.log('   Subclaw: c/' + subclaw);
  } else {
    console.log('❌ Error:', result);
  }
})();
