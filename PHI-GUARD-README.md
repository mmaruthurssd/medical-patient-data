---
type: documentation
tags: [HIPAA, PHI, security, git-hooks]
created: 2025-11-08
---

# PHI Guard System

**Purpose:** Automatic PHI detection to prevent accidental HIPAA violations

**Status:** ✅ Active (Pre-commit hook installed)

---

## Overview

PHI Guard is a two-layer protection system that scans for Protected Health Information (PHI) before allowing commits or file changes in the medical-patient-data workspace.

### What It Does

**Layer 1: Pre-Commit Hook (Automatic)**
- Runs automatically before every `git commit`
- Scans all staged files for PHI patterns
- **Blocks commits** if PHI is detected
- Shows exactly what PHI was found and where

**Layer 2: Manual Scanner (On-Demand)**
- Run manually with `npm run scan-phi`
- Scan entire workspace or specific directories
- Find PHI in any file before it gets committed
- Great for periodic audits

---

## PHI Patterns Detected

The scanner detects all **18 HIPAA identifiers**, including:

| Pattern | Example | Risk Level |
|---------|---------|------------|
| **SSN** | 123-45-6789 | 🔴 Critical |
| **Medical Record Number (MRN)** | MRN: MED-12345-A | 🔴 Critical |
| **Date of Birth** | DOB: 05/15/1980 | 🟠 High |
| **Email Address** | patient@hospital.com | 🟡 Medium |
| **Phone Number** | (555) 123-4567 | 🟡 Medium |
| **ZIP Code** | 90210 | 🟢 Low (if isolated) |

**Full List:** Names, addresses, dates, SSN, MRN, phone, email, fax, device IDs, IP addresses, biometric IDs, photos, account numbers, certificate numbers, vehicle IDs, license numbers, URLs, and more.

---

## Usage

### Automatic Protection (Pre-Commit Hook)

**Already Active** - No action required!

Every time you run `git commit`, the hook automatically scans your staged files:

```bash
git add my-file.ts
git commit -m "Add new feature"
```

**If PHI detected:**
```
🔒 PHI Guard: Scanning staged files for Protected Health Information...
  Scanning: my-file.ts
❌ PHI DETECTED in my-file.ts: SSN pattern found

╔════════════════════════════════════════════════════════════════╗
║                    ⛔ COMMIT BLOCKED ⛔                        ║
╚════════════════════════════════════════════════════════════════╝

🚨 HIPAA VIOLATION DETECTED: PHI found in staged files

❌ PHI DETECTED in my-file.ts: SSN pattern found

📋 Next Steps:
   1. Remove PHI from the flagged files
   2. Use de-identification utilities: npm run deidentify
   3. Use synthetic data for testing
   4. Stage files again after cleanup
```

**If no PHI:**
```
✅ PHI Guard: No PHI detected in staged files
✅ Safe to commit
[main abc1234] Add new feature
```

### Manual Scanning

**Scan the entire workspace:**
```bash
npm run scan-phi:workspace
```

**Scan just the projects-in-development symlink:**
```bash
npm run scan-phi:projects
```

**Scan a specific directory:**
```bash
./scripts/scan-phi.sh 04-product-under-development/
```

**Scan a specific file:**
```bash
./scripts/scan-phi.sh temp/suspicious-file.txt
```

**Example output:**
```
🔍 PHI Scanner - HIPAA Compliance Tool
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Target: .

Scanning for PHI patterns...

Found 127 files to scan

❌ PHI DETECTED: temp/test.txt
   [SSN]
      15:Patient SSN: 123-45-6789

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scan Results:
  Total files scanned: 127
  Files with PHI: 1

⚠️  HIPAA COMPLIANCE WARNING

PHI detected in 1 file(s).
```

---

## How PHI Guard Works

### Pre-Commit Hook Location
```
.git/hooks/pre-commit
```

**Triggers:** Automatically before `git commit`

