# Resources & Documentation

**Project:** Google Workspace Automation Infrastructure
**Last Updated:** 2025-11-08
**Status:** Active

---

## Overview

This directory contains comprehensive implementation guides for all phases of the Google Workspace Automation Infrastructure project.

---

## Implementation Guides

### 🔐 [Automation Account Guide](AUTOMATION-ACCOUNT-GUIDE.md)
**Phase:** 1 - Authentication Foundation
**Status:** Ready to use
**Time:** 1-2 hours
**Priority:** Critical (BLOCKING)

**What it covers:**
- Creating `automation@ssdsbc.com` account
- Configuring 2FA and security settings
- Granting Manager access to all Shared Drives
- Testing authentication
- Security best practices

**Prerequisites:**
- Google Workspace Admin access

**Outputs:**
- Automation account created and secured
- 2FA enabled with backup codes
- Manager access to all Shared Drives
- Credentials documented

---

### 🔑 [OAuth Setup Guide](OAUTH-SETUP-GUIDE.md)
**Phase:** 1 - Authentication Foundation
**Status:** Ready to use
**Time:** 2-3 hours
**Priority:** Critical (BLOCKING)

**What it covers:**
- Creating Google Cloud Project
- Enabling required APIs (Drive, Sheets, Apps Script)
- Configuring OAuth consent screen
- Creating OAuth client credentials
- Trusting app in Workspace Admin
- Testing authentication with all APIs
- Handling Shared Drive flags

**Prerequisites:**
- Automation account created
- Google Cloud Console access

**Outputs:**
- `credentials.json` file
- `token.json` file (after first auth)
- Working OAuth authentication for all APIs

---

### 🤖 [Gemini Integration Guide](GEMINI-INTEGRATION-GUIDE.md)
**Phase:** 2 - Gemini API Integration
**Status:** Ready to use (waiting for API key)
**Time:** 3-4 hours
**Priority:** Critical

**What it covers:**
- Verifying BAA coverage
- Obtaining Gemini API key from Google AI Studio
- Configuring environment variables
- Testing basic connectivity
- Implementing patient inquiry classifier
- PHI de-identification (Safe Harbor method)
- HIPAA audit logging
- End-to-end workflow testing

**Prerequisites:**
- OAuth setup complete
- HIPAA training completed
- Google Workspace BAA signed

**Outputs:**
- Gemini API key secured in .env
- Patient inquiry classifier (95%+ accuracy)
- PHI Guard de-identification utilities
- HIPAA audit logging system

---

### 📁 [Google Drive API Guide](GOOGLE-DRIVE-API-GUIDE.md)
**Phase:** 3 - Drive Integration
**Status:** Ready to use
**Time:** 4-6 hours
**Priority:** High

**What it covers:**
- Creating Drive API wrapper class
- Shared Drive operations (list, read, write, delete)
- Proper use of Shared Drive flags
- Bidirectional file synchronization
- PHI Guard integration
- Testing on production Shared Drives

**Prerequisites:**
- OAuth setup complete
- Manager access to Shared Drives

**Outputs:**
- `DriveAPIWrapper` class
- `DriveSyncManager` class
- Working file operations on all Shared Drives
- Zero 404 errors

---

### 📜 [Apps Script Deployment Guide](APPS-SCRIPT-DEPLOYMENT-GUIDE.md)
**Phase:** 4 - Apps Script Deployment
**Status:** Ready to use
**Time:** 10-12 hours
**Priority:** Critical

**What it covers:**
- Installing and authenticating clasp CLI
- Testing single sheet deployment
- Building sheet registry (240+ sheets)
- Validating registry
- Implementing bulk deployment
- Parallel processing (5 concurrent)
- Error handling and retry logic
- Rollback capability
- Pilot testing (20 sheets)
- Full deployment (240+ sheets)

**Prerequisites:**
- OAuth setup complete
- Apps Script API enabled
- Manager access to all sheets

**Outputs:**
- clasp CLI configured
- `sheet-registry.json` (240+ entries)
- Bulk deployment scripts
- Deployment logs and results
- Backup system for rollbacks

---

## Quick Start

### For New Implementation

**Week 1:**
1. Follow [Automation Account Guide](AUTOMATION-ACCOUNT-GUIDE.md)
2. Follow [OAuth Setup Guide](OAUTH-SETUP-GUIDE.md)
3. Mark Phase 1 goals complete in [GOALS.md](../02-goals-and-milestones/GOALS.md)

**Week 2:**
1. Obtain Gemini API key (user action required)
2. Follow [Gemini Integration Guide](GEMINI-INTEGRATION-GUIDE.md)
3. Mark Phase 2 goals complete

**Weeks 3-4:**
1. Follow [Google Drive API Guide](GOOGLE-DRIVE-API-GUIDE.md)
2. Test on production Shared Drives
3. Mark Phase 3 goals complete

**Weeks 5-6:**
1. Follow [Apps Script Deployment Guide](APPS-SCRIPT-DEPLOYMENT-GUIDE.md)
2. Build and validate sheet registry
3. Run pilot deployment (20 sheets)
4. Run full deployment (240+ sheets)
5. Mark Phase 4 goals complete

