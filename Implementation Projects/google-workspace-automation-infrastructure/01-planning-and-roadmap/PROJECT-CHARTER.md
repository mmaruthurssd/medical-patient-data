# Project Charter: Google Workspace Automation Infrastructure

**Project Code:** GWAI-2025-001
**Version:** 1.0
**Date:** 2025-11-08
**Status:** Active

---

## Executive Summary

### Purpose
Establish comprehensive Google Workspace automation infrastructure to enable:
- HIPAA-compliant AI operations via Gemini API
- Automated deployment to 240+ Google Sheets
- Programmatic access to Google Drive and Sheets APIs
- Unified authentication via dedicated automation account

### Business Case
**Current State:**
- Manual deployment to Google Sheets (30+ min per sheet)
- Permission conflicts ("works for Alice not Bob")
- No systematic PHI-safe AI integration
- Limited automation capabilities

**Future State:**
- Automated deployment (< 5 min per sheet)
- Zero permission conflicts
- HIPAA-compliant Gemini integration
- Scalable automation infrastructure

**ROI:**
- 87% faster deployments
- 100% permission consistency
- Enables AI-assisted patient workflows
- Foundation for future automation

---

## Project Scope

### In Scope

#### Phase 1: Authentication Foundation
- Create automation@ssdsbc.com account
- Set up Google Cloud Project
- Configure OAuth 2.0 credentials
- Grant Shared Drive access (Manager role to all drives)
- Test authentication with Drive/Sheets/Apps Script APIs

#### Phase 2: Gemini API Integration
- Obtain Gemini API key
- Configure environment (.env setup)
- Test basic Gemini connectivity
- Implement patient inquiry classifier
- Test PHI de-identification utilities
- Validate HIPAA audit logging

#### Phase 3: Google Drive Integration
- Implement Drive API wrapper
- Test read/write operations on Shared Drives
- Configure bidirectional sync
- Integrate with PHI Guard protection
- Test file management workflows

#### Phase 4: Apps Script Deployment
- Install and configure clasp CLI
- Test pull/push single script
- Build sheet registry (240+ sheets)
- Implement bulk deployment capability
- Test automated deployments

#### Phase 5: Combined Workflows
- Integrate Gemini + Drive/Sheets APIs
- Build patient workflow automation
- Test end-to-end workflows
- Deploy to production
- Team training and handoff

### Out of Scope

**Not Included in This Project:**
- Google Sheets framework refactoring (separate project)
- Patient-facing UI development
- Electronic Health Records (EHR) integration
- Billing system automation
- Mobile app development

**Future Enhancements (v2.0+):**
- Service Account with Domain-Wide Delegation
- CI/CD pipeline integration
- Advanced monitoring and alerting
- Multi-user access patterns
- Workload Identity Federation (keyless auth)

---

## Project Objectives

### Primary Objectives

1. **Establish Automation Account Infrastructure**
   - Success: automation@ssdsbc.com created with Manager access to all Shared Drives
   - Timeline: Week 1

2. **Enable OAuth-Based API Access**
   - Success: All Google Workspace APIs accessible via OAuth
   - Timeline: Week 1-2

3. **Integrate Gemini API (HIPAA-Compliant)**
   - Success: Gemini can process PHI with full audit logging
   - Timeline: Week 2-3

4. **Implement Google Drive/Sheets Integration**
   - Success: Programmatic read/write to all 240+ sheets
   - Timeline: Week 3-4

5. **Enable Automated Apps Script Deployment**
   - Success: Bulk deployment to 240+ sheets in < 2 hours
   - Timeline: Week 4-6

6. **Deliver Production-Ready Combined Workflows**
   - Success: End-to-end patient workflows tested and deployed
   - Timeline: Week 6-8

### Secondary Objectives

- Complete documentation for all components
- Train team on new infrastructure
- Establish operational runbooks
- Create monitoring and maintenance procedures

---

## Success Criteria

### Quantitative Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| **Permission errors per week** | 15-20 | 0 | Error logs |
| **Deployment time (single sheet)** | 30+ min | < 5 min | Time tracking |
| **Deployment time (all 240 sheets)** | N/A | < 2 hours | Time tracking |
| **Deployment success rate** | ~80% | > 95% | Success count |
| **API authentication failures** | 5-10/week | 0 | Monitoring logs |
| **PHI audit log compliance** | Manual | 100% automated | Audit review |

### Qualitative Metrics

**Team Adoption:**
- ✅ All developers can deploy without permission issues
- ✅ OAuth setup is straightforward and documented
- ✅ Team confident using automation infrastructure
- ✅ Troubleshooting is self-service via documentation

**HIPAA Compliance:**
- ✅ All PHI operations logged with timestamps
- ✅ De-identification utilities validated
- ✅ No PHI leakage to non-BAA systems
- ✅ Audit trail meets HIPAA requirements

