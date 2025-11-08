---
type: guide
tags: [hipaa, patterns, gemini, best-practices]
---

# HIPAA-Compliant Gemini Integration Patterns

**Purpose:** Design patterns for integrating Gemini API while maintaining HIPAA compliance

**Audience:** Developers working with PHI

---

## Pattern 1: Audit-First Design

**Problem:** Need to track all PHI access for HIPAA compliance

**Solution:** Wrap all Gemini calls with audit logging

```typescript
async function geminiCallWithAudit<T>(
  operation: () => Promise<T>,
  context: {
    userId: string;
    action: string;
    resource: string;
    phiAccessed: boolean;
  }
): Promise<T> {
  try {
    const result = await operation();

    await auditLog({
      ...context,
      timestamp: new Date().toISOString(),
      status: 'success'
    });

    return result;

  } catch (error) {
    await auditLog({
      ...context,
      timestamp: new Date().toISOString(),
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    throw error;
  }
}

// Usage
const result = await geminiCallWithAudit(
  () => classifier.classify(inquiry, userId),
  {
    userId,
    action: 'CLASSIFY_INQUIRY',
    resource: `patient/${patientId}/inquiry`,
    phiAccessed: true
  }
);
```

---

## Pattern 2: Minimum Necessary Principle

**Problem:** HIPAA requires accessing only minimum necessary PHI

**Solution:** De-identify when full PHI not needed

```typescript
// ❌ BAD - Using full PHI when not needed
async function categorizeInquiry(patientRecord: PatientRecord) {
  // Sends name, DOB, SSN, etc. when only symptoms needed
  return await gemini.categorize(JSON.stringify(patientRecord));
}

// ✅ GOOD - Extract only what's needed
async function categorizeInquiry(patientRecord: PatientRecord) {
  // Only send symptoms, not identifiers
  const minimalData = {
    symptoms: patientRecord.symptoms,
    ageRange: getAgeRange(patientRecord.dob),  // Not exact DOB
    generalLocation: patientRecord.zipCode.substring(0, 3)  // Not exact ZIP
  };

  return await gemini.categorize(JSON.stringify(minimalData));
}
```

---

## Pattern 3: Defense in Depth

**Problem:** Single point of failure in security

**Solution:** Multiple layers of protection

```typescript
class SecureGeminiClient {
  private validateRequest(data: any): void {
    // Layer 1: Input validation
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid input data');
    }
  }

  private scanForPHI(text: string): void {
    // Layer 2: PHI detection
    const phi = detectPHI(text);
    if (phi.length > 0 && !this.phiAllowed) {
      throw new Error('PHI detected in non-PHI context');
    }
  }

  private enforceRateLimit(): Promise<void> {
    // Layer 3: Rate limiting
    return this.rateLimiter.checkLimit();
  }

  async call(prompt: string, userId: string): Promise<string> {
    // Layer 4: Authentication
    if (!this.isAuthenticated(userId)) {
      throw new Error('Authentication required');
    }

    // Layer 5: Authorization
    if (!this.isAuthorized(userId, 'gemini:call')) {
      throw new Error('Insufficient permissions');
    }

    this.validateRequest(prompt);
    this.scanForPHI(prompt);
    await this.enforceRateLimit();

    // Layer 6: Audit logging
    return geminiCallWithAudit(
      () => this.gemini.generateContent(prompt),
      { userId, action: 'GEMINI_CALL', resource: 'api', phiAccessed: true }
    );
  }
}
```

---

## Pattern 4: Fail-Safe Defaults

**Problem:** Errors may expose PHI

**Solution:** Default to secure behavior on errors

```typescript
// ❌ BAD - Exposes details in error
async function processInquiry(inquiry: string) {
  try {
    return await gemini.process(inquiry);
  } catch (error) {
    // Error might contain PHI from inquiry
    throw error;  // Exposed to user!
  }
}

// ✅ GOOD - Sanitize errors
async function processInquiry(inquiry: string) {
  try {
    return await gemini.process(inquiry);
  } catch (error) {
    // Log full error (with PHI) securely
    await auditLog({
      userId: 'system',
      action: 'PROCESS_ERROR',
      resource: 'inquiry',
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown'
    });

    // Return generic error to user (no PHI)
    throw new Error('Processing failed. Please contact support with reference ID: ' + generateSafeId());
  }
}
```

---

## Pattern 5: Session Timeout Protection

**Problem:** Long-running sessions increase exposure risk

