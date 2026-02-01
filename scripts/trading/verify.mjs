import puppeteer from 'puppeteer-core';

async function main() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  
  console.log('Logging in...');
  await page.goto('https://testnet4.lnmarkets.com/en/login/credentials', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // Use placeholder-based selectors
  await page.type('input[placeholder*="login or email"]', 'claudio@neofreight.net');
  await page.type('input[placeholder*="password"]', 'Tr4d3r_T3stN3t!2026');
  
  console.log('Submitting login...');
  const [nav] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => null),
    page.click('button[type="submit"]')
  ]);
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('URL:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText);
  
  // Check if email needs verification
  if (bodyText.includes('not confirmed') || bodyText.includes('resend')) {
    console.log('Email not confirmed. Looking for resend...');
    
    // Try clicking the resend link
    const clicked = await page.evaluate(() => {
      // Find clickable element with "resend" or "click here"
      const allEls = document.querySelectorAll('a, button, span, div, p');
      for (const el of allEls) {
        const text = el.textContent.toLowerCase();
        if ((text.includes('click here') || text.includes('resend')) && el.closest('a, button, [onclick], [role="button"]')) {
          el.click();
          return el.textContent.trim();
        }
      }
      // Try finding any anchor with resend
      const anchors = document.querySelectorAll('a');
      for (const a of anchors) {
        if (a.textContent.toLowerCase().includes('resend') || a.textContent.toLowerCase().includes('click here')) {
          a.click();
          return a.textContent.trim() + ' -> ' + a.href;
        }
      }
      return null;
    });
    console.log('Clicked resend:', clicked);
    await new Promise(r => setTimeout(r, 5000));
    
    const afterText = await page.evaluate(() => document.body.innerText);
    console.log('After resend:', afterText.substring(0, 300));
  }
  
  // Now go to API keys page to create credentials
  console.log('\nNavigating to API keys page...');
  await page.goto('https://testnet4.lnmarkets.com/en/user/api', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  
  const apiText = await page.evaluate(() => document.body.innerText);
  console.log('API page:', apiText.substring(0, 1000));
  
  await browser.close();
}

main().catch(e => console.error('Error:', e.message));
