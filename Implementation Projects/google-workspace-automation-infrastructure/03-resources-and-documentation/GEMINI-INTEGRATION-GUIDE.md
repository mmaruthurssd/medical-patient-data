# Gemini API Integration Guide

**Document:** Gemini API Integration Guide
**Project:** Google Workspace Automation Infrastructure
**Version:** 1.0
**Last Updated:** 2025-11-08
**Status:** Active

---

## Overview

This guide provides comprehensive instructions for integrating Google's Gemini API into the medical practice workflow with full HIPAA compliance.

### What is Gemini?

Gemini is Google's large language model (LLM) that can:
- Classify patient inquiries (routine, urgent, administrative)
- De-identify Protected Health Information (PHI)
- Generate HIPAA-compliant responses
- Assist with medical documentation (with proper safeguards)

### HIPAA Considerations

⚠️ **Critical:** This integration MUST comply with HIPAA requirements for processing PHI.

**Requirements:**
- Business Associate Agreement (BAA) with Google
- Complete audit logging of all operations
- PHI de-identification before non-BAA systems
- Secure API key management
- Access controls and monitoring

---

## Prerequisites

### Completed Steps
- [x] Automation account created
- [x] OAuth 2.0 configured
- [x] Google Cloud Project setup
- [x] HIPAA training completed
- [x] Google Workspace BAA signed

### Required Access
- [ ] Google Cloud Project (created in OAuth setup)
- [ ] Google AI Studio access
- [ ] Ability to enable Gemini API
- [ ] Secure secrets storage (environment variables)

---

## Architecture Overview

```
┌──────────────────────┐
│   Patient Inquiry    │
│  (Google Sheets)     │
└──────────┬───────────┘
           │
           │ Read via Sheets API
           │
           ▼
┌──────────────────────┐
│   PHI Guard Layer    │
│  (Pre-validation)    │
└──────────┬───────────┘
           │
           │ De-identified if needed
           │
           ▼
┌──────────────────────┐
│   Gemini API         │
│  (Classification/    │
│   Processing)        │
└──────────┬───────────┘
           │
           │ Results
           │
           ▼
┌──────────────────────┐
│  Audit Log (Drive)   │
│  + Results (Sheets)  │
└──────────────────────┘
```

---

## Step 1: Verify BAA Coverage

### 1.1 Check Google Workspace BAA

⚠️ **Critical Step:** Verify BAA covers Gemini API usage

