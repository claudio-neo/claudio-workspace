#!/usr/bin/env node
// transcribe-audio.js — Transcribe audio file using OpenAI Whisper

const fs = require('fs');
const OpenAI = require('openai');

const audioPath = process.argv[2];

if (!audioPath) {
  console.error('Usage: node transcribe-audio.js <audio-file>');
  process.exit(1);
}

if (!fs.existsSync(audioPath)) {
  console.error(`File not found: ${audioPath}`);
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function transcribe() {
  try {
    console.error('Transcribing audio...');
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
      language: 'es'
    });
    
    console.log(transcription.text);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

transcribe();
