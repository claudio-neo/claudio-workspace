require("../lib/env");
const Imap = require('imap');
const { simpleParser } = require('mailparser');

const imap = new Imap({
  user: 'claudio@neofreight.net',
  password: process.env.EMAIL_PASSWORD,
  host: 'imap.ionos.es',
  port: 993,
  tls: true
});

function getEmails() {
  return new Promise((resolve, reject) => {
    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`📬 Leyendo INBOX (${box.messages.total} mensajes)`);
      
      // Leer últimos 10 emails
      const f = imap.seq.fetch('1:10', { bodies: '' });
      const emails = [];
      
      f.on('message', (msg, seqno) => {
        console.log(`\n📧 Mensaje #${seqno}:`);
        
        simpleParser(msg, async (err, parsed) => {
          if (err) {
            console.error('Error parsing:', err);
            return;
          }
          
          console.log('De:', parsed.from?.text);
          console.log('Asunto:', parsed.subject);
          
          if (parsed.text) {
            console.log('Contenido (primeros 500 chars):');
            console.log(parsed.text.substring(0, 500));
            
            // Buscar código de verificación
            const codeMatch = parsed.text.match(/antenna-[A-Z0-9]{4}/);
            if (codeMatch) {
              console.log(`\n🎉 CÓDIGO ENCONTRADO: ${codeMatch[0]}`);
              emails.push({ code: codeMatch[0], from: parsed.from?.text });
            }
          }
        });
      });
      
      f.on('error', reject);
      f.on('end', () => {
        setTimeout(() => {
          resolve(emails);
        }, 2000);
      });
    });
  });
}

(async () => {
  try {
    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        console.error('❌ Error conectando:', err.message);
        process.exit(1);
      }
      
      console.log('✅ Conectado a INBOX');
      console.log(`📬 Total de mensajes: ${box.messages.total}`);
      
      getEmails().then(emails => {
        if (emails.length === 0) {
          console.log('\n⚠️ No se encontraron códigos de verificación');
        }
        imap.closeBox(false, () => {
          imap.end();
        });
      }).catch(err => {
        console.error('Error:', err);
        imap.end();
      });
    });
    
    imap.openBox('INBOX', false, () => {});
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
})();

imap.openBox('INBOX', false, () => {});