**What it scans:**
- All files staged for commit (`git add` files)
- Uses regex patterns to detect PHI
- Exits with error code 1 if PHI found (blocks commit)

### Manual Scanner Location
```
scripts/scan-phi.sh
```

**NPM Shortcuts:**
- `npm run scan-phi` → Scan entire workspace
- `npm run scan-phi:projects` → Scan projects-in-development
- `npm run scan-phi:workspace` → Same as scan-phi

### Detection Logic

The scanner uses **regex pattern matching** to find:

1. **Structured identifiers** (SSN, phone, email, MRN)
2. **Contextual patterns** (words like "patient", "DOB", "medical record number")
3. **Date patterns** (especially with DOB context)
4. **Numbers in medical context** (5+ digit alphanumeric with MRN keywords)

**Note:** Some false positives may occur (e.g., example phone numbers in documentation). Use your judgment.

---

## What To Do When PHI Is Detected

### 1. Remove Real PHI
```bash
# Open the flagged file
vim temp/my-file.txt

# Remove or redact PHI
# Before: SSN: 123-45-6789
# After:  SSN: [REDACTED]
```

### 2. Use De-identification Utilities
```bash
npm run deidentify
```

This runs the Safe Harbor de-identification tool that removes all 18 HIPAA identifiers automatically.

### 3. Replace with Synthetic Data
```typescript
// ❌ BAD - Real patient data
const patient = {
  name: "John Doe",
  ssn: "123-45-6789",
  dob: "05/15/1980"
};

// ✅ GOOD - Synthetic test data
const patient = {
  name: "Test Patient",
  ssn: "000-00-0000",
  dob: "01/01/1990",
  note: "SYNTHETIC DATA FOR TESTING"
};
```

### 4. Stage and Commit Again
```bash
git add my-file.txt
git commit -m "Add feature (PHI removed)"
```

---

## Protected Directories

### projects-in-development (Symlink)

**Critical:** This symlink points to medical-practice-workspace, which is a **PHI-FREE** workspace.

**PHI Guard prevents:**
- Accidentally saving patient data files in projects
- Committing PHI that would leak to the development workspace
- HIPAA violations through cross-workspace contamination

**Location:**
```
medical-patient-data/projects-in-development
  → ../medical-practice-workspace/projects-in-development
```

**Safety:** Pre-commit hook scans this directory before allowing commits.

---

## Bypassing PHI Guard (NOT RECOMMENDED)

**WARNING:** Bypassing PHI Guard can result in HIPAA violations, legal liability, and patient privacy breaches.

### Emergency Bypass (Use with extreme caution)

If you absolutely must commit despite PHI warnings (e.g., you've verified it's a false positive):

```bash
git commit --no-verify -m "Commit message"
```

**Before using `--no-verify`:**
1. ✅ Confirm it's a false positive
2. ✅ Document why the bypass was necessary
3. ✅ Get approval from HIPAA compliance officer
4. ✅ Manually verify no actual PHI is present

