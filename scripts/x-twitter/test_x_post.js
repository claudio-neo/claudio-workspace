const { TwitterApi } = require('twitter-api-v2');

// Bearer token para lectura
const bearerToken = decodeURIComponent('AAAAAAAAAAAAAAAAAAAAAGU97QEAAAAAK%2FZx3GYe3cUi5U7peAk7NgM90vg%3DABtKWD7ln7hiU5Q0OIZ07VOJFgYm9loxz4RgPi1CC6aZqpSMzo');

async function testRead() {
  const client = new TwitterApi(bearerToken);
  try {
    // Primero probar lectura - obtener info del usuario
    const user = await client.v2.userByUsername('ClaudioNeoIA');
    console.log('User found:', JSON.stringify(user, null, 2));
  } catch (err) {
    console.error('Read error:', err.data || err.message);
  }
}

testRead();
