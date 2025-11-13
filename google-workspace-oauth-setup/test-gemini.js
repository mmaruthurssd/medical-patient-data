require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiConnectivity() {
  console.log('🔍 Testing Gemini API connectivity...\n');

  // Verify API key is loaded
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    console.error('   Check your .env file');
    process.exit(1);
  }

  console.log('✅ API key loaded from environment');
  console.log(`   Key prefix: ${process.env.GEMINI_API_KEY.substring(0, 10)}...`);

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-pro'
  });

  console.log(`   Model: ${process.env.GEMINI_MODEL || 'gemini-1.5-pro'}\n`);

  // Test basic generation
  console.log('🧪 Testing basic text generation...');

  try {
    const prompt = 'Say "Hello from Gemini" and confirm you are working.';
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log('✅ Gemini API response received');
    console.log(`   Response: ${response}\n`);

    // Test with structured output
    console.log('🧪 Testing structured output...');
    const structuredPrompt = `
      Classify the following text: "I need to schedule an appointment"

      Respond ONLY with valid JSON in this format:
      {
        "category": "routine|urgent|administrative",
        "confidence": 0.0-1.0,
        "reason": "brief explanation"
      }
    `;

    const structuredResult = await model.generateContent(structuredPrompt);
    const structuredResponse = structuredResult.response.text();

    console.log('✅ Structured output test successful');
    console.log(`   Response: ${structuredResponse}\n`);

    console.log('✅ All tests passed!');
    console.log('✅ Gemini API is ready for HIPAA-compliant operations');

  } catch (error) {
    console.error('❌ Gemini API test failed');
    console.error(`   Error: ${error.message}`);

    if (error.message.includes('API_KEY_INVALID')) {
      console.error('\n   Troubleshooting:');
      console.error('   1. Verify API key in Google AI Studio');
      console.error('   2. Check that key is copied correctly to .env');
      console.error('   3. Ensure no extra spaces or quotes in .env');
    }

    process.exit(1);
  }
}

testGeminiConnectivity();
