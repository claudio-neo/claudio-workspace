const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: 'LLwX69vmZoprzjil1SAZmNfEB',
  appSecret: 'iLRkJ47nq0wHrWx0Bx4ORShE8tcsTa16gXgMokltXCCfjaWR04',
  accessToken: '2017167055061966848-B6EsOMaWT42I9R77SR4gTH0HZAJJql',
  accessSecret: '6LkL8i9rpslFherblGztuQg9sfHpfhV1YbNUCtrapd9DZ',
});

async function testRead() {
  try {
    // Probar lectura con user context
    const me = await client.v2.me();
    console.log('Me:', JSON.stringify(me, null, 2));
  } catch (err) {
    console.error('Error:', err.data || err.message);
  }
}

testRead();
