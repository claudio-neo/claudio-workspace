const Imap = require('imap');
const { simpleParser } = require('mailparser');

const imap = new Imap({
  user: 'claudio@neofreight.net',
  password: 'REDACTED_PASSWORD',
  host: 'imap.ionos.es',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

imap.openBox('INBOX', false, (err, box) => {
  if (err) {
    console.error('❌ Error:', err.message);
    imap.end();
    return;
  }
  
  console.log(`✅ Conectado a INBOX (${box.messages.total} mensajes)`);
  
  // Leer últimos 5 emails
  const f = imap.seq.fetch('1:5', { bodies: '' });
  
  f.on('message', (msg, seqno) => {
    simpleParser(msg, (err, parsed) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      
      console.log(`\n📧 #${seqno}:`);
      console.log('De:', parsed.from?.text || 'Unknown');
      console.log('Asunto:', parsed.subject);
      
      if (parsed.text) {
        const preview = parsed.text.substring(0, 300);
        console.log('Texto:', preview);
        
        const codeMatch = parsed.text.match(/antenna-[A-Z0-9]{4}/);
        if (codeMatch) {
          console.log(`\n🎉 CÓDIGO: ${codeMatch[0]}`);
        }
      }
    });
  });
  
  f.on('error', (err) => {
    console.error('Fetch error:', err);
  });
  
  f.on('end', () => {
    console.log('\n✅ Lectura completada');
    imap.closeBox(false, () => imap.end());
  });
});

imap.connect();
