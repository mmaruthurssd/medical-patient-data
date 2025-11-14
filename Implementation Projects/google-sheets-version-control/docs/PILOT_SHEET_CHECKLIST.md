# Pilot Sheet Implementation Checklist

**Purpose**: Step-by-step checklist for migrating your first sheet to version control

**Sheet Name**: _________________ (Fill in when selected)

**Sheet ID**: _________________

**Started**: __________ **Completed**: __________

---

## Pre-Flight Checks

### ☐ 1. Select Pilot Sheet

**Criteria for pilot sheet**:
- [ ] Low criticality (not essential to operations)
- [ ] Low user impact (few users)
- [ ] Simple functionality (not too complex)
- [ ] Contains no test/sample data
- [ ] You have full access/permissions

**Good candidates**:
- Internal testing sheets
- Personal productivity sheets
- Non-critical reports
- Low-usage dashboards

**Avoid for pilot**:
- Patient billing sheets
- Prior authorization systems
- Critical reporting dashboards
- High-frequency automated sheets

**Selected sheet**: _______________________

---

## Phase 1: Preparation (30 minutes)

### ☐ 2. Document Current State

- [ ] Record sheet name: _______________________
- [ ] Record sheet ID (from URL): _______________________
- [ ] Record Apps Script project ID: _______________________
- [ ] Take screenshot of sheet structure
- [ ] Document current triggers/automations
- [ ] List dependencies (other sheets it uses)
- [ ] Note current owner/permissions

### ☐ 3. Verify Prerequisites

- [ ] `clasp` installed: `clasp --version`
- [ ] `clasp` authenticated: `clasp login`
- [ ] Git configured: `git config user.name` and `git config user.email`
- [ ] Node.js installed: `node --version`
- [ ] Repository cloned locally

---

## Phase 2: Create DEV Copy (20 minutes)

### ☐ 4. Create Development Sheet

**In Google Drive**:
1. [ ] Open production sheet
2. [ ] File → Make a copy
3. [ ] Rename to: `[DEV] [Original Name]`
4. [ ] Move to "Development Sheets" folder (create if needed)
5. [ ] Share with yourself (ensure you have edit access)

**Record info**:
- [ ] DEV sheet name: _______________________
- [ ] DEV sheet ID: _______________________
- [ ] DEV Apps Script project ID: _______________________

### ☐ 5. Test DEV Sheet

- [ ] Open DEV sheet - verify it loads
- [ ] Check data is copied correctly
- [ ] Test basic functionality
- [ ] Verify triggers work (if any)
- [ ] Confirm you can edit

---

## Phase 3: Pull Code to Git (30 minutes)

### ☐ 6. Create Folder Structure

```bash
cd ~/Desktop/ssd-google-sheets-staging-production

# Production folder
mkdir -p production-sheets/[SHEET_ID]_[Name]/live
mkdir -p production-sheets/[SHEET_ID]_[Name]/metadata
mkdir -p production-sheets/[SHEET_ID]_[Name]/backups

# Staging folder
mkdir -p staging-sheets/[SHEET_ID]-DEV_[Name]/dev
```

**Created folders**:
- [ ] Production live folder
- [ ] Production metadata folder
- [ ] Production backups folder
- [ ] Staging dev folder

### ☐ 7. Pull Production Code

```bash
cd production-sheets/[SHEET_ID]_[Name]/live

# Create .clasp.json with production script ID
echo '{"scriptId":"[PRODUCTION_SCRIPT_ID]"}' > ../.clasp.json

# Copy to live folder for pulling
cp ../.clasp.json .clasp.json

# Pull code
clasp pull

# Remove temp .clasp.json from live folder
rm .clasp.json
```

**Files pulled**:
- [ ] Code.gs (or similar)
- [ ] appsscript.json
- [ ] Other .gs files listed: _______________________

### ☐ 8. Pull DEV Code

```bash
cd ../../../staging-sheets/[SHEET_ID]-DEV_[Name]/dev

# Create .clasp.json with DEV script ID
echo '{"scriptId":"[DEV_SCRIPT_ID]"}' > ../.clasp.json

# Copy to dev folder
cp ../.clasp.json .clasp.json

# Pull code
clasp pull
```

**Files pulled**:
- [ ] Code.gs (or similar)
- [ ] appsscript.json
- [ ] Files match production: Yes / No

---

## Phase 4: Documentation (20 minutes)

### ☐ 9. Create README Files

**Production README** (`production-sheets/[SHEET_ID]_[Name]/README.md`):

```markdown
# [Sheet Name] - Production

**Sheet ID**: [ID]
**Apps Script ID**: [ID]
**Owner**: [Owner name]
**Criticality**: Low/Medium/High

## Purpose
[What this sheet does]

## Dependencies
- [List other sheets or systems it depends on]

## Triggers
- [List any time-based or event triggers]

## Last Deployed
[Date] by [Person]

## Notes
- [Any important notes about this sheet]
```

- [ ] Production README created
- [ ] All fields filled in

**Staging README** (`staging-sheets/[SHEET_ID]-DEV_[Name]/README.md`):

```markdown
# [Sheet Name] - Development

**DEV Sheet ID**: [ID]
**DEV Apps Script ID**: [ID]

## Testing Notes
[How to test this sheet]

## Known Issues
[Any known issues or quirks]
```

- [ ] Staging README created

---

## Phase 5: First Commit (10 minutes)

### ☐ 10. Commit to Git

