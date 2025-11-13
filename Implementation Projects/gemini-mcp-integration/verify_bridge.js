// verify_bridge.js
const { GeminiClient } = require('./gemini-client');
require('dotenv').config({ path: '../../.env' }); // Adjust path to root .env

async function verifyBridge() {
  console.log('Attempting to verify the MCP bridge...');

  if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is not set.');
    return;
  }

  const gemini = new GeminiClient({
    apiKey: process.env.GEMINI_API_KEY,
    bridgeUrl: process.env.MCP_BRIDGE_URL || 'http://localhost:3000',
    bridgeApiKey: process.env.MCP_BRIDGE_API_KEY,
    workspacePath: process.cwd()
  });

  try {
    await gemini.initialize();
    const tools = gemini.getTools();

    if (tools.length > 0) {
      console.log(`Success! Connected to MCP bridge and found ${tools.length} tools.`);
      console.log('Here are the first 5 tools:');
      tools.slice(0, 5).forEach(tool => {
        console.log(`- ${tool.name}: ${tool.description}`);
      });
    } else {
      console.log('Connected to the bridge, but no tools were found.');
    }
  } catch (error) {
    console.error('Failed to connect to the MCP bridge:', error.message);
    console.log('Please ensure the MCP Bridge Server is running.');
  }
}

verifyBridge();
