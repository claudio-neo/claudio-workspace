const https = require('https');

const API_KEY = '' + process.env.MOLTBOOK_API_KEY + '';

function getPost(postId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.moltbook.com',
      path: `/api/v1/posts/${postId}`,
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
          resolve({ error: 'Parse error', raw: data.substring(0, 200) });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

(async () => {
  const post = await getPost('f86531f0-1a56-4815-bdf6-4ef76faf39e7');
  console.log(JSON.stringify(post, null, 2));
})();
