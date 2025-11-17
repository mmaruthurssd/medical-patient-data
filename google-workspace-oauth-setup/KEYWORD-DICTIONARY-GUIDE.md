# Keyword Dictionary Guide

## Overview

The `keyword-dictionary.json` file provides structured keywords and patterns to improve AI task extraction quality by:
1. **Filtering out low-value tasks** (automated notifications, spam)
2. **Classifying tasks** into appropriate categories
3. **Identifying priority levels** based on context
4. **Extracting task owners** from descriptions
5. **Parsing due dates** from natural language

## Current Implementation (v1.0)

### 1. Exclusion Patterns

**Purpose**: Filter out tasks that shouldn't be extracted

**Current Patterns**:
- ✅ Google review notifications - `"Reply to new Google review"`
- ✅ Klara message notifications - `"View new Klara message"`
- ✅ Daily report notifications - `"Read SkinDx Daily Biopsy Report"`
- ✅ Recurring automated tickets - `"Monitor monthly network service"`
- ✅ Low-value prompts - `"Log in to OncoLens account"`, `"Check Skool calendar for call time"`

**Example from Testing**:
From the previous 6-transcript run, we extracted 98 tasks. Many were low-value:
- "Reply to Andrea's Google review" (appeared 4 times for different staff)
- "View new Klara message" (appeared 18 times!)
- "Read SkinDx Daily Biopsy Report" (appeared 3 times)

**Recommendation**: In the next iteration, update the extraction prompt to:
```javascript
// Before extracting tasks, check against exclusion patterns:
if (taskMatchesExclusionPattern(task, exclusionPatterns)) {
  task.confidence_score = 0.0;
  task.category = "Automated Notification";
  // Or skip entirely
}
```

### 2. Category Keywords

**Purpose**: Help AI classify tasks into the right category

**Categories Defined**:
1. **Clinical/Patient Care** - patient, prior authorization, prescription, referral, consent
2. **Administrative** - payroll, invoice, PTO, scheduling, billing, hiring
3. **Technology/Systems** - server, MCP, API, backup, deployment, infrastructure
4. **Training/Education** - webinar, certification, onboarding
5. **Communication/Follow-up** - email, call, meeting, notify, coordinate
6. **Research/Analysis** - audit, investigate, analyze, report
7. **Compliance/Legal** - BAA, HIPAA, PHI, security, policy, agreement

**Testing Results** (from 2 meetings, 31 tasks):
- ✅ "Administrative" correctly identified for "Draft clawback language for agreement"
- Need to test: Medical-specific tasks, IT tasks, compliance tasks

### 3. Priority Indicators

**Purpose**: Identify high/medium/low priority based on urgency keywords

**High Priority Keywords**:
- urgent, ASAP, critical, today, deadline, blocked, failing
- Patterns: "due today", "patient waiting", "system down"

**Medium Priority Keywords**:
- this week, by Friday, soon, scheduled, routine

**Low Priority Keywords**:
- eventually, when possible, future, someday, explore

**Testing Recommendations**:
- Compare AI-assigned priority with keyword-based priority
- If mismatch > 30%, adjust prompt to use keyword hints

### 4. Ownership Patterns

**Purpose**: Extract task owner from description text

**Patterns Defined**:
- `"[Name] needs to"` → Sarah needs to follow up
- `"[Name] will"` → Chris will send document
- `"assigned to [Name]"` → assigned to Mario Maruthur
- `"([Name])"` → Update system (Luigi)

**Testing Results**:
- ✅ Correctly identified: "Chris Thompson" from "Chris needs to draft..."
- Need to test: Complex multi-person assignments, team assignments

### 5. Due Date Patterns

**Purpose**: Extract specific dates from natural language

**Patterns**:
- "due today", "due this week"
- "by Friday", "by end of day", "by 11/20"
- "deadline: November 30"
- Date formats: 11/20/2025, 12/1/25

**Current Limitation**:
From testing, most tasks show "No deadline specified" even when dates mentioned in text.

**Recommendation**: Enhance prompt to specifically look for these patterns.

## How to Use the Dictionary

### Option 1: Enhanced AI Prompt (Recommended)

Modify the extraction prompt to include keyword hints:

```javascript
const EXTRACTION_PROMPT = `You are an AI assistant that extracts action items from transcripts.

