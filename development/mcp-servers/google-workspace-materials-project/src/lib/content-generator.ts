/**
 * Content Generator
 *
 * Generates structured markdown templates from natural language descriptions.
 * This is NOT an AI content generator - it creates scaffolding that Claude
 * (the user's AI assistant) will review and populate with intelligent content.
 */

export interface ContentGenerationParams {
  description: string;
  requirements?: string[];
  tokens?: string[];
  outputFormat?: 'doc' | 'slides';
}

export interface GeneratedContent {
  title: string;
  markdown: string;
  sections: string[];
  tokenCount: number;
}

/**
 * Generates markdown structure based on description and format
 */
export function generateMarkdownStructure(params: ContentGenerationParams): GeneratedContent {
  const { description, requirements = [], tokens = [], outputFormat = 'doc' } = params;

  const title = extractTitle(description);
  const sections = extractMainSections(description, requirements);

  let markdown: string;

  if (outputFormat === 'slides') {
    markdown = generateSlidesStructure(title, sections, tokens, requirements);
  } else {
    markdown = generateDocStructure(title, sections, tokens, requirements);
  }

  return {
    title,
    markdown,
    sections,
    tokenCount: tokens.length
  };
}

/**
 * Extract title from description
 */
export function extractTitle(description: string): string {
  // Remove common prefixes
  const cleaned = description
    .replace(/^(create|generate|make|build)\s+(a|an|the)?\s*/i, '')
    .replace(/\s+(for|about|on)\s+/i, ' - ')
    .trim();

  // Capitalize first letter of each word
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extract main sections from description and requirements
 */
export function extractMainSections(description: string, requirements: string[]): string[] {
  const sections: string[] = [];
  const lowerDesc = description.toLowerCase();

  // Common medical document sections
  if (lowerDesc.includes('patient') || lowerDesc.includes('handout')) {
    sections.push('Overview', 'Key Information', 'What to Expect', 'Important Reminders');
  }

  if (lowerDesc.includes('discharge')) {
    sections.push('Post-Procedure Care', 'Activity Restrictions', 'Diet Guidelines', 'Warning Signs', 'Follow-Up');
  }

  if (lowerDesc.includes('medication') || lowerDesc.includes('prescription')) {
    sections.push('About This Medication', 'How to Take', 'Possible Side Effects', 'Precautions', 'Storage');
  }

  if (lowerDesc.includes('consent')) {
    sections.push('Procedure Description', 'Risks and Benefits', 'Alternatives', 'Patient Rights', 'Authorization');
  }

  if (lowerDesc.includes('diabetes')) {
    sections.push('Understanding Diabetes', 'Blood Sugar Monitoring', 'Diet and Exercise', 'Medications', 'Complications to Watch For');
  }

  // Parse requirements for specific sections
  requirements.forEach(req => {
    const reqLower = req.toLowerCase();
    if (reqLower.includes('diet') && !sections.includes('Diet Guidelines')) {
      sections.push('Diet Guidelines');
    }
    if (reqLower.includes('exercise') && !sections.includes('Exercise')) {
      sections.push('Exercise Recommendations');
    }
    if (reqLower.includes('medication') && !sections.includes('Medications')) {
      sections.push('Medications');
    }
  });

  // Default sections if none identified
  if (sections.length === 0) {
    sections.push('Introduction', 'Main Content', 'Important Information', 'Next Steps');
  }

  return sections;
}

/**
 * Generate document-style markdown structure
 */
function generateDocStructure(
  title: string,
  sections: string[],
  tokens: string[],
  requirements: string[]
): string {
  const tokenSection = generateTokenSection(tokens);
  const readingLevelNote = extractReadingLevel(requirements);

  let markdown = `# ${title}\n\n`;

  // Add metadata comment
  markdown += `<!-- \n`;
  markdown += `Generated: ${new Date().toISOString().split('T')[0]}\n`;
  if (readingLevelNote) {
    markdown += `Reading Level: ${readingLevelNote}\n`;
  }
  markdown += `Tokens: ${tokens.join(', ')}\n`;
  markdown += `-->\n\n`;

  // Add token placeholders if provided
  if (tokenSection) {
    markdown += tokenSection + '\n\n';
  }

  // Add each section with placeholder content
  sections.forEach(section => {
    markdown += `## ${section}\n\n`;
    markdown += `[TODO: Add content for ${section.toLowerCase()}]\n\n`;

    // Add helpful prompts based on section type
    if (section.toLowerCase().includes('warning') || section.toLowerCase().includes('emergency')) {
      markdown += `**When to seek immediate medical attention:**\n`;
      markdown += `- Symptom 1\n`;
      markdown += `- Symptom 2\n`;
      markdown += `- Symptom 3\n\n`;
    }

    if (section.toLowerCase().includes('diet')) {
      markdown += `**Foods to eat:**\n- Item 1\n- Item 2\n\n`;
      markdown += `**Foods to limit:**\n- Item 1\n- Item 2\n\n`;
    }

    if (section.toLowerCase().includes('medication')) {
      markdown += `**Dosage:** [Specify dosage]\n\n`;
      markdown += `**Timing:** [When to take]\n\n`;
      markdown += `**Special instructions:** [Any special notes]\n\n`;
    }
  });

  // Add contact section
  markdown += `## Questions or Concerns\n\n`;
  if (tokens.includes('CLINIC_PHONE')) {
    markdown += `Please call our office at {{CLINIC_PHONE}}\n\n`;
  } else {
    markdown += `Please contact your healthcare provider if you have questions.\n\n`;
  }

  return markdown;
}

/**
 * Generate slides-style markdown structure
 */
function generateSlidesStructure(
  title: string,
  sections: string[],
  tokens: string[],
  requirements: string[]
): string {
  const readingLevelNote = extractReadingLevel(requirements);

  let markdown = `# ${title}\n\n`;

  // Add metadata
  markdown += `<!-- Presentation Format -->\n`;
  if (readingLevelNote) {
    markdown += `<!-- Reading Level: ${readingLevelNote} -->\n`;
  }
  markdown += `\n---\n\n`;

  // Title slide
  markdown += `## Title Slide\n\n`;
  markdown += `# ${title}\n\n`;

  if (tokens.includes('PATIENT_NAME')) {
    markdown += `**Patient:** {{PATIENT_NAME}}\n\n`;
  }
  if (tokens.includes('DOCTOR_NAME')) {
    markdown += `**Provider:** Dr. {{DOCTOR_NAME}}\n\n`;
  }
  if (tokens.includes('DATE')) {
    markdown += `**Date:** {{DATE}}\n\n`;
  }

  markdown += `---\n\n`;

  // Content slides - max 3-4 bullet points per slide
  sections.forEach((section, index) => {
    markdown += `## Slide ${index + 2}: ${section}\n\n`;
    markdown += `### ${section}\n\n`;
    markdown += `- Key point 1\n`;
    markdown += `- Key point 2\n`;
    markdown += `- Key point 3\n\n`;

    // Add visual cue suggestions
    markdown += `[VISUAL: Consider adding diagram, chart, or icon]\n\n`;
    markdown += `---\n\n`;
  });

  // Contact slide
  markdown += `## Final Slide: Contact Information\n\n`;
  markdown += `### Questions?\n\n`;

  if (tokens.includes('CLINIC_NAME')) {
    markdown += `**{{CLINIC_NAME}}**\n\n`;
  }
  if (tokens.includes('CLINIC_PHONE')) {
    markdown += `Phone: {{CLINIC_PHONE}}\n\n`;
  }
  if (tokens.includes('CLINIC_ADDRESS')) {
    markdown += `{{CLINIC_ADDRESS}}\n\n`;
  }

  markdown += `---\n`;

  return markdown;
}

/**
 * Generate token placeholder section
 */
function generateTokenSection(tokens: string[]): string {
  if (tokens.length === 0) return '';

  let section = `**Document Information:**\n`;

  tokens.forEach(token => {
    const label = token
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');

    section += `- ${label}: {{${token}}}\n`;
  });

  return section;
}

/**
 * Extract reading level requirement
 */
function extractReadingLevel(requirements: string[]): string | null {
  for (const req of requirements) {
    const match = req.match(/(\d+)(?:th|st|nd|rd)?\s*grade/i);
    if (match) {
      return `${match[1]}th grade`;
    }
  }
  return null;
}

/**
 * Convert description to filename-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '')   // Remove leading/trailing hyphens
    .substring(0, 50);         // Limit length
}
