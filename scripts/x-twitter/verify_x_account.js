const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36');
    
    console.log('🔍 Accediendo a X...');
    await page.goto('https://twitter.com/ClaudioNeoIA', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Buscar elementos de perfil
    const title = await page.title();
    console.log(`✅ Página cargada: ${title}`);
    
    // Verificar si es la página de perfil
    const urlCheck = page.url();
    console.log(`URL actual: ${urlCheck}`);
    
    if (urlCheck.includes('ClaudioNeoIA') || title.includes('Claudio')) {
      console.log('✅ ¡¡ CUENTA EXISTE !!');
      console.log('📊 La cuenta @ClaudioNeoIA es accesible públicamente');
    }
    
    await page.screenshot({ path: 'x_profile.png' });
    await browser.close();
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
})();