EXCLUSION PATTERNS:
Do not extract tasks that match these patterns:
- "View new Klara message" (automated notification)
- "Reply to Google review" (automated notification)
- "Read [X] Daily Report" (automated notification)
- "Monitor monthly network service" (recurring automated ticket)

If a task matches an exclusion pattern, either skip it or set confidence_score to 0.0.

CATEGORY KEYWORDS:
Use these keywords to classify tasks:
- Clinical/Patient Care: patient, prior authorization, prescription, referral
- Administrative: payroll, invoice, PTO, scheduling, billing
- Technology/Systems: server, API, deployment, infrastructure
- [etc...]

PRIORITY INDICATORS:
- High: urgent, ASAP, today, critical, blocked, patient waiting
- Medium: this week, by Friday, scheduled
- Low: eventually, when possible, someday

OWNERSHIP PATTERNS:
Look for: "[Name] needs to", "[Name] will", "assigned to [Name]"

... [rest of prompt]
`;
```

### Option 2: Post-Processing Filter

Apply filters after AI extraction:

```javascript
async function filterExtractedTasks(tasks, keywords) {
  return tasks.filter(task => {
    // Check exclusion patterns
    for (const pattern of keywords.exclusionPatterns.keywords) {
      if (taskMatchesPattern(task.task_summary, pattern.pattern)) {
        console.log(`   ⚠️  Filtered out: ${task.task_summary} (${pattern.reason})`);
        return false; // Exclude this task
      }
    }
    return true; // Keep this task
  });
}
```

### Option 3: Hybrid Approach (Best)

1. **Pre-processing**: Include exclusion hints in AI prompt
2. **AI extraction**: Let AI do the heavy lifting
3. **Post-processing**: Apply keyword-based validation and enhancement

## Testing Plan

### Iteration 1 (Current)
- ✅ Extract from 2 meetings without keyword filtering
- ✅ Document keyword patterns from results
- ✅ Create keyword dictionary v1.0

### Iteration 2 (Next)
1. Update extraction prompt with exclusion patterns
2. Re-run on same 2 meetings
3. Compare results: How many low-value tasks filtered?
4. Target: Reduce from 31 tasks to ~15-20 high-quality tasks

### Iteration 3
1. Add category keyword hints to prompt
2. Test category classification accuracy
3. Compare AI categories with keyword-based suggestions

### Iteration 4
1. Test priority indicators
2. Test ownership pattern extraction
3. Test due date parsing

## Examples from Testing

### Low-Value Tasks That Should Be Filtered

From previous 6-transcript extraction (98 tasks):

```json
{
  "task_summary": "View new Klara message (Khenriquez)",
  "category": "Communication/Follow-up",
  "confidence_score": 1,
  "SHOULD_BE_FILTERED": true,
  "REASON": "Automated notification, not actionable task"
}
```

**Impact**: 18 out of 39 tasks from one email were "View new Klara message" variations.

### High-Quality Tasks That Should Be Kept

```json
{
  "task_summary": "Draft clawback language for agreement",
  "category": "Administrative",
  "priority": "High",
  "owner_assigned_to": "Chris Thompson",
  "confidence_score": 0.95,
  "SHOULD_BE_KEPT": true,
  "REASON": "Clear action, specific owner, meaningful work"
}
```

## Customization

The dictionary is designed to be easily customizable:

1. **Add new exclusion patterns** for your domain
2. **Add medical-specific keywords** for category classification
3. **Add team member names** to ownership patterns
4. **Add project names** to project identifiers

Example:

```json
{
  "exclusionPatterns": {
    "keywords": [
      {
        "pattern": "your-specific-automated-notification",
        "reason": "Explain why this shouldn't be a task",
        "examples": ["Real examples from your transcripts"]
      }
    ]
  }
}
```

## Next Steps

1. **Review the 31 tasks** extracted from the 2 meetings
2. **Identify false positives** (tasks that shouldn't be tasks)
3. **Add patterns to exclusion list**
4. **Re-run extraction** with updated prompt
5. **Iterate** until quality meets expectations

## Notes

- Current focus: **Google Meets only** (emails/chats disabled)
- **Creation date now uses transcript date** (not extraction date)
- Source Type and Participants are correctly populated
- Ready for feedback-driven iteration