**Operational Excellence:**
- ✅ Bulk deployments reliable and predictable
- ✅ Rollback procedures tested and working
- ✅ Monitoring provides visibility into system health
- ✅ Maintenance overhead is minimal (< 2 hours/month)

---

## Stakeholders

### Project Sponsor
- **Name:** Marvin Maruthur
- **Role:** Practice Owner / Developer
- **Email:** mm@ssdsbc.com
- **Responsibilities:** Project approval, resource allocation, final decisions

### Project Lead
- **Name:** Marvin Maruthur
- **Role:** Technical Lead / Developer
- **Email:** mm@ssdsbc.com
- **Responsibilities:** Architecture, implementation, documentation, team training

### Key Stakeholders

| Stakeholder | Role | Interest | Influence | Strategy |
|-------------|------|----------|-----------|----------|
| **Medical Practice Staff** | End Users | Reliable sheet functionality | Low | Inform of changes |
| **IT/Security Team** | Compliance | HIPAA compliance, security | High | Involve in reviews |
| **Alvaro (Future)** | Developer | Team onboarding, collaboration | Medium | Prepare training materials |
| **Google Workspace Admin** | Admin | Account creation, API access | High | Collaborate on setup |

### Communication Plan

**Weekly Updates:**
- Progress summary
- Blockers and risks
- Next week's plan
- Decisions needed

**Phase Completion:**
- Phase summary report
- Metrics achieved
- Lessons learned
- Next phase preview

**Go-Live Announcement:**
- System availability
- Training schedule
- Support contacts
- Known limitations

---

## Timeline & Milestones

### High-Level Timeline

**Total Duration:** 8 weeks
**Start Date:** 2025-11-08
**Target End Date:** 2026-01-08

### Phase Milestones

| Phase | Duration | Start | End | Status |
|-------|----------|-------|-----|--------|
| **Phase 1: Authentication** | 1 week | 2025-11-08 | 2025-11-15 | 🚧 In Progress |
| **Phase 2: Gemini API** | 1 week | 2025-11-15 | 2025-11-22 | ⏸️ Partially Complete (waiting for API key) |
| **Phase 3: Drive Integration** | 2 weeks | 2025-11-22 | 2025-12-06 | 🚧 Not Started |
| **Phase 4: Apps Script** | 2 weeks | 2025-12-06 | 2025-12-20 | 🚧 Not Started |
| **Phase 5: Combined Workflows** | 2 weeks | 2025-12-20 | 2026-01-08 | 🚧 Not Started |

### Key Milestones

- **M1:** Automation account created and configured ⏳ 2025-11-15
- **M2:** OAuth authentication working for all APIs ⏳ 2025-11-15
- **M3:** Gemini API tested with patient workflows ⏳ 2025-11-22
- **M4:** Drive/Sheets API integration complete ⏳ 2025-12-06
- **M5:** Bulk deployment to 240+ sheets successful ⏳ 2025-12-20
- **M6:** Production deployment and team training ⏳ 2026-01-08

---

## Budget & Resources

### Personnel

| Role | Allocation | Duration | Cost Estimate |
|------|------------|----------|---------------|
| **Technical Lead** | 40% time | 8 weeks | 64 hours |
| **Google Workspace Admin** | 5% time | Week 1 | 4 hours |
| **Security Review** | As needed | Week 2 | 2 hours |

**Total Effort:** ~70 hours

### Infrastructure

| Item | Cost | Frequency | Annual Cost |
|------|------|-----------|-------------|
| **Google Workspace License** (automation@ssdsbc.com) | $12-18/user/month | Monthly | $144-216/year |
| **Google Cloud API Usage** | $0-50/month | Monthly | $0-600/year |
| **Secret Manager** (optional) | $0.06/10k accesses | As used | ~$10/year |

**Total Infrastructure:** ~$150-850/year

### Tools & Software

- Node.js (free)
- VS Code (free)
- clasp CLI (free)
- Git (free)
- Google APIs (free tier, then usage-based)

**Total Tools Cost:** $0 (free tier sufficient)

---

## Risks & Mitigation

### High Risks

| Risk | Probability | Impact | Mitigation | Contingency |
|------|-------------|--------|------------|-------------|
| **Automation account compromise** | Low | Critical | 2FA, secure storage, audit logs, regular review | Immediate credential rotation, access audit, incident response |
| **PHI data breach** | Low | Critical | PHI Guard, audit logging, de-identification, team training | Breach notification protocol, forensic analysis, HIPAA incident reporting |
| **Gemini API key leakage** | Medium | High | .env files, gitignore, secret rotation, never commit | Revoke key, rotate immediately, audit usage, notify Google |
| **Bulk deployment failure** | Medium | High | Extensive testing, dry-runs, rollback capability | Sheet-by-sheet manual rollback, restore from backups |

### Medium Risks

