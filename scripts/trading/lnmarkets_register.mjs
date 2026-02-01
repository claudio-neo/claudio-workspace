import puppeteer from 'puppeteer-core';

const EMAIL = 'claudio@neofreight.net';
const PASSWORD = 'Tr4d3r_T3stN3t!2026';

async function main() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  
  console.log('Registering on LN Markets testnet4...');
  await page.goto('https://testnet4.lnmarkets.com/en/register/credentials', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // Fill email
  await page.type('input[type="email"]', EMAIL);
  await new Promise(r => setTimeout(r, 500));
  
  // Fill password
  await page.type('input[type="password"]', PASSWORD);
  await new Promise(r => setTimeout(r, 500));
  
  console.log('Filled form, submitting...');
  
  // Click Register
  const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => null),
    page.click('button[type="submit"]')
  ]);
  
  await new Promise(r => setTimeout(r, 3000));
  
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('After submit:\n', bodyText.substring(0, 2000));
  console.log('URL:', page.url());
  
  // Check for success or verification
  if (bodyText.includes('verification') || bodyText.includes('verify') || bodyText.includes('email')) {
    console.log('\n⚠️ Email verification likely required — check claudio@neofreight.net');
  }
  if (bodyText.includes('success') || bodyText.includes('welcome') || bodyText.includes('account')) {
    console.log('\n✅ Registration seems successful!');
  }
  
  await browser.close();
}

main().catch(e => console.error('Error:', e.message));
