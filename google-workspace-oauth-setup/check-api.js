require('dotenv').config();
const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;

// Make a direct HTTP request to list models
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('\nResponse body:');

    try {
      const parsed = JSON.parse(data);

      if (parsed.models) {
        console.log('\nAvailable models:');
        parsed.models.forEach(model => {
          console.log(`\n- ${model.name}`);
          console.log(`  Display: ${model.displayName}`);
          console.log(`  Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        });
      } else {
        console.log(JSON.stringify(parsed, null, 2));
      }
    } catch (err) {
      console.log(data);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
