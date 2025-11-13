require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

class PatientInquiryClassifier {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.3,
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 1024,
      },
    });

    this.auditLog = [];
  }

  async classify(inquiryText, metadata = {}) {
    const timestamp = new Date().toISOString();

    // Pre-validation: Check for PHI
    const hasPHI = this.detectPHI(inquiryText);

    if (hasPHI && !process.env.ENABLE_PHI_GUARD) {
      throw new Error('PHI detected but PHI Guard is disabled');
    }

    const prompt = `
You are a medical office assistant helping classify patient inquiries.

Classify the following patient inquiry into one of these categories:
- "routine": Routine appointment requests, prescription refills, general questions
- "urgent": Medical concerns requiring same-day attention, symptoms, pain
- "administrative": Billing questions, insurance, paperwork, account issues

Inquiry: "${inquiryText}"

Respond ONLY with valid JSON:
{
  "category": "routine|urgent|administrative",
  "confidence": 0.0-1.0,
  "reason": "brief explanation (max 50 words)",
  "suggestedAction": "specific next step"
}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse JSON response
      const classification = JSON.parse(this.extractJSON(responseText));

      // Audit logging
      const auditEntry = {
        timestamp,
        operation: 'classify_patient_inquiry',
        user: 'automation@ssdsbc.com',
        hasPHI,
        deidentified: hasPHI, // In production, apply de-identification
        classification: classification.category,
        confidence: classification.confidence,
        metadata,
      };

      this.auditLog.push(auditEntry);
      this.saveAuditLog();

      return {
        success: true,
        classification,
        auditEntry,
      };

    } catch (error) {
      const auditEntry = {
        timestamp,
        operation: 'classify_patient_inquiry',
        user: 'automation@ssdsbc.com',
        error: error.message,
        metadata,
      };

      this.auditLog.push(auditEntry);
      this.saveAuditLog();

      throw error;
    }
  }

  detectPHI(text) {
    // Simple PHI detection (in production, use comprehensive PHI Guard)
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // Names
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/, // Dates
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    ];

    return phiPatterns.some(pattern => pattern.test(text));
  }

  extractJSON(text) {
    // Extract JSON from markdown code blocks or plain text
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
                      text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
  }

  saveAuditLog() {
    // Save audit log to file (in production, save to Google Drive)
    const logFile = 'gemini-audit-log.json';
    fs.writeFileSync(logFile, JSON.stringify(this.auditLog, null, 2));
  }

  getAuditLog() {
    return this.auditLog;
  }
}

module.exports = PatientInquiryClassifier;
