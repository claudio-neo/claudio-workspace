#!/usr/bin/env node
/**
 * Check email for Amboss verification code
 */

import Imap from 'imap';
import { simpleParser } from 'mailparser';
import fs from 'fs';

const creds = JSON.parse(fs.readFileSync('/home/neo/.openclaw/workspace/.email_creds.json', 'utf8'));

const imap = new Imap({
  user: creds.email,
  password: creds.password,
  host: creds.imap.host,
  port: creds.imap.port,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

imap.once('ready', () => {
  openInbox((err, box) => {
    if (err) throw err;
    
    // Search for recent emails from Amboss
    const searchCriteria = [
      ['FROM', 'amboss'],
      ['SINCE', new Date(Date.now() - 3600000)] // Last hour
    ];
    
    imap.search(searchCriteria, (err, results) => {
      if (err) throw err;
      
      if (results.length === 0) {
        console.log('No Amboss emails found in the last hour');
        imap.end();
        return;
      }
      
      const f = imap.fetch(results, { bodies: '' });
      
      f.on('message', (msg) => {
        msg.on('body', (stream) => {
          simpleParser(stream, (err, parsed) => {
            if (err) throw err;
            
            console.log('From:', parsed.from.text);
            console.log('Subject:', parsed.subject);
            console.log('\nBody:');
            console.log(parsed.text);
            
            // Extract verification code (usually 6 digits)
            const codeMatch = parsed.text.match(/\b(\d{6})\b/);
            if (codeMatch) {
              console.log('\n🔑 VERIFICATION CODE:', codeMatch[1]);
            }
          });
        });
      });
      
      f.once('end', () => {
        imap.end();
      });
    });
  });
});

imap.once('error', (err) => {
  console.error('IMAP Error:', err.message);
  process.exit(1);
});

imap.once('end', () => {
  console.log('Connection ended');
});

imap.connect();
