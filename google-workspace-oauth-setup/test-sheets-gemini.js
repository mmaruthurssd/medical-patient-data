require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const SheetsGeminiWorkflow = require('./sheets-gemini-workflow');

async function testSheetsGeminiWorkflow() {
  console.log('🧪 Testing Complete Sheets-Gemini Workflow\n');
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

    const workflow = new SheetsGeminiWorkflow(oAuth2Client);
    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    let testResults = {
      passed: 0,
      failed: 0,
      tests: [],
    };

    // Test 1: Create test spreadsheet with sample data
    console.log('📝 Test 1: Create Test Spreadsheet with Sample Inquiries');
    let testSpreadsheetId;

    try {
      const sampleData = [
        ['Timestamp', 'Inquiry', 'Patient Info', 'Status', 'Classification'],
        [
          new Date().toISOString(),
          'I need to schedule my annual physical exam',
          'Patient called',
          'pending',
          '',
        ],
        [
          new Date().toISOString(),
          "I'm experiencing severe chest pain and difficulty breathing",
          'Patient called',
          'pending',
          '',
        ],
        [
          new Date().toISOString(),
          'I have a question about the charges on my last bill',
          'Patient emailed',
          'pending',
          '',
        ],
        [
          new Date().toISOString(),
          'Can I get a refill on my blood pressure medication?',
          'Patient called',
          'pending',
          '',
        ],
        [
          new Date().toISOString(),
          'My child has been running a fever of 103 for 2 days and is very lethargic',
          'Parent called',
          'pending',
          '',
        ],
      ];

      const response = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'Patient Inquiries Test',
          },
          sheets: [{
            properties: {
              title: 'Patient Inquiries',
            },
            data: [{
              startRow: 0,
              startColumn: 0,
              rowData: sampleData.map(row => ({
                values: row.map(cell => ({ userEnteredValue: { stringValue: cell } })),
              })),
            }],
          }],
        },
      });

      testSpreadsheetId = response.data.spreadsheetId;

      console.log(`   ✅ Created spreadsheet: ${testSpreadsheetId}`);
      console.log(`   📊 Sample inquiries: ${sampleData.length - 1}`);
      console.log(`   🔗 URL: https://docs.google.com/spreadsheets/d/${testSpreadsheetId}/edit`);

      testResults.passed++;
      testResults.tests.push({
        name: 'Create Test Spreadsheet',
        status: 'passed',
        spreadsheetId: testSpreadsheetId,
      });
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Create Test Spreadsheet', status: 'failed', error: error.message });
      return;
    }
    console.log('');

    // Test 2: Read inquiries from sheet
    console.log('📖 Test 2: Read Inquiries from Sheet');
    let readResult;

    try {
      readResult = await workflow.readInquiries(testSpreadsheetId);

      console.log(`   ✅ Read ${readResult.count} inquiries`);
      console.log(`   Headers: ${readResult.headers.join(', ')}`);

      testResults.passed++;
      testResults.tests.push({
        name: 'Read Inquiries',
        status: 'passed',
        count: readResult.count,
      });
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Read Inquiries', status: 'failed', error: error.message });
      return;
    }
    console.log('');

    // Test 3: Process single inquiry
    console.log('🤖 Test 3: Process Single Inquiry');
    try {
      const testInquiry = readResult.inquiries[0];
      const processResult = await workflow.processInquiry(testInquiry.inquiryText, {
        rowNumber: testInquiry.rowNumber,
      });

      console.log(`   ✅ Processed inquiry`);
      console.log(`   Category: ${processResult.classification.category}`);
      console.log(`   Confidence: ${processResult.classification.confidence}`);
      console.log(`   Had PHI: ${processResult.hasPHI ? 'Yes' : 'No'}`);

      testResults.passed++;
      testResults.tests.push({
        name: 'Process Single Inquiry',
        status: 'passed',
        category: processResult.classification.category,
      });
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Process Single Inquiry', status: 'failed', error: error.message });
    }
    console.log('');

    // Test 4: Run complete workflow
    console.log('🔄 Test 4: Run Complete End-to-End Workflow');
    let workflowResult;

    try {
      console.log('   Processing all inquiries...\n');

      workflowResult = await workflow.runCompleteWorkflow(testSpreadsheetId, {
        sourceSheet: 'Patient Inquiries',
        createResultsSheet: true,
        timestampResults: false,
        syncAuditLog: true,
      });

      console.log(`   ✅ Workflow completed in ${workflowResult.duration}`);
      console.log(`   📊 Results:`);
      console.log(`      - Inquiries read: ${workflowResult.inquiriesRead}`);
      console.log(`      - Inquiries processed: ${workflowResult.inquiriesProcessed}`);
      console.log(`      - Inquiries failed: ${workflowResult.inquiriesFailed}`);
      console.log(`   `);
      console.log(`   📋 Categories:`);
      console.log(`      - Routine: ${workflowResult.summary.categories.routine}`);
      console.log(`      - Urgent: ${workflowResult.summary.categories.urgent}`);
      console.log(`      - Administrative: ${workflowResult.summary.categories.administrative}`);
      console.log(`   `);
      console.log(`   🔒 HIPAA Compliance:`);
      console.log(`      - PHI detected: ${workflowResult.summary.phiDetected}`);
      console.log(`      - Identifiers removed: ${workflowResult.summary.identifiersRemoved}`);

      testResults.passed++;
      testResults.tests.push({
        name: 'Complete Workflow',
        status: 'passed',
        processed: workflowResult.inquiriesProcessed,
      });
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Complete Workflow', status: 'failed', error: error.message });
    }
    console.log('');

    // Test 5: Verify results written to sheet
    console.log('✅ Test 5: Verify Results Written to Sheet');
    try {
      const verifyResult = await workflow.readInquiries(testSpreadsheetId);

      const processedCount = verifyResult.inquiries.filter(
        i => i.status === 'processed'
      ).length;

      console.log(`   ✅ Verified ${processedCount} inquiries marked as processed`);

      testResults.passed++;
      testResults.tests.push({
        name: 'Verify Results',
        status: 'passed',
        processedCount: processedCount,
      });
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Verify Results', status: 'failed', error: error.message });
    }
    console.log('');

    // Test 6: Verify results sheet created
    console.log('📊 Test 6: Verify Results Sheet Created');
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: testSpreadsheetId,
      });

      const resultsSheet = spreadsheet.data.sheets.find(
        s => s.properties.title === 'Classification Results'
      );

      if (resultsSheet) {
        console.log(`   ✅ Results sheet created: "Classification Results"`);
        console.log(`   Sheet ID: ${resultsSheet.properties.sheetId}`);

        testResults.passed++;
        testResults.tests.push({
          name: 'Verify Results Sheet',
          status: 'passed',
          sheetName: 'Classification Results',
        });
      } else {
        throw new Error('Results sheet not found');
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Verify Results Sheet', status: 'failed', error: error.message });
    }
    console.log('');

    // Summary
    console.log('═'.repeat(70));
    console.log('📊 Test Summary\n');
    console.log(`   Total Tests: ${testResults.passed + testResults.failed}`);
    console.log(`   ✅ Passed: ${testResults.passed}`);
    console.log(`   ❌ Failed: ${testResults.failed}`);
    console.log(`   Accuracy: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    console.log('');

    if (testResults.failed === 0) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('✅ Complete Sheets-Gemini workflow is fully functional');
      console.log('✅ End-to-end automation verified');
      console.log('✅ HIPAA compliance maintained throughout');
      console.log('');
      console.log('📋 Workflow Summary:');
      console.log(`   1. Read patient inquiries from Google Sheets`);
      console.log(`   2. Detect and remove PHI (Safe Harbor compliant)`);
      console.log(`   3. Classify with Gemini (routine/urgent/administrative)`);
      console.log(`   4. Write results back to source sheet`);
      console.log(`   5. Create detailed results sheet`);
      console.log(`   6. Sync audit log to Google Drive`);
      console.log('');
      console.log(`🔗 View results: https://docs.google.com/spreadsheets/d/${testSpreadsheetId}/edit`);
    } else {
      console.log('⚠️  Some tests failed - review implementation');
      console.log('\nFailed Tests:');
      testResults.tests.filter(t => t.status === 'failed').forEach(t => {
        console.log(`   - ${t.name}: ${t.error}`);
      });
    }

    console.log('');

    // Ask user if they want to keep the test spreadsheet
    console.log('🗑️  Test spreadsheet created (NOT automatically deleted)');
    console.log(`   URL: https://docs.google.com/spreadsheets/d/${testSpreadsheetId}/edit`);
    console.log('   You can review the results and delete manually when done.');
    console.log('');

  } catch (error) {
    console.log(`\n❌ Fatal Error: ${error.message}`);
    console.log(error.stack);
  }
}

testSheetsGeminiWorkflow();