**Weeks 7-8:**
1. Combine Gemini + Drive + Apps Script
2. Build patient workflows
3. Deploy to production
4. Team training
5. Project completion

---

## Document Conventions

### File Naming
- Guides use UPPERCASE-WITH-HYPHENS
- Code samples included inline
- Troubleshooting sections at end

### Code Examples
- All code examples are copy-paste ready
- Environment variables used (`.env` file)
- Error handling included
- HIPAA compliance considerations noted

### Success Criteria
- Each guide includes verification steps
- Expected outputs documented
- Common errors and solutions provided

---

## Supporting Materials

### Referenced External Documentation
- [Google Drive API Reference](https://developers.google.com/drive/api/v3/reference)
- [Google Sheets API Reference](https://developers.google.com/sheets/api/reference/rest)
- [Apps Script API Reference](https://developers.google.com/apps-script/api/reference/rest)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [clasp Documentation](https://github.com/google/clasp)
- [HIPAA Safe Harbor De-identification](https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html)

### Project Documentation
- [Project Charter](../01-planning-and-roadmap/PROJECT-CHARTER.md)
- [Implementation Roadmap](../01-planning-and-roadmap/IMPLEMENTATION-ROADMAP.md)
- [Goals](../02-goals-and-milestones/GOALS.md)
- [Milestones](../02-goals-and-milestones/MILESTONES.md)

---

## HIPAA Compliance Notes

All guides include HIPAA compliance considerations:

- **PHI Handling:** De-identification before non-BAA systems
- **Audit Logging:** All operations logged with timestamps
- **Access Controls:** Role-based access, least privilege
- **Data Security:** Encryption in transit (HTTPS), secure credential storage
- **BAA Coverage:** Verify all services are BAA-covered
- **Safe Harbor:** 18 identifiers removed before analytics/logging

---

## Security Best Practices

Common across all guides:

### ✅ DO:
- Store credentials in password manager
- Use `.env` files for secrets (never commit)
- Enable 2FA on all accounts
- Rotate credentials every 90 days
- Monitor API usage and access logs
- Use least-privilege OAuth scopes
- Implement audit logging

### ❌ DON'T:
- Commit credentials to Git
- Share passwords or OAuth tokens
- Skip 2FA setup
- Use root-level permissions
- Store PHI in logs
- Bypass security controls

---

## Troubleshooting

### Common Issues Across Phases

**"404 Not Found" on Shared Drive operations**
- Missing `supportsAllDrives: true` flags
- See: [OAuth Setup Guide - Step 7](OAUTH-SETUP-GUIDE.md#step-7-configure-shared-drive-access)

**"Insufficient Permission" errors**
- Automation account needs **Manager** role (not Content Manager)
- See: [Automation Account Guide - Step 3](AUTOMATION-ACCOUNT-GUIDE.md#step-3-grant-shared-drive-access)

**"API key invalid" for Gemini**
- Check `.env` file formatting
- Verify no extra spaces or quotes
- See: [Gemini Integration Guide - Troubleshooting](GEMINI-INTEGRATION-GUIDE.md#troubleshooting)

**clasp authentication fails**
- Apps Script API not enabled
- Missing OAuth scopes
- See: [Apps Script Deployment Guide - Troubleshooting](APPS-SCRIPT-DEPLOYMENT-GUIDE.md#troubleshooting)

---

## Updates and Maintenance

### Document Update Schedule
- **After each phase completion:** Update success criteria
- **Monthly:** Review for accuracy
- **Quarterly:** Update API references
- **Annually:** Security audit

### Version History
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-08 | Initial creation of all guides | Marvin Maruthur |

---

## Feedback and Improvements

If you encounter issues or have suggestions:

1. Document the issue in implementation notes
2. Create improvement suggestion in project tracking
3. Update guide after resolution
4. Share learnings with team

---

## Related Documents

### Planning
- [PROJECT-CHARTER.md](../01-planning-and-roadmap/PROJECT-CHARTER.md) - Executive overview
- [IMPLEMENTATION-ROADMAP.md](../01-planning-and-roadmap/IMPLEMENTATION-ROADMAP.md) - Detailed timeline
- [ARCHITECTURE.md](../01-planning-and-roadmap/ARCHITECTURE.md) - Technical architecture

### Tracking
- [GOALS.md](../02-goals-and-milestones/GOALS.md) - Detailed goal tracking
- [MILESTONES.md](../02-goals-and-milestones/MILESTONES.md) - High-level milestones

### External
- [HIPAA Compliance Guide](../../03-resources-docs-assets-tools/HIPAA-COMPLIANCE-GUIDE.md)
- [OAuth Permission Infrastructure Plan](../../projects-in-development/google-sheets-projects/google-sheets-framework-building-project/permission-structure-migration-planning/)

---

**Created:** 2025-11-08
**Last Updated:** 2025-11-08
**Owner:** Marvin Maruthur
**Status:** Complete - All guides ready for use
