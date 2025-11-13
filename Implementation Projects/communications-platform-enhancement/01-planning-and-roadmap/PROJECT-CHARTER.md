---
type: plan
tags: [project-charter, communications, multi-ai, strategy]
---

# Communications Platform Enhancement - Project Charter

**Project Name:** Communications Platform Enhancement
**Project Code:** CPE-2025-001
**Charter Date:** 2025-11-09
**Project Sponsor:** Marvin Maruthur
**Target Completion:** 2025-12-07 (4-5 weeks)

---

## Executive Summary

The Communications Platform Enhancement project transforms the existing Communications MCP Server from a Claude-only, send-only communication tool into a unified, bidirectional communications platform accessible by multiple AI systems (Claude Code and Gemini CLI) across email, Google Chat, and SMS channels with Google Workspace contacts integration.

---

## Business Case

### Problem Statement

**Current State:**
- Communications MCP only accessible via Claude Code (MCP protocol)
- Send-only capabilities (cannot read/receive messages)
- No SMS support
- No integration with Google Workspace contacts
- Gemini CLI cannot access communication tools

**Business Impact:**
- Limited automation potential (one AI system only)
- Manual message checking required
- No unified contact management
- Missed opportunities for multi-channel patient communication
- Reduced efficiency for medical practice workflows

### Proposed Solution

Build a **unified communications platform** with:

1. **Multi-AI Access**
   - Claude Code via MCP protocol (existing)
   - Gemini CLI via HTTP REST API (new)
   - Shared authentication and audit logging

2. **Multi-Channel Support**
   - Email (Gmail SMTP + API)
   - Google Chat (Webhooks + API)
   - SMS (Twilio)
   - All with send AND receive capabilities

3. **Contact Management**
   - Google Workspace People API integration
   - Contact groups and lists
   - Smart addressing (name → email/phone lookup)

4. **Approval Workflow**
   - Optional staging for human review
   - Batch approval capabilities
   - Audit logging for HIPAA compliance

### Expected Benefits

**Quantitative:**
- **80% reduction** in time to send communications (5 min → 1 min)
- **50% reduction** in manual message checking time
- **100% automation** of routine notifications
- Support **2 AI systems** vs 1 (200% increase in tooling access)

**Qualitative:**
- Unified platform for all communication needs
- Better patient communication workflows
- Improved team coordination
- HIPAA-compliant automation
- Future-proof architecture for additional AI systems

---

## Project Objectives

### Primary Objectives

1. **Enable Gemini CLI Access**
   - HTTP REST API with authentication
   - Feature parity with MCP protocol
   - Response time < 500ms

2. **Add SMS Capabilities**
   - Twilio integration for sending
   - Webhook for receiving
   - Staging workflow support
   - HIPAA compliance

3. **Implement Reading/Receiving**
   - Email inbox reading (Gmail API)
   - Google Chat message reading (Spaces API)
   - SMS receiving (Twilio webhooks)
   - Unified search across channels

4. **Integrate Google Workspace Contacts**
   - People API for contact management
   - CRUD operations on contacts
   - Smart addressing functionality
   - Contact groups/lists

5. **Maintain HIPAA Compliance**
   - All operations audited
   - Appropriate BAAs in place
   - PHI handling safeguards
   - Secure credential management

### Success Criteria

**Phase Completion:**
- ✅ Phase 1: Current state documented and tested
- 🎯 Phase 2: HTTP API functional with Gemini CLI
- 🎯 Phase 3: SMS send/receive operational
- 🎯 Phase 4: Email/Chat reading functional
- 🎯 Phase 5: Contacts integrated

**Technical Metrics:**
- API response time < 500ms (95th percentile)
- 99%+ message delivery success rate
- < 1000ms contact lookups
- Zero PHI leakage incidents
- 99%+ uptime after deployment

**User Metrics:**
- Both AI systems can access all channels
- < 5 min to send message from either AI
- Staging approval < 2 min per message
- Contact lookup success rate > 95%

---

## Scope

### In Scope

**Features:**
- ✅ HTTP API for Gemini CLI access
- ✅ SMS sending via Twilio
- ✅ SMS receiving via Twilio webhooks
- ✅ Email reading (IMAP + Gmail API)
- ✅ Google Chat reading (Spaces API)
- ✅ Google Workspace contacts integration
- ✅ Unified staging workflow for all channels
- ✅ HIPAA-compliant audit logging
- ✅ API authentication and authorization
- ✅ Documentation and testing

**Channels:**
- ✅ Email (SMTP + Gmail API)
- ✅ Google Chat (Webhooks + API)
- ✅ SMS (Twilio)

**AI Systems:**
- ✅ Claude Code (MCP protocol)
- ✅ Gemini CLI (HTTP REST API)

### Out of Scope

**Not Included in This Project:**
- ❌ Voice calling (phone calls)
- ❌ Video conferencing integration
- ❌ Slack/Microsoft Teams integration
- ❌ Third-party email services (beyond Gmail)
- ❌ WhatsApp/Signal/other messaging apps
- ❌ Fax integration
- ❌ Calendar/scheduling features
- ❌ File attachments (phase 6+ consideration)
- ❌ End-to-end encryption (S/MIME)
- ❌ Multi-user management (single automation account)

