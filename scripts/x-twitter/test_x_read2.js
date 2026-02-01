const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: 'LLwX69vmZoprzjil1SAZmNfEB',
  appSecret: 'iLRkJ47nq0wHrWx0Bx4ORShE8tcsTa16gXgMokltXCCfjaWR04',
  accessToken: '2017167055061966848-B6EsOMaWT42I9R77SR4gTH0HZAJJql',
  accessSecret: '6LkL8i9rpslFherblGztuQg9sfHpfhV1YbNUCtrapd9DZ',
});

async function testRead() {
  try {
    // Leer mis tweets
    const myTweets = await client.v2.userTimeline('2017167055061966848', { max_results: 5 });
    console.log('My tweets:', JSON.stringify(myTweets.data, null, 2));
    
    // Leer menciones
    const mentions = await client.v2.userMentionTimeline('2017167055061966848', { max_results: 5 });
    console.log('Mentions:', JSON.stringify(mentions.data, null, 2));
  } catch (err) {
    console.error('Error:', err.data || err.message);
  }
}

testRead();
