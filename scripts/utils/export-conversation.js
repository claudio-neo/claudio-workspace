#!/usr/bin/env node
/**
 * Export OpenClaw conversation history to markdown and push to GitHub
 * 
 * Usage:
 *   node export-conversation.js                    # Export current main session
 *   node export-conversation.js --all              # Export all sessions
 *   node export-conversation.js --session <key>    # Export specific session
 *   node export-conversation.js --push             # Export + git commit + push
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SESSIONS_DIR = '/home/neo/.openclaw/agents/main/sessions';
const OUTPUT_DIR = '/home/neo/.openclaw/workspace/conversations';
const WORKSPACE = '/home/neo/.openclaw/workspace';

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function parseJsonl(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  if (!content) return [];
  return content.split('\n').map(line => {
    try { return JSON.parse(line); }
    catch (e) { return null; }
  }).filter(Boolean);
}

function extractMessages(lines) {
  const session = lines.find(l => l.type === 'session');
  const messages = lines.filter(l => l.type === 'message');
  
  return {
    sessionId: session?.id || 'unknown',
    startTime: session?.timestamp || 'unknown',
    messages: messages.map(m => ({
      role: m.message?.role || 'unknown',
      timestamp: m.timestamp,
      content: extractContent(m.message?.content)
    })).filter(m => m.content.trim())
  };
}

function sanitize(text) {
  if (!text) return text;
  // Redact known secret patterns
  return text
    // GitHub PATs
    .replace(/ghp_[A-Za-z0-9]{36}/g, 'ghp_[REDACTED]')
    // Anthropic API keys
    .replace(/sk-ant-[A-Za-z0-9_-]{20,}/g, 'sk-ant-[REDACTED]')
    // Moltbook API keys
    .replace(/moltbook_sk_[A-Za-z0-9_-]{20,}/g, 'moltbook_sk_[REDACTED]')
    // Generic API keys/tokens (long alphanumeric strings after common keywords)
    .replace(/(token|password|apikey|api_key|secret|Bearer)\s*[:=]\s*["']?([A-Za-z0-9_-]{20,})["']?/gi, '$1: [REDACTED]')
    // Bot tokens
    .replace(/\d{10}:[A-Za-z0-9_-]{35}/g, '[BOT_TOKEN_REDACTED]')
    // Passwords in common formats
    .replace(/(password|passwd|pass)\s*[:=]\s*["']?[^\s"',]{6,}["']?/gi, '$1: [REDACTED]')
    // Email passwords specifically
    .replace(/REDACTED_PASSWORD/g, '[REDACTED]')
    .replace(/BtcNode2026!/g, '[REDACTED]');
}

function extractContent(content) {
  if (!content) return '';
  if (typeof content === 'string') return sanitize(content);
  if (Array.isArray(content)) {
    return content
      .filter(c => c.type === 'text')
      .map(c => sanitize(c.text))
      .join('\n')
      .trim();
  }
  return '';
}

function toMarkdown(data, sessionKey) {
  const lines = [];
  const date = data.startTime?.substring(0, 10) || 'unknown';
  
  lines.push(`# Conversation: ${sessionKey}`);
  lines.push(`**Session ID:** ${data.sessionId}`);
  lines.push(`**Started:** ${data.startTime}`);
  lines.push(`**Messages:** ${data.messages.length}`);
  lines.push(`**Exported:** ${new Date().toISOString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  let lastRole = '';
  for (const msg of data.messages) {
    const time = msg.timestamp?.substring(11, 19) || '';
    const role = msg.role === 'user' ? '👤 **User**' : '🤖 **Claudio**';
    
    // Skip heartbeat polls and HEARTBEAT_OK responses
    if (msg.content.includes('Read HEARTBEAT.md if it exists') && msg.role === 'user') {
      continue; // Skip heartbeat prompts
    }
    if (msg.content.trim() === 'HEARTBEAT_OK') {
      continue; // Skip heartbeat acks
    }
    
    lines.push(`### ${role} [${time}]`);
    lines.push('');
    lines.push(msg.content);
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  
  return lines.join('\n');
}

function gitPush(message) {
  try {
    execSync(`cd ${WORKSPACE} && git add conversations/ && git commit -m "${message}" && git push origin master`, {
      stdio: 'pipe',
      timeout: 30000
    });
    return true;
  } catch (e) {
    console.error('Git push failed:', e.message);
    return false;
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const doPush = args.includes('--push');
  const exportAll = args.includes('--all');
  
  // Find session files
  const sessionFiles = fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.jsonl') && !f.endsWith('.lock'));
  
  console.log(`Found ${sessionFiles.length} session files\n`);
  
  let exported = 0;
  
  for (const file of sessionFiles) {
    const filePath = path.join(SESSIONS_DIR, file);
    const sessionId = file.replace('.jsonl', '');
    
    console.log(`Processing: ${sessionId}`);
    
    const lines = parseJsonl(filePath);
    const data = extractMessages(lines);
    
    if (data.messages.length === 0) {
      console.log(`  Skipping (no messages)\n`);
      continue;
    }
    
    // Determine session key/name
    const date = data.startTime?.substring(0, 10) || 'unknown';
    const outputFile = `${date}_${sessionId.substring(0, 8)}.md`;
    const outputPath = path.join(OUTPUT_DIR, outputFile);
    
    // Skip if already exported and not forced
    if (fs.existsSync(outputPath) && !args.includes('--force')) {
      // Check if the conversation has grown
      const existingSize = fs.statSync(outputPath).size;
      const newContent = toMarkdown(data, sessionId);
      if (newContent.length <= existingSize + 100) {
        console.log(`  Already exported (${data.messages.length} msgs)\n`);
        continue;
      }
    }
    
    const markdown = toMarkdown(data, sessionId);
    fs.writeFileSync(outputPath, markdown);
    
    const filteredMsgs = data.messages.filter(m => {
      if (m.content.includes('Read HEARTBEAT.md if it exists') && m.role === 'user') return false;
      if (m.content.trim() === 'HEARTBEAT_OK') return false;
      return true;
    });
    
    console.log(`  ✅ Exported: ${outputFile}`);
    console.log(`  Messages: ${filteredMsgs.length} (${data.messages.length - filteredMsgs.length} heartbeats filtered)`);
    console.log(`  Size: ${(markdown.length / 1024).toFixed(1)}KB\n`);
    exported++;
  }
  
  console.log(`\nExported: ${exported} conversations`);
  
  if (doPush && exported > 0) {
    const date = new Date().toISOString().substring(0, 10);
    console.log('\nPushing to GitHub...');
    if (gitPush(`conversations: export ${date} (${exported} sessions)`)) {
      console.log('✅ Pushed to GitHub');
    }
  }
}

main().catch(console.error);
