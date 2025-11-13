# Enhanced Snapshot System - Technical Design

**Project:** Google Workspace Automation Infrastructure
**Component:** Intelligent Drift Detection with Gemini AI
**Version:** 2.0 (Enhanced from v1.0 daily snapshot)
**Last Updated:** 2025-11-08

---

## Executive Summary

This document specifies the technical design for upgrading the existing daily snapshot system (v1.0) to an AI-powered, twice-daily intelligent drift detection system (v2.0) using Google's Gemini API.

**Current System (v1.0):**
- Daily snapshots at 9 AM ET
- Text-based diff detection
- Manual classification of changes
- GitHub issue creation for any change

**Enhanced System (v2.0):**
- **Twice-daily** snapshots (9 AM + 5 PM ET)
- **AI-powered classification** using Gemini 1.5 Pro
- **Multi-severity alerting** (low/medium/high/critical)
- **Automated recommendations** (accept/review/rollback)
- **PHI risk assessment** integrated
- **HIPAA audit logging** for all AI decisions

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Snapshot Frequency](#snapshot-frequency)
3. [Gemini Integration](#gemini-integration)
4. [Classification System](#classification-system)
5. [Notification System](#notification-system)
6. [HIPAA Compliance](#hipaa-compliance)
7. [Implementation Plan](#implementation-plan)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)
10. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Architecture Overview

### System Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                   │
│                 (Triggered 9 AM + 5 PM ET)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Snapshot Production State                       │
│  - Pull latest code from all 240 sheets (clasp pull)        │
│  - Save to timestamped snapshot directory                   │
│  - Generate git diff from previous snapshot                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────┴────────────┐
        │  Changes detected?      │
        └────────────┬────────────┘
                     │
         ┌───────────┴───────────┐
         NO                     YES
         │                       │
         ▼                       ▼
    ┌────────┐        ┌──────────────────────┐
    │  Exit  │        │  Gemini AI Analysis  │
    └────────┘        │  - Load diff          │
                      │  - Classify severity  │
                      │  - Classify type      │
                      │  - PHI risk assess    │
                      │  - Recommend action   │
                      └──────────┬────────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │ HIPAA Audit Logging  │
                      │ - Log AI decision    │
                      │ - De-identify any    │
                      │   code snippets      │
                      │ - Timestamp event    │
                      └──────────┬────────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │  Classification      │
                      │  Result Storage      │
                      │  - Save to JSON      │
                      │  - Commit to repo    │
                      └──────────┬────────────┘
                                 │
                                 ▼
            ┌────────────────────┴────────────────────┐
            │         Multi-Channel Notification       │
            │                                          │
            │  ┌──────────┐  ┌──────────┐  ┌────────┐│
            │  │ Critical │  │ High     │  │Low/Med ││
            │  │ → Slack  │  │ → Slack  │  │→GitHub ││
            │  │ → Email  │  │ → Email  │  │  Issue ││
            │  │ → SMS*   │  │          │  │        ││
            │  └──────────┘  └──────────┘  └────────┘│
            └──────────────────────────────────────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │   Human Review       │
                      │   (if needed)        │
                      │  - Accept change     │
                      │  - Rollback          │
                      │  - Investigate       │
                      └──────────────────────┘

* SMS notifications optional for critical alerts
```

---

## Snapshot Frequency

### Current Schedule (v1.0)

```yaml
# .github/workflows/daily-snapshot.yml
on:
  schedule:
    - cron: '0 14 * * *'  # 9 AM ET (14:00 UTC)
```

**Coverage:**
- Once per day
- Captures overnight/morning changes
- Misses changes made during business hours (9 AM - 5 PM)
- Drift detected next morning (12-24 hour delay)

---

### Enhanced Schedule (v2.0)

```yaml
# .github/workflows/intelligent-snapshot.yml
on:
  schedule:
    - cron: '0 14 * * *'  # 9 AM ET (14:00 UTC) - Morning snapshot
    - cron: '0 22 * * *'  # 5 PM ET (22:00 UTC) - Evening snapshot

  # Manual trigger for testing
  workflow_dispatch:
    inputs:
      force_analysis:
        description: 'Force AI analysis even if no changes'
        required: false
        default: 'false'
```

**Coverage:**
- **Morning snapshot (9 AM ET):** Captures overnight/early morning changes
- **Evening snapshot (5 PM ET):** Captures business day changes (9 AM - 5 PM)
- **Total coverage:** Changes detected within maximum 8 hours (vs. 24 hours previously)

**Benefits:**
- Faster drift detection (8 hours vs. 24 hours)
- Captures unauthorized changes during business hours
- Reduces risk exposure time by 66%
- Aligns with business hours (9 AM - 5 PM)

---

## Gemini Integration

### API Configuration

**Model:** Gemini 1.5 Pro
- **Reason:** Superior code understanding, context window, reasoning
- **Context window:** 2M tokens (can analyze large diffs)
- **Speed:** ~2-5 seconds per classification
- **Cost:** ~$0.00125 per classification (input) + $0.005 per response

**Authentication:**
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    // Allow all content for code analysis
  ]
});
```

**Environment Variables:**
```bash
# .env (gitignored)
GEMINI_API_KEY=your_api_key_here
GOOGLE_CLOUD_PROJECT=your_project_id
```

**GitHub Actions Secrets:**
```yaml
# .github/workflows/intelligent-snapshot.yml
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  GOOGLE_CLOUD_PROJECT: ${{ secrets.GOOGLE_CLOUD_PROJECT }}
```

---

### Prompt Engineering

#### Base Classification Prompt

```javascript
const CLASSIFICATION_PROMPT = `You are a medical practice Google Apps Script code reviewer with expertise in HIPAA compliance and healthcare workflows.

Analyze the following code change and classify it:

**Sheet Name:** {SHEET_NAME}
**Changed Files:** {FILE_LIST}
**Change Summary:**
{GIT_DIFF}

**Your Task:**
1. Classify the severity of this change
2. Identify the type of change
3. Assess PHI (Protected Health Information) risk
4. Recommend an action
5. Provide clear reasoning

**Severity Levels:**
- **critical**: Major logic change, permission change, or introduces security risk
- **high**: Significant functionality change affecting patient workflows
- **medium**: Minor functionality change, formula updates, moderate impact
- **low**: Documentation, comments, formatting, no functional impact

**Change Types:**
- **documentation**: Comments, README, documentation only
- **formula**: Spreadsheet formula changes
- **logic**: Function logic, control flow, business logic
- **trigger**: Time-based or event-based triggers
- **permission**: Access control, sharing, permissions
- **ui**: User interface, menus, dialogs
- **other**: Does not fit above categories

**PHI Risk Levels:**
- **none**: No PHI exposure risk
- **low**: Change touches PHI-related code but doesn't expose it
- **medium**: Potential PHI logging or exposure if misconfigured
- **high**: Direct PHI exposure risk (logging, external API calls, etc.)

**Recommendations:**
- **accept**: Change is safe, low risk, can be auto-approved
- **review**: Change requires human review before acceptance
- **rollback**: Change is dangerous or unauthorized, recommend immediate rollback

**Response Format (JSON only, no markdown):**
{
  "severity": "low|medium|high|critical",
  "changeType": "documentation|formula|logic|trigger|permission|ui|other",
  "summary": "Brief 1-2 sentence human-readable summary of the change",
  "recommendation": "accept|review|rollback",
  "reasoning": "Detailed explanation of classification and recommendation (2-3 sentences)",
  "phiRisk": "none|low|medium|high",
  "affectedFunctions": ["function1", "function2"],
  "potentialImpact": "Description of potential impact on users/workflows",
  "securityConcerns": "Any security or compliance concerns (or 'None')"
}

**Critical Rules:**
- Be conservative: When in doubt, classify as higher severity
- HIPAA focus: Prioritize PHI protection over all else
- No false negatives: Better to over-alert than miss critical changes
- Consider context: Medical practice, patient data, regulatory compliance
`;
```

#### Example Classifications

**Example 1: Documentation Change**
```diff
- // This function sends appointment reminders
+ // This function sends appointment reminder emails to patients
+ // Runs daily at 8 AM ET via time-based trigger
```

**Expected Classification:**
```json
{
  "severity": "low",
  "changeType": "documentation",
  "summary": "Added clarifying comments to appointment reminder function",
  "recommendation": "accept",
  "reasoning": "Documentation-only change with no functional impact. Improves code clarity.",
  "phiRisk": "none",
  "affectedFunctions": [],
  "potentialImpact": "No functional impact, improved maintainability",
  "securityConcerns": "None"
}
```

---

**Example 2: Formula Change**
```diff
- =IF(A2="", "", VLOOKUP(A2, PatientData!A:B, 2, FALSE))
+ =IFERROR(VLOOKUP(A2, PatientData!A:B, 2, FALSE), "Not Found")
```

**Expected Classification:**
```json
{
  "severity": "medium",
  "changeType": "formula",
  "summary": "Added error handling to patient data lookup formula",
  "recommendation": "review",
  "reasoning": "Formula change affects how missing patient data is displayed. Should verify 'Not Found' message is acceptable for users and doesn't break downstream logic.",
  "phiRisk": "low",
  "affectedFunctions": [],
  "potentialImpact": "Users will see 'Not Found' instead of #N/A errors for missing patients",
  "securityConcerns": "None - error message does not expose PHI"
}
```

---

**Example 3: Critical Logic Change**
```diff
function sendPatientData() {
-  const data = getPatientData();
-  Logger.log('Sending data');
+  const data = getPatientData();
+  const url = 'https://external-api.com/upload';
+  UrlFetchApp.fetch(url, {
+    method: 'POST',
+    payload: JSON.stringify(data)
+  });
+  Logger.log('Data sent to external API');
   return true;
}
```

**Expected Classification:**
```json
{
  "severity": "critical",
  "changeType": "logic",
  "summary": "Added external API call sending patient data to third-party service",
  "recommendation": "rollback",
  "reasoning": "CRITICAL: This change sends patient data to an external URL without encryption, de-identification, or BAA verification. This is a HIPAA violation and potential data breach. Recommend immediate rollback and investigation.",
  "phiRisk": "high",
  "affectedFunctions": ["sendPatientData", "getPatientData"],
  "potentialImpact": "PHI exposure to unauthorized third party, HIPAA violation, potential breach notification required",
  "securityConcerns": "CRITICAL - Unencrypted PHI transmission to external service without BAA, consent, or de-identification"
}
```

---

**Example 4: Permission Change**
```diff
function onOpen() {
   const ui = SpreadsheetApp.getUi();
-  ui.createMenu('Admin Tools').addItem('View Logs', 'showLogs').addToUi();
+  ui.createMenu('Admin Tools')
+    .addItem('View Logs', 'showLogs')
+    .addItem('Export Patient List', 'exportPHI')
+    .addToUi();
}

+function exportPHI() {
+  const patients = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Patients').getDataRange().getValues();
+  const file = DriveApp.createFile('patient-export.csv', patients.join('\n'));
+  Logger.log('Exported to: ' + file.getUrl());
+}
```

**Expected Classification:**
```json
{
  "severity": "critical",
  "changeType": "permission",
  "summary": "Added menu item to export patient list to Drive, creating unencrypted PHI file",
  "recommendation": "rollback",
  "reasoning": "CRITICAL: New function exports entire patient list to Drive as plain text CSV without access controls, encryption, or audit logging. Any user with sheet access can export all PHI. HIPAA violation.",
  "phiRisk": "high",
  "affectedFunctions": ["onOpen", "exportPHI"],
  "potentialImpact": "Unauthorized PHI export, uncontrolled PHI proliferation, audit trail gaps, HIPAA breach risk",
  "securityConcerns": "CRITICAL - Unencrypted PHI export with no access controls or logging. Violates HIPAA Security Rule (164.312)"
}
```

---

### Code Implementation

#### Main Classification Function

```javascript
// scripts/classify-drift.js

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

/**
 * Classifies code drift using Gemini AI
 */
class DriftClassifier {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.1,  // Low temperature for consistent classification
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ]
    });
  }

  /**
   * Classify a single sheet change
   */
  async classifyChange(sheetName, gitDiff, changedFiles) {
    const prompt = this.buildPrompt(sheetName, gitDiff, changedFiles);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const classification = this.parseResponse(text);

      // Validate classification
      this.validateClassification(classification);

      // Add metadata
      classification.timestamp = new Date().toISOString();
      classification.sheetName = sheetName;
      classification.modelUsed = 'gemini-1.5-pro';

      return classification;

    } catch (error) {
      console.error(`Gemini classification failed for ${sheetName}:`, error);

      // Fallback to conservative classification
      return this.fallbackClassification(sheetName, error);
    }
  }

  /**
   * Build classification prompt
   */
  buildPrompt(sheetName, gitDiff, changedFiles) {
    return `You are a medical practice Google Apps Script code reviewer with expertise in HIPAA compliance and healthcare workflows.

Analyze the following code change and classify it:

**Sheet Name:** ${sheetName}
**Changed Files:** ${changedFiles.join(', ')}
**Change Summary:**
\`\`\`diff
${gitDiff}
\`\`\`

**Your Task:**
1. Classify the severity of this change
2. Identify the type of change
3. Assess PHI (Protected Health Information) risk
4. Recommend an action
5. Provide clear reasoning

**Severity Levels:**
- **critical**: Major logic change, permission change, or introduces security risk
- **high**: Significant functionality change affecting patient workflows
- **medium**: Minor functionality change, formula updates, moderate impact
- **low**: Documentation, comments, formatting, no functional impact

**Change Types:**
- **documentation**: Comments, README, documentation only
- **formula**: Spreadsheet formula changes
- **logic**: Function logic, control flow, business logic
- **trigger**: Time-based or event-based triggers
- **permission**: Access control, sharing, permissions
- **ui**: User interface, menus, dialogs
- **other**: Does not fit above categories

**PHI Risk Levels:**
- **none**: No PHI exposure risk
- **low**: Change touches PHI-related code but doesn't expose it
- **medium**: Potential PHI logging or exposure if misconfigured
- **high**: Direct PHI exposure risk (logging, external API calls, etc.)

**Recommendations:**
- **accept**: Change is safe, low risk, can be auto-approved
- **review**: Change requires human review before acceptance
- **rollback**: Change is dangerous or unauthorized, recommend immediate rollback

**Response Format (JSON only, no markdown):**
{
  "severity": "low|medium|high|critical",
  "changeType": "documentation|formula|logic|trigger|permission|ui|other",
  "summary": "Brief 1-2 sentence human-readable summary of the change",
  "recommendation": "accept|review|rollback",
  "reasoning": "Detailed explanation of classification and recommendation (2-3 sentences)",
  "phiRisk": "none|low|medium|high",
  "affectedFunctions": ["function1", "function2"],
  "potentialImpact": "Description of potential impact on users/workflows",
  "securityConcerns": "Any security or compliance concerns (or 'None')"
}

**Critical Rules:**
- Be conservative: When in doubt, classify as higher severity
- HIPAA focus: Prioritize PHI protection over all else
- No false negatives: Better to over-alert than miss critical changes
- Consider context: Medical practice, patient data, regulatory compliance
`;
  }

  /**
   * Parse Gemini response
   */
  parseResponse(text) {
    // Remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error(`Failed to parse Gemini response: ${error.message}\n\nResponse: ${text}`);
    }
  }

  /**
   * Validate classification response
   */
  validateClassification(classification) {
    const required = ['severity', 'changeType', 'summary', 'recommendation', 'reasoning', 'phiRisk'];
    const missing = required.filter(field => !classification[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Validate enums
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    const validTypes = ['documentation', 'formula', 'logic', 'trigger', 'permission', 'ui', 'other'];
    const validRecommendations = ['accept', 'review', 'rollback'];
    const validPHIRisks = ['none', 'low', 'medium', 'high'];

    if (!validSeverities.includes(classification.severity)) {
      throw new Error(`Invalid severity: ${classification.severity}`);
    }
    if (!validTypes.includes(classification.changeType)) {
      throw new Error(`Invalid changeType: ${classification.changeType}`);
    }
    if (!validRecommendations.includes(classification.recommendation)) {
      throw new Error(`Invalid recommendation: ${classification.recommendation}`);
    }
    if (!validPHIRisks.includes(classification.phiRisk)) {
      throw new Error(`Invalid phiRisk: ${classification.phiRisk}`);
    }
  }

  /**
   * Fallback classification if Gemini fails
   */
  fallbackClassification(sheetName, error) {
    return {
      severity: 'high',
      changeType: 'other',
      summary: 'AI classification failed - requires manual review',
      recommendation: 'review',
      reasoning: `Gemini AI classification failed with error: ${error.message}. Defaulting to conservative classification requiring manual review.`,
      phiRisk: 'medium',
      affectedFunctions: [],
      potentialImpact: 'Unknown - AI analysis unavailable',
      securityConcerns: 'Unknown - requires manual review',
      timestamp: new Date().toISOString(),
      sheetName: sheetName,
      modelUsed: 'fallback',
      error: error.message
    };
  }

  /**
   * Batch classify multiple changes
   */
  async classifyBatch(changes) {
    const classifications = [];

    for (const change of changes) {
      const classification = await this.classifyChange(
        change.sheetName,
        change.gitDiff,
        change.changedFiles
      );

      classifications.push(classification);

      // Rate limiting: 60 requests per minute
      await this.sleep(1000);
    }

    return classifications;
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default DriftClassifier;
```

---

## Classification System

### Severity Matrix

| Severity | Description | PHI Risk | Auto-Action | Alert Channel |
|----------|-------------|----------|-------------|---------------|
| **Critical** | Major security/compliance issue | High | None - Manual review required | Slack + Email + SMS |
| **High** | Significant functional change | Medium/High | None - Manual review required | Slack + Email |
| **Medium** | Moderate change, potential impact | Low/Medium | None - Create GitHub issue | GitHub Issue |
| **Low** | Minor change, no functional impact | None/Low | Auto-accept (optional) | GitHub Issue (summary only) |

---

### Change Type Categories

| Type | Examples | Typical Severity | Common Recommendations |
|------|----------|------------------|------------------------|
| **documentation** | Comments, README, docs | Low | Accept |
| **formula** | Spreadsheet formulas | Low-Medium | Review if PHI-related |
| **logic** | Function code, control flow | Medium-Critical | Review or rollback |
| **trigger** | Time-based, event triggers | High-Critical | Always review |
| **permission** | Access control, sharing | Critical | Always review |
| **ui** | Menus, dialogs, UI elements | Low-Medium | Review if exposes PHI |
| **other** | Miscellaneous | Medium | Review |

---

### Recommendation Actions

| Recommendation | Meaning | Automated Action | Human Follow-up |
|----------------|---------|------------------|-----------------|
| **accept** | Safe, low-risk change | Auto-merge to main (optional) | None required |
| **review** | Requires human judgment | Create GitHub issue, notify team | Review within 24 hours |
| **rollback** | Dangerous, unauthorized | Create critical alert, suggest rollback command | Immediate action required |

---

## Notification System

### Multi-Channel Alert Routing

```javascript
// scripts/notify-drift.js

class DriftNotifier {
  constructor(config) {
    this.slackWebhook = config.slackWebhook;
    this.emailConfig = config.emailConfig;
    this.smsConfig = config.smsConfig; // Optional
  }

  /**
   * Route notification based on severity
   */
  async notify(classification) {
    const { severity, sheetName, summary, recommendation } = classification;

    switch (severity) {
      case 'critical':
        await this.sendCriticalAlert(classification);
        break;

      case 'high':
        await this.sendHighAlert(classification);
        break;

      case 'medium':
        await this.sendMediumAlert(classification);
        break;

      case 'low':
        await this.sendLowAlert(classification);
        break;
    }
  }

  /**
   * Critical alerts: Slack + Email + SMS (optional)
   */
  async sendCriticalAlert(classification) {
    const { sheetName, summary, reasoning, recommendation, phiRisk } = classification;

    // Slack notification
    await this.sendSlack({
      channel: '#production-alerts',
      text: `🚨 CRITICAL: Code change detected in ${sheetName}`,
      attachments: [{
        color: 'danger',
        title: summary,
        fields: [
          { title: 'Severity', value: 'CRITICAL', short: true },
          { title: 'PHI Risk', value: phiRisk.toUpperCase(), short: true },
          { title: 'Recommendation', value: recommendation.toUpperCase(), short: true },
          { title: 'Reasoning', value: reasoning, short: false },
        ],
        actions: [
          {
            type: 'button',
            text: 'View Diff',
            url: this.getGitHubDiffUrl(classification)
          },
          {
            type: 'button',
            text: 'Rollback',
            url: this.getRollbackUrl(sheetName),
            style: 'danger'
          }
        ]
      }]
    });

    // Email notification
    await this.sendEmail({
      to: this.emailConfig.criticalRecipients,
      subject: `🚨 CRITICAL: Unauthorized code change in ${sheetName}`,
      html: this.buildEmailTemplate(classification, 'critical')
    });

    // SMS notification (optional)
    if (this.smsConfig?.enabled) {
      await this.sendSMS({
        to: this.smsConfig.criticalNumbers,
        message: `CRITICAL: Code change in ${sheetName}. Recommendation: ${recommendation}. Check Slack for details.`
      });
    }
  }

  /**
   * High alerts: Slack + Email
   */
  async sendHighAlert(classification) {
    // Similar to critical, but no SMS
    // ... implementation
  }

  /**
   * Medium alerts: GitHub Issue only
   */
  async sendMediumAlert(classification) {
    await this.createGitHubIssue(classification, 'medium');
  }

  /**
   * Low alerts: GitHub Issue (summary only)
   */
  async sendLowAlert(classification) {
    // Create issue with lower priority
    await this.createGitHubIssue(classification, 'low');
  }

  /**
   * Create GitHub issue for tracking
   */
  async createGitHubIssue(classification, severity) {
    const { sheetName, summary, reasoning, recommendation, phiRisk, changeType } = classification;

    const labels = [
      'drift-detection',
      `severity-${severity}`,
      `type-${changeType}`,
      `phi-risk-${phiRisk}`
    ];

    if (recommendation === 'rollback') {
      labels.push('requires-rollback');
    }

    const issue = {
      title: `[${severity.toUpperCase()}] Code drift detected: ${sheetName}`,
      body: `
## Change Summary

${summary}

## Details

- **Sheet:** ${sheetName}
- **Severity:** ${severity}
- **Change Type:** ${changeType}
- **PHI Risk:** ${phiRisk}
- **Recommendation:** ${recommendation}

## AI Analysis

${reasoning}

## Security Concerns

${classification.securityConcerns || 'None identified'}

## Potential Impact

${classification.potentialImpact || 'Not specified'}

## Affected Functions

${classification.affectedFunctions?.join(', ') || 'None specified'}

## Next Steps

${ recommendation === 'accept' ? '- Review and close issue if change is expected' : '' }
${ recommendation === 'review' ? '- Review code change\\n- Verify authorization\\n- Accept or rollback' : '' }
${ recommendation === 'rollback' ? '- **IMMEDIATE ACTION REQUIRED**\\n- Rollback change: \`./scripts/rollback.sh "${sheetName}"\`\\n- Investigate who made unauthorized change\\n- Review access controls' : '' }

---

*Generated by Gemini AI Drift Detection*
*Snapshot Time: ${classification.timestamp}*
      `,
      labels: labels,
      assignees: severity === 'critical' || severity === 'high' ? this.getOnCallEngineers() : []
    };

    // Create issue via GitHub API
    // ... implementation
  }
}
```

---

## HIPAA Compliance

### Audit Logging

All AI classifications must be logged for HIPAA compliance.

**Audit Log Structure:**
```json
{
  "timestamp": "2025-11-08T14:05:23Z",
  "event": "drift-classification",
  "sheetName": "D25-264_Prior_Auth_V3",
  "classification": {
    "severity": "medium",
    "changeType": "formula",
    "recommendation": "review",
    "phiRisk": "low"
  },
  "modelUsed": "gemini-1.5-pro",
  "modelVersion": "1.5-pro-001",
  "prompt": "[REDACTED - contains code snippets]",
  "response": "[REDACTED - contains code snippets]",
  "user": "automation@ssdsbc.com",
  "actionTaken": "github-issue-created",
  "issueNumber": 123
}
```

**Audit Log Implementation:**
```javascript
// scripts/audit-logger.js

class HIPAAAuditLogger {
  constructor(logPath) {
    this.logPath = logPath;
  }

  /**
   * Log AI classification event
   */
  async logClassification(classification, prompt, response) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      event: 'drift-classification',
      sheetName: classification.sheetName,
      classification: {
        severity: classification.severity,
        changeType: classification.changeType,
        recommendation: classification.recommendation,
        phiRisk: classification.phiRisk
      },
      modelUsed: classification.modelUsed,
      modelVersion: 'gemini-1.5-pro',
      prompt: this.redactPHI(prompt), // De-identify any PHI in prompt
      response: this.redactPHI(response), // De-identify any PHI in response
      user: process.env.USER || 'automation@ssdsbc.com',
      actionTaken: null, // Filled in later
      issueNumber: null // Filled in later
    };

    // Append to audit log (append-only)
    await fs.promises.appendFile(
      this.logPath,
      JSON.stringify(auditEntry) + '\\n'
    );

    return auditEntry;
  }

  /**
   * De-identify PHI from text using Safe Harbor method
   */
  redactPHI(text) {
    // Use PHI Guard utilities (from Goal 2.5)
    // Remove 18 HIPAA identifiers
    // For code snippets, we can be less aggressive since they're pseudocode

    // At minimum, redact:
    // - Names (replace with [NAME])
    // - Dates (replace with [DATE])
    // - Phone numbers (replace with [PHONE])
    // - Email addresses (replace with [EMAIL])

    let redacted = text;

    // Email addresses
    redacted = redacted.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');

    // Phone numbers
    redacted = redacted.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');

    // Dates (MM/DD/YYYY, MM-DD-YYYY, etc.)
    redacted = redacted.replace(/\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g, '[DATE]');

    // SSN-like patterns
    redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');

    return redacted;
  }
}
```

---

## Implementation Plan

### Phase 1: Core Infrastructure (Week 6, Day 1-2)

**Time:** 8 hours

- [ ] Create new GitHub Actions workflow file
  ```bash
  .github/workflows/intelligent-snapshot.yml
  ```

- [ ] Install Gemini SDK
  ```bash
  npm install @google/generative-ai --save
  ```

- [ ] Implement DriftClassifier class
  ```bash
  scripts/classify-drift.js
  ```

- [ ] Implement HIPAAAuditLogger class
  ```bash
  scripts/audit-logger.js
  ```

- [ ] Add GEMINI_API_KEY to GitHub Actions secrets

- [ ] Test classification locally with sample diffs
  ```bash
  node scripts/test-classification.js
  ```

**Success Criteria:**
- DriftClassifier can classify sample code changes
- Audit logging works locally
- No errors when running classification

---

### Phase 2: Notification System (Week 6, Day 3)

**Time:** 4 hours

- [ ] Implement DriftNotifier class
  ```bash
  scripts/notify-drift.js
  ```

- [ ] Configure Slack webhook
  ```bash
  # Add SLACK_WEBHOOK to GitHub secrets
  ```

- [ ] Configure email (GitHub Actions email or SMTP)

- [ ] Test notifications locally
  ```bash
  node scripts/test-notifications.js
  ```

- [ ] Create test GitHub issue

**Success Criteria:**
- Can send Slack message
- Can send email
- Can create GitHub issue

---

### Phase 3: GitHub Actions Integration (Week 6, Day 4)

**Time:** 6 hours

- [ ] Update workflow file with classification step
- [ ] Add notification step
- [ ] Add audit logging step
- [ ] Configure cron schedule (9 AM + 5 PM ET)
- [ ] Test manual workflow trigger
- [ ] Test with sample code change

**Success Criteria:**
- Workflow runs successfully on manual trigger
- Classification works in GitHub Actions
- Notifications sent correctly
- Audit log committed to repository

---

### Phase 4: Testing and Validation (Week 6, Day 5)

**Time:** 6 hours

- [ ] Create 10 test scenarios (low/medium/high/critical)
- [ ] Run classification on each scenario
- [ ] Verify correct severity assignments
- [ ] Verify correct PHI risk assessments
- [ ] Verify notifications route correctly
- [ ] Verify audit logging completeness
- [ ] Performance testing (time per classification)

**Success Criteria:**
- 90%+ classification accuracy on test scenarios
- All test cases logged to audit trail
- Notifications delivered within 2 minutes
- Average classification time < 5 seconds

---

## Testing Strategy

### Unit Tests

```javascript
// tests/classify-drift.test.js

describe('DriftClassifier', () => {
  let classifier;

  beforeEach(() => {
    classifier = new DriftClassifier(process.env.GEMINI_API_KEY);
  });

  test('classifies documentation change as low severity', async () => {
    const diff = `
- // Send reminders
+ // Send appointment reminder emails
    `;

    const result = await classifier.classifyChange('TestSheet', diff, ['Code.gs']);

    expect(result.severity).toBe('low');
    expect(result.changeType).toBe('documentation');
    expect(result.recommendation).toBe('accept');
  });

  test('classifies PHI export as critical', async () => {
    const diff = `
+function exportPHI() {
+  const data = getPatientData();
+  DriveApp.createFile('export.csv', JSON.stringify(data));
+}
    `;

    const result = await classifier.classifyChange('TestSheet', diff, ['Code.gs']);

    expect(result.severity).toBe('critical');
    expect(result.phiRisk).toBe('high');
    expect(result.recommendation).toBe('rollback');
  });
});
```

---

### Integration Tests

```javascript
// tests/snapshot-workflow.test.js

describe('Enhanced Snapshot Workflow', () => {
  test('end-to-end workflow with classification', async () => {
    // 1. Create test code change
    // 2. Run snapshot
    // 3. Detect drift
    // 4. Classify with Gemini
    // 5. Send notification
    // 6. Verify audit log
    // 7. Verify GitHub issue created
  });
});
```

---

## Deployment

### Rollout Plan

**Week 6:**
- Deploy enhanced snapshot system alongside existing system
- Run in parallel for 1 week
- Compare results
- Tune classification prompts

**Week 7:**
- Switch primary alerting to enhanced system
- Keep old system as backup
- Monitor for false positives/negatives

**Week 8:**
- Deprecate old snapshot system
- Enhanced system becomes primary
- Document lessons learned

---

## Monitoring and Maintenance

### Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Classification accuracy | > 90% | < 80% |
| False positives (critical) | < 5% | > 10% |
| False negatives (critical) | 0% | > 0% |
| Average classification time | < 5 seconds | > 10 seconds |
| Gemini API cost per day | < $2 | > $5 |
| Notification delivery time | < 2 minutes | > 5 minutes |

---

### Maintenance Tasks

**Daily:**
- Review critical/high severity classifications
- Verify scheduled snapshots ran successfully
- Check Gemini API quota usage

**Weekly:**
- Review classification accuracy metrics
- Tune prompts if needed
- Review false positive/negative rates

**Monthly:**
- Audit log review (HIPAA compliance)
- Cost analysis (Gemini API usage)
- Prompt engineering improvements
- Update classification examples

---

## Appendix

### A. Example GitHub Actions Workflow

```yaml
# .github/workflows/intelligent-snapshot.yml
name: Intelligent Production Snapshot

on:
  schedule:
    - cron: '0 14 * * *'  # 9 AM ET
    - cron: '0 22 * * *'  # 5 PM ET
  workflow_dispatch:
    inputs:
      force_analysis:
        description: 'Force AI analysis even if no changes'
        required: false
        default: 'false'

jobs:
  snapshot-and-classify:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full history for diffs

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Authenticate clasp
        run: |
          echo '${{ secrets.CLASP_TOKEN }}' > ~/.clasprc.json
          npx @google/clasp login --creds ~/.clasprc.json

      - name: Run snapshot
        run: |
          node scripts/snapshot-production-state.js
        env:
          FORCE_ANALYSIS: ${{ github.event.inputs.force_analysis }}

      - name: Detect changes
        id: changes
        run: |
          if git diff --quiet HEAD~1 HEAD -- snapshots/; then
            echo "has_changes=false" >> $GITHUB_OUTPUT
          else
            echo "has_changes=true" >> $GITHUB_OUTPUT
          fi

      - name: Classify changes with Gemini
        if: steps.changes.outputs.has_changes == 'true'
        run: |
          node scripts/classify-drift.js
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

      - name: Send notifications
        if: steps.changes.outputs.has_changes == 'true'
        run: |
          node scripts/notify-drift.js
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SMTP_HOST: ${{ secrets.SMTP_HOST }}
          SMTP_USER: ${{ secrets.SMTP_USER }}
          SMTP_PASS: ${{ secrets.SMTP_PASS }}

      - name: Commit audit logs
        if: steps.changes.outputs.has_changes == 'true'
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add audit-logs/
          git add snapshots/
          git commit -m "Automated snapshot: $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
          git push
```

---

### B. Cost Analysis

**Gemini API Pricing:**
- Input: $0.00125 per 1K tokens
- Output: $0.005 per 1K tokens

**Estimated Usage:**
- Average diff size: ~500 tokens (input)
- Average response: ~300 tokens (output)
- Changes per snapshot: ~10 sheets (average)
- Snapshots per day: 2 (9 AM + 5 PM)

**Daily Cost:**
```
Input:  10 sheets × 0.5K tokens × $0.00125 = $0.00625
Output: 10 sheets × 0.3K tokens × $0.005   = $0.015
Total per snapshot: $0.02125
Total per day: $0.02125 × 2 = $0.04250
```

**Monthly Cost:** ~$1.28
**Annual Cost:** ~$15.53

**Extremely cost-effective for the value provided.**

---

### C. Security Considerations

1. **API Key Protection:**
   - Store in GitHub Secrets (encrypted at rest)
   - Never log API key
   - Rotate every 90 days

2. **PHI Handling:**
   - De-identify code snippets before logging
   - Redact PHI from audit logs
   - Use Safe Harbor method (18 identifiers)

3. **Access Control:**
   - GitHub repository: Private
   - Audit logs: Append-only
   - Secrets: Limited to workflow

4. **Audit Trail:**
   - All classifications logged
   - Logs committed to Git (immutable)
   - 7-year retention for HIPAA compliance

---

**Document Status:** Complete - Ready for implementation
**Created:** 2025-11-08
**Owner:** Marvin Maruthur
**Next Review:** After Phase 1 implementation
