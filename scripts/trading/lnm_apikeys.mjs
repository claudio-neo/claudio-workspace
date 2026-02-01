import puppeteer from 'puppeteer-core';

async function main() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  
  // Login
  console.log('Logging in...');
  await page.goto('https://testnet4.lnmarkets.com/en/login/credentials', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.type('input[placeholder*="login or email"]', 'claudio@neofreight.net');
  await page.type('input[placeholder*="password"]', 'Tr4d3r_T3stN3t!2026');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => null),
    page.click('button[type="submit"]')
  ]);
  await new Promise(r => setTimeout(r, 3000));
  console.log('Logged in.');
  
  // Go to API V3 page
  await page.evaluate(() => { window.location.href = '/en/user/api/v3/'; });
  await new Promise(r => setTimeout(r, 8000));
  
  // Click "New key"
  console.log('Clicking New key...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('New key'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  
  // Read the auto-generated name and passphrase
  const inputs = await page.evaluate(() => 
    Array.from(document.querySelectorAll('input')).map(el => ({
      value: el.value,
      type: el.type,
      placeholder: el.placeholder
    }))
  );
  console.log('Form inputs:', JSON.stringify(inputs));
  
  // Click "Select all" for permissions
  console.log('Selecting all permissions...');
  await page.evaluate(() => {
    // Find "Select all" text and click it or its parent button
    const allEls = document.querySelectorAll('button, label, span, div, a');
    for (const el of allEls) {
      if (el.textContent.trim() === 'Select all') {
        el.click();
        console.log('Clicked Select all');
        break;
      }
    }
    // Also try clicking all checkboxes
    document.querySelectorAll('input[type="checkbox"], button[role="checkbox"]').forEach(cb => {
      if (!cb.checked && !cb.getAttribute('data-state')?.includes('checked')) {
        cb.click();
      }
    });
  });
  await new Promise(r => setTimeout(r, 2000));
  
  // Click "Create" button
  console.log('Creating API key...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.trim() === 'Create');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  
  // Read the result - should show key, secret, passphrase
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('\nAfter create:\n', bodyText.substring(0, 3000));
  
  // Get all values from inputs, code blocks, etc.
  const allValues = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('input, code, pre, span, div').forEach(el => {
      const val = el.value || el.textContent || '';
      // Look for long strings that could be keys/secrets
      if (val.length > 10 && val.length < 200 && !val.includes(' ') && /^[a-zA-Z0-9_/+=.-]+$/.test(val)) {
        results.push({ tag: el.tagName, class: el.className?.substring(0, 30), value: val });
      }
    });
    return results;
  });
  console.log('\nPotential keys/secrets:', JSON.stringify(allValues, null, 2));
  
  await browser.close();
}

main().catch(e => console.error('Error:', e.message));
