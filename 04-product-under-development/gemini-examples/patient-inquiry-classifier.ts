/**
 * Patient Inquiry Classifier
 *
 * Classifies incoming patient messages by urgency and category
 * HIPAA-COMPLIANT: Includes audit logging and PHI handling
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { auditLog } from './utils/audit-logger';
import { deIdentifyText, isTextSafeToPrint } from './utils/de-identify';

dotenv.config();

interface ClassificationResult {
  urgency: 1 | 2 | 3 | 4 | 5;  // 1=routine, 5=emergency
  category: string;
  suggestedAction: string;
  reasoning: string;
}

export class PatientInquiryClassifier {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Classify patient inquiry with HIPAA compliance
   */
  async classify(
    inquiry: string,
    userId: string,
    patientId?: string
  ): Promise<ClassificationResult> {
    const startTime = Date.now();

    try {
      // Build classification prompt
      const prompt = this.buildPrompt(inquiry);

      // Call Gemini API
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse classification result
      const classification = this.parseResponse(text);

      // Audit log (HIPAA requirement)
      await auditLog({
        timestamp: new Date().toISOString(),
        userId,
        action: 'CLASSIFY_INQUIRY',
        resource: patientId ? `patient/${patientId}/inquiry` : 'inquiry',
        status: 'success',
        phiAccessed: true
      });

      // Log performance metric
      const duration = Date.now() - startTime;
      console.log(`✅ Classification completed in ${duration}ms`);

      return classification;

    } catch (error) {
      // Audit log failure
      await auditLog({
        timestamp: new Date().toISOString(),
        userId,
        action: 'CLASSIFY_INQUIRY',
        resource: patientId ? `patient/${patientId}/inquiry` : 'inquiry',
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Build classification prompt
   */
  private buildPrompt(inquiry: string): string {
    return `You are a medical triage assistant. Classify the following patient inquiry:

INQUIRY:
${inquiry}

Provide a JSON response with this exact structure:
{
  "urgency": <1-5>,
  "category": "<category>",
  "suggestedAction": "<action>",
  "reasoning": "<reasoning>"
}

Urgency Scale:
1 - Routine (can wait weeks)
2 - Non-urgent (can wait days)
3 - Moderate (should be seen within 24-48 hours)
4 - Urgent (should be seen same day)
5 - Emergency (immediate medical attention)

Categories:
- Appointment Scheduling
- Medication Refill
- Lab Results Question
- Symptom Inquiry
- Billing Question
- General Question
- Emergency

Suggested Actions:
- Schedule routine appointment
- Schedule urgent appointment
- Contact physician
- Call 911 / Go to ER
- Refer to billing department
- Provide self-service information

Respond ONLY with the JSON object, no additional text.`;
  }

  /**
   * Parse Gemini response into structured result
   */
  private parseResponse(responseText: string): ClassificationResult {
    try {
      // Extract JSON from response (handles markdown code blocks)
      let jsonText = responseText.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(jsonText);

      // Validate structure
      if (!parsed.urgency || !parsed.category || !parsed.suggestedAction) {
        throw new Error('Invalid response structure');
      }

      // Ensure urgency is in range
      const urgency = Math.min(5, Math.max(1, parseInt(parsed.urgency))) as 1 | 2 | 3 | 4 | 5;

      return {
        urgency,
        category: parsed.category,
        suggestedAction: parsed.suggestedAction,
        reasoning: parsed.reasoning || 'No reasoning provided'
      };

    } catch (error) {
      console.error('Failed to parse Gemini response:', responseText);
      throw new Error('Failed to parse classification response');
    }
  }

  /**
   * Classify with de-identification (when full PHI not needed)
   */
  async classifyDeidentified(
    inquiry: string,
    userId: string
  ): Promise<ClassificationResult> {
    // Remove PHI before processing
    const deidentified = deIdentifyText(inquiry);

    console.log('ℹ️  Processing de-identified inquiry');

    return this.classify(deidentified, userId);
  }
}

// Example usage
async function main() {
  const classifier = new PatientInquiryClassifier();

  // Example 1: Routine inquiry (de-identified)
  const inquiry1 = "I'd like to schedule a routine checkup. It's been about a year since my last visit.";

  console.log('Example 1: Routine Inquiry');
  console.log('━'.repeat(50));

  const result1 = await classifier.classifyDeidentified(inquiry1, 'system-test');

  console.log('Inquiry:', inquiry1);
  console.log('Classification:');
  console.log(`  Urgency: ${result1.urgency}/5`);
  console.log(`  Category: ${result1.category}`);
  console.log(`  Action: ${result1.suggestedAction}`);
  console.log(`  Reasoning: ${result1.reasoning}`);
  console.log();

  // Example 2: Urgent inquiry
  const inquiry2 = "I've had chest pain for the past 2 hours and shortness of breath.";

  console.log('Example 2: Urgent Inquiry');
  console.log('━'.repeat(50));

  const result2 = await classifier.classifyDeidentified(inquiry2, 'system-test');

  console.log('Inquiry:', inquiry2);
  console.log('Classification:');
  console.log(`  Urgency: ${result2.urgency}/5`);
  console.log(`  Category: ${result2.category}`);
  console.log(`  Action: ${result2.suggestedAction}`);
  console.log(`  Reasoning: ${result2.reasoning}`);
  console.log();

  // Example 3: Administrative inquiry
  const inquiry3 = "What is the copay for a specialist visit with my insurance?";

  console.log('Example 3: Administrative Inquiry');
  console.log('━'.repeat(50));

  const result3 = await classifier.classifyDeidentified(inquiry3, 'system-test');

  console.log('Inquiry:', inquiry3);
  console.log('Classification:');
  console.log(`  Urgency: ${result3.urgency}/5`);
  console.log(`  Category: ${result3.category}`);
  console.log(`  Action: ${result3.suggestedAction}`);
  console.log(`  Reasoning: ${result3.reasoning}`);
}

// Run examples if executed directly
if (require.main === module) {
  main().catch(console.error);
}
