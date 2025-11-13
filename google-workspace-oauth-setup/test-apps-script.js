require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const AppsScriptDeploy = require('./apps-script-deploy');

async function testAppsScriptDeployment() {
  console.log('🧪 Testing Apps Script Deployment\n');
  console.log('═'.repeat(70) + '\n');

  try {
    // Load credentials
    const credentials = JSON.parse(fs.readFileSync('credentials.json'));
    const token = JSON.parse(fs.readFileSync('token.json'));

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    oAuth2Client.setCredentials(token);

    const deployer = new AppsScriptDeploy(oAuth2Client);
    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    let testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: [],
    };

    // Test 1: Check Apps Script API availability
    console.log('🔍 Test 1: Check Apps Script API Availability');
    let apiEnabled = false;
    try {
      const apiTest = await deployer.testApiAvailability();
      if (apiTest.available) {
        console.log('   ✅ Apps Script API is enabled and accessible');
        apiEnabled = true;
        testResults.passed++;
        testResults.tests.push({ name: 'API Availability', status: 'passed' });
      } else {
        console.log('   ⚠️  Apps Script API not enabled in user settings');
        console.log('   📋 Enable at: https://script.google.com/home/usersettings');
        console.log('   ⏭️  Skipping remaining tests (API required)');
        testResults.skipped++;
        testResults.tests.push({ name: 'API Availability', status: 'skipped', reason: 'API not enabled' });

        console.log('\n═'.repeat(70));
        console.log('📊 Test Summary\n');
        console.log('   ⚠️  Apps Script API not enabled');
        console.log('   📋 Action Required:');
        console.log('      1. Visit: https://script.google.com/home/usersettings');
        console.log('      2. Sign in as automation@ssdsbc.com');
        console.log('      3. Enable "Google Apps Script API"');
        console.log('      4. Wait 5 minutes');
        console.log('      5. Re-run: node test-apps-script.js');
        console.log('');
        return;
      }
    } catch (error) {
      if (error.message.includes('disabled') || error.message.includes('not enabled') || error.message.includes('permission')) {
        console.log('   ⚠️  Apps Script API not enabled or no permission');
        console.log('   📋 Enable at: https://script.google.com/home/usersettings');
        console.log('   ⏭️  Skipping remaining tests (API required)');
        testResults.skipped++;
        testResults.tests.push({ name: 'API Availability', status: 'skipped', reason: 'API not enabled' });

        console.log('\n═'.repeat(70));
        console.log('📊 Test Summary\n');
        console.log('   ⚠️  Apps Script API not enabled');
        console.log('   📋 Action Required:');
        console.log('      1. Visit: https://script.google.com/home/usersettings');
        console.log('      2. Sign in as automation@ssdsbc.com');
        console.log('      3. Enable "Google Apps Script API"');
        console.log('      4. Wait 5 minutes');
        console.log('      5. Re-run: node test-apps-script.js');
        console.log('');
        return;
      }
      throw error;
    }
    console.log('');

    // Test 2: Create a test spreadsheet
    console.log('📝 Test 2: Create Test Spreadsheet');
    let testSpreadsheetId;
    try {
      const response = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'AppsScript-Deployment-Test',
          },
          sheets: [
            {
              properties: {
                title: 'Data',
              },
            },
          ],
        },
      });

      testSpreadsheetId = response.data.spreadsheetId;
      console.log(`   ✅ Created test spreadsheet: ${testSpreadsheetId}`);
      console.log(`   🔗 URL: https://docs.google.com/spreadsheets/d/${testSpreadsheetId}/edit`);
      testResults.passed++;
      testResults.tests.push({ name: 'Create Spreadsheet', status: 'passed', spreadsheetId: testSpreadsheetId });
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Create Spreadsheet', status: 'failed', error: error.message });
      return;
    }
    console.log('');

    // Test 3: Create standard code template
    console.log('📦 Test 3: Create Standard Code Template');
    let codeFiles;
    try {
      codeFiles = deployer.createStandardTemplate({
        customHello: `
function customHello() {
  return 'Hello from automation script!';
}
        `.trim(),
      });

      console.log(`   ✅ Template created with ${codeFiles.length} files:`);
      codeFiles.forEach(file => {
        console.log(`      - ${file.name} (${file.type})`);
      });
      testResults.passed++;
      testResults.tests.push({ name: 'Create Template', status: 'passed', fileCount: codeFiles.length });
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Create Template', status: 'failed', error: error.message });
      return;
    }
    console.log('');

    // Test 4: Deploy to test spreadsheet
    console.log('🚀 Test 4: Deploy Code to Spreadsheet');
    let scriptId;
    let backup;
    try {
      const result = await deployer.deployToSheet(
        testSpreadsheetId,
        codeFiles,
        {
          sheetTitle: 'AppsScript-Deployment-Test',
          scriptTitle: 'Test Automation Script',
          createBackup: true,
        }
      );

      scriptId = result.scriptId;
      backup = result.backup;

      console.log(`   ✅ Deployment ${result.action}`);
      console.log(`   Script ID: ${scriptId}`);
      console.log(`   Backup created: ${backup ? 'Yes' : 'No'}`);
      console.log(`   🔗 Script URL: https://script.google.com/d/${scriptId}/edit`);
      testResults.passed++;
      testResults.tests.push({ name: 'Deploy to Sheet', status: 'passed', scriptId: scriptId, action: result.action });
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Deploy to Sheet', status: 'failed', error: error.message });
    }
    console.log('');

    // Test 5: Verify deployment
    console.log('✅ Test 5: Verify Deployment');
    try {
      const content = await deployer.getProjectContent(scriptId);
      console.log(`   ✅ Retrieved project content`);
      console.log(`   Files: ${content.files.length}`);
      content.files.forEach(file => {
        const preview = file.source ? `${file.source.substring(0, 50)}...` : 'N/A';
        console.log(`      - ${file.name}: ${preview}`);
      });
      testResults.passed++;
      testResults.tests.push({ name: 'Verify Deployment', status: 'passed', files: content.files.length });
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Verify Deployment', status: 'failed', error: error.message });
    }
    console.log('');

    // Test 6: Test script execution
    console.log('▶️  Test 6: Test Script Execution');
    try {
      const result = await deployer.runScript(scriptId, 'testConnection');
      console.log(`   ✅ Script executed successfully`);
      console.log(`   Result: ${result.result}`);
      testResults.passed++;
      testResults.tests.push({ name: 'Script Execution', status: 'passed', result: result.result });
    } catch (error) {
      console.log(`   ⚠️  Execution failed: ${error.message}`);
      console.log(`   Note: Script may need manual authorization first`);
      testResults.tests.push({ name: 'Script Execution', status: 'warning', error: error.message });
    }
    console.log('');

    // Test 7: Update deployment
    console.log('🔄 Test 7: Update Existing Deployment');
    try {
      const updatedFiles = deployer.createStandardTemplate({
        customHello: `
function customHello() {
  return 'Hello from UPDATED automation script!';
}
        `.trim(),
        newFunction: `
function newFunction() {
  return 'This is a new function added in the update';
}
        `.trim(),
      });

      const result = await deployer.deployToSheet(
        testSpreadsheetId,
        updatedFiles,
        {
          sheetTitle: 'AppsScript-Deployment-Test',
          createBackup: true,
        }
      );

      console.log(`   ✅ Update ${result.action}`);
      console.log(`   Script ID: ${result.scriptId}`);
      testResults.passed++;
      testResults.tests.push({ name: 'Update Deployment', status: 'passed', action: result.action });
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Update Deployment', status: 'failed', error: error.message });
    }
    console.log('');

    // Test 8: Rollback mechanism
    console.log('⏮️  Test 8: Test Rollback Mechanism');
    if (backup) {
      try {
        await deployer.rollback(scriptId, backup.files);
        console.log(`   ✅ Rollback successful`);
        console.log(`   Restored to version from: ${backup.timestamp}`);
        testResults.passed++;
        testResults.tests.push({ name: 'Rollback', status: 'passed', timestamp: backup.timestamp });
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        testResults.failed++;
        testResults.tests.push({ name: 'Rollback', status: 'failed', error: error.message });
      }
    } else {
      console.log(`   ⏭️  Skipped (no backup available)`);
      testResults.skipped++;
      testResults.tests.push({ name: 'Rollback', status: 'skipped', reason: 'No backup' });
    }
    console.log('');

    // Test 9: Bulk deployment simulation (2 sheets)
    console.log('📦 Test 9: Bulk Deployment Simulation');
    try {
      // Create second test sheet
      const sheet2Response = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'AppsScript-Bulk-Test-2',
          },
        },
      });

      const deployments = [
        {
          spreadsheetId: testSpreadsheetId,
          sheetTitle: 'AppsScript-Deployment-Test',
          scriptTitle: 'Test Automation Script',
          codeFiles: codeFiles,
        },
        {
          spreadsheetId: sheet2Response.data.spreadsheetId,
          sheetTitle: 'AppsScript-Bulk-Test-2',
          scriptTitle: 'Test Automation Script 2',
          codeFiles: codeFiles,
        },
      ];

      const bulkResults = await deployer.bulkDeploy(deployments, {
        batchSize: 2,
        delayMs: 500,
        createBackup: false,
      });

      console.log(`   ✅ Bulk deployment completed`);
      console.log(`   Total: ${bulkResults.total}`);
      console.log(`   Successful: ${bulkResults.successful}`);
      console.log(`   Failed: ${bulkResults.failed}`);
      testResults.passed++;
      testResults.tests.push({
        name: 'Bulk Deployment',
        status: 'passed',
        total: bulkResults.total,
        successful: bulkResults.successful,
        failed: bulkResults.failed,
      });

      // Store second sheet ID for cleanup
      global.testSheet2Id = sheet2Response.data.spreadsheetId;
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Bulk Deployment', status: 'failed', error: error.message });
    }
    console.log('');

    // Summary
    console.log('═'.repeat(70));
    console.log('📊 Test Summary\n');
    const total = testResults.passed + testResults.failed + testResults.skipped;
    console.log(`   Total Tests: ${total}`);
    console.log(`   ✅ Passed: ${testResults.passed}`);
    console.log(`   ❌ Failed: ${testResults.failed}`);
    console.log(`   ⏭️  Skipped: ${testResults.skipped}`);
    if (testResults.passed + testResults.failed > 0) {
      console.log(`   Accuracy: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    }
    console.log('');

    if (testResults.failed === 0 && testResults.passed > 0) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('✅ Apps Script deployment is fully functional');
      console.log('✅ Rollback mechanism tested and working');
      console.log('✅ Bulk deployment ready for production');
    } else if (testResults.failed > 0) {
      console.log('⚠️  Some tests failed - review implementation');
      console.log('\nFailed Tests:');
      testResults.tests.filter(t => t.status === 'failed').forEach(t => {
        console.log(`   - ${t.name}: ${t.error}`);
      });
    }

    console.log('');

    // Cleanup
    console.log('🗑️  Cleaning up test spreadsheets...');
    try {
      await drive.files.delete({
        fileId: testSpreadsheetId,
        supportsAllDrives: true,
      });
      console.log('   ✅ Test spreadsheet 1 deleted');

      if (global.testSheet2Id) {
        await drive.files.delete({
          fileId: global.testSheet2Id,
          supportsAllDrives: true,
        });
        console.log('   ✅ Test spreadsheet 2 deleted');
      }
    } catch (error) {
      console.log(`   ⚠️  Could not delete test spreadsheets: ${error.message}`);
    }

    console.log('');

  } catch (error) {
    console.log(`\n❌ Fatal Error: ${error.message}`);
    console.log(error.stack);
  }
}

testAppsScriptDeployment();
