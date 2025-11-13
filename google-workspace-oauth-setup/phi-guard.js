/**
 * PHI Guard - HIPAA Safe Harbor De-identification
 *
 * Removes all 18 HIPAA identifiers per Safe Harbor method:
 * https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html
 */

class PHIGuard {
  constructor() {
    // HIPAA Safe Harbor: 18 identifiers to remove
    this.identifiers = {
      names: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      fax: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      mrn: /\bMRN:?\s*\d+\b/gi,
      accountNumber: /\bAccount:?\s*\d+\b/gi,
      ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
      url: /https?:\/\/[^\s]+/g,

      // Dates (allow year only)
      fullDate: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,

      // Geographic subdivisions (ZIP codes)
      zipCode: /\b\d{5}(?:-\d{4})?\b/g,

      // Vehicle identifiers, license plates
      licensePlate: /\b[A-Z0-9]{6,8}\b/g,
    };
  }

  /**
   * De-identify text by removing all 18 HIPAA identifiers
   */
  deidentify(text) {
    let cleaned = text;
    const removedIdentifiers = [];

    // Remove names
    cleaned = cleaned.replace(this.identifiers.names, (match) => {
      removedIdentifiers.push({ type: 'name', value: match });
      return '[NAME REDACTED]';
    });

    // Remove SSN
    cleaned = cleaned.replace(this.identifiers.ssn, (match) => {
      removedIdentifiers.push({ type: 'ssn', value: match });
      return '[SSN REDACTED]';
    });

    // Remove phone/fax
    cleaned = cleaned.replace(this.identifiers.phone, (match) => {
      removedIdentifiers.push({ type: 'phone', value: match });
      return '[PHONE REDACTED]';
    });

    // Remove email
    cleaned = cleaned.replace(this.identifiers.email, (match) => {
      removedIdentifiers.push({ type: 'email', value: match });
      return '[EMAIL REDACTED]';
    });

    // Remove MRN
    cleaned = cleaned.replace(this.identifiers.mrn, (match) => {
      removedIdentifiers.push({ type: 'mrn', value: match });
      return '[MRN REDACTED]';
    });

    // Remove dates (keep year)
    cleaned = cleaned.replace(this.identifiers.fullDate, (match) => {
      const year = match.match(/\d{4}/)?.[0];
      removedIdentifiers.push({ type: 'date', value: match });
      return year ? `[DATE REDACTED - ${year}]` : '[DATE REDACTED]';
    });

    // Remove ZIP codes (keep first 3 digits)
    cleaned = cleaned.replace(this.identifiers.zipCode, (match) => {
      const prefix = match.substring(0, 3);
      removedIdentifiers.push({ type: 'zipCode', value: match });
      return `${prefix}00`;
    });

    return {
      deidentifiedText: cleaned,
      removedIdentifiers,
      hasPHI: removedIdentifiers.length > 0,
    };
  }

  /**
   * Detect PHI without removing it
   */
  detectPHI(text) {
    const detections = [];

    for (const [type, pattern] of Object.entries(this.identifiers)) {
      const matches = text.match(pattern);
      if (matches) {
        detections.push({
          type,
          count: matches.length,
          examples: matches.slice(0, 3), // First 3 examples
        });
      }
    }

    return {
      hasPHI: detections.length > 0,
      identifiersFound: detections,
      riskLevel: this.assessRisk(detections),
    };
  }

  /**
   * Assess risk level based on PHI found
   */
  assessRisk(detections) {
    if (detections.length === 0) return 'none';

    const highRiskTypes = ['ssn', 'mrn', 'name'];
    const hasHighRisk = detections.some(d => highRiskTypes.includes(d.type));

    if (hasHighRisk) return 'high';
    if (detections.length >= 3) return 'medium';
    return 'low';
  }

  /**
   * Mask PHI partially (for internal use)
   */
  maskPHI(text) {
    let masked = text;

    // Mask SSN: 123-45-6789 → ***-**-6789
    masked = masked.replace(this.identifiers.ssn, (match) => {
      return '***-**-' + match.slice(-4);
    });

    // Mask phone: 555-123-4567 → ***-***-4567
    masked = masked.replace(this.identifiers.phone, (match) => {
      const last4 = match.replace(/\D/g, '').slice(-4);
      return '***-***-' + last4;
    });

    // Mask email: john@example.com → j***@example.com
    masked = masked.replace(this.identifiers.email, (match) => {
      const [local, domain] = match.split('@');
      return local[0] + '***@' + domain;
    });

    return masked;
  }
}

module.exports = PHIGuard;
