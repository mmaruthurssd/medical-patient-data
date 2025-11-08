/**
 * Gemini API Connectivity Test
 *
 * Tests basic connection to Google Gemini API
 * NO PHI - Safe for testing
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testGeminiAPI() {
  console.log('✅ Gemini API Test');
  console.log('━'.repeat(50));

  // Verify API key is loaded
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY not found in .env file');
    console.log('\nPlease:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Add your Gemini API key to .env');
    console.log('3. Get key from: https://makersuite.google.com/app/apikey');
    process.exit(1);
  }

  console.log(`API Key: Loaded from environment (${apiKey.substring(0, 10)}...)`);
  console.log('Model: gemini-pro');
  console.log('━'.repeat(50));
  console.log();

  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Test prompt (NO PHI)
    const prompt = 'What are three key considerations for HIPAA compliance in healthcare AI applications?';

    console.log('Prompt:', prompt);
    console.log();

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('Response:');
    console.log(text);
    console.log();

    console.log('✅ Test completed successfully');
    console.log('━'.repeat(50));

  } catch (error) {
    console.error('❌ Test failed');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.log('━'.repeat(50));
    console.log();
    console.log('Troubleshooting:');
    console.log('1. Verify API key is correct');
    console.log('2. Check internet connection');
    console.log('3. Verify Google Cloud project is active');
    console.log('4. Check quotas: https://console.cloud.google.com/');
    process.exit(1);
  }
}

// Run test
testGeminiAPI().catch(console.error);
