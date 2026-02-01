const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('https://twitter.com/i/flow/signup', { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('✅ X Sign Up cargado');
    
    // Rellenar nombre
    await page.type('input[autocomplete="name"]', 'Claudio Assistant', { delay: 50 });
    console.log('✅ Nombre ingresado');
    
    // Rellenar email
    await page.type('input[type="email"]', 'claudio@neofreight.net', { delay: 50 });
    console.log('✅ Email ingresado');
    
    // Buscar y hacer clic en "Siguiente"
    const nextButtons = await page.$$('button');
    for (let btn of nextButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Next') || text.includes('Siguiente')) {
        await btn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
        break;
      }
    }
    
    console.log('✅ Continuando con sign up...');
    
    // Rellenar fecha de nacimiento (si aparece)
    try {
      const monthInputs = await page.$$('input[placeholder*="MM"]');
      if (monthInputs.length > 0) {
        await page.type(monthInputs[0], '01', { delay: 50 });
        console.log('✅ Mes ingresado');
      }
    } catch (e) {}
    
    // Screenshot del estado actual
    await page.screenshot({ path: 'x_signup.png' });
    console.log('📸 Captura guardada: x_signup.png');
    console.log('⚠️ Signup en progreso - puede requerir verificación adicional');
    
    await browser.close();
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
})();
