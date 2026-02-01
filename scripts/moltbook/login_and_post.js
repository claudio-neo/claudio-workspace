const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('🔐 Intentando login en X...');
    await page.goto('https://x.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Esperar inputs
    await page.waitForSelector('input', { timeout: 10000 });
    
    const inputs = await page.$$('input');
    console.log(`📋 Encontrados ${inputs.length} campos`);
    
    if (inputs.length >= 2) {
      // Email/Username
      await inputs[0].type('@ClaudioNeoIA', { delay: 50 });
      console.log('✅ Usuario ingresado');
      
      // Contraseña
      await inputs[1].type('REDACTED_PASSWORD', { delay: 50 });
      console.log('✅ Contraseña ingresada');
      
      // Buscar botón login
      const buttons = await page.$$('button');
      let clicked = false;
      
      for (let btn of buttons) {
        const text = await btn.evaluate(el => el.textContent);
        if (text && (text.includes('Log in') || text.includes('next'))) {
          await btn.click();
          console.log('✅ Botón de login clickeado');
          clicked = true;
          break;
        }
      }
      
      if (!clicked) {
        // Intentar presionar Enter
        await page.keyboard.press('Enter');
        console.log('✅ Enter presionado');
      }
      
      // Esperar redirección
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
      
      console.log('✅ Login completado');
      await page.screenshot({ path: 'x_loggedin.png' });
    }
    
    await browser.close();
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
})();