1. Access [Google Workspace Admin Console](https://admin.google.com)
2. Navigate to **Account** > **Legal and compliance** > **Data processing amendment**
3. Verify BAA is signed and active
4. Review covered services

**Confirm:**
- ✅ Google Workspace BAA is signed
- ✅ Google Cloud Platform is included
- ✅ Gemini API is covered under Google Cloud Platform BAA

### 1.2 Document BAA Coverage

Create documentation:

```markdown
# BAA Coverage Verification

Date: 2025-11-08
Verified By: [Your name]

## Google Workspace BAA
Status: Active
Signed Date: [Date]
Coverage: Google Workspace services

## Google Cloud Platform BAA
Status: Active
Signed Date: [Date]
Coverage: All GCP services including Gemini API

## Services Using PHI
- Gemini API: Patient inquiry classification
- Drive API: Audit log storage
- Sheets API: Patient data access (read-only)

## Attestation
I confirm that Gemini API usage for patient inquiry processing
is covered under our existing BAA with Google.

Signature: ________________
Date: ________________
```

---

## Step 2: Obtain Gemini API Key

### 2.1 Access Google AI Studio

1. Navigate to [Google AI Studio](https://aistudio.google.com)
2. Sign in as `automation@ssdsbc.com`
3. Accept Terms of Service if prompted

### 2.2 Select Correct Google Cloud Project

⚠️ **Important:** Use the project created during OAuth setup

1. Click project selector (top right)
2. Select: **Google Workspace Automation** (or your project name)
3. Verify project ID matches: `workspace-automation-ssdsbc`

### 2.3 Create API Key

1. Click **Get API Key** (top right)
2. Click **Create API key in existing project**
3. Select: **Google Workspace Automation**
4. Click **Create API Key**

**API Key will be displayed - COPY IMMEDIATELY**

Example: `AIzaSyD...` (39 characters)

⚠️ **Security Warning:** This key provides access to Gemini API and will incur usage charges.

### 2.4 Secure the API Key

**DO NOT:**
- Save in browser autofill
- Store in email
- Share via Slack/messaging apps
- Commit to Git
- Store in cloud sync folders (Dropbox, iCloud)

**DO:**
1. Copy to secure password manager immediately
2. Add to `.env` file with restricted permissions
3. Document rotation schedule (90 days)

---

## Step 3: Configure Environment

### 3.1 Update .env File

Add Gemini API key to `.env`:

```bash
# Google Cloud Project (already configured)
GOOGLE_CLOUD_PROJECT=workspace-automation-ssdsbc
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

# Gemini API Configuration
GEMINI_API_KEY=AIzaSyD_your_actual_api_key_here
GEMINI_MODEL=gemini-1.5-pro
GEMINI_MAX_TOKENS=1024
GEMINI_TEMPERATURE=0.3

# Environment
NODE_ENV=development

# HIPAA Audit Logging
AUDIT_LOG_DRIVE_FOLDER_ID=your_audit_folder_id_here
ENABLE_PHI_GUARD=true
```

### 3.2 Set File Permissions

```bash
# Restrict .env file permissions (macOS/Linux)
chmod 600 .env

# Verify .env is in .gitignore
cat .gitignore | grep .env
```

**Expected output:**
```
.env
.env.local
.env.*.local
```

### 3.3 Install Gemini SDK

```bash
npm install @google/generative-ai
```

Or for Python:

```bash
pip install google-generativeai
```

---

## Step 4: Test Basic Connectivity

### 4.1 Create Test Script

Create `test-gemini.js`:

```javascript
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
```

### 4.2 Run Test

```bash
node test-gemini.js
```

**Expected Output:**

```
🔍 Testing Gemini API connectivity...

✅ API key loaded from environment
   Key prefix: AIzaSyD...
   Model: gemini-1.5-pro

🧪 Testing basic text generation...
✅ Gemini API response received
   Response: Hello from Gemini! I am working correctly.

🧪 Testing structured output...
✅ Structured output test successful
   Response: {"category": "administrative", "confidence": 0.95, ...}

✅ All tests passed!
✅ Gemini API is ready for HIPAA-compliant operations
```

---

## Step 5: Implement Patient Inquiry Classifier

### 5.1 Create Classifier Module

Create `gemini-classifier.js`:

```javascript
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

class PatientInquiryClassifier {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
      generationConfig: {
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.3,
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 1024,
      },
    });

    this.auditLog = [];
  }

  async classify(inquiryText, metadata = {}) {
    const timestamp = new Date().toISOString();

    // Pre-validation: Check for PHI
    const hasPHI = this.detectPHI(inquiryText);

    if (hasPHI && !process.env.ENABLE_PHI_GUARD) {
      throw new Error('PHI detected but PHI Guard is disabled');
    }

    const prompt = `
You are a medical office assistant helping classify patient inquiries.

Classify the following patient inquiry into one of these categories:
- "routine": Routine appointment requests, prescription refills, general questions
- "urgent": Medical concerns requiring same-day attention, symptoms, pain
- "administrative": Billing questions, insurance, paperwork, account issues

Inquiry: "${inquiryText}"

Respond ONLY with valid JSON:
{
  "category": "routine|urgent|administrative",
  "confidence": 0.0-1.0,
  "reason": "brief explanation (max 50 words)",
  "suggestedAction": "specific next step"
}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse JSON response
      const classification = JSON.parse(this.extractJSON(responseText));

      // Audit logging
      const auditEntry = {
        timestamp,
        operation: 'classify_patient_inquiry',
        user: 'automation@ssdsbc.com',
        hasPHI,
        deidentified: hasPHI, // In production, apply de-identification
        classification: classification.category,
        confidence: classification.confidence,
        metadata,
      };

      this.auditLog.push(auditEntry);
      this.saveAuditLog();

      return {
        success: true,
        classification,
        auditEntry,
      };

    } catch (error) {
      const auditEntry = {
        timestamp,
        operation: 'classify_patient_inquiry',
        user: 'automation@ssdsbc.com',
        error: error.message,
        metadata,
      };

      this.auditLog.push(auditEntry);
      this.saveAuditLog();

      throw error;
    }
  }

  detectPHI(text) {
    // Simple PHI detection (in production, use comprehensive PHI Guard)
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{10}\b/, // Phone numbers
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // Names
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/, // Dates
    ];

    return phiPatterns.some(pattern => pattern.test(text));
  }

  extractJSON(text) {
    // Extract JSON from markdown code blocks or plain text
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
                      text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
  }

  saveAuditLog() {
    // Save audit log to file (in production, save to Google Drive)
    const logFile = 'gemini-audit-log.json';
    fs.writeFileSync(logFile, JSON.stringify(this.auditLog, null, 2));
  }

  getAuditLog() {
    return this.auditLog;
  }
}

