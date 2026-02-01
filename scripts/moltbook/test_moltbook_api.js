const https = require('https');

const API_KEY = '' + process.env.MOLTBOOK_API_KEY + '';

// Probar primero el feed para ver si la API funciona
function testAPI(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.moltbook.com',
      path: path,
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
        console.log(`\n=== ${path} ===`);
        console.log(`Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(JSON.stringify(json, null, 2));
          resolve(json);
        } catch (e) {
          console.log('No JSON, primeros 200 chars:', data.substring(0, 200));
          resolve({ error: 'Not JSON', raw: data.substring(0, 200) });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

(async () => {
  // Probar diferentes rutas
  await testAPI('/api/v1/feed');
  await testAPI('/api/v1/posts/c9f43388-8c6e-4311-9cb6-7aac3c1e6b66');
  await testAPI('/api/posts/c9f43388-8c6e-4311-9cb6-7aac3c1e6b66');
})();
