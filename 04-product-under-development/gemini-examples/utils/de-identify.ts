/**
 * PHI De-Identification Utility
 *
 * Removes or masks Protected Health Information (PHI) from text
 * Use when full PHI is not required for processing
 */

/**
 * De-identify text by removing common PHI patterns
 *
 * HIPAA Safe Harbor Method - Removes 18 identifiers
 */
export function deIdentifyText(text: string): string {
  let cleaned = text;

  // 1. Names - Basic pattern (First Last format)
  // Note: This is simplistic. Production should use NER (Named Entity Recognition)
  cleaned = cleaned.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME-REDACTED]');

  // 2 & 3. Geographic subdivisions & Dates
  // Remove full addresses
  cleaned = cleaned.replace(/\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir)\b/gi, '[ADDRESS-REDACTED]');

  // Remove ZIP codes (5 or 9 digit)
  cleaned = cleaned.replace(/\b\d{5}(?:-\d{4})?\b/g, '[ZIP-REDACTED]');

  // Remove dates (MM/DD/YYYY, MM-DD-YYYY, Month DD, YYYY)
  cleaned = cleaned.replace(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, '[DATE-REDACTED]');
  cleaned = cleaned.replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi, '[DATE-REDACTED]');

  // 4. Telephone numbers (various formats)
  cleaned = cleaned.replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE-REDACTED]');
  cleaned = cleaned.replace(/\(\d{3}\)\s*\d{3}[-.\s]?\d{4}\b/g, '[PHONE-REDACTED]');

  // 5. Fax numbers (same pattern as phone)
  // Already covered above

  // 6. Email addresses
  cleaned = cleaned.replace(/\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/gi, '[EMAIL-REDACTED]');

  // 7. Social Security numbers (###-##-####)
  cleaned = cleaned.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN-REDACTED]');

  // 8. Medical record numbers (pattern: MRN followed by digits)
  cleaned = cleaned.replace(/\b(?:MRN|Medical Record|Record #):?\s*\d+\b/gi, '[MRN-REDACTED]');

  // 9. Health plan beneficiary numbers
  cleaned = cleaned.replace(/\b(?:Member ID|Subscriber #|Policy #):?\s*[\w-]+\b/gi, '[MEMBER-ID-REDACTED]');

  // 10. Account numbers
  cleaned = cleaned.replace(/\b(?:Account|Acct) #:?\s*\d+\b/gi, '[ACCOUNT-REDACTED]');

  // 11. Certificate/license numbers
  cleaned = cleaned.replace(/\b(?:License|Cert|Certificate) #:?\s*[\w-]+\b/gi, '[CERT-REDACTED]');

  // 12 & 13. Vehicle and device identifiers
  cleaned = cleaned.replace(/\b(?:VIN|Serial #|Device ID):?\s*[\w-]+\b/gi, '[ID-REDACTED]');

  // 14. Web URLs
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/gi, '[URL-REDACTED]');

  // 15. IP addresses (IPv4)
  cleaned = cleaned.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP-REDACTED]');

  // 16. Biometric identifiers - Can't detect in text, skip

  // 17. Full-face photographs - Can't detect in text, skip

  // 18. Other unique identifiers
  // UUID pattern
  cleaned = cleaned.replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[UUID-REDACTED]');

  return cleaned;
}

/**
 * Check if text is safe to print/log (contains no PHI)
 */
export function isTextSafeToPrint(text: string): boolean {
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/,  // SSN
    /\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/i,  // Email
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,  // Phone
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/,  // Dates
    /\b\d{5}(?:-\d{4})?\b/,  // ZIP codes
  ];

  return !phiPatterns.some(pattern => pattern.test(text));
}

/**
 * Detect PHI in text (for pre-commit scanning)
 */
export function detectPHI(text: string): Array<{ type: string; match: string; position: number }> {
  const detections: Array<{ type: string; match: string; position: number }> = [];

  const patterns = [
    { type: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
    { type: 'Email', regex: /\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/gi },
    { type: 'Phone', regex: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
    { type: 'Date', regex: /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g },
    { type: 'ZIP Code', regex: /\b\d{5}(?:-\d{4})?\b/g },
    { type: 'IP Address', regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g },
  ];

  patterns.forEach(({ type, regex }) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      detections.push({
        type,
        match: match[0],
        position: match.index
      });
    }
  });

  return detections;
}

/**
 * Mask PHI (partial redaction - keep format for readability)
 */
export function maskPHI(text: string): string {
  let masked = text;

  // SSN: Show last 4 digits
  masked = masked.replace(/\b\d{3}-\d{2}-(\d{4})\b/g, 'XXX-XX-$1');

  // Phone: Show last 4 digits
  masked = masked.replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?(\d{4})\b/g, 'XXX-XXX-$1');

  // Email: Show domain only
  masked = masked.replace(/\b[\w._%+-]+@([\w.-]+\.[A-Z]{2,})\b/gi, '[REDACTED]@$1');

  // Dates: Show year only
  masked = masked.replace(/\b\d{1,2}[/-]\d{1,2}[/-](\d{4})\b/g, 'XX/XX/$1');

  return masked;
}

/**
 * Validate that de-identification was successful
 */
export function validateDeidentification(original: string, deidentified: string): {
  valid: boolean;
  remainingPHI: Array<{ type: string; match: string }>;
} {
  const remaining = detectPHI(deidentified);

  return {
    valid: remaining.length === 0,
    remainingPHI: remaining
  };
}

// Example usage
if (require.main === module) {
  const testText = `
    Patient John Smith (SSN: 123-45-6789) called from 555-123-4567.
    Email: john.smith@email.com
    Address: 123 Main Street, Anytown, CA 94105
    DOB: 03/15/1980
    MRN: 987654
    Next appointment: 12/25/2024
  `;

  console.log('Original Text:');
  console.log(testText);
  console.log();

  console.log('De-identified Text:');
  console.log(deIdentifyText(testText));
  console.log();

  console.log('Masked Text (partial):');
  console.log(maskPHI(testText));
  console.log();

  console.log('PHI Detection:');
  const detections = detectPHI(testText);
  detections.forEach(d => {
    console.log(`  - ${d.type}: ${d.match} at position ${d.position}`);
  });
}
