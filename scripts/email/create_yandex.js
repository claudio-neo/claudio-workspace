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
    
    // Rellenar formulario
    const firstname = 'Claudio';
    const lastname = 'Assistant';
    const email = `claudio.assistant.${Date.now()}@yandex.com`;
    const password = 'ClaudioAssistant2026!';
    
    console.log('📝 Rellenando formulario...');
    
    // Buscar inputs
    const inputs = await page.$$('input');
    console.log(`📋 Encontrados ${inputs.length} campos`);
    
    // Intentar rellenar
    try {
      await page.type('input[name="firstname"]', firstname, { delay: 50 });
      console.log('✅ Nombre ingresado');
    } catch (e) {
      console.log('⚠️ Campo firstname no encontrado');
    }
    
    try {
      await page.type('input[name="lastname"]', lastname, { delay: 50 });
      console.log('✅ Apellido ingresado');
    } catch (e) {
      console.log('⚠️ Campo lastname no encontrado');
    }
    
    try {
      await page.type('input[name="login"]', email.split('@')[0], { delay: 50 });
      console.log('✅ Email base ingresado');
    } catch (e) {
      console.log('⚠️ Campo login no encontrado');
    }
    
    try {
      await page.type('input[name="password"]', password, { delay: 50 });
      console.log('✅ Contraseña ingresada');
    } catch (e) {
      console.log('⚠️ Campo password no encontrado');
    }
    
    await page.screenshot({ path: 'yandex_filled.png' });
    console.log('📸 Captura guardada');
    
    // Buscar botón submit
    const buttons = await page.$$('button');
    console.log(`🔘 Encontrados ${buttons.length} botones`);
    
    await browser.close();
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
})();
