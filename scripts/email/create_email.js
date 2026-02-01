const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('https://accounts.google.com/signup', { waitUntil: 'networkidle2' });
    
    console.log('✅ Google Sign Up cargado');
    console.log('⚠️ Necesito interacción manual para los CAPTCHAs');
    
    // Screenshot para verificar
    await page.screenshot({ path: 'signup.png' });
    console.log('📸 Captura guardada en signup.png');
    
    await browser.close();
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
})();
