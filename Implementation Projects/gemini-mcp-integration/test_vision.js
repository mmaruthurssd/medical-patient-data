const { GeminiClient } = require('./gemini-client');
const path = require('path');
require('dotenv').config({ path: '../../.env' });

async function testVision() {
  console.log('--- Testing Image Description (Direct Client Call) ---');

  try {
    const gemini = new GeminiClient({
      apiKey: process.env.GEMINI_API_KEY,
      bridgeUrl: process.env.MCP_BRIDGE_URL || 'http://localhost:3000',
      bridgeApiKey: process.env.MCP_BRIDGE_API_KEY,
    });

    await gemini.initialize();

    const imagePath = '/Users/mmaruthurnew/Desktop/ssd google drive files/test_image.jpg';
    console.log(`\n--- Describing image at: ${imagePath} ---`);

    const response = await gemini.chatWithImage('Describe this image in detail.', imagePath);

    console.log('\n--- Gemini Response ---');
    console.log(response.text);
    console.log('----------------------');

  } catch (error) {
    console.error('--- Test Failed ---');
    console.error(error);
  }
}

testVision();
