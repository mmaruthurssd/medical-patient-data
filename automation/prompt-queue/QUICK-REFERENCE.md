---
type: reference
tags: [quick-reference, automation, commands]
---

# Quick Reference: Google Sheets → Claude Code Automation

## For Claude Code Users

### Check for New Prompts
```
Check automation queue
```

### Execute All Pending
```
Execute all pending prompts
```

### Execute One Prompt
```
Execute prompt-[ID].json
```

### Show Queue Status
```
Show automation queue status
```

### Archive Old Prompts
```
Archive completed prompts older than 7 days
```

---

## For Google Sheets Apps Script

### Send a Prompt
```javascript
sendPromptToClaude("Your prompt here", {
  type: 'analysis',
  priority: 'normal',
  context: { dataSource: 'sheet-name' }
});
```

### Check for Responses
```javascript
const responses = checkClaudeResponses();
```

### Create Daily Trigger
```javascript
ScriptApp.newTrigger('myFunction')
  .timeBased()
  .atHour(9)
  .everyDays(1)
  .create();
```

---

## Directory Structure

```
automation/prompt-queue/
├── pending/          ← New prompts (Google Sheets writes here)
├── processing/       ← Currently executing
├── completed/        ← Finished prompts
├── responses/        ← Responses for Google Sheets to read
└── archive/          ← Old prompts (30+ days)
```

---

## Common Commands

| Task | Command in Claude Code |
|------|----------------------|
| Check queue | "Check automation queue" |
| Execute all | "Execute all pending prompts" |
| Execute priority | "Execute HIGH priority prompts only" |
| Show status | "Show queue status" |
| Archive old | "Archive completed prompts older than 7 days" |

---

## Prompt Priority Levels

- **URGENT** - Process immediately
- **HIGH** - Process within 1 hour
- **NORMAL** - Process when convenient
- **LOW** - Process during off-hours

---

## File Naming

- **Prompts:** `prompt-[uuid].json`
- **Responses:** `response-[uuid].json`

---

## Troubleshooting Quick Fixes

**Prompt not showing up?**
```bash
# Check Google Drive sync
ls -la automation/prompt-queue/pending/
```

**Response not in Sheets?**
```bash
# Check if response file created
ls -la automation/prompt-queue/responses/
```

**Claude not finding prompts?**
```
# In Claude Code:
"List all files in automation/prompt-queue/pending/"
```

---

## Daily Workflow

**Morning:**
1. Open Claude Code
2. "Check automation queue"
3. Execute overnight prompts

**Throughout day:**
- Prompts queue automatically
- Check periodically

**End of day:**
1. "Check automation queue"
2. Process remaining
3. "Archive old prompts"

---

**Full Docs:** See `SETUP-GUIDE.md` and `CLAUDE-CODE-WORKFLOW.md`