| Risk | Probability | Impact | Mitigation | Contingency |
|------|-------------|--------|------------|-------------|
| **API quota exceeded** | Medium | Medium | Rate limiting, monitoring, quota increase request | Throttle operations, schedule off-peak, request quota bump |
| **Permission errors at scale** | Medium | Medium | Shared Drive flags, automation account pattern, testing | Audit permissions, re-grant access, fix flags |
| **Integration complexity** | High | Medium | Phased approach, modular design, extensive docs | Simplify scope, defer complex features to v2.0 |
| **Team knowledge gaps** | Medium | Medium | Comprehensive docs, training sessions, runbooks | One-on-one coaching, extended support period |

### Low Risks

| Risk | Probability | Impact | Mitigation | Contingency |
|------|-------------|--------|------------|-------------|
| **Google API changes** | Low | Low | Monitor Google Cloud release notes, version pinning | Update code, test thoroughly, gradual migration |
| **Cost overruns** | Low | Low | Monitor usage, set billing alerts, optimize API calls | Review usage patterns, optimize code, request budget increase |

---

## Assumptions & Constraints

### Assumptions

1. **Access:** Admin access to Google Workspace available for account creation
2. **BAA:** Google Workspace BAA covers Gemini API for PHI processing
3. **Resources:** Developer time available (~8 hours/week for 8 weeks)
4. **Sheets:** 240+ Google Sheets count is accurate and stable
5. **APIs:** Google APIs remain stable during project timeline
6. **Team:** Alvaro onboarding will occur after infrastructure is complete

### Constraints

1. **HIPAA:** All PHI operations must be logged and auditable
2. **Security:** No credentials in Git, all secrets in .env or vault
3. **Budget:** Minimal budget available (infrastructure costs only)
4. **Timeline:** 8-week target (flexible if scope expands)
5. **Access:** Automation account must have Manager role (not just Content Manager)
6. **BAA:** Can only use Google services covered under BAA

---

## Dependencies

### External Dependencies

- **Google Workspace:** Admin Console access for account creation
- **Google Cloud Platform:** API enablement, OAuth configuration
- **Google AI Studio:** Gemini API key provisioning
- **Medical Practice Workspace:** Shared Drive access, permissions

### Internal Dependencies

- **PHI Guard System:** Must be operational before Gemini integration
- **Three-Workspace Architecture:** Foundation for separation of concerns
- **HIPAA Training:** Team must complete before handling PHI
- **Documentation:** Existing OAuth plan and Gemini guides

### Blocking Dependencies

⚠️ **Critical Path:**
1. Automation account creation (blocks everything)
2. Google Cloud Project setup (blocks OAuth and APIs)
3. Gemini API key (blocks Phase 2)
4. Shared Drive Manager access (blocks Apps Script deployment)

---

## Deliverables

### Phase 1: Authentication Foundation
- ✅ Automation account (automation@ssdsbc.com) created and configured
- ✅ Google Cloud Project with APIs enabled
- ✅ OAuth 2.0 credentials configured and trusted
- ✅ Authentication tested with Drive/Sheets/Apps Script APIs
- ✅ Documentation: OAuth Setup Guide

### Phase 2: Gemini API Integration
- ✅ Gemini API key obtained and secured
- ✅ .env file configured
- ✅ Patient inquiry classifier tested
- ✅ PHI de-identification utilities validated
- ✅ HIPAA audit logging implemented
- ✅ Documentation: Gemini Integration Guide

### Phase 3: Google Drive Integration
- ✅ Drive API wrapper implemented
- ✅ Read/write operations tested on Shared Drives
- ✅ Bidirectional sync configured
- ✅ PHI Guard integration tested
- ✅ Documentation: Google Drive API Guide

### Phase 4: Apps Script Deployment
- ✅ clasp CLI installed and authenticated
- ✅ Sheet registry built (240+ sheets)
- ✅ Bulk deployment scripts implemented
- ✅ Deployment tested on pilot sheets
- ✅ Full deployment to all 240+ sheets successful
- ✅ Documentation: Apps Script Deployment Guide

### Phase 5: Combined Workflows
- ✅ Gemini + Drive/Sheets integration complete
- ✅ Patient workflow automation tested
- ✅ End-to-end workflows validated
- ✅ Production deployment complete
- ✅ Team training delivered
- ✅ Operational runbooks created

---

## Approval

### Project Charter Approval

**Project Sponsor:**
- Name: ________________________________
- Signature: ____________________________
- Date: ________________________________

**Project Lead:**
- Name: Marvin Maruthur
- Signature: ____________________________
- Date: 2025-11-08

**Security/Compliance Review:**
- Name: ________________________________
- Signature: ____________________________
- Date: ________________________________

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-08 | Marvin Maruthur | Initial project charter created |

---

**Next Review:** 2025-11-15 (end of Phase 1)
**Document Owner:** Marvin Maruthur (mm@ssdsbc.com)
**Status:** Active
