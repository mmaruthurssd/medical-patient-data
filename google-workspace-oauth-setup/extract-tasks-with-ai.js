#!/usr/bin/env node
/**
 * AI Task Extraction using Gemini API
 *
 * Reads transcripts from the Testing sheet and extracts structured action items
 * using Google's Gemini API, then writes results to AI Extraction Results tab.
 */

const { google } = require('googleapis');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Configuration
const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const TOKEN_FILE = path.join(__dirname, 'token.json');
const TESTING_SHEET_ID = '1slreBMgMoBy16KvvpCaEQPe3HccugWJxv8a7BrjDV7A'; // AI Task Tracker - Testing

const TABS = {
  SOURCE: 'Test Transcripts',
  RESULTS: 'AI Extraction Results'
};

// Try to load Gemini API key from environment or .env file
let GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (match) {
      GEMINI_API_KEY = match[1].trim();
    }
  }
}

if (!GEMINI_API_KEY) {
  console.error('\n❌ Gemini API Key not found!\n');
  console.error('Please set up your Gemini API key using one of these methods:\n');
  console.error('1. Environment variable:');
  console.error('   export GEMINI_API_KEY="your_key_here"\n');
  console.error('2. Create a .env file in this directory:');
  console.error('   echo "GEMINI_API_KEY=your_key_here" > .env\n');
  console.error('To get a Gemini API key:');
  console.error('   Visit: https://aistudio.google.com/app/apikey\n');
  process.exit(1);
}

// AI Extraction Prompt (from PROMPT-VERSIONS.md v1.0)
const EXTRACTION_PROMPT = `You are an AI assistant that extracts action items from Google Meet transcripts, email threads, and chat conversations.

Analyze the following transcript and extract all action items, tasks, and follow-up items mentioned.

For each action item identified, provide the following information in structured format:

1. **Task Summary**: A brief one-line summary of the action item (max 10 words)
2. **Task Description**: A detailed description of what needs to be done (2-3 sentences)
3. **Category**: Classify the task into one of these categories:
   - Clinical/Patient Care
   - Administrative
   - Technology/Systems
   - Training/Education
   - Communication/Follow-up
   - Research/Analysis
   - Other
4. **Project/Recurring List**: If this task belongs to an ongoing project or recurring task list, specify which one. If it's a one-time task, write "One-time task"
5. **Status**: Current status of the task:
   - Not Started
   - In Progress
   - Blocked
   - Completed
6. **Next Steps**: Immediate next action required to move this task forward (one sentence)
7. **Owner/Assigned To**: Who is responsible for this task (if mentioned in transcript, otherwise "Unassigned")
8. **Due Date**: When this task should be completed (if mentioned, otherwise "No deadline specified")
9. **Priority**: Based on context and urgency:
   - High (urgent, time-sensitive)
   - Medium (important but not urgent)
   - Low (can be done later)
10. **Confidence Score**: Your confidence that this is actually an action item (0.0 to 1.0 scale)

Return the results as a JSON array with each action item as an object. Use these exact field names:
- task_summary
- task_description
- category
- project_recurring_list
- status
- next_steps
- owner_assigned_to
- due_date
- priority
- confidence_score

IMPORTANT: Return ONLY the JSON array, no additional text or markdown formatting.

TRANSCRIPT:
{transcript_text}`;

async function authenticateOAuth() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
  const token = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));

  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(token);

  return oAuth2Client;
}

async function readTranscripts(sheets) {
  console.log('📖 Reading transcript log from testing sheet...');

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: TESTING_SHEET_ID,
    range: `${TABS.SOURCE}!A:H`
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) {
    console.log('   ⚠️  No transcripts found');
    return [];
  }

  // Load transcript cache (full text)
  console.log('📖 Loading transcript cache...');
  const cachePath = path.join(__dirname, 'transcript-cache.json');
  if (!fs.existsSync(cachePath)) {
    console.log('   ⚠️  No transcript cache found. Run pull-transcripts.js first.');
    return [];
  }

  const transcriptCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const headers = rows[0];
  const data = rows.slice(1);

  // Map to transcript objects, loading full text from cache
  const transcripts = data.map(row => ({
    transcriptId: row[0] || '',
    date: row[1] || '',
    type: row[2] || '',
    title: row[3] || '',
    sourceDocLink: row[4] || '',
    characterCount: row[5] || '',
    fullText: transcriptCache[row[0]] || '', // Load from cache
    processingStatus: row[7] || 'Pending'
  }));

  console.log(`   ✅ Found ${transcripts.length} transcripts`);
  return transcripts;
}

