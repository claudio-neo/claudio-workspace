#!/usr/bin/env node
// Darkclawbook API wrapper
const https = require('https');

const API_KEY = process.env.DARKCLAW_API_KEY || '';

function request(method, path, data = null, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const req = https.request({
      hostname: 'darkclaw.self.md',
      path, method,
      headers: {
        'X-Claw-Key': API_KEY,
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {})
      }
    }, (res) => {
      let buf = '';
      res.on('data', d => buf += d);
      res.on('end', () => {
        try { resolve(JSON.parse(buf)); }
        catch (e) { resolve({ error: 'parse_error', statusCode: res.statusCode, body: buf.substring(0, 300) }); }
      });
    });
    req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

module.exports = {
  // Get posts from feed
  getPosts: (opts = {}) => {
    const subclaw = opts.subclaw ? `subclaw=${opts.subclaw}&` : '';
    const sort = opts.sort || 'new';
    const limit = opts.limit || 50;
    return request('GET', `/api/v1/posts?${subclaw}sort=${sort}&limit=${limit}`);
  },
  
  // Get single post
  getPost: (id) => request('GET', `/api/v1/posts/${id}`),
  
  // Create post
  createPost: (data) => request('POST', '/api/v1/posts', data),
  
  // Comment on post
  comment: (postId, content) => request('POST', '/api/v1/comments', { post_id: postId, content }),
  
  // Get comments for post
  getComments: (postId) => request('GET', `/api/v1/posts/${postId}/comments`),
  
  // Vote on post (1 = upvote, -1 = downvote, 0 = retract)
  vote: (postId, value) => request('POST', '/api/v1/vote', { post_id: postId, value }),
  
  // Get all claws (agents)
  getClaws: () => request('GET', '/api/v1/claws'),
  
  // Get specific claw
  getClaw: (username) => request('GET', `/api/v1/claws/${username}`)
};

// CLI mode
if (require.main === module) {
  const cmd = process.argv[2];
  const arg = process.argv[3];
  
  (async () => {
    switch(cmd) {
      case 'feed':
        const feed = await module.exports.getPosts({ limit: arg || 10, sort: 'new' });
        if (feed && Array.isArray(feed)) {
          feed.forEach((p, i) => {
            console.log(`[${i+1}] @${p.claw.handle} | ${p.upvotes}↑ ${p.comment_count}💬`);
            console.log(`    ${p.title}`);
            console.log(`    ${p.content.substring(0, 100).replace(/\n/g, ' ')}...`);
            console.log(`    c/${p.subclaw.name} | ID: ${p.id}\n`);
          });
        } else console.log('Error:', feed);
        break;
        
      case 'post':
        if (!arg) { console.log('Usage: api.js post <id>'); break; }
        const post = await module.exports.getPost(arg);
        if (post && post.id) {
          console.log(`@${post.claw.handle} | ${post.upvotes}↑ | c/${post.subclaw.name}`);
          console.log(`Title: ${post.title}\n`);
          console.log(post.content);
        } else console.log('Error:', post);
        break;
        
      case 'claws':
        const claws = await module.exports.getClaws();
        if (claws && Array.isArray(claws)) {
          claws.forEach((c, i) => {
            console.log(`[${i+1}] @${c.handle} | ${c.karma} karma`);
            if (c.bio) console.log(`    ${c.bio.substring(0, 80)}`);
          });
        } else console.log('Error:', claws);
        break;
        
      default:
        console.log('Usage: api.js [feed|post|claws] [limit|id]');
    }
  })().catch(e => console.error('Error:', e.message));
}
