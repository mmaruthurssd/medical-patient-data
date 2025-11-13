---
type: guide
tags: [hipaa, compliance, phi, security, audit]
---

# HIPAA Compliance Guide

**Purpose:** Comprehensive guide for HIPAA-compliant development and operations

**Scope:** All workflows involving Protected Health Information (PHI)

---

## Table of Contents

1. [Overview](#overview)
2. [PHI Identification](#phi-identification)
3. [Development Requirements](#development-requirements)
4. [Security Controls](#security-controls)
5. [Audit & Logging](#audit--logging)
6. [Incident Response](#incident-response)
7. [Compliance Checklist](#compliance-checklist)

---

## Overview

### What is HIPAA?

Health Insurance Portability and Accountability Act (HIPAA) establishes national standards for protecting patient health information.

### Key Requirements

**Privacy Rule** - Protects individually identifiable health information
**Security Rule** - Safeguards for electronic PHI (ePHI)
**Breach Notification Rule** - Notification requirements for PHI breaches

### Our Commitment

This workspace implements HIPAA Security Rule technical safeguards:
- Access controls
- Audit controls
- Integrity controls
- Transmission security

---

## PHI Identification

### 18 HIPAA Identifiers

Protected Health Information (PHI) includes any of these 18 identifiers:

1. **Names** - Full names, nicknames, maiden names
2. **Geographic subdivisions** smaller than state (addresses, cities, ZIP codes)
3. **Dates** - Birth dates, admission dates, discharge dates, death dates
4. **Telephone numbers**
5. **Fax numbers**
6. **Email addresses**
7. **Social Security numbers**
8. **Medical record numbers**
9. **Health plan beneficiary numbers**
10. **Account numbers**
11. **Certificate/license numbers**
12. **Vehicle identifiers** and serial numbers
13. **Device identifiers** and serial numbers
14. **Web URLs**
15. **IP addresses**
16. **Biometric identifiers** (fingerprints, voice prints)
17. **Full-face photographs**
18. **Any other unique identifying number, characteristic, or code**

### Special Cases

**Diagnosis Codes (ICD-10)** - PHI when linked to patient
**Procedure Codes (CPT)** - PHI when linked to patient
**Lab Results** - PHI when linked to patient
**Appointment Times** - PHI when linked to patient

---

## Development Requirements

### Data Minimization Principle

**Only access PHI when absolutely necessary for treatment, payment, or operations.**

```typescript
// ❌ BAD - Retrieving unnecessary PHI
const allPatientData = fetchPatient(patientId); // Gets name, SSN, address, etc.

// ✅ GOOD - Minimal necessary
const appointmentTime = fetchAppointmentTime(patientId); // Only gets time
```

### De-Identification

When PHI is not needed, use de-identified or anonymized data:

**Safe Harbor Method:**
- Remove all 18 identifiers
- No actual knowledge remaining identifiers can identify individual

**Expert Determination Method:**
- Statistical/scientific expert determines very small risk of re-identification

### Example: De-Identified Data

```typescript
interface DeIdentifiedRecord {
  patientHash: string;        // One-way hash, not reversible
  ageRange: '18-30' | '31-50' | '51+'; // Not exact age
  zipPrefix: string;          // First 3 digits only (if population > 20,000)
  diagnosisCategory: string;  // General category, not specific
  appointmentMonth: string;   // Month only, not specific date
}
```

---

## Security Controls

### 1. Access Controls

**Authentication Required:**
```typescript
// All PHI access must be authenticated
if (!isAuthenticated(user)) {
  throw new UnauthorizedError('Authentication required for PHI access');
}

// Role-based access control
if (!hasRole(user, 'healthcare_provider')) {
  throw new ForbiddenError('Insufficient permissions');
}
```

**Unique User Identification:**
- Each user must have unique credentials
- No shared accounts
- Multi-factor authentication recommended

### 2. Encryption

**At Rest:**
- All PHI must be encrypted when stored
- AES-256 minimum encryption standard
- Encryption keys stored separately from data

**In Transit:**
- TLS 1.2+ for all PHI transmission
- HTTPS only, no HTTP
- Certificate validation required

```typescript
// ✅ GOOD - Encrypted transmission
const response = await fetch('https://api.practice.com/patients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(encryptedPayload)
});
```

### 3. Automatic Logoff

Sessions must timeout after inactivity:
- Recommended: 15 minutes
- Maximum: 30 minutes

### 4. PHI Scanning (Pre-Commit)

**Automatic Detection:**
```bash
# Pre-commit hook scans for PHI before git commit
git commit -m "Add patient workflow"
# Hook runs security-compliance-mcp PHI scanner
# Blocks commit if PHI detected
```

**Manual Scanning:**
```bash
# Scan specific file
npx security-scan --phi patient-data.ts

# Scan entire directory
npx security-scan --phi --recursive ./src
```

---

## Audit & Logging

### Required Audit Logs

Must log all PHI access with:
- User ID
- Date and time
- Action performed (create, read, update, delete)
- Resource accessed
- Success/failure status

**Example Audit Log Entry:**
```json
{
  "timestamp": "2025-11-08T15:30:00Z",
  "userId": "dr.smith@practice.com",
  "action": "READ",
  "resource": "patient/12345/medical-record",
  "status": "success",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

### Log Retention

- Minimum: 6 years
- Recommended: 7 years (to match most state laws)
- Logs themselves must be protected as PHI

### Implementation

```typescript
import { auditLog } from './audit-logger';

async function accessPatientRecord(userId: string, patientId: string) {
  try {
    const record = await db.patients.findOne({ id: patientId });

    await auditLog({
      userId,
      action: 'READ',
      resource: `patient/${patientId}/medical-record`,
      status: 'success'
    });

    return record;
  } catch (error) {
    await auditLog({
      userId,
      action: 'READ',
      resource: `patient/${patientId}/medical-record`,
      status: 'failure',
      error: error.message
    });

    throw error;
  }
}
```

---

## Incident Response

### PHI Breach Definition

Unauthorized acquisition, access, use, or disclosure of PHI that compromises security or privacy.

### Immediate Actions

1. **Contain** - Stop the breach immediately
2. **Assess** - Determine scope and severity
3. **Document** - Record all details
4. **Notify** - Alert compliance officer

### Notification Requirements

**Individuals:**
- Within 60 days of discovery
- Method: First-class mail or email (if authorized)

**HHS (Department of Health and Human Services):**
- Breaches affecting 500+ individuals: within 60 days
- Breaches affecting <500 individuals: annual report

**Media:**
- Breaches affecting 500+ individuals in same state/jurisdiction

### Incident Report Template

```markdown
## PHI Breach Incident Report

**Date Discovered:** YYYY-MM-DD
**Time Discovered:** HH:MM TZ
**Discovered By:** [Name, Role]

**Breach Description:**
[What happened, how it occurred]

**Affected Systems:**
- System 1
- System 2

**Estimated Impact:**
- Number of individuals affected: [number]
- Types of PHI involved: [list identifiers]
- Time period of exposure: [start - end]

**Immediate Actions Taken:**
1. [Action 1]
2. [Action 2]

**Root Cause:**
[Analysis of how breach occurred]

**Remediation:**
[Steps to prevent recurrence]

**Notifications:**
- [ ] Individuals notified (date: ______)
- [ ] HHS notified (date: ______)
- [ ] Media notified (if applicable, date: ______)
```

---

## Compliance Checklist

### Development Phase

- [ ] PHI identified and documented
- [ ] Data minimization applied
- [ ] De-identification used where possible
- [ ] Encryption implemented (at rest and in transit)
- [ ] Access controls implemented
- [ ] Pre-commit PHI scanning enabled
- [ ] Code review completed

### Testing Phase

- [ ] PHI removed from test data
- [ ] Synthetic data used for testing
- [ ] Security testing completed
- [ ] Penetration testing (if applicable)
- [ ] Audit logging validated

### Deployment Phase

- [ ] Production environment secured
- [ ] TLS/HTTPS verified
- [ ] Database encryption confirmed
- [ ] Access controls deployed
- [ ] Audit logging enabled
- [ ] Backup encryption verified
- [ ] Disaster recovery tested

### Operations Phase

- [ ] Audit logs monitored regularly
- [ ] Access reviewed quarterly
- [ ] Security patches applied promptly
- [ ] Incident response plan documented
- [ ] Staff training completed
- [ ] Annual risk assessment conducted

---

## Tools & Resources

### Available MCP Tools

**security-compliance-mcp:**
- `scan_for_credentials` - Detect API keys, tokens
- `scan_for_phi` - Detect PHI in code/files
- `manage_hooks` - Install pre-commit scanning

**workspace-brain:**
- `log_event` - Audit trail logging
- `track_workflow_cost` - ROI tracking with PHI handling flags

**backup-dr:**
- `create_backup` - HIPAA-compliant backups with PHI scanning

### External Resources

- HIPAA Security Rule: https://www.hhs.gov/hipaa/for-professionals/security/
- Breach Notification Rule: https://www.hhs.gov/hipaa/for-professionals/breach-notification/
- OCR Guidance: https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/

---

## Contact

**HIPAA Compliance Officer:** [To be designated]
**Security Incident Reporting:** [security@practice.com]
**Privacy Questions:** [privacy@practice.com]

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Next Review:** 2026-11-08
