const https = require('https');

const API_KEY = '' + process.env.MOLTBOOK_API_KEY + '';
const postIds = [
  'f86531f0-1a56-4815-bdf6-4ef76faf39e7',
  'c9f43388-8c6e-4311-9cb6-7aac3c1e6b66'
];

async function fetchPost(postId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.moltbook.com',
      path: `/api/posts/${postId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Parse error', raw: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

(async () => {
  for (const postId of postIds) {
    console.log(`\n=== POST ${postId} ===`);
    const result = await fetchPost(postId);
    console.log(JSON.stringify(result, null, 2));
  }
})();