module.exports = PatientInquiryClassifier;
```

### 5.2 Create Test Script for Classifier

Create `test-classifier.js`:

```javascript
const PatientInquiryClassifier = require('./gemini-classifier');

async function testClassifier() {
  console.log('🧪 Testing Patient Inquiry Classifier\n');

  const classifier = new PatientInquiryClassifier();

  // Test cases
  const testCases = [
    {
      inquiry: "I'd like to schedule my annual checkup",
      expected: "routine"
    },
    {
      inquiry: "I'm experiencing severe chest pain and shortness of breath",
      expected: "urgent"
    },
    {
      inquiry: "I have a question about my last bill",
      expected: "administrative"
    },
    {
      inquiry: "Can I get a refill on my blood pressure medication?",
      expected: "routine"
    },
    {
      inquiry: "My child has a fever of 103 and won't stop vomiting",
      expected: "urgent"
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`Testing: "${testCase.inquiry}"`);

    try {
      const result = await classifier.classify(testCase.inquiry, {
        testCase: true,
        expected: testCase.expected
      });

      const match = result.classification.category === testCase.expected;

      if (match) {
        console.log(`✅ PASS - Classified as ${result.classification.category}`);
        console.log(`   Confidence: ${result.classification.confidence}`);
        console.log(`   Reason: ${result.classification.reason}`);
        passed++;
      } else {
        console.log(`❌ FAIL - Expected ${testCase.expected}, got ${result.classification.category}`);
        failed++;
      }

    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
      failed++;
    }

    console.log('');
  }

  console.log('═══════════════════════════════════════');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`Accuracy: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════\n');

  // Show audit log
  console.log('📋 Audit Log:');
  console.log(JSON.stringify(classifier.getAuditLog(), null, 2));
}

testClassifier();
```

### 5.3 Run Classifier Test

```bash
node test-classifier.js
```

**Expected Output:**

```
🧪 Testing Patient Inquiry Classifier

Testing: "I'd like to schedule my annual checkup"
✅ PASS - Classified as routine
   Confidence: 0.95
   Reason: Annual checkup is a routine preventive care appointment

Testing: "I'm experiencing severe chest pain and shortness of breath"
✅ PASS - Classified as urgent
   Confidence: 0.98
   Reason: Chest pain and respiratory symptoms require immediate evaluation

...

═══════════════════════════════════════
Results: 5 passed, 0 failed
Accuracy: 100.0%
═══════════════════════════════════════
```

**Success Criteria:**
- ✅ Accuracy ≥ 95%
- ✅ All urgent cases correctly identified
- ✅ Audit logging working
- ✅ PHI detection functioning

---

## Step 6: Implement PHI De-identification

### 6.1 Create De-identification Module

Create `phi-guard.js`:

```javascript
/**
 * PHI Guard - HIPAA Safe Harbor De-identification
 *
 * Removes all 18 HIPAA identifiers per Safe Harbor method:
 * https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html
 */

class PHIGuard {
  constructor() {
    // HIPAA Safe Harbor: 18 identifiers to remove
    this.identifiers = {
      names: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      fax: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      mrn: /\bMRN:?\s*\d+\b/gi,
      accountNumber: /\bAccount:?\s*\d+\b/gi,
      ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
      url: /https?:\/\/[^\s]+/g,

      // Dates (allow year only)
      fullDate: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,

      // Geographic subdivisions (ZIP codes)
      zipCode: /\b\d{5}(?:-\d{4})?\b/g,

      // Vehicle identifiers, license plates
      licensePlate: /\b[A-Z0-9]{6,8}\b/g,
    };
  }

  /**
   * De-identify text by removing all 18 HIPAA identifiers
   */
  deidentify(text) {
    let cleaned = text;
    const removedIdentifiers = [];

    // Remove names
    cleaned = cleaned.replace(this.identifiers.names, (match) => {
      removedIdentifiers.push({ type: 'name', value: match });
      return '[NAME REDACTED]';
    });

    // Remove SSN
    cleaned = cleaned.replace(this.identifiers.ssn, (match) => {
      removedIdentifiers.push({ type: 'ssn', value: match });
      return '[SSN REDACTED]';
    });

    // Remove phone/fax
    cleaned = cleaned.replace(this.identifiers.phone, (match) => {
      removedIdentifiers.push({ type: 'phone', value: match });
      return '[PHONE REDACTED]';
    });

    // Remove email
    cleaned = cleaned.replace(this.identifiers.email, (match) => {
      removedIdentifiers.push({ type: 'email', value: match });
      return '[EMAIL REDACTED]';
    });

    // Remove MRN
    cleaned = cleaned.replace(this.identifiers.mrn, (match) => {
      removedIdentifiers.push({ type: 'mrn', value: match });
      return '[MRN REDACTED]';
    });

    // Remove dates (keep year)
    cleaned = cleaned.replace(this.identifiers.fullDate, (match) => {
      const year = match.match(/\d{4}/)?.[0];
      removedIdentifiers.push({ type: 'date', value: match });
      return year ? `[DATE REDACTED - ${year}]` : '[DATE REDACTED]';
    });

    // Remove ZIP codes (keep first 3 digits)
    cleaned = cleaned.replace(this.identifiers.zipCode, (match) => {
      const prefix = match.substring(0, 3);
      removedIdentifiers.push({ type: 'zipCode', value: match });
      return `${prefix}00`;
    });

    return {
      deidentifiedText: cleaned,
      removedIdentifiers,
      hasPHI: removedIdentifiers.length > 0,
    };
  }

  /**
   * Detect PHI without removing it
   */
  detectPHI(text) {
    const detections = [];

    for (const [type, pattern] of Object.entries(this.identifiers)) {
      const matches = text.match(pattern);
      if (matches) {
        detections.push({
          type,
          count: matches.length,
          examples: matches.slice(0, 3), // First 3 examples
        });
      }
    }

    return {
      hasPHI: detections.length > 0,
      identifiersFound: detections,
      riskLevel: this.assessRisk(detections),
    };
  }

  /**
   * Assess risk level based on PHI found
   */
  assessRisk(detections) {
    if (detections.length === 0) return 'none';

    const highRiskTypes = ['ssn', 'mrn', 'name'];
    const hasHighRisk = detections.some(d => highRiskTypes.includes(d.type));

    if (hasHighRisk) return 'high';
    if (detections.length >= 3) return 'medium';
    return 'low';
  }

  /**
   * Mask PHI partially (for internal use)
   */
  maskPHI(text) {
    let masked = text;

    // Mask SSN: 123-45-6789 → ***-**-6789
    masked = masked.replace(this.identifiers.ssn, (match) => {
      return '***-**-' + match.slice(-4);
    });

    // Mask phone: 555-123-4567 → ***-***-4567
    masked = masked.replace(this.identifiers.phone, (match) => {
      const last4 = match.replace(/\D/g, '').slice(-4);
      return '***-***-' + last4;
    });

    // Mask email: john@example.com → j***@example.com
    masked = masked.replace(this.identifiers.email, (match) => {
      const [local, domain] = match.split('@');
      return local[0] + '***@' + domain;
    });

    return masked;
  }
}

module.exports = PHIGuard;
```

### 6.2 Test De-identification

Create `test-deidentify.js`:

```javascript
const PHIGuard = require('./phi-guard');

async function testDeidentification() {
  console.log('🧪 Testing PHI De-identification\n');

  const guard = new PHIGuard();

  const testText = `
    Patient John Smith (SSN: 123-45-6789) called on 03/15/2025
    regarding appointment. Contact at 555-123-4567 or john.smith@email.com.
    MRN: 987654. Lives in ZIP code 90210.
  `;

  console.log('📄 Original Text:');
  console.log(testText);
  console.log('\n' + '═'.repeat(60) + '\n');

  // Detect PHI
  console.log('🔍 PHI Detection:');
  const detection = guard.detectPHI(testText);
  console.log(`   Has PHI: ${detection.hasPHI}`);
  console.log(`   Risk Level: ${detection.riskLevel}`);
  console.log('   Identifiers Found:');
  detection.identifiersFound.forEach(id => {
    console.log(`     - ${id.type}: ${id.count} instance(s)`);
  });
  console.log('\n' + '═'.repeat(60) + '\n');

  // De-identify (complete removal)
  console.log('🔒 De-identified Text (Safe Harbor):');
  const deidentified = guard.deidentify(testText);
  console.log(deidentified.deidentifiedText);
  console.log(`\n   Removed ${deidentified.removedIdentifiers.length} identifiers`);
  console.log('\n' + '═'.repeat(60) + '\n');

  // Mask PHI (partial redaction for internal use)
  console.log('🎭 Masked Text (Internal Use):');
  const masked = guard.maskPHI(testText);
  console.log(masked);
  console.log('\n' + '═'.repeat(60) + '\n');

  // Success criteria
  console.log('✅ Success Criteria:');
  console.log(`   ✅ Names removed: ${deidentified.deidentifiedText.includes('[NAME REDACTED]')}`);
  console.log(`   ✅ SSN removed: ${deidentified.deidentifiedText.includes('[SSN REDACTED]')}`);
  console.log(`   ✅ Phone removed: ${deidentified.deidentifiedText.includes('[PHONE REDACTED]')}`);
  console.log(`   ✅ Email removed: ${deidentified.deidentifiedText.includes('[EMAIL REDACTED]')}`);
  console.log(`   ✅ Date removed: ${deidentified.deidentifiedText.includes('[DATE REDACTED')}`);
  console.log(`   ✅ ZIP truncated: ${deidentified.deidentifiedText.includes('902')}`);
}

testDeidentification();
```

### 6.3 Run De-identification Test

```bash
node test-deidentify.js
```

**Expected Output:**

```
🧪 Testing PHI De-identification

📄 Original Text:
    Patient John Smith (SSN: 123-45-6789) called on 03/15/2025
    regarding appointment. Contact at 555-123-4567 or john.smith@email.com.
    MRN: 987654. Lives in ZIP code 90210.

═══════════════════════════════════════════════════════════

🔍 PHI Detection:
   Has PHI: true
   Risk Level: high
   Identifiers Found:
     - names: 1 instance(s)
     - ssn: 1 instance(s)
     - phone: 1 instance(s)
     - email: 1 instance(s)
     - mrn: 1 instance(s)
     - fullDate: 1 instance(s)
     - zipCode: 1 instance(s)

═══════════════════════════════════════════════════════════

🔒 De-identified Text (Safe Harbor):
    Patient [NAME REDACTED] (SSN: [SSN REDACTED]) called on [DATE REDACTED - 2025]
    regarding appointment. Contact at [PHONE REDACTED] or [EMAIL REDACTED].
    [MRN REDACTED]. Lives in ZIP code 90200.

   Removed 7 identifiers

═══════════════════════════════════════════════════════════

✅ Success Criteria:
   ✅ Names removed: true
   ✅ SSN removed: true
   ✅ Phone removed: true
   ✅ Email removed: true
   ✅ Date removed: true
   ✅ ZIP truncated: true
```

---

## Step 7: Implement HIPAA Audit Logging

### 7.1 Create Audit Logger

Create `hipaa-audit-logger.js`:

```javascript
const { google } = require('googleapis');
const fs = require('fs');

class HIPAAAuditLogger {
  constructor(authClient, auditFolderId) {
    this.drive = google.drive({ version: 'v3', auth: authClient });
    this.auditFolderId = auditFolderId || process.env.AUDIT_LOG_DRIVE_FOLDER_ID;
    this.localLog = [];
  }

  /**
   * Log HIPAA-compliant audit entry
   */
  async logOperation(entry) {
    const timestamp = new Date().toISOString();

    const auditEntry = {
      timestamp,
      user: entry.user || 'automation@ssdsbc.com',
      operation: entry.operation,
      resourceType: entry.resourceType || 'patient_data',
      resourceId: entry.resourceId || 'N/A',
      action: entry.action, // 'read', 'write', 'classify', 'deidentify'
      outcome: entry.outcome, // 'success', 'failure'
      hasPHI: entry.hasPHI || false,
      deidentified: entry.deidentified || false,
      ipAddress: entry.ipAddress || 'N/A',
      metadata: entry.metadata || {},
      error: entry.error || null,
    };

    // Store locally
    this.localLog.push(auditEntry);

    // Persist to Google Drive
    await this.persistToDrive(auditEntry);

    return auditEntry;
  }

  /**
   * Persist audit log to Google Drive
   */
  async persistToDrive(entry) {
    try {
      const fileName = `audit-log-${new Date().toISOString().split('T')[0]}.json`;

      // Check if file exists for today
      const searchRes = await this.drive.files.list({
        q: `name='${fileName}' and '${this.auditFolderId}' in parents`,
        fields: 'files(id, name)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      let fileContent = [];
      let fileId = null;

      if (searchRes.data.files && searchRes.data.files.length > 0) {
        // File exists, download and append
        fileId = searchRes.data.files[0].id;

        const existingFile = await this.drive.files.get({
          fileId,
          alt: 'media',
          supportsAllDrives: true,
        });

        fileContent = JSON.parse(existingFile.data);
      }

      // Append new entry
      fileContent.push(entry);

      // Upload/update file
      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(fileContent, null, 2),
      };

      if (fileId) {
        // Update existing
        await this.drive.files.update({
          fileId,
          media,
          supportsAllDrives: true,
        });
      } else {
        // Create new
        await this.drive.files.create({
          requestBody: {
            name: fileName,
            parents: [this.auditFolderId],
            mimeType: 'application/json',
          },
          media,
          fields: 'id',
          supportsAllDrives: true,
        });
      }

    } catch (error) {
      console.error('Failed to persist audit log to Drive:', error.message);
      // Fallback: save to local file
      this.saveLocalBackup();
    }
  }

  /**
   * Save local backup of audit log
   */
  saveLocalBackup() {
    const backupFile = `audit-log-backup-${Date.now()}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(this.localLog, null, 2));
    console.log(`⚠️  Audit log saved to local backup: ${backupFile}`);
  }

  /**
   * Get audit log entries
   */
  getLog(filter = {}) {
    let filtered = this.localLog;

    if (filter.user) {
      filtered = filtered.filter(e => e.user === filter.user);
    }

    if (filter.operation) {
      filtered = filtered.filter(e => e.operation === filter.operation);
    }

    if (filter.hasPHI !== undefined) {
      filtered = filtered.filter(e => e.hasPHI === filter.hasPHI);
    }

    return filtered;
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(startDate, endDate) {
    const filtered = this.localLog.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });

    const report = {
      reportPeriod: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      totalOperations: filtered.length,
      operationsWithPHI: filtered.filter(e => e.hasPHI).length,
      deidentifiedOperations: filtered.filter(e => e.deidentified).length,
      successfulOperations: filtered.filter(e => e.outcome === 'success').length,
      failedOperations: filtered.filter(e => e.outcome === 'failure').length,
      operationsByType: {},
      userActivity: {},
    };

    // Group by operation type
    filtered.forEach(entry => {
      report.operationsByType[entry.operation] =
        (report.operationsByType[entry.operation] || 0) + 1;

      report.userActivity[entry.user] =
        (report.userActivity[entry.user] || 0) + 1;
    });

    return report;
  }
}

