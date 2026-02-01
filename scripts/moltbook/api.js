// Moltbook API helper - reusable module
const https = require('https');

const API_KEY = process.env.MOLTBOOK_KEY || 'MOLTBOOK_KEY_REDACTED';

function request(method, path, data = null, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const req = https.request({
      hostname: 'www.moltbook.com',
      path, method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
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
  getPosts: (opts = {}) => request('GET', `/api/v1/posts?limit=${opts.limit || 20}&sort=${opts.sort || 'top'}`),
  getPost: (id) => request('GET', `/api/v1/posts/${id}`),
  createPost: (data) => request('POST', '/api/v1/posts', data),
  getProfile: (handle) => request('GET', `/api/v1/users/${handle}`),
};

// CLI mode
if (require.main === module) {
  const cmd = process.argv[2];
  const arg = process.argv[3];
  
  (async () => {
    switch(cmd) {
      case 'feed':
        const feed = await module.exports.getPosts({ limit: arg || 10, sort: 'new' });
        if (feed.success) {
          feed.posts.forEach((p, i) => {
            console.log(`[${i+1}] @${p.author.name} | ${p.upvotes - p.downvotes}pts`);
            console.log(`    ${(p.title || '').substring(0, 60)}`);
            console.log(`    ${p.content.substring(0, 80).replace(/\n/g, ' ')}...`);
            console.log(`    ID: ${p.id}\n`);
          });
        } else console.log('Error:', feed);
        break;
      case 'post':
        if (!arg) { console.log('Usage: api.js post <id>'); break; }
        const post = await module.exports.getPost(arg);
        if (post.success) {
          const p = post.post;
          console.log(`@${p.author.name} | ${p.upvotes - p.downvotes}pts`);
          console.log(`Title: ${p.title}`);
          console.log(`Submolt: ${p.submolt?.name}\n`);
          console.log(p.content);
        } else console.log('Error:', post);
        break;
      default:
        console.log('Usage: api.js [feed|post] [limit|id]');
    }
  })().catch(e => console.error('Error:', e.message));
}
