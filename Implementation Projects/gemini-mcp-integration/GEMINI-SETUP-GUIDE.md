---
type: guide
tags: [gemini, setup, api, hipaa, integration]
---

# Gemini API Integration Setup Guide

**Purpose:** Complete walkthrough for setting up Google Gemini API in medical-patient-data workspace

**Audience:** Developers with HIPAA training

**Time Required:** 30-45 minutes

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Get Gemini API Key](#get-gemini-api-key)
3. [Environment Setup](#environment-setup)
4. [Install Dependencies](#install-dependencies)
5. [Test API Connectivity](#test-api-connectivity)
6. [HIPAA Compliance Configuration](#hipaa-compliance-configuration)
7. [Example Workflows](#example-workflows)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required
- ✅ Node.js 18+ installed
- ✅ Google Cloud account
- ✅ HIPAA training completed
- ✅ Access to medical-patient-data workspace
- ✅ Reviewed HIPAA-COMPLIANCE-GUIDE.md

### Google Workspace BAA
- Google Workspace Business Plus or higher
- Business Associate Agreement (BAA) signed with Google
- Gemini API covered under BAA (verify with your Google rep)

**Important:** Without BAA, you CANNOT process PHI with Gemini API.

---

## Get Gemini API Key

### Step 1: Access Google AI Studio

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google Workspace account (BAA-covered account)
3. Click **"Get API key"** or **"Create API key"**

### Step 2: Create API Key

**Option A: Create new project**
```
1. Click "Create API key in new project"
2. Name: "Medical Practice - Gemini Integration"
3. Click "Create"
4. Copy the API key (starts with "AIza...")
```

**Option B: Use existing project**
```
1. Click "Create API key in existing project"
2. Select your Google Cloud project
3. Click "Create"
4. Copy the API key
```

### Step 3: Secure the API Key

**DO NOT:**
- ❌ Commit to git
- ❌ Share in Slack/email
- ❌ Store in code
- ❌ Log to console in production

**DO:**
- ✅ Store in .env file (gitignored)
- ✅ Use environment variables
- ✅ Rotate every 90 days
- ✅ Restrict API key to specific IPs (production)

---

## Environment Setup

### Step 1: Navigate to Workspace

```bash
cd ~/Desktop/medical-patient-data
```

### Step 2: Create .env File

```bash
cp .env.example .env
```

### Step 3: Add Gemini API Key

Edit `.env`:

```bash
# Gemini API Configuration
GEMINI_API_KEY=AIzaSy...your-actual-key-here

# Google Cloud Project
GOOGLE_CLOUD_PROJECT=your-project-id

# Environment
NODE_ENV=development

# Audit Logging
AUDIT_LOG_LEVEL=info
AUDIT_LOG_PATH=./logs/audit.log

# Session Configuration
SESSION_TIMEOUT_MINUTES=15
```

### Step 4: Verify .env is Gitignored

```bash
# Check .gitignore includes .env
grep "^\.env$" .gitignore

# Should output: .env
```

---

## Install Dependencies

### Step 1: Initialize Node Project (if not done)

```bash
npm init -y
```

### Step 2: Install Gemini SDK

```bash
npm install @google/generative-ai
```

### Step 3: Install Development Dependencies

```bash
npm install --save-dev typescript @types/node ts-node
npm install dotenv
```

### Step 4: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 5: Add Scripts to package.json

```json
{
  "scripts": {
    "test": "ts-node src/test-gemini.ts",
    "build": "tsc",
    "dev": "ts-node src/index.ts"
  }
}
```

---

## Test API Connectivity

### Step 1: Create Test Script

Location: `04-product-under-development/gemini-examples/test-gemini.ts`

(See example code files)

### Step 2: Run Test

```bash
npm test
```

### Expected Output

```
✅ Gemini API Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API Key: Loaded from environment
Model: gemini-pro
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prompt: What are three key considerations for HIPAA compliance?

Response:
1. **Administrative Safeguards**: Implementing policies and procedures...
2. **Physical Safeguards**: Ensuring physical security of facilities...
3. **Technical Safeguards**: Using encryption, access controls...

✅ Test completed successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Troubleshooting Test Failures

**Error: "API key not valid"**
- Check .env file has correct key
- Verify no extra spaces or quotes
- Regenerate API key if needed

**Error: "Unable to fetch"**
- Check internet connection
- Verify firewall allows Google API access
- Check Google Cloud project is active

**Error: "Quota exceeded"**
- Check Google Cloud quotas: https://console.cloud.google.com/
- Free tier: 60 requests/minute
- Paid tier: Higher limits

---

## HIPAA Compliance Configuration

### Audit Logging Setup

Every Gemini API call with PHI must be logged.

**Create audit logger:**

Location: `src/utils/audit-logger.ts`

```typescript
import * as fs from 'fs/promises';
import * as path from 'path';

interface AuditEntry {
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  status: 'success' | 'failure';
  phiAccessed?: boolean;
  error?: string;
}

export async function auditLog(entry: AuditEntry): Promise<void> {
  const logPath = process.env.AUDIT_LOG_PATH || './logs/audit.log';
  const logDir = path.dirname(logPath);

  // Ensure log directory exists
  await fs.mkdir(logDir, { recursive: true });

  const logEntry = JSON.stringify({
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString()
  }) + '\n';

  await fs.appendFile(logPath, logEntry);
}
```

### De-Identification Helper

**Create de-identification utility:**

Location: `src/utils/de-identify.ts`

```typescript
export function deIdentifyText(text: string): string {
  // Remove common PHI patterns (basic example)
  let cleaned = text;

  // Remove SSN patterns (###-##-####)
  cleaned = cleaned.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN-REDACTED]');

  // Remove email addresses
  cleaned = cleaned.replace(/\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/gi, '[EMAIL-REDACTED]');

  // Remove phone numbers (various formats)
  cleaned = cleaned.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE-REDACTED]');

  // Remove dates (MM/DD/YYYY, MM-DD-YYYY)
  cleaned = cleaned.replace(/\b\d{1,2}[/-]\d{1,2}[/-]\d{4}\b/g, '[DATE-REDACTED]');

  return cleaned;
}

export function isTextSafeToPrint(text: string): boolean {
  // Returns false if text contains PHI patterns
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/,  // SSN
    /\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/i,  // Email
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/  // Phone
  ];

  return !phiPatterns.some(pattern => pattern.test(text));
}
```

### Rate Limiting

**Create rate limiter:**

Location: `src/utils/rate-limiter.ts`

```typescript
export class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 60, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);

      throw new Error(`Rate limit exceeded. Wait ${waitTime}ms`);
    }

    this.requests.push(now);
  }
}
```

---

## Example Workflows

### 1. Patient Inquiry Classification

**Use Case:** Classify incoming patient messages by urgency/topic

**PHI Level:** May contain PHI (patient name, symptoms)

**Implementation:** See `patient-inquiry-classifier.ts`

**Key Features:**
- Audit logging for all classifications
- PHI detection and handling
- Urgency scoring (1-5)
- Category assignment

### 2. Appointment Scheduling Assistant

**Use Case:** Suggest optimal appointment times

**PHI Level:** Patient preferences, schedule info

**Implementation:** See `appointment-assistant.ts`

**Key Features:**
- Time optimization
- Provider availability matching
- Conflict detection
- Booking confirmation

### 3. Medical Document Summarization

**Use Case:** Summarize lab results, reports

**PHI Level:** HIGH - Contains diagnosis, test results

**Implementation:** See `document-summarizer.ts`

**Key Features:**
- Multi-page processing
- Key findings extraction
- Clinical terminology preservation
- HIPAA-compliant output

---

## Best Practices

### 1. Always Use Audit Logging

```typescript
// ✅ GOOD
await auditLog({
  userId: user.id,
  action: 'GEMINI_CLASSIFY',
  resource: 'patient-inquiry',
  status: 'success',
  phiAccessed: true
});

