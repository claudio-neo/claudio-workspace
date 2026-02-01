require("../lib/env");
const Imap = require('imap');
const { simpleParser } = require('mailparser');

const imap = new Imap({
  user: 'claudio@neofreight.net',
  password: process.env.EMAIL_PASSWORD,
  host: 'imap.ionos.es',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

imap.on('ready', () => {
  console.log('✅ IMAP conectado y autenticado');
  
  imap.openBox('INBOX', false, (err, box) => {
    if (err) {
      console.error('❌ Error abriendo INBOX:', err.message);
      imap.end();
      return;
    }
    
    console.log(`📬 INBOX abierto (${box.messages.total} mensajes)`);
    
    const f = imap.seq.fetch('1:10', { bodies: '' });
    let foundCode = false;
    
    f.on('message', (msg, seqno) => {
      simpleParser(msg, (err, parsed) => {
        if (err) return;
        
        console.log(`\n#${seqno} - De: ${parsed.from?.text || '?'}`);
        console.log(`Asunto: ${parsed.subject}`);
        
        if (parsed.text) {
          const codeMatch = parsed.text.match(/antenna-[A-Z0-9]{4}/);
          if (codeMatch) {
            console.log(`🎉 CÓDIGO ENCONTRADO: ${codeMatch[0]}`);
            foundCode = true;
          }
        }
      });
    });
    
    f.on('end', () => {
      if (!foundCode) {
        console.log('\n⚠️ No se encontró código de verificación');
      }
      imap.closeBox(false, () => imap.end());
    });
  });
});

imap.on('error', (err) => {
  console.error('❌ Error IMAP:', err.message);
});

imap.on('end', () => {
  console.log('\n✅ Conexión cerrada');
});

console.log('🔌 Conectando a IMAP...');
imap.connect();
