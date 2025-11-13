---
type: guide
tags: [claude-code, automation, workflow, prompt-queue]
---

# Claude Code Automation Queue Workflow

**Purpose:** Guide for processing automated prompts from Google Sheets in Claude Code

## Quick Start

When you open Claude Code, simply say:

```
"Check automation queue"
```

Claude will check for new prompts and execute them.

---

## Detailed Workflow

### Step 1: Check for New Prompts

**Command:**
```
Check the automation/prompt-queue/pending/ directory for new prompts.
List all pending prompts with their IDs, priorities, and descriptions.
```

**Expected Response:**
Claude Code will read all `.json` files in the `pending/` directory and show you:
```
Found 3 automation prompts:

1. [HIGH] prompt-abc123.json
   Type: alert
   Created: 2025-11-13 09:15:23
   Prompt: "URGENT: Review critical value entry..."

2. [NORMAL] prompt-def456.json
   Type: daily-summary
   Created: 2025-11-13 09:00:00
   Prompt: "Generate summary of yesterday's biopsy cases..."

3. [NORMAL] prompt-ghi789.json
   Type: analysis
   Created: 2025-11-13 10:00:00
   Prompt: "Review billing errors from the past 24 hours..."

Would you like me to execute them?
```

### Step 2: Execute Prompts

**Option A: Execute All**
```
Yes, execute all pending prompts in priority order (HIGH → NORMAL → LOW)
```

**Option B: Execute Specific**
```
Execute only prompt-abc123.json (the urgent one)
```

**Option C: Review First**
```
Show me the full details of prompt-abc123.json before executing
```

### Step 3: Processing Flow

For each prompt, Claude Code will:

1. **Move to processing/**
   ```bash
   mv automation/prompt-queue/pending/prompt-abc123.json \
      automation/prompt-queue/processing/
   ```

2. **Execute the prompt**
   - Read the prompt text
   - Use context from the JSON file
   - Perform the requested task
   - Generate output (reports, summaries, etc.)

3. **Write response**
   ```json
   {
     "promptId": "abc123",
     "executed": "2025-11-13T09:16:45.000Z",
     "status": "completed",
     "result": {
       "summary": "Critical value review completed. Case requires immediate physician notification.",
       "outputLocation": "reports/urgent-case-abc123.md",
       "actions": [
         "Created urgent case report",
         "Updated priority dashboard",
         "Flagged for physician review"
       ]
     },
     "duration": "23 seconds",
     "tokensUsed": 1456
   }
   ```

4. **Move to completed/ and write response/**
   ```bash
   mv automation/prompt-queue/processing/prompt-abc123.json \
      automation/prompt-queue/completed/

   # Write response for Apps Script to read
   cat > automation/prompt-queue/responses/response-abc123.json
   ```

---

## Example Workflows

### Example 1: Daily Biopsy Summary

**Prompt received:**
```json
{
  "id": "daily-biopsy-20251113",
  "prompt": "Generate summary of yesterday's biopsy cases. Identify urgent cases and create markdown report.",
  "context": {
    "type": "daily-summary",
    "dataSource": "biopsy-log-sheet",
    "outputLocation": "reports/daily-biopsy-summary.md"
  }
}
```

**Claude Code execution:**
```
User: "Execute the daily biopsy summary prompt"

Claude: "I'll generate the daily biopsy summary. Let me:
1. Review yesterday's date (2025-11-12)
2. Create summary report with urgent cases
3. Write to reports/daily-biopsy-summary-2025-11-12.md

Executing...

✅ Report created: reports/daily-biopsy-summary-2025-11-12.md

Summary:
- Total cases: 15
- Urgent cases: 2 (flagged for immediate review)
- Normal processing: 13

Response written to automation/prompt-queue/responses/ for Google Sheets to retrieve.
```

### Example 2: Urgent Alert Processing

**Prompt received:**
```json
{
  "id": "urgent-case-789",
  "priority": "urgent",
  "prompt": "URGENT: Case #789 marked urgent. Review and suggest next steps immediately.",
  "context": {
    "type": "alert",
    "caseId": "789",
    "triggeredBy": "onEdit"
  }
}
```

**Claude Code execution:**
```
User: "Check queue"

Claude: "🚨 URGENT PROMPT DETECTED

Priority: URGENT
Case: #789
Triggered: onEdit event in Google Sheets

Prompt: Review case #789 and suggest next steps

Would you like me to process this immediately?

User: "Yes, process immediately"

Claude: "Processing urgent case #789...

1. Case review: [Details based on available data]
2. Recommended actions:
   - Immediate physician notification
   - Schedule follow-up within 24 hours
   - Update patient record with alert flag

✅ Urgent response created and queued for Google Sheets
```

### Example 3: Weekly Analysis

**Prompt received:**
```json
{
  "id": "weekly-volume-w47",
  "prompt": "Analyze patient volume trends for past week. Create forecast and staffing recommendations.",
  "context": {
    "type": "weekly-analysis",
    "dateRange": "last-7-days"
  }
}
```

**Claude Code execution:**
```
User: "Process weekly volume analysis"

Claude: "Executing weekly patient volume analysis...

Analyzing data for: 2025-11-06 to 2025-11-12

Tasks:
1. Calculate daily patient volumes ✓
2. Compare to previous weeks ✓
3. Generate staffing forecast ✓
4. Create visualization recommendations ✓

Report created: reports/weekly-volume-2025-w47.md

Key findings:
- 15% increase in volume vs. previous week
- Peak day: Thursday (32 patients)
- Staffing recommendation: Add 1 provider on Thursdays

Response queued for Google Sheets.
```

---

## Manual Commands

### Check Queue Status
```
Show me the status of the automation queue:
- How many pending prompts?
- How many in processing?
- How many completed today?
```

### Process Single Prompt
```
Read and execute automation/prompt-queue/pending/prompt-[ID].json
```

### Clear Completed Queue
```
Archive all completed prompts older than 7 days
```

### Emergency Stop
```
Move all processing prompts back to pending (if something goes wrong)
```

---

## Integration with Task-Executor MCP

For complex prompts that require multiple steps, Claude Code can automatically create task-executor workflows:

**Prompt:**
```json
{
  "prompt": "Complete end-of-week report generation",
  "context": {
    "requiresWorkflow": true,
    "tasks": [
      "Compile patient volume statistics",
      "Generate billing summary",
      "Create staffing recommendations",
      "Produce executive dashboard"
    ]
  }
}
```

**Claude Code can:**
1. Read the prompt
2. Create task-executor workflow automatically
3. Execute workflow with validation
4. Return comprehensive response

---

## Response Format Details

### Success Response
```json
{
  "promptId": "abc123",
  "executed": "2025-11-13T09:16:45.000Z",
  "status": "completed",
  "result": {
    "summary": "Task completed successfully",
    "outputLocation": "path/to/output.md",
    "actions": ["Action 1", "Action 2"],
    "metrics": {
      "itemsProcessed": 15,
      "errorsFound": 0,
      "recommendations": 3
    }
  },
  "duration": "23 seconds",
  "tokensUsed": 1456
}
```

### Error Response
```json
{
  "promptId": "abc123",
  "executed": "2025-11-13T09:16:45.000Z",
  "status": "error",
  "error": {
    "message": "Data source not found",
    "details": "Sheet ID 'biopsy-log' not accessible",
    "recoverable": false
  },
  "duration": "5 seconds"
}
```

### Partial Success Response
```json
{
  "promptId": "abc123",
  "executed": "2025-11-13T09:16:45.000Z",
  "status": "partial",
  "result": {
    "summary": "Completed 2 of 3 tasks",
    "completed": ["Task 1", "Task 2"],
    "failed": ["Task 3"]
  },
  "warnings": [
    "Could not access external data source for Task 3"
  ],
  "duration": "45 seconds"
}
```

---

## Best Practices

### 1. Regular Queue Checks
- Check queue at start of each Claude Code session
- Set up routine: "Check automation queue" as first command

### 2. Priority Handling
- Process URGENT prompts immediately
- Batch process NORMAL prompts
- Schedule LOW priority during off-hours

### 3. Error Handling
- If prompt fails, write detailed error response
- Move failed prompts to `completed/` with error status
- Log errors to workspace-brain for learning

### 4. Context Preservation
- Keep original prompt file for audit trail
- Include execution timestamp in responses
- Log to workspace-brain for analytics

### 5. Output Organization
- Follow suggested output locations from context
- Use consistent file naming (date-based)
- Update relevant dashboards automatically

---

## Troubleshooting

### Prompt Not Appearing
1. Check Google Drive sync status
2. Verify folder path: `automation/prompt-queue/pending/`
3. Check file permissions
4. Look for `.json` file extension

### Execution Fails
1. Check prompt JSON format (valid JSON?)
2. Verify context data is accessible
3. Check for PHI in prompt (blocked?)
4. Review error in processing log

### Response Not Received in Sheets
1. Verify response written to `responses/` directory
2. Check Google Drive sync (both directions)
3. Confirm Apps Script trigger is running
4. Check response JSON format

---

## Automation Tips

### Scheduled Routine
Create a daily routine:

**9:00 AM:**
```
Check automation queue
Execute all daily summary prompts
Review urgent alerts
```

**12:00 PM:**
```
Check queue for new prompts
Process analysis requests
```

**5:00 PM:**
```
Execute end-of-day reports
Archive completed prompts
```

### Batch Processing
```
Execute all pending prompts with priority >= NORMAL
Skip LOW priority for now
```

### Smart Filtering
```
Show me only prompts of type 'analysis' created today
Execute them as a batch
```

---

**Quick Reference:**
- Check queue: "Check automation queue"
- Execute all: "Execute all pending prompts"
- Execute one: "Execute prompt [ID]"
- Check status: "Show queue status"
- Archive old: "Archive completed prompts older than 7 days"

---

**Created:** 2025-11-13
**Status:** Active
**Integration:** Google Sheets → Claude Code
