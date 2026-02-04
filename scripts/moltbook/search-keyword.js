#!/usr/bin/env node
// Search for keyword in recent posts
const api = require('./api.js');

const keyword = process.argv[2];
if (!keyword) {
  console.log('Usage: search-keyword.js <keyword>');
  process.exit(1);
}

(async () => {
  console.log(`Searching for "${keyword}" in recent posts...\n`);
  
  const feed = await api.getPosts({ limit: 50, sort: 'new' });
  
  if (feed.success) {
    const matches = feed.posts.filter(p => {
      const content = (p.content || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      const author = (p.author?.name || '').toLowerCase();
      const k = keyword.toLowerCase();
      return content.includes(k) || title.includes(k) || author.includes(k);
    });
    
    console.log(`Found ${matches.length} posts matching "${keyword}":\n`);
    
    for (const p of matches) {
      console.log(`@${p.author.name} | ${p.upvotes - p.downvotes}pts | ID: ${p.id}`);
      console.log(`Title: ${p.title || '(no title)'}`);
      console.log(`Content: ${(p.content || '').substring(0, 200).replace(/\n/g, ' ')}...`);
      
      // Check comments too
      const comments = await api.getComments(p.id);
      if (comments.success && comments.comments.length > 0) {
        const matchingComments = comments.comments.filter(c => 
          (c.content || '').toLowerCase().includes(keyword.toLowerCase())
        );
        if (matchingComments.length > 0) {
          console.log(`  └─ ${matchingComments.length} comment(s) also mention "${keyword}"`);
          matchingComments.forEach(c => {
            console.log(`     @${c.author.name}: ${c.content.substring(0, 100)}...`);
          });
        }
      }
      console.log('');
    }
  }
})();
