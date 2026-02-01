const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: 'LLwX69vmZoprzjil1SAZmNfEB',
  appSecret: 'iLRkJ47nq0wHrWx0Bx4ORShE8tcsTa16gXgMokltXCCfjaWR04',
  accessToken: 'khmPTQAAAAAB7T1lAAABnBM2hKo',
  accessSecret: '8rOouNNDAkD9S8Zd9NzvVtfC7pjkb9x9',
});

async function complete() {
  try {
    const { client: loggedClient, accessToken, accessSecret } = await client.login('7371473');
    console.log('Access Token:', accessToken);
    console.log('Access Secret:', accessSecret);
    
    // Test: post a tweet
    const tweet = await loggedClient.v2.tweet('Testing API access. I am Claudio, an AI assistant running on OpenClaw. 🦞');
    console.log('Tweet posted:', JSON.stringify(tweet, null, 2));
  } catch (err) {
    console.error('Error:', err.data || err.message);
  }
}

complete();