**Solution:** Automatic timeout and re-authentication

```typescript
class SessionManager {
  private lastActivity: Date = new Date();
  private readonly timeoutMs: number;

  constructor(timeoutMinutes: number = 15) {
    this.timeoutMs = timeoutMinutes * 60 * 1000;
  }

  checkSession(): void {
    const now = new Date();
    const elapsed = now.getTime() - this.lastActivity.getTime();

    if (elapsed > this.timeoutMs) {
      throw new Error('Session expired. Please re-authenticate.');
    }

    this.lastActivity = now;
  }

  async withSession<T>(operation: () => Promise<T>): Promise<T> {
    this.checkSession();
    const result = await operation();
    this.lastActivity = new Date();  // Update on successful operation
    return result;
  }
}

// Usage
const session = new SessionManager(15);  // 15-minute timeout

await session.withSession(async () => {
  return await classifier.classify(inquiry, userId);
});
```

---

## Pattern 6: Encryption at Rest

**Problem:** Cached responses may contain PHI

**Solution:** Encrypt all stored data

```typescript
import * as crypto from 'crypto';

class EncryptedCache {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor() {
    // Key from environment (never hardcode!)
    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString) {
      throw new Error('ENCRYPTION_KEY not configured');
    }
    this.key = Buffer.from(keyString, 'hex');
  }

  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  decrypt(encrypted: string, ivHex: string, tagHex: string): string {
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  async cacheResponse(key: string, value: string): Promise<void> {
    const { encrypted, iv, tag } = this.encrypt(value);

    // Store encrypted data
    await this.storage.set(key, { encrypted, iv, tag });
  }

  async getCachedResponse(key: string): Promise<string | null> {
    const data = await this.storage.get(key);
    if (!data) return null;

    return this.decrypt(data.encrypted, data.iv, data.tag);
  }
}
```

---

## Pattern 7: Data Retention Policy

**Problem:** HIPAA requires proper data retention and disposal

**Solution:** Automated expiration and secure deletion

```typescript
interface RetentionPolicy {
  category: string;
  retentionDays: number;
  disposalMethod: 'secure-delete' | 'archive';
}

const RETENTION_POLICIES: RetentionPolicy[] = [
  { category: 'audit-logs', retentionDays: 2555, disposalMethod: 'archive' },  // 7 years
  { category: 'classifications', retentionDays: 90, disposalMethod: 'secure-delete' },
  { category: 'cache', retentionDays: 1, disposalMethod: 'secure-delete' }
];

class DataRetentionManager {
  async enforceRetention(): Promise<void> {
    for (const policy of RETENTION_POLICIES) {
      await this.cleanupCategory(policy);
    }
  }

  private async cleanupCategory(policy: RetentionPolicy): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    const expiredItems = await this.findExpiredItems(policy.category, cutoffDate);

    for (const item of expiredItems) {
      if (policy.disposalMethod === 'secure-delete') {
        await this.secureDelete(item);
      } else {
        await this.archiveItem(item);
      }
    }

    console.log(`Retention: ${expiredItems.length} items processed for ${policy.category}`);
  }

  private async secureDelete(item: any): Promise<void> {
    // Overwrite data before deletion (DOD 5220.22-M standard)
    await this.storage.overwrite(item.id, crypto.randomBytes(item.size));
    await this.storage.overwrite(item.id, Buffer.alloc(item.size, 0));
    await this.storage.overwrite(item.id, crypto.randomBytes(item.size));
    await this.storage.delete(item.id);
  }
}
```

---

## Pattern 8: Breach Detection

**Problem:** Need to detect potential PHI breaches quickly

**Solution:** Automated monitoring and alerting

