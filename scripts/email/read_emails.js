const Imap = require('imap');
const { PassThrough } = require('stream');

const imap = new Imap({
  user: 'claudio@neofreight.net',
  password: 'REDACTED_PASSWORD',
  host: 'imap.ionos.es',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

imap.on('ready', () => {
  console.log('✅ Conectado');
  
  imap.openBox('INBOX', false, (err, box) => {
    if (err) throw err;
    
    console.log(`📬 ${box.messages.total} mensajes\n`);
    
    // Leer todo el email
    const f = imap.seq.fetch('1:*', { bodies: 'HEADER.FIELDS (FROM SUBJECT)' });
    let msgCount = 0;
    
    f.on('message', (msg, seqno) => {
      msgCount++;
      let header = '';
      
      msg.on('body', (stream) => {
        stream.on('data', (chunk) => {
          header += chunk.toString();
        });
        
        stream.on('end', () => {
          console.log(`Message #${seqno}:`);
          console.log(header);
          console.log('---');
        });
      });
    });
    
    f.on('end', () => {
      console.log(`\n✅ Leídos ${msgCount} mensajes`);
      
      // Ahora leer contenido completo
      const f2 = imap.seq.fetch('1:*', { bodies: 'TEXT' });
      
      f2.on('message', (msg, seqno) => {
        let content = '';
        
        msg.on('body', (stream) => {
          stream.on('data', (chunk) => {
            content += chunk.toString();
          });
          
          stream.on('end', () => {
            console.log(`\n=== CONTENIDO MENSAJE #${seqno} ===`);
            console.log(content.substring(0, 500));
            
            const match = content.match(/antenna-[A-Z0-9]{4}/);
            if (match) {
              console.log(`\n🎉🎉🎉 CÓDIGO: ${match[0]} 🎉🎉🎉`);
            }
          });
        });
      });
      
      f2.on('end', () => {
        imap.closeBox(false, () => imap.end());
      });
    });
  });
});

imap.on('error', (err) => {
  console.error('❌ Error:', err);
});

imap.on('end', () => {
  console.log('\n✅ Hecho');
});

imap.connect();