// ❌ BAD
// No audit trail
```

### 2. De-Identify When Possible

```typescript
// ✅ GOOD - Remove PHI before non-critical operations
const deidentified = deIdentifyText(patientMessage);
const category = await classifyMessage(deidentified);

// ❌ BAD - Sending full PHI when not needed
const category = await classifyMessage(patientMessage);
```

### 3. Handle Errors Gracefully

```typescript
// ✅ GOOD
try {
  const result = await geminiCall(prompt);
  await auditLog({ ...entry, status: 'success' });
} catch (error) {
  await auditLog({
    ...entry,
    status: 'failure',
    error: error.message
  });
  // Don't expose error details to user if contains PHI
  throw new Error('Processing failed. Please try again.');
}
```

### 4. Implement Timeout Protection

```typescript
// ✅ GOOD - Timeout to prevent hanging
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000);

try {
  const result = await fetch(apiEndpoint, {
    signal: controller.signal
  });
} finally {
  clearTimeout(timeout);
}
```

---

## Troubleshooting

### Common Issues

**Issue: API calls return 403 Forbidden**
- Verify API key is correct
- Check Google Cloud project has Gemini API enabled
- Verify billing is set up (required for some features)

**Issue: Responses are slow**
- Check prompt length (shorter = faster)
- Use gemini-pro-vision only when needed (slower than gemini-pro)
- Consider caching common responses

**Issue: PHI detected in logs**
- Review all console.log statements
- Use de-identification before logging
- Enable pre-commit PHI scanning

**Issue: Rate limit errors**
- Implement rate limiting (see rate-limiter.ts)
- Upgrade to paid tier if needed
- Add retry logic with exponential backoff

---

## Next Steps

1. ✅ Complete this setup
2. ✅ Test basic API connectivity
3. ✅ Review example workflows
4. ✅ Implement audit logging
5. ⬜ Build your first patient workflow
6. ⬜ Deploy to production with monitoring
7. ⬜ Set up alerting for errors/PHI violations

---

## Additional Resources

**Google Gemini Docs:**
- API Reference: https://ai.google.dev/api
- Quickstart: https://ai.google.dev/tutorials/quickstart
- Safety Settings: https://ai.google.dev/docs/safety_setting

**HIPAA Compliance:**
- See: `03-resources-docs-assets-tools/HIPAA-COMPLIANCE-GUIDE.md`
- Google BAA: https://cloud.google.com/security/compliance/hipaa
- HHS HIPAA Portal: https://www.hhs.gov/hipaa

**MCP Tools:**
- `security-compliance-mcp` - PHI scanning
- `workspace-brain` - Audit logging
- `project-management` - Goal tracking

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Next Review:** When deploying to production