```typescript
class BreachDetector {
  async monitorForBreaches(): Promise<void> {
    // Check 1: Unauthorized access attempts
    const suspiciousAccess = await this.detectSuspiciousAccess();
    if (suspiciousAccess.length > 0) {
      await this.alertSecurityTeam('Suspicious access detected', suspiciousAccess);
    }

    // Check 2: Unusual data volume
    const unusualVolume = await this.detectUnusualDataVolume();
    if (unusualVolume) {
      await this.alertSecurityTeam('Unusual data volume', unusualVolume);
    }

    // Check 3: Failed decryption attempts
    const failedDecryption = await this.detectFailedDecryption();
    if (failedDecryption.length > 0) {
      await this.alertSecurityTeam('Failed decryption attempts', failedDecryption);
    }

    // Check 4: PHI in logs
    const phiInLogs = await this.scanLogsForPHI();
    if (phiInLogs.length > 0) {
      await this.alertSecurityTeam('PHI detected in logs', phiInLogs);
    }
  }

  private async detectSuspiciousAccess(): Promise<any[]> {
    const logs = await queryAuditLogs(
      new Date(Date.now() - 24 * 60 * 60 * 1000),  // Last 24 hours
      new Date()
    );

    // Flag: >100 PHI accesses by single user in 1 hour
    const userCounts: Record<string, number> = {};
    logs.filter(log => log.phiAccessed).forEach(log => {
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    });

    return Object.entries(userCounts)
      .filter(([_, count]) => count > 100)
      .map(([userId, count]) => ({ userId, count }));
  }

  private async alertSecurityTeam(
    alertType: string,
    details: any
  ): Promise<void> {
    console.error(`🚨 SECURITY ALERT: ${alertType}`, details);

    // Send to security monitoring system
    await this.sendAlert({
      type: alertType,
      severity: 'high',
      timestamp: new Date().toISOString(),
      details
    });

    // Create incident report
    await this.createIncidentReport(alertType, details);
  }
}
```

---

## Pattern 9: Testing with Synthetic Data

**Problem:** Can't use real PHI for testing

**Solution:** Generate realistic synthetic data

```typescript
class SyntheticDataGenerator {
  generatePatientInquiry(): string {
    const templates = [
      "I need to refill my prescription for [MEDICATION]",
      "I've been experiencing [SYMPTOM] for [DURATION]",
      "What are my lab results from [DATE]?",
      "I'd like to schedule a [APPOINTMENT_TYPE]"
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];

    return template
      .replace('[MEDICATION]', this.randomMedication())
      .replace('[SYMPTOM]', this.randomSymptom())
      .replace('[DURATION]', this.randomDuration())
      .replace('[DATE]', this.randomDate())
      .replace('[APPOINTMENT_TYPE]', this.randomAppointmentType());
  }

  private randomMedication(): string {
    return ['blood pressure medication', 'allergy medication', 'pain reliever'][Math.floor(Math.random() * 3)];
  }

  private randomSymptom(): string {
    return ['headaches', 'back pain', 'fatigue'][Math.floor(Math.random() * 3)];
  }

  private randomDuration(): string {
    return ['2 days', 'a week', '3 weeks'][Math.floor(Math.random() * 3)];
  }

  private randomDate(): string {
    return 'last Monday';  // Relative, not specific
  }

  private randomAppointmentType(): string {
    return ['checkup', 'follow-up', 'consultation'][Math.floor(Math.random() * 3)];
  }
}

// Usage in tests
const generator = new SyntheticDataGenerator();
const testInquiry = generator.generatePatientInquiry();
// "I've been experiencing headaches for a week"
```

---

## Pattern 10: Graceful Degradation

**Problem:** API failures shouldn't compromise security

**Solution:** Safe fallback behavior

```typescript
class ResilientClassifier {
  private primaryClassifier: GeminiClassifier;
  private fallbackClassifier: RuleBasedClassifier;

  async classify(inquiry: string, userId: string): Promise<Classification> {
    try {
      // Try Gemini first
      return await this.primaryClassifier.classify(inquiry, userId);

    } catch (error) {
      console.warn('Gemini classification failed, using fallback');

      // Log the failure
      await auditLog({
        userId,
        action: 'CLASSIFICATION_FALLBACK',
        resource: 'inquiry',
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown'
      });

      // Use rule-based fallback (keywords, patterns)
      return await this.fallbackClassifier.classify(inquiry, userId);
    }
  }
}
```

---

## Checklist: HIPAA-Compliant Integration

Before deploying Gemini integration:

- [ ] Audit logging implemented for all PHI access
- [ ] Minimum necessary principle applied
- [ ] De-identification used when possible
- [ ] Encryption at rest for cached data
- [ ] Encryption in transit (TLS 1.2+)
- [ ] Session timeout implemented (≤30 minutes)
- [ ] Rate limiting configured
- [ ] Error messages sanitized (no PHI exposure)
- [ ] Data retention policy automated
- [ ] Breach detection monitoring active
- [ ] Testing with synthetic data only
- [ ] BAA with Google Workspace confirmed
- [ ] Security incident response plan documented
- [ ] Team HIPAA training completed

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
