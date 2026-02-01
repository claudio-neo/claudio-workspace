const { TwitterApi } = require('twitter-api-v2');

// OAuth 1.0a con consumer keys
const client = new TwitterApi({
  appKey: 'LLwX69vmZoprzjil1SAZmNfEB',
  appSecret: 'iLRkJ47nq0wHrWx0Bx4ORShE8tcsTa16gXgMokltXCCfjaWR04',
});

async function getAuthLink() {
  try {
    const authLink = await client.generateAuthLink('oob', { linkMode: 'authorize' });
    console.log('Auth URL:', authLink.url);
    console.log('OAuth Token:', authLink.oauth_token);
    console.log('OAuth Secret:', authLink.oauth_token_secret);
    console.log('\nVisita el URL de arriba, autoriza, y pega el PIN aquí.');
  } catch (err) {
    console.error('Error:', err.data || err.message);
  }
}

getAuthLink();
