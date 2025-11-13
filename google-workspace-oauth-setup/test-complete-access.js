const { google } = require('googleapis');
const fs = require('fs');

async function loadAuth() {
  const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
  const token = JSON.parse(fs.readFileSync('token.json', 'utf8'));

  const { client_id, client_secret, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

async function testCompleteAccess() {
  console.log('🔍 COMPREHENSIVE GOOGLE WORKSPACE ACCESS TEST\n');
  console.log('═'.repeat(70) + '\n');

  const auth = await loadAuth();
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });
  const script = google.script({ version: 'v1', auth });

  let testsPassed = 0;
  let testsFailed = 0;

  // ============================================================================
  // TEST 1: List All Shared Drives
  // ============================================================================
  console.log('📁 TEST 1: List All Shared Drives');
  console.log('─'.repeat(70));
  try {
    const drivesRes = await drive.drives.list({
      pageSize: 100,
    });

    const sharedDrives = drivesRes.data.drives || [];
    console.log(`✅ SUCCESS: Found ${sharedDrives.length} Shared Drives`);

    sharedDrives.forEach((d, idx) => {
      console.log(`   ${idx + 1}. ${d.name}`);
      console.log(`      ID: ${d.id}`);
    });

    testsPassed++;
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    testsFailed++;
  }
  console.log('\n' + '═'.repeat(70) + '\n');

  // ============================================================================
  // TEST 2: Read Files from Shared Drives (with proper flags)
  // ============================================================================
  console.log('📖 TEST 2: Read Files from Shared Drives');
  console.log('─'.repeat(70));
  try {
    // List files from ALL shared drives using proper flags
    const filesRes = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType, driveId, parents)',
      supportsAllDrives: true,           // CRITICAL FLAG
      includeItemsFromAllDrives: true,   // CRITICAL FLAG
      corpora: 'allDrives',               // Search across all drives
    });

    const files = filesRes.data.files || [];
    console.log(`✅ SUCCESS: Read ${files.length} files from Shared Drives`);

    files.slice(0, 5).forEach((f, idx) => {
      const type = f.mimeType.includes('spreadsheet') ? '📊' :
                   f.mimeType.includes('folder') ? '📁' : '📄';
      console.log(`   ${idx + 1}. ${type} ${f.name}`);
      console.log(`      ID: ${f.id}`);
    });

    testsPassed++;
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    testsFailed++;
  }
  console.log('\n' + '═'.repeat(70) + '\n');

  // ============================================================================
  // TEST 3: Read Files from My Drive
  // ============================================================================
  console.log('💾 TEST 3: Read Files from My Drive');
  console.log('─'.repeat(70));
  try {
    const myDriveRes = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType)',
      corpora: 'user', // My Drive only
    });

    const myFiles = myDriveRes.data.files || [];
    console.log(`✅ SUCCESS: Read ${myFiles.length} files from My Drive`);

    myFiles.slice(0, 5).forEach((f, idx) => {
      const type = f.mimeType.includes('spreadsheet') ? '📊' :
                   f.mimeType.includes('folder') ? '📁' : '📄';
      console.log(`   ${idx + 1}. ${type} ${f.name}`);
    });

    testsPassed++;
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    testsFailed++;
  }
  console.log('\n' + '═'.repeat(70) + '\n');

  // ============================================================================
  // TEST 4: Create Test File in Shared Drive
  // ============================================================================
  console.log('✍️  TEST 4: Write File to Shared Drive');
  console.log('─'.repeat(70));
  try {
    // Get first Shared Drive ID
    const drivesRes = await drive.drives.list({ pageSize: 1 });
    const firstDrive = drivesRes.data.drives?.[0];

    if (!firstDrive) {
      throw new Error('No Shared Drives available for testing');
    }

    console.log(`   Testing in Shared Drive: ${firstDrive.name}`);

    // Create a test file
    const testFileMetadata = {
      name: `OAuth-Test-${Date.now()}.txt`,
      mimeType: 'text/plain',
      parents: [firstDrive.id],
    };

    const testFileMedia = {
      mimeType: 'text/plain',
      body: 'This is a test file created by OAuth setup verification.\n' +
            'Created: ' + new Date().toISOString() + '\n' +
            'Purpose: Verify write access to Shared Drives\n',
    };

    const createRes = await drive.files.create({
      requestBody: testFileMetadata,
      media: testFileMedia,
      fields: 'id, name, webViewLink',
      supportsAllDrives: true, // CRITICAL FLAG
    });

    console.log(`✅ SUCCESS: Created test file`);
    console.log(`   File: ${createRes.data.name}`);
    console.log(`   ID: ${createRes.data.id}`);
    console.log(`   Link: ${createRes.data.webViewLink}`);

    // Store file ID for cleanup
    const testFileId = createRes.data.id;

    testsPassed++;

    // ========================================================================
    // TEST 5: Read Back the File We Just Created
    // ========================================================================
    console.log('\n' + '═'.repeat(70) + '\n');
    console.log('📖 TEST 5: Read Back Created File');
    console.log('─'.repeat(70));

    const readRes = await drive.files.get({
      fileId: testFileId,
      alt: 'media',
      supportsAllDrives: true, // CRITICAL FLAG
    });

    console.log(`✅ SUCCESS: Read back test file content`);
    console.log(`   Content preview: ${readRes.data.substring(0, 100)}...`);

    testsPassed++;

    // ========================================================================
    // TEST 6: Update the File
    // ========================================================================
    console.log('\n' + '═'.repeat(70) + '\n');
    console.log('✏️  TEST 6: Update File Content');
    console.log('─'.repeat(70));

    const updateMedia = {
      mimeType: 'text/plain',
      body: readRes.data + '\n\nUPDATED: ' + new Date().toISOString() + '\n',
    };

    await drive.files.update({
      fileId: testFileId,
      media: updateMedia,
      supportsAllDrives: true, // CRITICAL FLAG
    });

    console.log(`✅ SUCCESS: Updated test file`);

    testsPassed++;

    // ========================================================================
    // TEST 7: Delete the Test File (Cleanup)
    // ========================================================================
    console.log('\n' + '═'.repeat(70) + '\n');
    console.log('🗑️  TEST 7: Delete Test File (Cleanup)');
    console.log('─'.repeat(70));

    await drive.files.delete({
      fileId: testFileId,
      supportsAllDrives: true, // CRITICAL FLAG
    });

    console.log(`✅ SUCCESS: Deleted test file`);

    testsPassed++;

  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    testsFailed++;
  }
  console.log('\n' + '═'.repeat(70) + '\n');

  // ============================================================================
  // TEST 8: Access Google Sheets
  // ============================================================================
  console.log('📊 TEST 8: Access Google Sheets');
  console.log('─'.repeat(70));
  try {
    // Find a spreadsheet from Shared Drives
    const sheetsRes = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      pageSize: 1,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: 'allDrives',
    });

    if (sheetsRes.data.files && sheetsRes.data.files.length > 0) {
      const sheet = sheetsRes.data.files[0];
      console.log(`   Found spreadsheet: ${sheet.name}`);

      // Try to read from it
      const values = await sheets.spreadsheets.values.get({
        spreadsheetId: sheet.id,
        range: 'A1:B2', // Small range to avoid large reads
      });

      console.log(`✅ SUCCESS: Read from Google Sheet`);
      console.log(`   Sheet: ${sheet.name}`);
      console.log(`   Rows read: ${values.data.values?.length || 0}`);

      testsPassed++;
    } else {
      console.log(`⚠️  SKIPPED: No spreadsheets found to test`);
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    testsFailed++;
  }
  console.log('\n' + '═'.repeat(70) + '\n');

  // ============================================================================
  // TEST 9: List Apps Script Projects
  // ============================================================================
  console.log('📜 TEST 9: List Apps Script Projects');
  console.log('─'.repeat(70));
  try {
    const scriptsRes = await script.projects.list({
      pageSize: 10,
    });

    const projects = scriptsRes.data.projects || [];
    console.log(`✅ SUCCESS: Found ${projects.length} Apps Script projects`);

    if (projects.length > 0) {
      projects.slice(0, 5).forEach((p, idx) => {
        console.log(`   ${idx + 1}. ${p.title}`);
        console.log(`      Project ID: ${p.scriptId}`);
        console.log(`      Created: ${p.createTime}`);
      });
    } else {
      console.log(`   (No projects found - this is normal if you haven't created any yet)`);
    }

    testsPassed++;
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    testsFailed++;
  }
  console.log('\n' + '═'.repeat(70) + '\n');

  // ============================================================================
  // TEST 10: Create and Execute Apps Script Project
  // ============================================================================
  console.log('🚀 TEST 10: Create & Execute Apps Script Code');
  console.log('─'.repeat(70));
  try {
    // Create a simple Apps Script project
    const createScriptRes = await script.projects.create({
      requestBody: {
        title: `OAuth-Test-Script-${Date.now()}`,
      },
    });

    const projectId = createScriptRes.data.scriptId;
    console.log(`   Created script project: ${createScriptRes.data.title}`);
    console.log(`   Project ID: ${projectId}`);

    // Update with code
    const scriptContent = {
      files: [
        {
          name: 'Code',
          type: 'SERVER_JS',
          source: `
function testFunction() {
  Logger.log('OAuth test executed successfully!');
  return {
    success: true,
    timestamp: new Date().toISOString(),
    message: 'Apps Script execution verified'
  };
}
          `,
        },
      ],
    };

    await script.projects.updateContent({
      scriptId: projectId,
      requestBody: scriptContent,
    });

    console.log(`   Updated script with test code`);

    // Execute the function
    const execRes = await script.scripts.run({
      scriptId: projectId,
      requestBody: {
        function: 'testFunction',
      },
    });

    if (execRes.data.response && execRes.data.response.result) {
      console.log(`✅ SUCCESS: Apps Script execution verified`);
      console.log(`   Result:`, execRes.data.response.result);
      testsPassed++;
    } else if (execRes.data.error) {
      throw new Error(execRes.data.error.details[0].errorMessage);
    }

    // Cleanup: Delete the test script project
    console.log(`   Cleaning up test script project...`);
    // Note: Apps Script API doesn't have a delete method via API
    // The project will remain but can be manually deleted from script.google.com
    console.log(`   ⚠️  Note: Test script remains in Drive - delete manually if needed`);

  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    if (err.message.includes('PERMISSION_DENIED')) {
      console.log(`   Note: Script execution requires additional setup`);
      console.log(`   This is expected on first OAuth setup`);
    }
    testsFailed++;
  }
  console.log('\n' + '═'.repeat(70) + '\n');

  // ============================================================================
  // TEST SUMMARY
  // ============================================================================
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(70));
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  console.log('═'.repeat(70) + '\n');

  // Critical flags reminder
  console.log('🔑 CRITICAL FLAGS FOR SHARED DRIVES:');
  console.log('─'.repeat(70));
  console.log('When accessing Shared Drives, ALWAYS include:');
  console.log('  • supportsAllDrives: true');
  console.log('  • includeItemsFromAllDrives: true');
  console.log('  • corpora: "allDrives" (or "drive" with driveId)');
  console.log('');
  console.log('Without these flags, you will get 404 errors!');
  console.log('═'.repeat(70) + '\n');

  if (testsFailed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Full Google Workspace access verified');
    console.log('✅ Ready to proceed with automation');
  } else {
    console.log('⚠️  Some tests failed - review errors above');
  }

  console.log('');
}

testCompleteAccess().catch(console.error);