async function extractParticipants(genAI, transcript) {
  // Extract participants using a simple prompt
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const participantPrompt = `Extract the names of all participants from this transcript. Return ONLY a comma-separated list of names, nothing else.

TRANSCRIPT:
${transcript.fullText.substring(0, 2000)}`; // Just use first 2000 chars to find participants

  try {
    const result = await model.generateContent(participantPrompt);
    const response = await result.response;
    const text = response.text().trim();
    return text;
  } catch (error) {
    return 'Unknown';
  }
}

async function extractTasksFromTranscript(genAI, transcript) {
  console.log(`\n🤖 Extracting tasks from: ${transcript.transcriptId} (${transcript.type})`);
  console.log(`   Title: ${transcript.title}`);

  try {
    // First extract participants
    console.log(`   👥 Extracting participants...`);
    const participants = await extractParticipants(genAI, transcript);
    console.log(`   👥 Participants: ${participants}`);

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build prompt with transcript text
    const prompt = EXTRACTION_PROMPT.replace('{transcript_text}', transcript.fullText);

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let tasks;
    try {
      // Clean up response - remove markdown code blocks if present
      let cleanText = text.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
      }

      tasks = JSON.parse(cleanText);

      if (!Array.isArray(tasks)) {
        console.error('   ❌ Response is not an array');
        return { success: false, tasks: [], rawResponse: text };
      }

      console.log(`   ✅ Extracted ${tasks.length} tasks`);

      // Log task summaries
      tasks.forEach((task, i) => {
        console.log(`      ${i + 1}. ${task.task_summary} (${task.priority}, confidence: ${task.confidence_score})`);
      });

      return { success: true, tasks, rawResponse: text, participants };

    } catch (parseError) {
      console.error('   ❌ Failed to parse JSON response');
      console.error('   Raw response:', text.substring(0, 200));
      return { success: false, tasks: [], rawResponse: text, error: parseError.message, participants: 'Unknown' };
    }

  } catch (error) {
    console.error(`   ❌ API Error: ${error.message}`);
    return { success: false, tasks: [], rawResponse: '', error: error.message, participants: 'Unknown' };
  }
}

async function writeExtractionResults(sheets, transcriptId, transcriptType, participants, transcriptDate, tasks, rawResponse) {
  console.log(`\n⬆️  Writing ${tasks.length} tasks to results sheet...`);

  // Use the transcript's date, not the extraction date
  const timestamp = transcriptDate || new Date().toISOString();

  // Format rows: [Transcript ID, Source Type, Participants, Creation Date, Task Summary,
  //               Task Description, Category, Project/Recurring List, Status, Next Steps,
  //               Owner, Due Date, Priority, User Feedback, Confidence Score, Raw AI Response]
  const rows = tasks.map(task => [
    transcriptId,                          // Transcript ID
    transcriptType,                        // Source Type (Email/Chat/Meeting)
    participants,                          // Participants
    timestamp,                             // Creation Date (transcript date)
    task.task_summary || '',               // Task Summary
    task.task_description || '',           // Task Description
    task.category || '',                   // Category
    task.project_recurring_list || '',     // Project/Recurring List
    task.status || 'Not Started',          // Status
    task.next_steps || '',                 // Next Steps
    task.owner_assigned_to || 'Unassigned', // Owner/Assigned To
    task.due_date || 'No deadline specified', // Due Date
    task.priority || 'Medium',             // Priority
    '',                                    // User Feedback (empty for user input)
    task.confidence_score || 0.0,          // Confidence Score
    JSON.stringify(task)                   // Raw AI Response (individual task JSON)
  ]);

  // Append to results sheet
  await sheets.spreadsheets.values.append({
    spreadsheetId: TESTING_SHEET_ID,
    range: `${TABS.RESULTS}!A:P`,
    valueInputOption: 'RAW',
    requestBody: {
      values: rows
    }
  });

  console.log(`   ✅ Wrote ${rows.length} tasks to results sheet`);
}

