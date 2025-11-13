require('dotenv').config();
const axios = require('axios');

async function listModels() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is not set in your .env file.');
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const models = response.data.models;

    console.log('Available Gemini Models:\n');
    models.forEach(model => {
      console.log(`Model: ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error fetching models:', error.response ? error.response.data : error.message);
  }
}

listModels();
