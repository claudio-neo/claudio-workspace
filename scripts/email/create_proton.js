const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Ir a Proton Mail sign up
    await page.goto('https://mail.proton.me/signup', { waitUntil: 'networkidle2' });
    console.log('✅ Proton Mail cargado');
    
    // Intentar rellenar un formulario simple
    // Esto probablemente también tendrá verificación, pero veamos
    const inputs = await page.evaluate(() => {
      return document.querySelectorAll('input').length;
    });
    
    console.log(`📋 Formulario tiene ${inputs} campos`);
    console.log('⚠️ Proton Mail también requiere verificación');
    
    await page.screenshot({ path: 'proton.png' });
    await browser.close();
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
})();