async function updateTranscriptTaskCount(sheets, transcriptId, taskCount) {
  // Find the row with this transcript ID and update the task count
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: TESTING_SHEET_ID,
    range: `${TABS.SOURCE}!A:H`
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) return;

  const rowIndex = rows.findIndex((row, i) => i > 0 && row[0] === transcriptId);
  if (rowIndex === -1) return;

  // Update task count column (column G, index 6)
  await sheets.spreadsheets.values.update({
    spreadsheetId: TESTING_SHEET_ID,
    range: `${TABS.SOURCE}!G${rowIndex + 1}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[taskCount]]
    }
  });
}

async function updateTranscriptStatus(sheets, transcriptId, status) {
  // Find the row with this transcript ID
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: TESTING_SHEET_ID,
    range: `${TABS.SOURCE}!A:H`
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) return;

  const rowIndex = rows.findIndex((row, i) => i > 0 && row[0] === transcriptId);
  if (rowIndex === -1) return;

  // Update status column (column H, index 7)
  await sheets.spreadsheets.values.update({
    spreadsheetId: TESTING_SHEET_ID,
    range: `${TABS.SOURCE}!H${rowIndex + 1}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[status]]
    }
  });
}

async function extractAllTasks() {
  try {
    console.log('🚀 Starting AI Task Extraction...\n');

    // Authenticate
    console.log('🔑 Authenticating Google Sheets...');
    const auth = await authenticateOAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Authenticated\n');

    // Initialize Gemini
    console.log('🤖 Initializing Gemini API...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('✅ Gemini initialized\n');

    // Read transcripts
    const transcripts = await readTranscripts(sheets);

    if (transcripts.length === 0) {
      console.log('\n⚠️  No transcripts to process. Run pull-transcripts.js first.');
      return;
    }

    // Process each transcript
    let totalTasks = 0;
    let successCount = 0;
    let failCount = 0;

    for (const transcript of transcripts) {
      // Skip non-Meeting transcripts (focus on Google Meets only for now)
      if (transcript.type !== 'Meeting') {
        console.log(`\n⏭️  Skipping ${transcript.transcriptId} (${transcript.type} - not a Meeting)`);
        continue;
      }

      // Skip if already processed
      if (transcript.processingStatus === 'Processed') {
        console.log(`\n⏭️  Skipping ${transcript.transcriptId} (already processed)`);
        continue;
      }

      // Extract tasks
      const result = await extractTasksFromTranscript(genAI, transcript);

      if (result.success && result.tasks.length > 0) {
        // Write to results sheet
        await writeExtractionResults(
          sheets,
          transcript.transcriptId,
          transcript.type,
          result.participants,
          transcript.date,
          result.tasks,
          result.rawResponse
        );

        // Update transcript status and task count
        await updateTranscriptStatus(sheets, transcript.transcriptId, 'Processed');
        await updateTranscriptTaskCount(sheets, transcript.transcriptId, result.tasks.length);

        totalTasks += result.tasks.length;
        successCount++;
      } else {
        // Update transcript status to Failed
        await updateTranscriptStatus(sheets, transcript.transcriptId, 'Failed');
        await updateTranscriptTaskCount(sheets, transcript.transcriptId, 0);
        failCount++;
      }

      // Brief delay between API calls to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ AI EXTRACTION COMPLETE!');
    console.log('='.repeat(80));
    console.log();
    console.log('📊 Summary:');
    console.log(`   Transcripts processed: ${successCount}`);
    console.log(`   Transcripts failed: ${failCount}`);
    console.log(`   Total tasks extracted: ${totalTasks}`);
    console.log();
    console.log('🔗 Results Sheet:');
    console.log(`   https://docs.google.com/spreadsheets/d/${TESTING_SHEET_ID}/edit#gid=<AI_EXTRACTION_RESULTS_TAB>`);
    console.log();
    console.log('💡 Next Steps:');
    console.log('   1. Review extracted tasks in AI Extraction Results tab');
    console.log('   2. Provide feedback in the "User Feedback" column (blue highlight)');
    console.log('   3. Use feedback to iterate on the extraction prompt');
    console.log();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    throw error;
  }
}

// Run
extractAllTasks();