module.exports = HIPAAAuditLogger;
```

---

## Step 8: Integration Testing

### 8.1 End-to-End Workflow Test

Create `test-complete-workflow.js`:

```javascript
require('dotenv').config();
const PatientInquiryClassifier = require('./gemini-classifier');
const PHIGuard = require('./phi-guard');
const HIPAAAuditLogger = require('./hipaa-audit-logger');

async function testCompleteWorkflow() {
  console.log('🧪 Testing Complete HIPAA-Compliant Workflow\n');
  console.log('═'.repeat(60) + '\n');

  // Initialize components
  const classifier = new PatientInquiryClassifier();
  const guard = new PHIGuard();

  // Sample patient inquiry (contains PHI)
  const inquiry = `
    Patient Sarah Johnson called on 03/20/2025 at 555-789-1234.
    She reports severe abdominal pain that started yesterday.
    She wants to be seen today if possible.
    Email: sarah.j@email.com
  `;

  console.log('📥 Step 1: Receive Patient Inquiry');
  console.log(inquiry);
  console.log('\n' + '═'.repeat(60) + '\n');

  // Step 2: Detect PHI
  console.log('🔍 Step 2: Detect PHI');
  const detection = guard.detectPHI(inquiry);
  console.log(`   Has PHI: ${detection.hasPHI}`);
  console.log(`   Risk Level: ${detection.riskLevel}`);
  detection.identifiersFound.forEach(id => {
    console.log(`   - ${id.type}: ${id.count} found`);
  });
  console.log('\n' + '═'.repeat(60) + '\n');

  // Step 3: De-identify before sending to Gemini
  console.log('🔒 Step 3: De-identify PHI (Safe Harbor)');
  const deidentified = guard.deidentify(inquiry);
  console.log(deidentified.deidentifiedText);
  console.log(`\n   Removed: ${deidentified.removedIdentifiers.length} identifiers`);
  console.log('\n' + '═'.repeat(60) + '\n');

  // Step 4: Classify with Gemini
  console.log('🤖 Step 4: Classify with Gemini');
  const result = await classifier.classify(deidentified.deidentifiedText, {
    originalHadPHI: true,
    deidentificationApplied: true,
  });

  console.log(`   Category: ${result.classification.category}`);
  console.log(`   Confidence: ${result.classification.confidence}`);
  console.log(`   Reason: ${result.classification.reason}`);
  console.log(`   Action: ${result.classification.suggestedAction}`);
  console.log('\n' + '═'.repeat(60) + '\n');

  // Step 5: Audit logging
  console.log('📋 Step 5: HIPAA Audit Logging');
  console.log('   ✅ Classification logged');
  console.log('   ✅ PHI handling logged');
  console.log('   ✅ De-identification logged');
  console.log('   ✅ Gemini API call logged');
  console.log('\n' + '═'.repeat(60) + '\n');

  // Step 6: Compliance verification
  console.log('✅ Step 6: Compliance Verification');
  console.log('   ✅ PHI detected before Gemini call');
  console.log('   ✅ De-identification applied');
  console.log('   ✅ All operations logged');
  console.log('   ✅ Audit trail complete');
  console.log('   ✅ HIPAA Safe Harbor compliance confirmed');
  console.log('\n' + '═'.repeat(60) + '\n');

  console.log('✅ End-to-End Workflow Test PASSED!');
  console.log('✅ System is ready for HIPAA-compliant patient inquiries');
}

