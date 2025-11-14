# Security Policy

## Overview

This repository contains Apps Script code for SSD medical practice management. While no PHI (Protected Health Information) is stored here, we maintain strict security practices to protect practice operations and ensure HIPAA compliance.

## What This Repository Contains

✅ **Allowed**:
- Apps Script code (.gs files)
- Configuration files (appsscript.json)
- Documentation
- Deployment scripts
- Code structure metadata

❌ **NEVER Commit**:
- Patient Health Information (PHI)
- Actual spreadsheet data
- API keys or credentials
- OAuth tokens
- Service account credentials
- Email addresses (except in documentation)
- Phone numbers
- Any personally identifiable information (PII)

## Security Measures

### Repository Access

- **Visibility**: Private (team members only)
- **Access Control**: Administrators approve all collaborators
- **Branch Protection**: Main branch requires pull request approval
- **Code Review**: All changes reviewed before production deployment

### Data Handling

1. **Code Only**: This repository stores code, never data
2. **No PHI**: All test data must be anonymized/fake
3. **Environment Variables**: All secrets stored as environment variables
4. **No Hardcoded Credentials**: Use OAuth or service accounts properly configured

### Development Practices

**Required**:
- Use test/fake data for development and testing
- Review all code for accidental PHI before committing
- Keep credentials in `.env` files (gitignored)
- Use Apps Script Properties Service for runtime secrets

**Prohibited**:
- Committing real patient data
- Hardcoding passwords or API keys
- Sharing credentials in commit messages
- Storing PHI in comments or documentation

## HIPAA Compliance

### How We Maintain Compliance

1. **Separation of Code and Data**
   - Code is versioned in Git
   - Data stays in Google Sheets (HIPAA-compliant storage)
   - Never mix the two

2. **Access Controls**
   - GitHub repository: Team members only
   - Google Sheets: Role-based access
   - Audit trail: Git history + Google's audit logs

3. **Audit Trail**
   - All code changes tracked in Git
   - Deployment history documented
   - Access changes logged

4. **Data Minimization**
   - Only code stored here
   - Test data is fake/anonymized
   - No unnecessary information retained

## Reporting Security Issues

### If You Discover

**PHI in Repository**:
1. **DO NOT** create a public issue
2. Contact Practice Manager immediately
3. We will remove from Git history
4. Incident response procedure activated

**Security Vulnerability**:
1. Contact Practice Manager directly
2. Or create a private GitHub issue
3. Mark as "Security" label
4. Do not disclose publicly until fixed

**Contact**: Practice Manager (repository administrator)

## Incident Response

### If PHI is Accidentally Committed

**Immediate Actions**:
1. Stop all work on repository
2. Notify Practice Manager
3. Do not push to remote if caught locally
4. Prepare incident report

**Remediation**:
1. Remove from Git history (git filter-branch or BFG)
2. Force push to overwrite remote
3. All collaborators re-clone repository
4. Document incident per HIPAA requirements
5. Review and update security training

### If Credentials are Exposed

**Immediate Actions**:
1. Revoke/rotate compromised credentials
2. Remove from Git history
3. Audit for unauthorized access
4. Update affected systems

## Security Best Practices

### Before Committing

**Checklist**:
- [ ] No PHI in code or comments
- [ ] No credentials or API keys
- [ ] Test data is fake/anonymized
- [ ] No email addresses (except in docs)
- [ ] No phone numbers
- [ ] `.gitignore` properly configured
- [ ] Environment variables used for secrets

### During Development

**Good**:
- Use Apps Script Properties Service for runtime config
- Use OAuth for authentication
- Store test credentials in `.env` (gitignored)
- Document security considerations

**Bad**:
- Hardcode passwords
- Commit `.env` files
- Use real patient data for testing
- Share credentials in code or comments

### Code Review Focus

Reviewers must check:
1. No PHI or PII present
2. No credentials exposed
3. Proper use of environment variables
4. Security implications of changes
5. Compliance with this policy

## Secure Development Environment

### Required Tools

- **Git**: Version control
- **GitHub CLI**: Secure authentication
- **Clasp**: Apps Script deployment (use OAuth)
- **Node.js**: For automation scripts

### Recommended Practices

1. **Use SSH Keys**: For GitHub authentication
2. **Enable 2FA**: On GitHub account
3. **Keep Tools Updated**: Security patches
4. **Secure Your Machine**: Encryption, lock screen, etc.

## Compliance Documentation

### Audit Trail

Git provides:
- Who made changes (author)
- What changed (diff)
- When (commit timestamp)
- Why (commit message)

### Retention

- Code history: Indefinite (Git)
- Deployment logs: 7 years (practice policy)
- Access logs: Per HIPAA requirements

## Security Training

All team members with repository access must:
1. Review this security policy
2. Complete HIPAA training
3. Understand Git security implications
4. Know how to report security issues

## Policy Updates

This security policy is reviewed:
- Quarterly
- After security incidents
- When requirements change
- When team members join/leave

**Last Updated**: 2025-10-16
**Next Review**: 2026-01-16
**Version**: 1.0

---

**Questions about security?** Contact Practice Manager
**Report security issues**: See "Reporting Security Issues" above
