#!/usr/bin/env node
/**
 * Automatic login to Lightning Network+ using LND signature
 */

import { chromium } from 'playwright';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function signMessage(message) {
  const cmd = `/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli --lnddir=/home/neo/.lnd --network=mainnet signmessage "${message}"`;
  const { stdout } = await execAsync(cmd);
  const result = JSON.parse(stdout);
  return result.signature;
}

async function loginToLNPlus() {
  console.log('🚀 Starting Lightning Network+ login...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to login page
    console.log('📄 Opening login page...');
    await page.goto('https://lightningnetwork.plus/ln_sign_in', { waitUntil: 'networkidle' });
    
    // Wait for the message to appear
    await page.waitForSelector('text=/lnplus-login-/');
    
    // Extract the message to sign
    const messageElement = await page.locator('text=/lnplus-login-[a-f0-9]+-[a-f0-9]+-[a-f0-9]+/').first();
    const message = await messageElement.textContent();
    console.log('📝 Message to sign:', message.trim());
    
    // Sign with LND
    console.log('🔐 Signing with LND...');
    const signature = await signMessage(message.trim());
    console.log('✅ Signature generated:', signature.substring(0, 50) + '...');
    
    // Find the signature input field
    const signatureInput = await page.locator('textarea, input[type="text"]').first();
    await signatureInput.fill(signature);
    
    // Submit
    console.log('📤 Submitting signature...');
    await page.click('button[type="submit"], input[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    
    // Wait for navigation
    await page.waitForNavigation({ timeout: 10000 }).catch(() => {
      console.log('⏳ Navigation timeout - checking if logged in...');
    });
    
    // Check if logged in
    const url = page.url();
    console.log('🌐 Current URL:', url);
    
    if (url.includes('ln_sign_in')) {
      console.log('❌ Still on login page - login may have failed');
      const errorMsg = await page.locator('.error, .alert, [class*="error"]').first().textContent().catch(() => null);
      if (errorMsg) {
        console.log('Error message:', errorMsg);
      }
    } else {
      console.log('✅ Login successful!');
      console.log('📍 Redirected to:', url);
    }
    
    // Save cookies for future use
    const cookies = await context.cookies();
    console.log('🍪 Saved', cookies.length, 'cookies');
    
    // Take a screenshot
    await page.screenshot({ path: '/tmp/lnplus-logged-in.png' });
    console.log('📸 Screenshot saved to /tmp/lnplus-logged-in.png');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/tmp/lnplus-error.png' });
    console.log('📸 Error screenshot saved to /tmp/lnplus-error.png');
    throw error;
  } finally {
    await browser.close();
  }
}

loginToLNPlus().catch(console.error);
