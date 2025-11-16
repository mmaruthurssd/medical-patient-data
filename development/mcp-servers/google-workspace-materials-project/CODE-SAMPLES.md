# Code Samples - Key Implementation Snippets

## Tool Registration (src/server.ts)

### MCP Tool Definitions

```typescript
const tools: Tool[] = [
  {
    name: 'create_from_prompt',
    description: 'Generate print material content from natural language prompt...',
    inputSchema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: "What to create" },
        requirements: { type: 'array', items: { type: 'string' } },
        tokens: { type: 'array', items: { type: 'string' } },
        outputFormat: { type: 'string', enum: ['doc', 'slides'] },
        saveToDrive: { type: 'boolean' }
      },
      required: ['description']
    }
  },
  {
    name: 'ai_enhance',
    description: 'Improve existing content for reading level, tone, or clarity...',
    inputSchema: {
      type: 'object',
      properties: {
        markdownPath: { type: 'string' },
        enhancements: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'reading-level-8th-grade',
              'reading-level-6th-grade',
              'simplify-language',
              'professional-tone',
              'friendly-tone',
              'add-examples',
              'improve-clarity'
            ]
          }
        },
        preserveTokens: { type: 'boolean' },
        outputSuffix: { type: 'string' }
      },
      required: ['markdownPath', 'enhancements']
    }
  }
];
```

### Tool Handler

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'create_from_prompt': {
      const result = await createFromPrompt(args as unknown as CreateFromPromptParams);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    }

    case 'ai_enhance': {
      const result = await aiEnhance(args as unknown as AiEnhanceParams);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});
