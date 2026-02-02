#!/usr/bin/env node
// Simple web scraper using playwright-core
const { chromium } = require('playwright-core');

async function scrape(url) {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    
    const title = await page.title();
    const content = await page.evaluate(() => document.body.innerText);
    
    console.log(`Title: ${title}\n`);
    console.log('Content:\n', content);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scrape.js <url>');
  process.exit(1);
}

scrape(url);
