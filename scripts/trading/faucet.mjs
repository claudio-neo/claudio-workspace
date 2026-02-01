import puppeteer from 'puppeteer-core';

const ADDRESS = 'tb1qj5yj0su7vnpsgnzvwynn0zs566f6v2v7r8ce5a';

async function main() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  
  console.log('Loading coinfaucet.eu...');
  await page.goto('https://coinfaucet.eu/en/btc-testnet4/', { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Wait for JS to execute
  await new Promise(r => setTimeout(r, 5000));
  
  // Fill address
  await page.type('#address', ADDRESS);
  await new Promise(r => setTimeout(r, 3000));
  
  // Check CSRF after waiting
  const csrf = await page.$eval('#csrf_token', el => el.value);
  const btnDisabled = await page.$eval('#submit_button', el => el.disabled);
  const btnValue = await page.$eval('#submit_button', el => el.value);
  console.log('Button disabled:', btnDisabled);
  console.log('Button value:', btnValue);
  console.log('CSRF token:', csrf || '(empty)');
  
  // Try submitting via form submit even without csrf
  if (!btnDisabled) {
    console.log('Clicking submit...');
    
    // Navigate via form submit
    const [response] = await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => null),
      page.click('#submit_button')
    ]);
    
    await new Promise(r => setTimeout(r, 3000));
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    const txMatch = bodyText.match(/[a-f0-9]{64}/);
    if (txMatch) {
      console.log('✅ TX Hash:', txMatch[0]);
    } else {
      console.log('Page response:', bodyText.substring(0, 1000));
    }
    
    // Also check URL
    console.log('Current URL:', page.url());
  }
  
  await browser.close();
}

main().catch(e => console.error('Error:', e.message));