```

## Content Generation (src/lib/content-generator.ts)

### Main Generation Function

```typescript
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

  return { title, markdown, sections, tokenCount: tokens.length };
}
```

### Section Extraction (Smart Detection)

```typescript
export function extractMainSections(description: string, requirements: string[]): string[] {
  const sections: string[] = [];
  const lowerDesc = description.toLowerCase();

  // Diabetes-specific sections
  if (lowerDesc.includes('diabetes')) {
    sections.push(
      'Understanding Diabetes',
      'Blood Sugar Monitoring',
      'Diet and Exercise',
      'Medications',
      'Complications to Watch For'
    );
  }

  // Discharge instructions sections
  if (lowerDesc.includes('discharge')) {
    sections.push(
      'Post-Procedure Care',
      'Activity Restrictions',
      'Diet Guidelines',
      'Warning Signs',
      'Follow-Up'
    );
  }

  // Medication guide sections
  if (lowerDesc.includes('medication')) {
    sections.push(
      'About This Medication',
      'How to Take',
      'Possible Side Effects',
      'Precautions',
      'Storage'
    );
  }

  // Parse requirements for additional sections
  requirements.forEach(req => {
    if (req.toLowerCase().includes('diet') && !sections.includes('Diet Guidelines')) {
      sections.push('Diet Guidelines');
    }
  });

  // Default sections if none identified
  if (sections.length === 0) {
    sections.push('Introduction', 'Main Content', 'Important Information', 'Next Steps');
  }

  return sections;
}
```

### Document Structure Generation

```typescript
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

  // Add token placeholders
  if (tokenSection) {
    markdown += tokenSection + '\n\n';
  }

  // Add each section with smart prompts
  sections.forEach(section => {
    markdown += `## ${section}\n\n`;
    markdown += `[TODO: Add content for ${section.toLowerCase()}]\n\n`;

    // Add helpful prompts based on section type
    if (section.toLowerCase().includes('warning')) {
      markdown += `**When to seek immediate medical attention:**\n`;
      markdown += `- Symptom 1\n- Symptom 2\n- Symptom 3\n\n`;
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

  return markdown;
}
```

## Content Enhancement (src/lib/content-enhancer.ts)

### Language Simplification

```typescript
export function simplifyLanguage(text: string): string {
  const replacements: Record<string, string> = {
    // Medical jargon
    'hypertension': 'high blood pressure',
    'myocardial infarction': 'heart attack',
    'cerebrovascular accident': 'stroke',

    // Complex verbs
    'utilize': 'use',
    'administer': 'give',
    'discontinue': 'stop',
    'commence': 'start',
    'facilitate': 'help',

    // Complex phrases
    'in the event that': 'if',
    'due to the fact that': 'because',
    'at this point in time': 'now',
    'in order to': 'to',
  };

  let simplified = text;

  Object.entries(replacements).forEach(([complex, simple]) => {
    const pattern = new RegExp(`\\b${complex}\\b`, 'gi');
    simplified = simplified.replace(pattern, (match) => {
      // Preserve capitalization
      if (match[0] === match[0].toUpperCase()) {
        return simple.charAt(0).toUpperCase() + simple.slice(1);
      }
      return simple;
    });
  });

  return simplified;
}
```

### Reading Level Calculation

```typescript
export function calculateReadingLevel(text: string): ReadingLevelScore {
  // Remove markdown formatting
  const plainText = text
    .replace(/[#*_\[\]()]/g, '')
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/---+/g, '')
    .trim();

  const sentences = countSentences(plainText);
  const words = countWords(plainText);
  const syllables = countSyllables(plainText);

  // Flesch Reading Ease Score
  const score = 206.835
    - 1.015 * (words / sentences)
    - 84.6 * (syllables / words);

  // Flesch-Kincaid Grade Level
  const gradeLevel = 0.39 * (words / sentences)
    + 11.8 * (syllables / words)
    - 15.59;

  return {
    score: Math.round(score * 10) / 10,
    gradeLevel: Math.max(0, Math.round(gradeLevel * 10) / 10),
    interpretation: interpretReadingLevel(gradeLevel)
  };
}
```

### Syllable Counting

```typescript
export function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let totalSyllables = 0;

  words.forEach(word => {
    word = word.replace(/[^a-z]/g, '');
    if (word.length === 0) return;

    let syllables = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = 'aeiouy'.includes(word[i]);

      if (isVowel && !previousWasVowel) {
        syllables++;
      }

      previousWasVowel = isVowel;
    }

    // Adjust for silent e
    if (word.endsWith('e') && syllables > 1) {
      syllables--;
    }

    // Every word has at least one syllable
    syllables = Math.max(1, syllables);

    totalSyllables += syllables;
  });

  return totalSyllables;
}
```

### Token Preservation

```typescript
function extractTokens(text: string): { text: string; tokens: string[] } {
  const tokenPattern = /\{\{([A-Z_]+)\}\}/g;
  const tokens: string[] = [];
  const matches = text.matchAll(tokenPattern);

  for (const match of matches) {
    if (!tokens.includes(match[1])) {
      tokens.push(match[1]);
    }
  }

  // Replace tokens with placeholder that won't be modified
  const textWithPlaceholders = text.replace(tokenPattern, (_, token) => {
    return `__TOKEN_${token}__`;
  });

  return { text: textWithPlaceholders, tokens };
}

function restoreTokens(text: string, tokens: string[]): string {
  let restored = text;
  tokens.forEach(token => {
    const placeholder = `__TOKEN_${token}__`;
    const tokenPattern = new RegExp(placeholder, 'g');
    restored = restored.replace(tokenPattern, `{{${token}}}`);
  });
  return restored;
}
```

### Tone Adjustment

```typescript
export function adjustTone(text: string, tone: 'professional' | 'friendly'): string {
  let adjusted = text;

  if (tone === 'friendly') {
    // Add conversational elements
    adjusted = adjusted
      .replace(/\bYou must\b/gi, 'You should')
      .replace(/\bIt is important that\b/gi, 'Please')
      .replace(/\bDo not\b/gi, "Don't")
      .replace(/\bCannot\b/gi, "can't");

    // Add empathetic language
    adjusted = adjusted
      .replace(/Contact your physician/gi, 'Talk to your doctor');

  } else if (tone === 'professional') {
    // Use formal language
    adjusted = adjusted
      .replace(/\bDon't\b/g, 'Do not')
      .replace(/\bCan't\b/g, 'Cannot')
      .replace(/\btalk to\b/gi, 'consult with')
      .replace(/\bcheck\b/gi, 'monitor');
  }

  return adjusted;
}
```

## Tool Implementation (src/tools/content-generation.ts)

### create_from_prompt Implementation

```typescript
export async function createFromPrompt(
  params: CreateFromPromptParams
): Promise<CreateFromPromptResult> {
  try {
    // Ensure templates directory exists
    await fs.mkdir(TEMPLATES_DIR, { recursive: true });

    // Generate markdown structure
    const generated = generateMarkdownStructure({
      description: params.description,
      requirements: params.requirements,
      tokens: params.tokens,
      outputFormat: params.outputFormat || 'doc'
    });

    // Create filename
    const filename = slugify(params.description) + '.md';
    const localPath = path.join(TEMPLATES_DIR, filename);

    // Save to file
    await fs.writeFile(localPath, generated.markdown, 'utf-8');

    // Calculate reading level
    const readingLevel = calculateReadingLevel(generated.markdown);

    return {
      success: true,
      localMarkdownPath: localPath,
      content: generated.markdown,
      metadata: {
        title: generated.title,
        sections: generated.sections,
        tokenCount: generated.tokenCount,
        readingLevel
      },
      message: `Markdown template created at ${localPath}...`
    };
  } catch (error) {
    return {
      success: false,
      // ... error handling
    };
  }
}
```

### ai_enhance Implementation

```typescript
export async function aiEnhance(
  params: AiEnhanceParams
): Promise<AiEnhanceResult> {
  try {
    // Resolve file path
    let filePath = params.markdownPath;
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(TEMPLATES_DIR, filePath);
    }

    // Read original content
    const originalContent = await fs.readFile(filePath, 'utf-8');

    // Calculate original reading level
    const originalReadingLevel = calculateReadingLevel(originalContent);

    // Apply enhancements
    const result = enhanceContent(
      originalContent,
      params.enhancements,
      params.preserveTokens !== false
    );

    // Determine output path
    const suffix = params.outputSuffix !== undefined ? params.outputSuffix : '.enhanced';
    const ext = path.extname(filePath);
    const base = filePath.slice(0, -ext.length);
    const enhancedPath = suffix ? `${base}${suffix}${ext}` : filePath;

    // Save enhanced content
    await fs.writeFile(enhancedPath, result.enhancedContent, 'utf-8');

    // Calculate improvements
    const gradeReduction = originalReadingLevel.gradeLevel - result.readingLevel.gradeLevel;

    return {
      success: true,
      originalPath: filePath,
      enhancedPath,
      enhancedContent: result.enhancedContent,
      originalReadingLevel,
      enhancedReadingLevel: result.readingLevel,
      enhancementsApplied: result.enhancementsApplied,
      tokensPreserved: result.tokensPreserved,
      improvements: {
        gradeReduction: Math.round(gradeReduction * 10) / 10
      },
      message: generateEnhancementMessage(...)
    };
  } catch (error) {
    return { success: false, ... };
  }
}
```

## Usage Examples

### Creating a Patient Handout

```typescript
const result = await createFromPrompt({
  description: 'patient handout about managing diabetes',
  requirements: ['8th grade reading level', 'include diet section'],
  tokens: ['PATIENT_NAME', 'DOCTOR_NAME', 'CLINIC_PHONE'],
  outputFormat: 'doc'
});

console.log(result.localMarkdownPath);
// => /path/to/print-materials/templates/patient-handout-about-managing-diabetes.md

console.log(result.metadata.sections);
// => ['Understanding Diabetes', 'Blood Sugar Monitoring', ...]

console.log(result.metadata.readingLevel.gradeLevel);
// => 8.2
```

### Enhancing Content

```typescript
const result = await aiEnhance({
  markdownPath: 'patient-handout-about-managing-diabetes.md',
  enhancements: [
    'reading-level-6th-grade',
    'simplify-language',
    'friendly-tone',
    'add-examples'
  ],
  preserveTokens: true
});

console.log(`Improved from ${result.originalReadingLevel.gradeLevel} to ${result.enhancedReadingLevel.gradeLevel}`);
// => Improved from 12.5 to 6.1

console.log(result.tokensPreserved);
// => ['PATIENT_NAME', 'DOCTOR_NAME', 'CLINIC_PHONE']
```

### Batch Processing

```typescript
const prompts = [
  'patient handout about diabetes',
  'discharge instructions for knee surgery',
  'medication guide for blood pressure'
];

for (const prompt of prompts) {
  const result = await createFromPrompt({
    description: prompt,
    tokens: ['PATIENT_NAME', 'DOCTOR_NAME'],
    outputFormat: 'doc'
  });

  if (result.success) {
    // Enhance for 6th grade reading level
    await aiEnhance({
      markdownPath: result.localMarkdownPath,
      enhancements: ['reading-level-6th-grade', 'friendly-tone'],
      outputSuffix: ''  // Overwrite original
    });
  }
}
```

## Test Examples

### Testing create_from_prompt

```typescript
it('should generate markdown from description', async () => {
  const result = await createFromPrompt({
    description: 'patient handout about diabetes',
    outputFormat: 'doc'
  });

  expect(result.success).toBe(true);
  expect(result.content).toContain('# ');
  expect(result.content).toContain('## ');
  expect(result.metadata.sections.length).toBeGreaterThan(0);
});

it('should include specified tokens', async () => {
  const result = await createFromPrompt({
    description: 'patient education material',
    tokens: ['PATIENT_NAME', 'DOCTOR_NAME', 'CLINIC_PHONE']
  });

  expect(result.content).toContain('{{PATIENT_NAME}}');
  expect(result.content).toContain('{{DOCTOR_NAME}}');
  expect(result.content).toContain('{{CLINIC_PHONE}}');
  expect(result.metadata.tokenCount).toBe(3);
});
```

### Testing ai_enhance

```typescript
it('should simplify language', async () => {
  const result = await aiEnhance({
    markdownPath: testFilePath,
    enhancements: ['simplify-language']
  });

  expect(result.enhancedContent).toContain('high blood pressure');
  expect(result.enhancedContent).not.toContain('Hypertension');
  expect(result.enhancedContent).toContain('doctor');
  expect(result.enhancedContent).not.toContain('physician');
});

it('should preserve tokens', async () => {
  const result = await aiEnhance({
    markdownPath: testFilePath,
    enhancements: ['simplify-language'],
    preserveTokens: true
  });

  expect(result.enhancedContent).toContain('{{PATIENT_NAME}}');
  expect(result.tokensPreserved).toContain('PATIENT_NAME');
});
```

## Performance Benchmarks

```typescript
// Template generation: ~5-10ms
console.time('generate');
const generated = generateMarkdownStructure({
  description: 'patient handout about diabetes',
  outputFormat: 'doc'
});
console.timeEnd('generate');
// => generate: 8.234ms

// Reading level calculation: ~2-5ms
console.time('readinglevel');
const level = calculateReadingLevel(longText);
console.timeEnd('readinglevel');
// => readinglevel: 3.891ms

// Full enhancement: ~20-50ms
console.time('enhance');
const enhanced = enhanceContent(text, ['simplify-language', 'friendly-tone']);
console.timeEnd('enhance');
// => enhance: 42.156ms
```
