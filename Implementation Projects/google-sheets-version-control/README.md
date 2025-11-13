# SSD Google Sheets - Staging & Production

Version control for SSD production Google Sheets staging and production environments (~237 sheets).

## Status

🚧 **Initial Setup** - Repository created, ready for pilot sheet migration

## Overview

This repository manages the **Application Layer** of the SSD medical practice management system, providing version control, deployment automation, and safety mechanisms for approximately 237 production Google Sheets.

### Purpose

- **Version Control**: Track all changes to Apps Script code
- **Safe Deployment**: Staging → Production workflow with backups
- **Change History**: Complete audit trail of all modifications
- **Rollback Capability**: Quick recovery from issues
- **Team Collaboration**: Code review and approval process

## Repository Structure

```
ssd-google-sheets-staging-production/
├── production-sheets/          # LIVE production code (snapshots)
│   └── [Sheet folders TBD]
│
├── staging-sheets/             # DEVELOPMENT workspace
│   └── [DEV sheet folders TBD]
│
├── shared-libraries/           # Reusable code across sheets
│   └── [Common libraries TBD]
│
├── scripts/                    # Deployment automation
│   └── [Scripts TBD]
│
├── docs/                       # Documentation
│   └── [Guides TBD]
│
└── .github/                    # GitHub configuration
    └── workflows/              # GitHub Actions (future)
```

## Quick Start

### Prerequisites

- Git installed locally
- GitHub account access (mmaruthurssd)
- Google Apps Script CLI (clasp) installed
- Node.js for automation scripts

### Clone Repository

```bash
git clone https://github.com/mmaruthurssd/ssd-google-sheets-staging-production.git
cd ssd-google-sheets-staging-production
```

## Current Phase: Pilot Setup

**Next Steps**:
1. Select 1 low-risk pilot sheet
2. Create DEV copy in Google Drive
3. Pull code from production and DEV
4. Test manual deployment workflow
5. Document lessons learned

## Development Workflow (Planned)

1. **Edit** code in `staging-sheets/[SHEET]-DEV/`
2. **Test** in DEV Google Sheet
3. **Commit** to Git
4. **Deploy** to production via script
5. **Verify** in production sheet

## Safety Features

- ✅ Automatic backups before deployment
- ✅ Staging environment for testing
- ✅ Code review process
- ✅ Rollback capability
- ✅ Complete audit trail

## Team

**Administrators**:
- Practice Manager
- Alvaro Gonzalez

**Developers**:
- Apps Script Developer
- (Future team members)

## Documentation

- **Planning**: See `medical-practice-workspace/projects-in-development/organization-planning/02-GITHUB-ORGANIZATION-PLAN.md`
- **Registry**: See `medical-practice-workspace/github-organization-registry/`
- **Application Layer**: See `medical-practice-workspace/live-practice-management-system/2-Application Layer/`

## Security

- 🔒 **Private repository** - Team access only
- 🔒 **No PHI stored** - Code only, never data
- 🔒 **No credentials** - Use environment variables
- 🔒 **Protected branches** - Requires approval

See [SECURITY.md](SECURITY.md) for detailed security policies.

## Progress

- [x] Repository created
- [x] Basic structure set up
- [ ] Pilot sheet selected
- [ ] Deployment scripts added
- [ ] First deployment tested
- [ ] GitHub Actions configured
- [ ] Full migration begun

## Support

**Questions or Issues**:
- Check documentation in `docs/` folder
- Review planning documents in workspace
- Create GitHub issue
- Contact Practice Manager

---

**Repository**: https://github.com/mmaruthurssd/ssd-google-sheets-staging-production
**Created**: 2025-10-16
**Status**: 🚧 Initial Setup
