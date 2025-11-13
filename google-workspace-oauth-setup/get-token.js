const { google } = require('googleapis');
const fs = require('fs');

async function getToken(authCode) {
  console.log('🔐 Exchanging authorization code for token...\n');

  // Load credentials
  const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
  const { client_id, client_secret, redirect_uris } = credentials.installed;

  // Create OAuth2 client
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  try {
    // Exchange code for token
    const { tokens } = await oAuth2Client.getToken(authCode);
    oAuth2Client.setCredentials(tokens);

    // Save token
    fs.writeFileSync('token.json', JSON.stringify(tokens, null, 2));
    console.log('✅ Token saved to token.json\n');

    return oAuth2Client;
  } catch (err) {
    console.error('❌ Error getting token:', err.message);
    process.exit(1);
  }
}

async function testAPIs(auth) {
  console.log('🧪 Testing API access...\n');

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
  const authCode = process.argv[2];

  if (!authCode) {
    console.error('❌ Error: Please provide the authorization code as an argument');
    console.log('\nUsage: node get-token.js YOUR_AUTH_CODE');
    process.exit(1);
  }

  try {
    const auth = await getToken(authCode);
    await testAPIs(auth);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
