#!/usr/bin/env node
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Load API key
let GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (match) GEMINI_API_KEY = match[1].trim();
  }
}

async function listModels() {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  try {
    console.log('📋 Fetching available Gemini models...\n');

    const models = await genAI.listModels();

    console.log('Available models:');
    console.log('='.repeat(80));

    for await (const model of models) {
      console.log(`\n🤖 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
