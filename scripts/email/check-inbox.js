#!/usr/bin/env node
// Email Inbox Checker - reusable script
// Usage: node check-inbox.js [unread|all|count]

require('../lib/env');
const Imap = require('imap');
const { simpleParser } = require('mailparser');

const CONFIG = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  host: process.env.EMAIL_IMAP_HOST || 'imap.ionos.es',
  port: parseInt(process.env.EMAIL_IMAP_PORT || '993'),
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

const mode = process.argv[2] || 'unread';

const imap = new Imap(CONFIG);

imap.once('ready', () => {
  imap.openBox('INBOX', false, (err) => {
    if (err) { console.error('Error opening inbox:', err.message); imap.end(); return; }
    
    const searchCriteria = mode === 'all' ? ['ALL'] : ['UNSEEN'];
    
    imap.search(searchCriteria, (err, results) => {
      if (err) { console.error('Search error:', err.message); imap.end(); return; }
      
      if (mode === 'count') {
        console.log(JSON.stringify({ total: results.length, mode: 'unread' }));
        imap.end();
        return;
      }
      
      if (results.length === 0) {
        console.log('No emails found');
        imap.end();
        return;
      }
      
      const limit = mode === 'all' ? results.slice(-10) : results;
      const f = imap.fetch(limit, { bodies: '', markSeen: true });
      const emails = [];
      
      f.on('message', (msg) => {
        msg.on('body', (stream) => {
          simpleParser(stream, (err, parsed) => {
            if (err) return;
            emails.push({
              from: parsed.from?.text || 'unknown',
              subject: parsed.subject || '(no subject)',
              date: parsed.date?.toISOString()?.substring(0, 19) || 'unknown',
              preview: (parsed.text || '').substring(0, 200).replace(/\n/g, ' ').trim()
            });
          });
        });
      });
      
      f.once('end', () => {
        setTimeout(() => {
          emails.sort((a, b) => b.date.localeCompare(a.date));
          emails.forEach((e, i) => {
            console.log(`[${i+1}] ${e.date}`);
            console.log(`    From: ${e.from}`);
            console.log(`    Subject: ${e.subject}`);
            console.log(`    ${e.preview.substring(0, 100)}...`);
            console.log('');
          });
          console.log(`Total: ${emails.length} emails (${mode})`);
          imap.end();
        }, 1500);
      });
    });
  });
});

imap.once('error', (err) => console.error('IMAP error:', err.message));
imap.connect();