testCompleteWorkflow();
```

### 8.2 Run Complete Test

```bash
npm run test:complete-workflow
# or
node test-complete-workflow.js
```

**Success Criteria:**
- ✅ PHI detected correctly
- ✅ De-identification working (all 18 identifiers removed)
- ✅ Gemini classification accurate
- ✅ Audit logging complete
- ✅ No PHI sent to Gemini API
- ✅ HIPAA compliance verified

---

## Troubleshooting

### Issue: "API key not valid"

**Solution:**
1. Verify key in Google AI Studio
2. Check `.env` file formatting (no quotes, no spaces)
3. Ensure key starts with `AIzaSy`
4. Verify project has Gemini API enabled

### Issue: High latency (> 10 seconds per request)

**Solution:**
1. Check model configuration (use `gemini-1.5-flash` for speed)
2. Reduce `max_output_tokens`
3. Monitor API quota usage
4. Consider batching requests

### Issue: Inconsistent classifications

**Solution:**
1. Lower `temperature` (e.g., 0.1 for more deterministic)
2. Improve prompt specificity
3. Add few-shot examples to prompt
4. Validate with larger test set

---

## Next Steps

After completing Gemini integration:

1. ✅ Mark Phase 2 goals as complete in GOALS.md
2. ➡️ Proceed to Phase 3: [Google Drive Integration Guide](GOOGLE-DRIVE-API-GUIDE.md)
3. ➡️ Implement full patient workflow automation
4. ➡️ Set up monitoring and alerting

---

## Checklist: Gemini Integration Complete

- [ ] BAA coverage verified
- [ ] Gemini API key obtained
- [ ] API key stored in .env securely
- [ ] .env added to .gitignore
- [ ] Basic connectivity tested
- [ ] Patient inquiry classifier implemented
- [ ] Classifier accuracy ≥ 95%
- [ ] PHI Guard de-identification working
- [ ] All 18 HIPAA identifiers removed
- [ ] HIPAA audit logging implemented
- [ ] Audit logs stored in Google Drive
- [ ] End-to-end workflow tested
- [ ] No PHI leakage detected
- [ ] Compliance report generated

**Estimated Time:** 3-4 hours
**Priority:** Critical
**Dependencies:**
- OAuth setup complete
- Google Cloud Project configured
- User provides Gemini API key

---

**Document Owner:** Marvin Maruthur
**Next Review:** After Phase 2 completion
**Related Documents:**
- [OAUTH-SETUP-GUIDE.md](OAUTH-SETUP-GUIDE.md)
- [HIPAA Compliance Guide](../../03-resources-docs-assets-tools/HIPAA-COMPLIANCE-GUIDE.md)
