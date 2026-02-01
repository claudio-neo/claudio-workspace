// Load .env from workspace root
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && !key.startsWith('#')) {
      process.env[key.trim()] = val.join('=').trim();
    }
  });
}

module.exports = {
  moltbook: {
    apiKey: process.env.MOLTBOOK_API_KEY,
  },
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    imapHost: process.env.EMAIL_IMAP_HOST || 'imap.ionos.es',
    imapPort: parseInt(process.env.EMAIL_IMAP_PORT || '993'),
    smtpHost: process.env.EMAIL_SMTP_HOST || 'smtp.ionos.es',
    smtpPort: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
  },
  lnmarkets: {
    key: process.env.LNMARKETS_KEY,
    secret: process.env.LNMARKETS_SECRET,
    passphrase: process.env.LNMARKETS_PASSPHRASE,
  }
};
