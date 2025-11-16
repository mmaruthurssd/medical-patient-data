/**
 * Demo Usage Examples
 *
 * Demonstrates how to use the content generation tools
 */

import { createFromPrompt, aiEnhance } from './dist/tools/content-generation.js';

async function demo() {
  console.log('=== Content Generation MCP Demo ===\n');

  // Demo 1: Create patient handout about diabetes
  console.log('1. Creating patient handout about diabetes management...\n');
  const diabetesResult = await createFromPrompt({
    description: 'patient handout about managing diabetes',
    requirements: ['8th grade reading level', 'include diet section', 'friendly tone'],
    tokens: ['PATIENT_NAME', 'DOCTOR_NAME', 'CLINIC_PHONE'],
    outputFormat: 'doc'
  });

  console.log('Result:', {
    success: diabetesResult.success,
    title: diabetesResult.metadata.title,
    sections: diabetesResult.metadata.sections,
    tokenCount: diabetesResult.metadata.tokenCount,
    readingLevel: diabetesResult.metadata.readingLevel?.gradeLevel.toFixed(1) + 'th grade',
    path: diabetesResult.localMarkdownPath
  });
  console.log('\nGenerated Content Preview:');
  console.log(diabetesResult.content.substring(0, 500) + '...\n');

  // Demo 2: Create discharge instructions (slides format)
  console.log('\n2. Creating discharge instructions in slides format...\n');
  const dischargeResult = await createFromPrompt({
    description: 'discharge instructions for knee replacement surgery',
    requirements: ['include warning signs', 'visual-friendly'],
    tokens: ['PATIENT_NAME', 'SURGERY_DATE', 'CLINIC_PHONE', 'SURGEON_NAME'],
    outputFormat: 'slides'
  });

  console.log('Result:', {
    success: dischargeResult.success,
    title: dischargeResult.metadata.title,
    sections: dischargeResult.metadata.sections,
    format: 'slides',
    path: dischargeResult.localMarkdownPath
  });
  console.log('\nSlides Content Preview:');
  console.log(dischargeResult.content.substring(0, 600) + '...\n');

  // Demo 3: Enhance existing content
  if (diabetesResult.success) {
    console.log('\n3. Enhancing diabetes handout for 6th grade reading level...\n');
    const enhanceResult = await aiEnhance({
      markdownPath: diabetesResult.localMarkdownPath,
      enhancements: [
        'reading-level-6th-grade',
        'simplify-language',
        'friendly-tone',
        'add-examples'
      ],
      preserveTokens: true,
      outputSuffix: '.enhanced'
    });

    console.log('Enhancement Result:', {
      success: enhanceResult.success,
      originalGrade: enhanceResult.originalReadingLevel.gradeLevel.toFixed(1),
      enhancedGrade: enhanceResult.enhancedReadingLevel.gradeLevel.toFixed(1),
      improvement: enhanceResult.improvements.gradeReduction?.toFixed(1) + ' grades',
      tokensPreserved: enhanceResult.tokensPreserved,
      path: enhanceResult.enhancedPath
    });
    console.log('\nEnhanced Content Preview:');
    console.log(enhanceResult.enhancedContent.substring(0, 500) + '...\n');
  }

  // Demo 4: Create medication guide
  console.log('\n4. Creating medication guide...\n');
  const medGuideResult = await createFromPrompt({
    description: 'medication guide for blood pressure medication',
    requirements: ['6th grade reading level', 'include side effects'],
    tokens: ['PATIENT_NAME', 'MEDICATION_NAME', 'DOSAGE', 'DOCTOR_NAME'],
    outputFormat: 'doc'
  });

  console.log('Result:', {
    success: medGuideResult.success,
    title: medGuideResult.metadata.title,
    sections: medGuideResult.metadata.sections,
    readingLevel: medGuideResult.metadata.readingLevel?.gradeLevel.toFixed(1) + 'th grade',
    path: medGuideResult.localMarkdownPath
  });

  // Demo 5: Create consent form (professional tone)
  console.log('\n5. Creating consent form with professional tone...\n');
  const consentResult = await createFromPrompt({
    description: 'consent form for surgical procedures',
    requirements: ['professional tone', 'include legal disclaimers'],
    tokens: ['PATIENT_NAME', 'PROCEDURE_NAME', 'DOCTOR_NAME', 'DATE', 'WITNESS_NAME'],
    outputFormat: 'doc'
  });

  console.log('Result:', {
    success: consentResult.success,
    title: consentResult.metadata.title,
    sections: consentResult.metadata.sections,
    tokenCount: consentResult.metadata.tokenCount,
    path: consentResult.localMarkdownPath
  });
  console.log('\nConsent Form Preview:');
  console.log(consentResult.content.substring(0, 500) + '...\n');

  console.log('\n=== Demo Complete ===');
  console.log('\nAll generated templates are saved in: print-materials/templates/');
  console.log('Review and edit them as needed before deployment.');
}

// Run demo
demo().catch(console.error);