```bash
cd ~/Desktop/ssd-google-sheets-staging-production

# Check what's new
git status

# Add files
git add production-sheets/[SHEET_ID]_[Name]/
git add staging-sheets/[SHEET_ID]-DEV_[Name]/

# Commit
git commit -m "feat(pilot): Add [Sheet Name] as pilot sheet

- Added production code snapshot
- Added staging/DEV code
- Created README documentation
- Ready for deployment testing"

# Push to GitHub
git push origin main
```

- [ ] Files staged
- [ ] Commit created
- [ ] Pushed to GitHub
- [ ] Verified on GitHub.com

---

## Phase 6: Test Deployment Workflow (30 minutes)

### ☐ 11. Make Test Change

**In DEV sheet code**:
1. [ ] Open Apps Script editor for DEV sheet
2. [ ] Add a simple comment: `// Test change for deployment`
3. [ ] Save in Apps Script editor

**Pull change to Git**:
```bash
cd staging-sheets/[SHEET_ID]-DEV_[Name]/dev
clasp pull
```

4. [ ] Verify comment appears in local file
5. [ ] Commit change:
```bash
git add .
git commit -m "test(pilot): Test change for deployment workflow"
git push
```

### ☐ 12. Deploy to Production (DRY RUN FIRST)

**Read through deployment script first**:
```bash
cat scripts/deploy-to-production.sh
```

- [ ] Understand what script will do
- [ ] Confirm backup will be created
- [ ] Confirm you can rollback

**Run deployment**:
```bash
./scripts/deploy-to-production.sh [SHEET_ID]_[Name]
```

**During deployment**:
- [ ] Backup created successfully
- [ ] Diff shown correctly
- [ ] Confirmed deployment (typed 'y')
- [ ] Deployment completed without errors
- [ ] Git commit created
- [ ] Changes pushed to GitHub

### ☐ 13. Verify Production

- [ ] Open production sheet
- [ ] Tools → Script editor
- [ ] Verify test comment is there
- [ ] Run a function to test
- [ ] Check execution log for errors
- [ ] Test sheet functionality

---

## Phase 7: Test Rollback (15 minutes)

### ☐ 14. Perform Test Rollback

**IMPORTANT**: This will undo your test change

```bash
./scripts/rollback.sh [SHEET_ID]_[Name]
```

**During rollback**:
- [ ] Latest backup identified correctly
- [ ] Confirmed rollback (typed 'y')
- [ ] Rollback completed
- [ ] Git commit created

### ☐ 15. Verify Rollback

- [ ] Open production sheet script editor
- [ ] Test comment is gone (rolled back)
- [ ] Sheet functions still work
- [ ] No errors in execution log

---

## Phase 8: Documentation & Lessons (20 minutes)

### ☐ 16. Document Results

Create `PILOT_RESULTS.md`:

```markdown
# Pilot Sheet Results

**Sheet**: [Name]
**Date**: [Date]
**Tester**: [Your name]

## What Worked Well
-
-
-

## Issues Encountered
1. Issue: [Description]
   Solution: [How you fixed it]

2. Issue: [Description]
   Solution: [How you fixed it]

## Time Taken
- Preparation: __ minutes
- DEV copy creation: __ minutes
- Code pulling: __ minutes
- Documentation: __ minutes
- Deployment test: __ minutes
- Rollback test: __ minutes
- **Total**: __ minutes

## Improvements Needed
-
-
-

## Ready for Next Sheets?
Yes / No (explain why)

## Recommendations
-
-
```

- [ ] Results document created
- [ ] All sections filled
- [ ] Lessons learned documented

---

## Phase 9: Cleanup (10 minutes)

### ☐ 17. Redeploy Test Change (Optional)

If you want to keep your test change in production:
```bash
cd staging-sheets/[SHEET_ID]-DEV_[Name]/dev
# Make sure test comment is in code
clasp push  # Push to DEV
cd -
./scripts/deploy-to-production.sh [SHEET_ID]_[Name]
```

### ☐ 18. Final Commit

```bash
git add docs/PILOT_RESULTS.md
git commit -m "docs(pilot): Add pilot test results for [Sheet Name]"
git push
```

---

## Success Criteria

### Minimum Success (Can proceed with caution)
- [ ] DEV copy created
- [ ] Code pulled to Git
- [ ] Deployment script ran (even if manual fixes needed)
- [ ] Production sheet still works

### Full Success (Ready to scale)
- [ ] All of above
- [ ] Deployment worked smoothly
- [ ] Rollback worked smoothly
- [ ] < 30 minutes total for deployment
- [ ] No data lost
- [ ] No errors in production

---

## Troubleshooting

### Issue: "Command not found: clasp"
**Solution**: Install clasp: `npm install -g @google/clasp`

### Issue: "User has not enabled the Apps Script API"
**Solution**: Enable at https://script.google.com/home/usersettings

### Issue: ".clasp.json not found"
**Solution**: Create it manually with script ID from Apps Script editor

### Issue: "Deployment failed - files not found"
**Solution**: Check folder paths match exactly, including DEV suffix

### Issue: "Permission denied running scripts"
**Solution**: `chmod +x scripts/*.sh`

### Issue: "Git push rejected"
**Solution**: Pull first: `git pull origin main`, then push again

---

## Next Steps After Successful Pilot

1. [ ] Review with team
2. [ ] Select next 2-3 low-risk sheets
3. [ ] Create batch migration plan
4. [ ] Update scripts based on lessons learned
5. [ ] Begin Week 3 migration (10 sheets)

---

**Completed**: ☐ Yes ☐ No

**Notes**:
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
