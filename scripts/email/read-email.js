#!/usr/bin/env node
require('../lib/env');
const Imap = require('imap');
const { simpleParser } = require('mailparser');

const imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  host: process.env.EMAIL_IMAP_HOST || 'imap.ionos.es',
  port: parseInt(process.env.EMAIL_IMAP_PORT || '993'),
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

const emailIndex = parseInt(process.argv[2]) || 1;

imap.once('ready', () => {
  imap.openBox('INBOX', true, (err, box) => {
    if (err) throw err;

    const total = box.messages.total;
    const seqno = total - emailIndex + 1;

    if (seqno < 1 || seqno > total) {
      console.error(`Invalid email index. Total emails: ${total}`);
      imap.end();
      return;
    }

    const f = imap.fetch(seqno, { bodies: '' });

    f.on('message', (msg) => {
      msg.on('body', (stream) => {
        simpleParser(stream, (err, parsed) => {
          if (err) throw err;

          console.log(`From: ${parsed.from.text}`);
          console.log(`Subject: ${parsed.subject}`);
          console.log(`Date: ${parsed.date}\n`);
          console.log('--- Body ---');
          console.log(parsed.text || parsed.html || '(no body)');
        });
      });
    });

    f.once('error', (err) => {
      console.error('Fetch error:', err);
    });

    f.once('end', () => {
      imap.end();
    });
  });
});

imap.once('error', (err) => {
  console.error(err);
});

imap.connect();