**Future Considerations:**
- File attachments for email
- Calendar integration
- Additional messaging platforms
- Multi-user support with role-based access
- Advanced analytics/reporting

---

## Stakeholders

### Project Team

| Role | Name | Responsibilities |
|------|------|------------------|
| **Project Lead** | Marvin Maruthur | Architecture, development, HIPAA compliance |
| **Technical Lead** | Marvin Maruthur | API design, implementation, testing |
| **Documentation** | Marvin Maruthur | User guides, API docs, runbooks |

### Key Stakeholders

| Stakeholder | Interest | Influence | Engagement Strategy |
|-------------|----------|-----------|---------------------|
| **Medical Practice Staff** | End users of communication tools | High | Weekly demos, training sessions |
| **IT/Security Team** | HIPAA compliance oversight | High | Security reviews, BAA validation |
| **Patients** | Receive communications | Medium | Consent forms, opt-in/out |
| **Google Workspace Admin** | API access, permissions | Medium | API enablement support |
| **Twilio Account Manager** | SMS service, BAA | Medium | Account setup, billing |

---

## Constraints

### Technical Constraints

1. **MCP Protocol Limitation**
   - MCP protocol only works with Claude Code
   - Cannot extend to other AI systems
   - Requires HTTP API for Gemini

2. **Google API Quotas**
   - Gmail API: 1 billion quota units/day
   - People API: 300 requests/min per user
   - Chat API: 60 requests/min per user
   - Requires rate limiting and monitoring

3. **Twilio Costs**
   - SMS: $0.0075 per message (US)
   - Phone number: ~$1/month
   - Budget impact at scale

4. **HIPAA Requirements**
   - Cannot send PHI via SMS (not secure)
   - BAA required for Twilio
   - All operations must be audited
   - Limited to appointment reminders only

### Resource Constraints

1. **Single Developer**
   - One person (Marvin) for architecture, dev, testing, docs
   - 4-5 week timeline
   - ~4-6 hours/day availability

2. **No Staging Environment**
   - Testing on production MCP instance
   - Requires careful deployment strategy
   - Backup/rollback critical

3. **Existing System in Use**
   - Communications MCP currently in use
   - Cannot break existing functionality
   - Backward compatibility required

### Compliance Constraints

1. **HIPAA**
   - BAA required for Twilio (SMS)
   - Google Workspace BAA already in place
   - PHI handling restrictions
   - Audit logging mandatory

2. **Security**
   - API keys must be secured
   - OAuth tokens encrypted
   - TLS/SSL required
   - Regular security reviews

---

## Assumptions

1. **Gemini CLI HTTP Capability**
   - Assumption: Gemini CLI can make HTTP REST API calls
   - Risk: May require wrapper script
   - Validation: Phase 2, week 1

2. **Twilio BAA Available**
   - Assumption: Twilio provides HIPAA BAA for Business accounts
   - Risk: May require enterprise tier
   - Validation: Phase 3, day 1

3. **Google Workspace Permissions**
   - Assumption: Automation account has access to People API
   - Risk: May need admin approval
   - Validation: Phase 5, day 1

4. **Sufficient API Quotas**
   - Assumption: Default Google API quotas sufficient
   - Risk: May need quota increase request
   - Validation: Ongoing monitoring

5. **SMS Patient Consent**
   - Assumption: Patients will consent to SMS reminders
   - Risk: Low opt-in rates
   - Validation: Phase 3 rollout

6. **Backward Compatibility**
   - Assumption: Can extend without breaking existing MCP
   - Risk: MCP SDK changes
   - Validation: Continuous testing

---

## Dependencies

### External Dependencies

| Dependency | Provider | Status | Risk Level | Mitigation |
|------------|----------|--------|------------|------------|
| **Twilio Account** | Twilio | ⏳ Pending | Medium | Sign up early, validate BAA |
| **Twilio BAA** | Twilio | ⏳ Pending | High | Review terms, enterprise tier if needed |
| **People API Access** | Google | ⏳ Pending | Medium | Admin approval process |
| **Gemini CLI Tool** | User | ⏳ Unknown | High | Validate HTTP capability early |
| **OAuth Credentials** | Google Cloud | ✅ Complete | Low | Already configured |

### Internal Dependencies

| Dependency | Status | Owner | Notes |
|------------|--------|-------|-------|
| **Communications MCP v1.0** | ✅ Complete | Marvin | Build and tested |
| **Google Workspace BAA** | ✅ Complete | Practice | Already signed |
| **OAuth Infrastructure** | ✅ Complete | Marvin | Tokens refreshing |
| **PHI Guard System** | ✅ Complete | Marvin | HIPAA safeguards |
| **medical-patient-data workspace** | ✅ Complete | Marvin | Project structure |

---

## Risk Management

### High Risks

