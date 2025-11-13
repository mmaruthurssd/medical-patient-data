# Automation Account Setup Guide

**Document:** Automation Account Setup Guide
**Project:** Google Workspace Automation Infrastructure
**Version:** 1.0
**Last Updated:** 2025-11-08
**Status:** Active

---

## Overview

This guide provides step-by-step instructions for creating and configuring the `automation@ssdsbc.com` Google Workspace account that will serve as the foundation for all automated operations.

### Why an Automation Account?

**Problem Solved:**
- Eliminates "works for Alice not Bob" permission conflicts
- Provides consistent authentication for all automated operations
- Separates personal access from automation access
- Enables team collaboration without sharing personal credentials
- Simplifies access management (grant once to automation account)

**Alternative Considered:**
Service Account with Domain-Wide Delegation (DWD) is the enterprise-grade alternative, but requires significantly more setup complexity. The automation account pattern is recommended for:
- Development and testing phases
- Small to medium deployments (< 500 sheets)
- Teams without dedicated security engineering resources

---

## Prerequisites

### Required Access
- [ ] Google Workspace Admin Console access
- [ ] Permissions to create new user accounts
- [ ] Permissions to manage Shared Drive membership
- [ ] Password manager for secure credential storage

### Required Information
- Domain: `ssdsbc.com`
- Account name: `automation@ssdsbc.com`
- Organizational Unit: (recommend creating "Automation" OU)

---

## Step 1: Create the Automation Account

### 1.1 Access Admin Console