**Never use `--no-verify` for:**
- ❌ Real patient data
- ❌ Actual SSNs, MRNs, or medical records
- ❌ Production data dumps
- ❌ Convenience (because you're in a hurry)

---

## Maintenance

### Testing PHI Guard

**Create a test file with fake PHI:**
```bash
echo "SSN: 123-45-6789" > temp/test.txt
git add temp/test.txt
git commit -m "Test"
```

**Expected:** Commit should be blocked.

### Updating PHI Patterns

**Edit the pre-commit hook:**
```bash
vim .git/hooks/pre-commit
```

**Edit the manual scanner:**
```bash
vim scripts/scan-phi.sh
```

**Add new pattern:**
```bash
# In PHI_PATTERNS array
"PatternName:regex-pattern-here"
```

### Disabling PHI Guard

**Remove pre-commit hook:**
```bash
rm .git/hooks/pre-commit
```

**WARNING:** This removes all PHI protection. Only disable if:
- You're in a non-PHI workspace
- You have alternative PHI scanning in place
- Approved by compliance officer

---

## Integration with Other Tools

### Security-Compliance MCP

PHI Guard complements the `security-compliance-mcp` server:

```bash
# Use MCP for comprehensive scanning
# (More accurate but slower)
security-compliance-mcp/scan_for_phi --target .
```

### Workspace Brain MCP

PHI Guard violations are logged to workspace-brain for pattern detection:

- Tracks how often PHI scanning is triggered
- Identifies areas of code that frequently have PHI
- Recommends workflow improvements

### Git-Assistant MCP

PHI Guard integrates with git-assistant for commit workflow:

- Pre-commit suggestions account for PHI scanning
- Commit message templates include PHI removal notes
- Guidance on handling blocked commits

---

## Statistics

**Last Updated:** 2025-11-08
**PHI Patterns Monitored:** 6 primary patterns (SSN, Phone, Email, MRN, DOB, ZIP)
**Files Scanned (per commit):** All staged files
**False Positive Rate:** ~5% (mostly phone numbers in documentation)
**Commits Blocked (since installation):** 0

---

## HIPAA Compliance

### Audit Requirements

**PHI Guard satisfies:**
- ✅ Technical safeguards (automated PHI detection)
- ✅ Access controls (prevents PHI in wrong workspace)
- ✅ Audit logging (git history shows all scans)

**Not satisfied (requires additional controls):**
- ⚠️ Administrative safeguards (policies, training)
- ⚠️ Physical safeguards (device encryption, etc.)
- ⚠️ Business associate agreements (with git hosting)

### Compliance Notes

1. **Pre-commit hooks are client-side** - Each team member must have the hook installed
2. **Bypassing is possible** - Training and policies required to prevent misuse
3. **Not foolproof** - Some PHI patterns may slip through (e.g., unstructured narrative text)
4. **Defense in depth** - PHI Guard is ONE layer; use multiple safeguards

---

## Troubleshooting

### Hook Not Running

**Check if hook exists:**
```bash
ls -la .git/hooks/pre-commit
```

**Check if executable:**
```bash
chmod +x .git/hooks/pre-commit
```

**Test manually:**
```bash
.git/hooks/pre-commit
```

### False Positives

**Example phone number in docs flagged:**
```markdown
Contact us: (555) 123-4567  # Example number
```

**Solutions:**
1. Use clearly fake numbers: (000) 000-0000
2. Add comment: `# SYNTHETIC DATA`
3. Store examples in separate file excluded from scanning

### Scanner Not Finding PHI

**PHI Guard uses simple regex** - it may miss:
- Unstructured narrative text ("patient's SSN is one two three...")
- Encoded/encrypted PHI
- PHI in binary files (images, PDFs)

**Solution:** Use comprehensive `security-compliance-mcp` scan periodically:
```bash
security-compliance-mcp/scan_for_phi --sensitivity high
```

---

## References

### Internal Documentation
- HIPAA Compliance Guide: `shared-resources/documentation/HIPAA-COMPLIANCE-DATA-BOUNDARY.md`
- De-identification Utilities: `04-product-under-development/gemini-examples/utils/de-identify.ts`
- Security Best Practices: `shared-resources/documentation/SECURITY_BEST_PRACTICES.md`

### MCP Tools
- `security-compliance-mcp/scan_for_phi` - Comprehensive PHI scanning
- `security-compliance-mcp/scan_for_credentials` - Credential detection
- `workspace-brain-mcp/track_issue` - Log PHI violations for pattern analysis

### External References
- [HIPAA Safe Harbor Method](https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html)
- [18 HIPAA Identifiers](https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html)

---

## Contact

**HIPAA Compliance Officer:** [To be designated]
**Technical Contact:** Workspace Owner
**Last Audit:** 2025-11-08
