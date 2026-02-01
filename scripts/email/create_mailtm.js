const https = require('https');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.mail.tm',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  try {
    console.log('🔍 Buscando un dominio disponible en Mail.tm...');
    
    // Obtener dominios disponibles
    const domainsRes = await makeRequest('GET', '/domains');
    const domains = domainsRes.body['hydra:member'] || [];
    
    if (domains.length === 0) {
      console.error('❌ No hay dominios disponibles');
      return;
    }
    
    const domain = domains[0];
    console.log(`✅ Dominio: ${domain.domain}`);
    
    // Crear cuenta
    const email = `claudio.${Date.now()}@${domain.domain}`;
    const password = 'ClaudioAssistant2026!';
    
    console.log(`📧 Creando: ${email}`);
    
    const signupRes = await makeRequest('POST', '/accounts', {
      address: email,
      password: password
    });
    
    if (signupRes.status === 201) {
      console.log('✅ CUENTA CREADA');
      console.log(`\n📧 Email: ${email}`);
      console.log(`🔐 Contraseña: ${password}`);
      console.log(`\n🌐 Acceso web: https://mail.tm`);
      console.log('✅ Sin CAPTCHA requerido');
    } else {
      console.error('❌ Error:', signupRes.body);
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
})();