1. Navigate to [Google Workspace Admin Console](https://admin.google.com)
2. Sign in with your admin account (e.g., `mm@ssdsbc.com`)

### 1.2 Create New User

1. Navigate to: **Directory** > **Users**
2. Click **Add new user**
3. Fill in user details:
   - **First name:** `Automation`
   - **Last name:** `Service Account`
   - **Primary email:** `automation@ssdsbc.com`
   - **Organizational unit:** `Automation` (create if needed)

4. Click **Add new user**

### 1.3 Set Strong Password

1. Click on the newly created user
2. Navigate to **Security** > **Password**
3. Click **Reset password**
4. Generate a strong password (use password manager)
5. **Recommended format:** 32+ characters, random alphanumeric + symbols
6. Store password securely in password manager immediately
7. Uncheck "Ask for a password change at the next sign-in"

### 1.4 Assign Workspace License

1. Navigate to **Billing** > **Subscriptions**
2. Ensure you have available Google Workspace licenses
3. Assign appropriate license to `automation@ssdsbc.com`
   - **Recommended:** Google Workspace Business Standard or higher
   - **Required features:** Drive, Sheets, Apps Script access

**Estimated Cost:** $12-18/user/month (included in existing Workspace subscription)

---

## Step 2: Configure Security Settings

### 2.1 Enable 2-Factor Authentication (2FA)

⚠️ **Critical Security Step**

1. Sign in to `automation@ssdsbc.com` in a new incognito window
2. Navigate to [myaccount.google.com/security](https://myaccount.google.com/security)
3. Under "Signing in to Google," select **2-Step Verification**
4. Click **Get started**
5. Follow the setup wizard:
   - **Primary method:** Authenticator app (recommended: Google Authenticator)
   - **Backup method:** Backup codes

### 2.2 Generate and Store Backup Codes

1. After 2FA setup, click **Backup codes**
2. Click **Get codes**
3. Store backup codes securely:
   - **Primary storage:** Password manager
   - **Backup storage:** Encrypted document in secure location
   - **Print option:** Physical printout in locked safe

⚠️ **Warning:** If you lose both the 2FA device and backup codes, account recovery will require Google Workspace Admin intervention.

### 2.3 Configure Recovery Options

1. Navigate to **Security** > **Ways we can verify it's you**
2. Add recovery email: Your admin email (e.g., `mm@ssdsbc.com`)
3. Add recovery phone: Your verified phone number
4. Review security checkup

---

## Step 3: Grant Shared Drive Access

### 3.1 Identify All Shared Drives

1. Sign in as admin (`mm@ssdsbc.com`)
2. Navigate to [Google Drive](https://drive.google.com)
3. Click **Shared drives** in left sidebar
4. Document all Shared Drives that need automation access

**Expected Drives (based on project scope):**
- Prior Authorization Drive
- Patient Data Drive
- Medical Records Drive
- Administrative Drive
- _(List all drives in your workspace)_

### 3.2 Grant Manager Role

⚠️ **Important:** Use **Manager** role, not **Content Manager**

**For each Shared Drive:**

1. Open the Shared Drive
2. Click the Shared Drive name > **Manage members**
3. Click **Add members**
4. Enter: `automation@ssdsbc.com`
5. Select role: **Manager**
6. Click **Send**

**Repeat for ALL Shared Drives (estimated 5-10 drives)**

### 3.3 Verify Access

1. Sign in as `automation@ssdsbc.com`
2. Navigate to Google Drive > **Shared drives**
3. Verify all expected Shared Drives are visible
4. Test permissions:
   - Open a spreadsheet in each drive
   - Verify you can view content
   - Create a test file
   - Delete the test file

**Success Criteria:**
- ✅ All Shared Drives visible
- ✅ Can open files in each drive
- ✅ Can create files
- ✅ Can delete files
- ✅ No permission errors

---

## Step 4: Configure Organizational Settings

### 4.1 Set Session Length

1. Admin Console > **Security** > **Settings**
2. Under "Session control," configure:
   - **Web session duration:** 14 days (recommended for automation accounts)
   - **Mobile session duration:** 14 days

This reduces the frequency of re-authentication for automated scripts.

### 4.2 Configure API Access

1. Admin Console > **Security** > **API controls**
2. Under "App access control," ensure:
   - **Google Workspace Marketplace apps:** Trusted apps allowed
   - **API access:** Enabled
   - **Less secure apps:** Disabled (OAuth only)

### 4.3 Review Access Transparency

1. Admin Console > **Security** > **Access transparency**
2. Enable access transparency logging
3. Configure alerts for unusual access patterns

---

## Step 5: Document and Secure Credentials

### 5.1 Password Manager Entry

Create password manager entry with:

```
Title: Google Workspace - Automation Account
Username: automation@ssdsbc.com
Password: [32+ character generated password]
2FA Secret: [Authenticator secret key]
Backup Codes: [10 backup codes]
Recovery Email: mm@ssdsbc.com
Recovery Phone: [Your phone]
Created: 2025-11-08
Purpose: Automated Google Workspace operations
Notes:
  - Manager access to all Shared Drives
  - Used for OAuth authentication
  - Used for Apps Script deployments
  - DO NOT use for manual operations
```

### 5.2 Team Access Documentation

Create shared documentation (in secure location) with:

**Who has access:**
- Primary: [Your name] (password manager + 2FA device)
- Backup: [Backup admin] (2FA backup codes in safe)

**When to use:**
- OAuth setup for automation scripts
- Apps Script deployment via clasp
- Google Cloud Project authentication
- Debugging permission issues

**When NOT to use:**
- Manual spreadsheet editing (use personal account)
- Day-to-day operations (use personal account)
- Sharing with external users

### 5.3 Rotation Schedule

**Password Rotation:** Every 90 days
**2FA Backup Codes:** Regenerate every 180 days
**Access Review:** Quarterly review of Shared Drive memberships

Set calendar reminders for:
- 2025-02-08: First password rotation
- 2025-05-08: First backup code regeneration
- 2025-11-08: Annual security audit

---

## Step 6: Test Authentication

### 6.1 Browser Test

1. Open incognito window
2. Navigate to [Google Drive](https://drive.google.com)
3. Sign in as `automation@ssdsbc.com`
4. Verify:
   - ✅ 2FA prompt appears
   - ✅ Can access Shared Drives
   - ✅ Can open spreadsheets
   - ✅ Can create/edit/delete files

### 6.2 API Test (After OAuth Setup)

After completing OAuth setup (see OAUTH-SETUP-GUIDE.md):

```bash
# Test authentication with Google APIs
npm run test:auth

# Expected output:
# ✅ Authenticated as automation@ssdsbc.com
# ✅ Drive API access confirmed
# ✅ Sheets API access confirmed
# ✅ Apps Script API access confirmed
```

---

## Troubleshooting

### Issue: "User not found" when adding to Shared Drive

**Cause:** Account creation not fully propagated
**Solution:** Wait 15-30 minutes and retry

### Issue: 2FA setup fails

**Cause:** Browser blocking popups or cookies
**Solution:**
1. Use Chrome in incognito mode
2. Disable browser extensions temporarily
3. Clear cookies and cache

### Issue: Cannot access Shared Drive after being added

**Cause:** Insufficient permissions or wrong role
**Solution:**
1. Verify **Manager** role (not Content Manager)
2. Check organization-level sharing settings
3. Verify account is in correct Organizational Unit

### Issue: Lost 2FA device

**Solution:**
1. Use backup codes from password manager
2. If no backup codes, contact Google Workspace Admin
3. Admin can reset 2FA via Admin Console

---

## Security Best Practices

### ✅ DO:
- Store credentials in password manager
- Enable 2FA immediately
- Use Manager role on Shared Drives
- Rotate password every 90 days
- Monitor account activity via Admin Console
- Use account only for automation (not manual work)
- Document all Shared Drive memberships

### ❌ DON'T:
- Share password with team members
- Use weak passwords
- Skip 2FA setup
- Grant Owner role (unnecessary and risky)
- Use account for personal tasks
- Store credentials in code or Git
- Share 2FA device

---

## Compliance Notes

### HIPAA Considerations

**PHI Access:**
- Automation account will have access to PHI via Shared Drives
- Account must be included in HIPAA compliance documentation
- Must be listed in Security Risk Assessment
- Must be included in annual audit trail reviews

**Audit Requirements:**
- Log all authentication events
- Monitor access patterns
- Review activity logs quarterly
- Document all password changes

### Access Control Policy

Add to practice security policy:

```
Automation Account Policy

1. Purpose: Dedicated account for automated Google Workspace operations
2. Custodian: [Your name], Practice Owner
3. Access: Limited to authorized technical personnel
4. Usage: Automation only (Apps Script, API calls, scheduled tasks)
5. Security: 2FA required, password rotation every 90 days
6. Monitoring: Quarterly access reviews, real-time anomaly alerts
7. Incident Response: Immediate password reset if compromise suspected
```

---

## Next Steps

After completing this guide:

1. ✅ Mark Goal 1.1 as complete in GOALS.md
2. ➡️ Proceed to [OAuth Setup Guide](OAUTH-SETUP-GUIDE.md)
3. ➡️ Set up Google Cloud Project (Goal 1.2)
4. ➡️ Configure OAuth credentials (Goal 1.3)

---

## Checklist: Automation Account Setup Complete

- [ ] Account `automation@ssdsbc.com` created
- [ ] Strong password set and stored in password manager
- [ ] 2FA enabled with authenticator app
- [ ] Backup codes generated and stored securely
- [ ] Recovery email and phone configured
- [ ] Google Workspace license assigned
- [ ] Added as **Manager** to ALL Shared Drives
- [ ] Manager role verified (not just Content Manager)
- [ ] Access tested (can view/create/delete in all drives)
- [ ] Credentials documented in password manager
- [ ] Rotation schedule set (90-day password, 180-day codes)
- [ ] Team access procedure documented
- [ ] HIPAA compliance documentation updated
- [ ] No permission errors when accessing any Shared Drive
- [ ] Account activity monitoring configured

**Estimated Time:** 1-2 hours
**Priority:** Critical (BLOCKING all other phases)
**Dependencies:** Google Workspace Admin access

---

**Document Owner:** Marvin Maruthur
**Next Review:** After Phase 1 completion
**Related Documents:**
- [OAuth Setup Guide](OAUTH-SETUP-GUIDE.md)
- [PROJECT-CHARTER.md](../01-planning-and-roadmap/PROJECT-CHARTER.md)
- [GOALS.md](../02-goals-and-milestones/GOALS.md) - Goal 1.1
