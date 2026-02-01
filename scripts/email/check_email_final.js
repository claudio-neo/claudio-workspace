const Imap = require('imap');
const { simpleParser } = require('mailparser');

// Contraseña con exclamaciones - sin escape
const password = 'REDACTED_PASSWORD';

const imap = new Imap({
  user: 'claudio@neofreight.net',
  password: password,
  host: 'imap.ionos.es',
  port: 993,
  tls: true,
  tlsOptions: { 
    rejectUnauthorized: false
  }
});

imap.on('ready', () => {
  console.log('✅ AUTENTICACIÓN EXITOSA');
  
  imap.openBox('INBOX', false, (err, box) => {
    if (err) {
      console.error('Error abriendo INBOX:', err);
      imap.end();
      return;
    }
    
    console.log(`📬 Total de mensajes: ${box.messages.total}`);
    
    if (box.messages.total === 0) {
      console.log('⚠️ INBOX vacío');
      imap.closeBox(false, () => imap.end());
      return;
    }
    
    // Leer todos los mensajes
    const f = imap.seq.fetch('1:*', { bodies: '' });
    let codeFound = null;
    
    f.on('message', (msg, seqno) => {
      simpleParser(msg, (err, parsed) => {
        if (err) {
          console.error(`Error en mensaje ${seqno}:`, err.message);
          return;
        }
        
        const from = parsed.from?.text || 'Unknown';
        const subject = parsed.subject || '(sin asunto)';
        
        console.log(`\n📧 Mensaje #${seqno}`);
        console.log(`   De: ${from}`);
        console.log(`   Asunto: ${subject}`);
        
        if (parsed.text) {
          // Buscar código Moltbook
          const match = parsed.text.match(/antenna-[A-Z0-9]{4}/);
          if (match) {
            codeFound = match[0];
            console.log(`\n   🎉 ¡¡¡ CÓDIGO ENCONTRADO !!!`);
            console.log(`   📌 CÓDIGO: ${codeFound}`);
            console.log(`   🎉 ¡¡¡ CÓDIGO ENCONTRADO !!!`);
          }
          
          // Mostrar preview si es relevante
          if (from.toLowerCase().includes('moltbook') || subject.toLowerCase().includes('moltbook')) {
            console.log(`   Preview: ${parsed.text.substring(0, 150)}`);
          }
        }
      });
    });
    
    f.on('error', (err) => {
      console.error('Error en fetch:', err);
    });
    
    f.on('end', () => {
      console.log('\n✅ Lectura completada');
      if (codeFound) {
        console.log(`\n🎯 RESULTADO FINAL: ${codeFound}`);
      } else {
        console.log('\n⚠️ No se encontró código de verificación');
      }
      imap.closeBox(false, () => imap.end());
    });
  });
});

imap.on('error', (err) => {
  console.error('❌ Error IMAP:', err.message);
  process.exit(1);
});

imap.on('end', () => {
  console.log('\nConexión cerrada');
});

console.log('🔌 Conectando a imap.ionos.es...');
imap.connect();
