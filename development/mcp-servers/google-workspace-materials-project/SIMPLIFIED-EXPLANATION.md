# What This Does (Simple Explanation)

## The Problem

Creating patient handouts, consent forms, and discharge instructions takes **20-30 minutes** of manual work:
1. Pick a template
2. Type all the content yourself
3. Fill in patient details
4. Generate PDF
5. Repeat for each document

## The Solution

With this MCP, you just tell Claude what you need:

```
"Claude, create a discharge handout for knee surgery patients"
```

**30 seconds later:**
- ✅ Complete professional handout written
- ✅ 6th-8th grade reading level (easy to understand)
- ✅ Saved to Google Drive
- ✅ PDF ready for printing
- ✅ Includes {{PATIENT_NAME}} tokens for personalization

**Time saved:** 85-90% (20-30 min → 2-3 min)

---

## Real Examples

### Example 1: Create New Material
**You say:**
```
Claude, create a patient education handout about managing high blood pressure.

Include:
- What high blood pressure is
- Lifestyle changes (diet, exercise)
- Medication reminders
- When to call the doctor
- Use 6th grade reading level
- Save as Google Doc
```

**What happens:**
1. Claude generates complete content in markdown
2. MCP converts to Google Doc automatically
3. Saves to your "AI Print Materials/Templates" folder in Drive
4. Creates PDF version
5. Adds to searchable index

**Result:** Professional 2-page handout ready in 30 seconds

---

### Example 2: Make It Easier to Read
**You say:**
```
Claude, take our diabetes handout and simplify it to 6th grade reading level.
Make it more friendly and encouraging.
```

**What happens:**
1. MCP reads your existing diabetes handout from Drive
2. Claude rewrites complex sentences simply
3. Changes "utilize" → "use", "administer" → "give", etc.
4. Adds encouraging phrases
5. Preserves all your {{PATIENT_NAME}} tokens
6. Updates the document in Drive

**Result:** Same handout but easier for patients to understand

---

### Example 3: Batch Export
**You say:**
```
Claude, export all consent forms to PDF.
```

**What happens:**
1. MCP finds all consent forms in your Drive
2. Converts each to PDF
3. Organizes in dated folders (2025-11-15/)
4. Tracks which ones you use most

**Result:** All PDFs ready for printing in one command

---

### Example 4: Create Variations
**You say:**
```
Claude, create a pediatric version of the wound care handout.
```

**What happens:**
1. Takes your adult wound care handout
2. Claude rewrites for parents/children
3. Simpler language
4. Different examples (cartoon bandages vs surgical dressings)
5. Saves as new document

**Result:** Two versions (adult + pediatric) without rewriting manually

---

## What Makes This Different?

### Current Printable Documents Builder:
- You pick header template
- **You type all the content** ⏰ Slow!
- You fill in tokens manually
- You generate PDF

### This MCP:
- **AI writes the content** 🚀 Fast!
- You just describe what you need
- AI fills in tokens automatically
- PDF generated automatically

---

## Technical Details (Simple)

### The "Bridge" Concept

**Claude's World:**
- Writes in "markdown" (like taking notes)
- Natural for AI to create and edit

**Your World:**
- Google Docs and Slides (familiar tools)
- PDFs for printing

**The MCP (Middle Person):**
- Converts Claude's markdown → Google Docs/Slides
- Converts Google Docs → markdown for editing
- Handles Drive storage and organization
- Creates PDFs automatically

### Google Drive Organization

```
AI Print Materials/
├── Templates/        ← Reusable templates you create
├── Generated/        ← Materials you've created
│   ├── 2025-11-15/  ← Organized by date
│   └── 2025-11-16/
└── Archive/          ← Old materials
```

### The Index

Think of it like a library card catalog:
- Tracks every material you create
- Searchable by type (education, consent, discharge)
- Sortable by most-used
- Shows when last updated

---

## What You Can Do

### Content Creation
- "Create a handout about [topic]"
- "Write consent form for [procedure]"
- "Draft discharge instructions for [surgery]"

### Content Enhancement
- "Simplify this to 6th grade reading level"
- "Make this more friendly and encouraging"
- "Add more examples about [topic]"
- "Create Spanish version"

### Organization
- "Find all diabetes materials"
- "Show me what's most-used this month"
- "Export everything to PDF"

### Customization
- Uses {{TOKENS}} for patient-specific info
- {{PATIENT_NAME}}, {{SURGERY_DATE}}, {{DOCTOR_NAME}}
- Fill in once, use everywhere

---

## Time & Value

**Current workflow:** 5-10 materials/week × 20-30 min each = **2-5 hours/week**

**With this MCP:** 5-10 materials/week × 2-3 min each = **10-30 minutes/week**

**Time saved:** 3-4.5 hours per week

**Annual value:** $7,800-11,700 (at $50/hour)

---

## Your Existing Setup

Good news: **You already have most of this set up!**

**Google Cloud Account:** ✅ Already configured
- Project: `workspace-automation-ssdspc`
- Service account: `ssd-automation-service-account@...`
- Same account you use for Google Sheets backups

**What's Left:**
1. Enable Drive, Docs, Slides APIs (5 minutes)
2. Create Drive folders (5 minutes)
3. Share folders with your automation account (2 minutes)
4. Configure the MCP (10 minutes)

**Total setup time:** ~25 minutes (not 60!)

---

## Common Questions

**Q: Will this replace our Printable Documents Builder?**
A: No, it runs alongside it. This is for AI-generated content. The builder is still there for your existing templates.

**Q: What if I don't like what Claude writes?**
A: Edit it like any Google Doc. You can also ask Claude to revise: "Make this section more detailed" or "Simplify the medication instructions."

**Q: Can I use my own templates?**
A: Yes! Save templates to the Templates/ folder. Then say "Use the [template name] template to create..."

**Q: What about patient privacy?**
A: No patient data goes to AI. You use {{TOKENS}} for patient info, which you fill in manually later (just like current workflow).

**Q: Does this cost money?**
A: Google Cloud has usage-based pricing. For typical use (5-10 materials/week), cost is minimal (~$1-5/month). ROI is huge (saving 3-4 hours/week).

---

## Next Steps

**Quick Setup (~25 minutes):**

1. **Enable APIs** (5 min)
   - Go to Google Cloud Console
   - Enable Drive, Docs, Slides APIs

2. **Create Drive Folders** (5 min)
   - Create "AI Print Materials" folder
   - Create subfolders (Templates, Generated, Archive, config)

3. **Share Folders** (2 min)
   - Share with: ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
   - Permission: Editor

4. **Configure MCP** (10 min)
   - Copy folder IDs from Drive URLs
   - Update configuration file
   - Restart Claude Code

5. **Test** (3 min)
   - Create sample handout
   - Export to PDF
   - Verify it works

**Detailed instructions:** See `QUICK-START.md`

---

**Bottom Line:**

Instead of spending 20-30 minutes writing each handout manually, you spend 30 seconds describing what you need and Claude writes it for you.

**Questions?** Ask Claude: "How do I [specific task]?"
