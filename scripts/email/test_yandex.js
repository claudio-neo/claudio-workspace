const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('https://passport.yandex.com/registration', { waitUntil: 'networkidle2' });
    
    // Verificar si hay CAPTCHA en la página
    const captchas = await page.evaluate(() => {
      const recaptcha = document.querySelector('[data-sitekey]');
      const hcaptcha = document.querySelector('.h-captcha');
      return { recaptcha: !!recaptcha, hcaptcha: !!hcaptcha };
    });
    
    console.log('🔍 Análisis de Yandex:');
    console.log(`- reCAPTCHA: ${captchas.recaptcha ? '❌ Presente' : '✅ No presente'}`);
    console.log(`- hCaptcha: ${captchas.hcaptcha ? '❌ Presente' : '✅ No presente'}`);
    
    if (!captchas.recaptcha && !captchas.hcaptcha) {
      console.log('\n✅ Yandex podría funcionar sin CAPTCHA');
    }
    
    await browser.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