**1. Gemini CLI Incompatibility**
- **Probability:** 30%
- **Impact:** High (blocks Phase 2)
- **Mitigation:** Test HTTP capability early, create wrapper if needed
- **Contingency:** HTTP API still useful for future integrations

**2. SMS HIPAA Non-Compliance**
- **Probability:** 20%
- **Impact:** Critical (project halt)
- **Mitigation:** Twilio BAA required, SMS for non-PHI only, patient consent
- **Contingency:** Skip SMS feature if BAA unavailable

**3. API Quota Exceeded**
- **Probability:** 25%
- **Impact:** Medium (service degradation)
- **Mitigation:** Rate limiting, monitoring, quota alerts
- **Contingency:** Request quota increase, implement caching

### Medium Risks

**4. Development Timeline Overrun**
- **Probability:** 40%
- **Impact:** Medium (delayed completion)
- **Mitigation:** Phased approach, clear priorities, buffer time
- **Contingency:** Reduce scope, defer Phase 5 if needed

**5. Twilio Cost Overrun**
- **Probability:** 30%
- **Impact:** Medium (budget impact)
- **Mitigation:** Usage tracking, alerts, budget limits
- **Contingency:** Set daily SMS limits, review high-volume uses

### Low Risks

**6. MCP SDK Breaking Changes**
- **Probability:** 10%
- **Impact:** Medium (refactoring required)
- **Mitigation:** Pin SDK version, monitor releases
- **Contingency:** Upgrade incrementally, test thoroughly

---

## Budget

### Development Costs

**Labor (4-5 weeks):**
- Marvin: 4-6 hours/day × 5 weeks = 100-150 hours
- Rate: Internal resource (no external cost)

**Total Labor:** $0 (internal)

### Service Costs

| Service | Cost | Frequency | Annual |
|---------|------|-----------|--------|
| **Twilio Phone Number** | $1.00 | Monthly | $12 |
| **Twilio SMS (1000/month)** | $7.50 | Monthly | $90 |
| **Google APIs** | $0 | - | $0 |
| **Total Services** | ~$8.50 | Monthly | $102 |

**Phase 3+ Costs:** ~$102/year (~$8.50/month)

### Total Project Budget

- **Development:** $0 (internal)
- **Year 1 Operations:** $102
- **Total Project Cost:** $102

*Note: Assumes internal development, existing Google Workspace subscription, typical SMS volume (~1000 messages/month).*

---

## Timeline

### High-Level Schedule

| Phase | Duration | Target Dates | Key Deliverables |
|-------|----------|--------------|------------------|
| **Phase 1: Current State** | 1 day | Nov 9 | ✅ Documentation, testing |
| **Phase 2: HTTP API** | 4-5 days | Nov 11-15 | HTTP server, Gemini access |
| **Phase 3: SMS** | 2-3 days | Nov 18-20 | Twilio integration |
| **Phase 4: Reading** | 7-10 days | Nov 25-Dec 6 | Email/Chat/SMS reading |
| **Phase 5: Contacts** | 3-4 days | Dec 2-6 | Google Contacts integration |
| **Final Validation** | 5 days | Dec 9-13 | Testing, docs, deployment |

**Total Duration:** 4-5 weeks (Nov 9 - Dec 13, 2025)

### Critical Path

1. Phase 1 completion → Phase 2 start
2. HTTP API functional → Gemini testing
3. Twilio account + BAA → SMS features
4. People API access → Contacts features

---

## Communication Plan

### Status Updates

**Frequency:** Weekly
**Format:** Progress summary email
**Recipients:** Stakeholders, practice staff
**Content:** Phase progress, blockers, next actions

### Milestone Reviews

**Frequency:** End of each phase
**Format:** Demo + documentation
**Recipients:** All stakeholders
**Content:** Feature demo, testing results, next phase plan

### Issue Escalation

**Level 1 (Minor):** Document in project notes
**Level 2 (Medium):** Email stakeholders within 24 hours
**Level 3 (Major):** Immediate notification, mitigation plan required

---

## Approval

### Project Charter Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Project Sponsor** | Marvin Maruthur | _____________ | 2025-11-09 |
| **Technical Lead** | Marvin Maruthur | _____________ | 2025-11-09 |

### Change Control

**Change Request Process:**
1. Document proposed change
2. Assess impact (scope, timeline, budget)
3. Approval required for major changes
4. Update project charter and roadmap

**Major Change Criteria:**
- Scope additions/removals
- Timeline shift > 1 week
- Budget change > 20%
- HIPAA compliance impact

---

## Next Steps

1. ✅ **Charter Approved** (2025-11-09)
2. ⏳ **Kickoff Phase 2** - Week of Nov 11
3. ⏳ **HTTP API Design** - Nov 11-12
4. ⏳ **Gemini CLI Testing** - Nov 13
5. ⏳ **Twilio Account Setup** - Nov 18

---

**Document Version:** 1.0
**Last Updated:** 2025-11-09
**Next Review:** 2025-11-15 (End of Phase 2)
