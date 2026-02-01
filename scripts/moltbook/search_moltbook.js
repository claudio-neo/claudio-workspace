const Imap = require('imap');

const imap = new Imap({
  user: 'claudio@neofreight.net',
  password: 'REDACTED_PASSWORD',
  host: 'imap.ionos.es',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

imap.on('ready', () => {
  imap.openBox('INBOX', false, (err, box) => {
    if (err) throw err;
    
    console.log(`📬 Total de mensajes: ${box.messages.total}`);
    console.log('Buscando "moltbook" o "antenna"...\n');
    
    // Buscar mensajes de Moltbook
    imap.search(['TEXT', 'antenna'], (err, results) => {
      if (err) {
        console.log('No se encontró con search, probando otro método...');
        
        // Leer todo manualmente
        const f = imap.seq.fetch('1:*', { bodies: 'TEXT' });
        
        f.on('message', (msg, seqno) => {
          let text = '';
          msg.on('body', stream => {
            stream.on('data', chunk => text += chunk.toString());
            stream.on('end', () => {
              const match = text.match(/antenna-[A-Z0-9]{4}/);
              if (match) {
                console.log(`✅ Mensaje #${seqno} contiene: ${match[0]}`);
              }
              
              const xMatch = text.match(/\d{6}(?=[\s\n])/);
              if (xMatch && text.includes('X') && text.includes('verificaci')) {
                console.log(`📧 Mensaje #${seqno} - Código X: ${xMatch[0]}`);
              }
            });
          });
        });
        
        f.on('end', () => {
          imap.closeBox(false, () => imap.end());
        });
        
        return;
      }
      
      console.log(`Encontrados ${results.length} mensajes con "antenna"`);
      
      if (results.length > 0) {
        const f = imap.fetch(results, { bodies: 'TEXT' });
        
        f.on('message', (msg, seqno) => {
          let text = '';
          msg.on('body', stream => {
            stream.on('data', chunk => text += chunk.toString());
            stream.on('end', () => {
              const match = text.match(/antenna-[A-Z0-9]{4}/);
              if (match) {
                console.log(`🎉 CÓDIGO MOLTBOOK: ${match[0]}`);
              }
            });
          });
        });
        
        f.on('end', () => {
          imap.closeBox(false, () => imap.end());
        });
      } else {
        console.log('❌ No hay mensajes de Moltbook aún\n');
        console.log('✅ Pero tenemos el código de X: 442465');
        imap.closeBox(false, () => imap.end());
      }
    });
  });
});

imap.on('error', err => console.error(err));
imap.on('end', () => {});

imap.connect();
