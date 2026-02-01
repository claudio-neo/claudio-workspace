require("../lib/env");
const Imap = require('imap');
const { simpleParser } = require('mailparser');

const imap = new Imap({
  user: 'claudio@neofreight.net',
  password: process.env.EMAIL_PASSWORD,
  host: 'imap.ionos.es',
  port: 993,
  tls: true,
  tlsOptions: { 
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  debug: (msg) => console.log('DEBUG:', msg)
});

imap.on('ready', () => {
  console.log('✅ IMAP conectado');
  
  imap.openBox('INBOX', false, (err, box) => {
    if (err) throw err;
    
    console.log(`📬 ${box.messages.total} mensajes en INBOX`);
    
    if (box.messages.total === 0) {
      console.log('⚠️ INBOX vacío - no hay emails');
      imap.closeBox(false, () => imap.end());
      return;
    }
    
    // Leer últimos 20 mensajes
    const f = imap.seq.fetch('1:20', { bodies: '' });
    
    f.on('message', (msg, seqno) => {
      simpleParser(msg, (err, parsed) => {
        if (err) return;
        
        console.log(`\n#${seqno}`);
        console.log(`De: ${parsed.from?.text || 'Unknown'}`);
        console.log(`Asunto: ${parsed.subject || '(sin asunto)'}`);
        
        if (parsed.text) {
          // Buscar código antenna-XXXX
          const match = parsed.text.match(/antenna-[A-Z0-9]{4}/);
          if (match) {
            console.log(`\n🎉🎉🎉 CÓDIGO ENCONTRADO: ${match[0]} 🎉🎉🎉`);
          }
          
          // También mostrar preview si es corto
          if (parsed.text.length < 200) {
            console.log(`Texto: ${parsed.text.substring(0, 150)}`);
          }
        }
      });
    });
    
    f.on('end', () => {
      console.log('\n✅ Lectura completada');
      imap.closeBox(false, () => imap.end());
    });
  });
});

imap.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

imap.on('end', () => {
  console.log('Conexión cerrada');
});

console.log('🔌 Conectando...');
imap.connect();
