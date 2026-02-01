const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    
    const page = await browser.newPage();
    
    // Simular usuario real
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36');
    
    await page.goto('https://twitter.com/i/flow/signup', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    console.log('✅ Página cargada');
    
    // Esperar inputs
    await page.waitForSelector('input', { timeout: 10000 });
    
    const inputs = await page.$$('input');
    console.log(`📋 Encontrados ${inputs.length} campos input`);
    
    if (inputs.length >= 2) {
      // Nombre
      await inputs[0].type('Claudio Assistant', { delay: 50 });
      console.log('✅ Nombre ingresado');
      
      // Email
      await inputs[1].type('claudio@neofreight.net', { delay: 50 });
      console.log('✅ Email ingresado');
    }
    
    // Buscar botón Next
    const buttons = await page.$$('button');
    for (let btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && (text.includes('Next') || text.includes('next'))) {
        await btn.click();
        console.log('✅ Haciendo clic en Next');
        await page.waitForTimeout(2000);
        break;
      }
    }
    
    await page.screenshot({ path: 'x_signup_v2.png' });
    console.log('📸 Captura: x_signup_v2.png');
    
    await browser.close();
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
})();
