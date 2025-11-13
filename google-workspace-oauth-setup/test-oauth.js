const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');

async function authenticate() {
  console.log('🔐 Starting OAuth authentication...\n');

  // Load credentials
  const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
  const { client_id, client_secret, redirect_uris } = credentials.installed;

  // Create OAuth2 client
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if token exists
  if (fs.existsSync('token.json')) {
    const token = JSON.parse(fs.readFileSync('token.json', 'utf8'));
    oAuth2Client.setCredentials(token);
    console.log('✅ Using existing token from token.json\n');
    return oAuth2Client;
  }

  // Generate auth URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/script.projects',
      'https://www.googleapis.com/auth/script.deployments',
      'https://www.googleapis.com/auth/script.scriptapp',
    ],
  });

  console.log('🌐 Authorize this app by visiting this URL:\n');
  console.log(authUrl);
  console.log('\n📋 Instructions:');
  console.log('1. Copy the URL above');
  console.log('2. Open it in your browser');
  console.log('3. Sign in as automation@ssdsbc.com');
  console.log('4. Click "Allow" to grant permissions');
  console.log('5. Copy the authorization code from the browser');
  console.log('6. Paste it below\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter authorization code: ', async (code) => {
      rl.close();
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        fs.writeFileSync('token.json', JSON.stringify(tokens, null, 2));
        console.log('\n✅ Token saved to token.json');
        resolve(oAuth2Client);
      } catch (err) {
        console.error('\n❌ Error getting token:', err.message);
        process.exit(1);
      }
    });
  });
}

async function testAPIs(auth) {
  console.log('\n🧪 Testing API access...\n');

  // Test Drive API
  try {
    const drive = google.drive({ version: 'v3', auth });
    const driveRes = await drive.files.list({
      pageSize: 3,
      fields: 'files(id, name)',
    });
    console.log('✅ Drive API: Working');
    if (driveRes.data.files && driveRes.data.files.length > 0) {
      console.log(`   Sample files found: ${driveRes.data.files.length}`);
      driveRes.data.files.forEach(file => {
        console.log(`   - ${file.name}`);
      });
    }
  } catch (err) {
    console.log('❌ Drive API: Failed -', err.message);
  }

  // Test Sheets API
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('\n✅ Sheets API: Working');
  } catch (err) {
    console.log('\n❌ Sheets API: Failed -', err.message);
  }

  // Test Apps Script API
  try {
    const script = google.script({ version: 'v1', auth });
    const scriptRes = await script.projects.list({ pageSize: 5 });
    console.log('✅ Apps Script API: Working');
    const projectCount = scriptRes.data.projects?.length || 0;
    console.log(`   Script projects found: ${projectCount}`);
  } catch (err) {
    console.log('❌ Apps Script API: Failed -', err.message);
  }

  // Test Shared Drives
  try {
    const drive = google.drive({ version: 'v3', auth });
    const drivesRes = await drive.drives.list({ pageSize: 10 });
    const sharedDrives = drivesRes.data.drives || [];
    console.log(`\n✅ Shared Drives: Found ${sharedDrives.length}`);
    if (sharedDrives.length > 0) {
      sharedDrives.slice(0, 3).forEach(drive => {
        console.log(`   - ${drive.name}`);
      });
      if (sharedDrives.length > 3) {
        console.log(`   ... and ${sharedDrives.length - 3} more`);
      }
    }
  } catch (err) {
    console.log('\n❌ Shared Drives: Failed -', err.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ OAuth authentication test complete!');
  console.log('='.repeat(50) + '\n');
}

async function main() {
  try {
    const auth = await authenticate();
    await testAPIs(auth);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
