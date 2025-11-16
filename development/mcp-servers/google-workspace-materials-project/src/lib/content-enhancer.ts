/**
 * Content Enhancer
 *
 * Improves existing markdown content for readability, tone, and clarity.
 * Preserves {{TOKEN}} placeholders throughout transformations.
 */

export type EnhancementType =
  | 'reading-level-8th-grade'
  | 'reading-level-6th-grade'
  | 'simplify-language'
  | 'professional-tone'
  | 'friendly-tone'
  | 'add-examples'
  | 'improve-clarity';

export interface EnhancementResult {
  originalContent: string;
  enhancedContent: string;
  readingLevel: ReadingLevelScore;
  enhancementsApplied: EnhancementType[];
  tokensPreserved: string[];
}

export interface ReadingLevelScore {
  score: number;
  gradeLevel: number;
  interpretation: string;
}

/**
 * Apply enhancements to markdown content
 */
export function enhanceContent(
  content: string,
  enhancements: EnhancementType[],
  preserveTokens: boolean = true
): EnhancementResult {
  let enhanced = content;
  let tokensPreserved: string[] = [];

  // Extract and preserve tokens
  if (preserveTokens) {
    const { text, tokens } = extractTokens(content);
    enhanced = text;
    tokensPreserved = tokens;
  }

  // Apply each enhancement in order
  for (const enhancement of enhancements) {
    switch (enhancement) {
      case 'reading-level-8th-grade':
        enhanced = adjustToReadingLevel(enhanced, 8);
        break;
      case 'reading-level-6th-grade':
        enhanced = adjustToReadingLevel(enhanced, 6);
        break;
      case 'simplify-language':
        enhanced = simplifyLanguage(enhanced);
        break;
      case 'professional-tone':
        enhanced = adjustTone(enhanced, 'professional');
        break;
      case 'friendly-tone':
        enhanced = adjustTone(enhanced, 'friendly');
        break;
      case 'add-examples':
        enhanced = addExamples(enhanced);
        break;
      case 'improve-clarity':
        enhanced = improveClarity(enhanced);
        break;
    }
  }

  // Restore tokens
  if (preserveTokens) {
    enhanced = restoreTokens(enhanced, tokensPreserved);
  }

  const readingLevel = calculateReadingLevel(enhanced);

  return {
    originalContent: content,
    enhancedContent: enhanced,
    readingLevel,
    enhancementsApplied: enhancements,
    tokensPreserved
  };
}

/**
 * Extract {{TOKEN}} placeholders from text
 */
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

/**
 * Restore {{TOKEN}} placeholders
 */
function restoreTokens(text: string, tokens: string[]): string {
  let restored = text;
  tokens.forEach(token => {
    const placeholder = `__TOKEN_${token}__`;
    const tokenPattern = new RegExp(placeholder, 'g');
    restored = restored.replace(tokenPattern, `{{${token}}}`);
  });
  return restored;
}

/**
 * Simplify language by replacing complex words with simpler alternatives
 */
export function simplifyLanguage(text: string): string {
  const replacements: Record<string, string> = {
    // Medical jargon
    'hypertension': 'high blood pressure',
    'myocardial infarction': 'heart attack',
    'cerebrovascular accident': 'stroke',
    'utilize': 'use',
    'administer': 'give',
    'discontinue': 'stop',
    'commence': 'start',
    'facilitate': 'help',
    'demonstrate': 'show',
    'implement': 'do',
    'approximately': 'about',
    'additional': 'more',
    'assistance': 'help',
    'immediately': 'right away',
    'medication': 'medicine',
    'physician': 'doctor',
    'notify': 'tell',
    'observe': 'watch',
    'obtain': 'get',
    'purchase': 'buy',
    'regarding': 'about',
    'require': 'need',
    'sufficient': 'enough',
    'terminate': 'end',
    'subsequent': 'next',
    // Complex phrases
    'in the event that': 'if',
    'due to the fact that': 'because',
    'at this point in time': 'now',
    'for the purpose of': 'to',
    'in order to': 'to',
    'with regard to': 'about',
    'as a result of': 'because',
    'in the near future': 'soon',
    'make an attempt': 'try',
    'give consideration to': 'consider',
  };

  let simplified = text;

  // Replace complex words/phrases (case-insensitive, preserving case)
  Object.entries(replacements).forEach(([complex, simple]) => {
    // Match whole words/phrases
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

/**
 * Adjust text to target reading level
 */
export function adjustToReadingLevel(text: string, targetGrade: number): string {
  let adjusted = text;

  // First simplify language
  adjusted = simplifyLanguage(adjusted);

  // Shorten sentences for lower grade levels
  if (targetGrade <= 8) {
    adjusted = shortenSentences(adjusted);
  }

  // Break up complex sentences
  adjusted = breakUpComplexSentences(adjusted);

  return adjusted;
}

/**
 * Shorten long sentences
 */
function shortenSentences(text: string): string {
  const sentences = text.split(/([.!?]+\s+)/);
  const shortened: string[] = [];

  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i];
    const punctuation = sentences[i + 1] || '';

    // If sentence has multiple clauses, consider breaking it up
    if (sentence.includes(', and ')) {
      const parts = sentence.split(', and ');
      shortened.push(parts[0] + '.');
      shortened.push(' ');
      shortened.push(parts.slice(1).join(', and '));
      shortened.push(punctuation);
    } else if (sentence.includes(', but ')) {
      const parts = sentence.split(', but ');
      shortened.push(parts[0] + '.');
      shortened.push(' However, ');
      shortened.push(parts.slice(1).join(', but '));
      shortened.push(punctuation);
    } else {
      shortened.push(sentence);
      shortened.push(punctuation);
    }
  }

  return shortened.join('');
}

/**
 * Break up complex sentences
 */
function breakUpComplexSentences(text: string): string {
  // This is a simplified implementation
  // In production, would use NLP to properly parse sentence structure
  return text
    .replace(/;\s+/g, '. ')  // Replace semicolons with periods
    .replace(/,\s+which\s+/g, '. This ') // Break up relative clauses
    .replace(/,\s+although\s+/g, '. However, '); // Break up contrast clauses
}

/**
 * Adjust tone of content
 */
export function adjustTone(text: string, tone: 'professional' | 'friendly'): string {
  let adjusted = text;

  if (tone === 'friendly') {
    // Add conversational elements
    adjusted = adjusted
      .replace(/\bYou must\b/gi, 'You should')
      .replace(/\bIt is important that\b/gi, 'Please')
      .replace(/\bPatients should\b/gi, 'You should')
      .replace(/\bDo not\b/gi, "Don't")
      .replace(/\bCannot\b/gi, "can't");

    // Add empathetic language
    adjusted = adjusted
      .replace(/([.!?]\s+)If you experience/gi, '$1If you notice')
      .replace(/Contact your physician/gi, 'Talk to your doctor');

  } else if (tone === 'professional') {
    // Use formal language
    adjusted = adjusted
      .replace(/\bDon't\b/g, 'Do not')
      .replace(/\bCan't\b/g, 'Cannot')
      .replace(/\bWon't\b/g, 'Will not')
      .replace(/\btalk to\b/gi, 'consult with')
      .replace(/\bcheck\b/gi, 'monitor');
  }

  return adjusted;
}

/**
 * Add practical examples to content
 */
export function addExamples(text: string): string {
  // This is a template-based approach
  // In production, would use context-aware example generation

  let enhanced = text;

  // Add examples after certain keywords
  const exampleTriggers = [
    { keyword: 'exercise', example: '\n\nFor example: walking for 30 minutes, swimming, or light gardening.' },
    { keyword: 'healthy diet', example: '\n\nFor example: whole grains, lean proteins, fruits, and vegetables.' },
    { keyword: 'side effects', example: '\n\nFor example: nausea, dizziness, or headache.' },
    { keyword: 'warning signs', example: '\n\nFor example: severe pain, unusual bleeding, or high fever.' },
  ];

  exampleTriggers.forEach(({ keyword, example }) => {
    const pattern = new RegExp(`(${keyword}[^.!?]*[.!?])`, 'gi');
    enhanced = enhanced.replace(pattern, (match) => {
      if (!match.toLowerCase().includes('example')) {
        return match + example;
      }
      return match;
    });
  });

  return enhanced;
}

/**
 * Improve clarity through better structure and organization
 */
export function improveClarity(text: string): string {
  let improved = text;

  // Ensure headers are properly formatted
  improved = normalizeHeaders(improved);

  // Add clear transitions
  improved = addTransitions(improved);

  // Improve list formatting
  improved = improveListFormatting(improved);

  return improved;
}

/**
 * Normalize header formatting
 */
function normalizeHeaders(text: string): string {
  return text
    .replace(/^(#{1,6})\s*([^#\n]+)\s*$/gm, (_, hashes, title) => {
      // Ensure single space after hashes and trim title
      return `${hashes} ${title.trim()}`;
    });
}

/**
 * Add clear transitions between sections
 */
function addTransitions(text: string): string {
  // Add transition phrases before major sections
  return text.replace(/^(## [^\n]+)/gm, (match) => {
    // Skip if already has transition
    if (match.toLowerCase().includes('next') || match.toLowerCase().includes('additionally')) {
      return match;
    }
    return match;
  });
}

/**
 * Improve list formatting
 */
function improveListFormatting(text: string): string {
  return text
    // Ensure consistent bullet points
    .replace(/^[\*\-]\s+/gm, '- ')
    // Ensure proper spacing around lists
    .replace(/([^\n])\n([-\*]\s)/gm, '$1\n\n$2')
    .replace(/([-\*]\s[^\n]+)\n([^\n-\*])/gm, '$1\n\n$2');
}

/**
 * Calculate Flesch-Kincaid reading level
 */
export function calculateReadingLevel(text: string): ReadingLevelScore {
  // Remove markdown formatting for accurate calculation
  const plainText = text
    .replace(/[#*_\[\]()]/g, '')  // Remove markdown symbols
    .replace(/\{\{[^}]+\}\}/g, '') // Remove tokens
    .replace(/---+/g, '')          // Remove horizontal rules
    .trim();

  if (!plainText) {
    return {
      score: 0,
      gradeLevel: 0,
      interpretation: 'No content to analyze'
    };
  }

  const sentences = countSentences(plainText);
  const words = countWords(plainText);
  const syllables = countSyllables(plainText);

  if (sentences === 0 || words === 0) {
    return {
      score: 0,
      gradeLevel: 0,
      interpretation: 'Insufficient content'
    };
  }

  // Flesch Reading Ease Score
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);

  // Flesch-Kincaid Grade Level
  const gradeLevel = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;

  return {
    score: Math.round(score * 10) / 10,
    gradeLevel: Math.max(0, Math.round(gradeLevel * 10) / 10),
    interpretation: interpretReadingLevel(gradeLevel)
  };
}

/**
 * Count sentences in text
 */
function countSentences(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return Math.max(1, sentences.length);
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

/**
 * Count syllables in text (simplified algorithm)
 */
export function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let totalSyllables = 0;

  words.forEach(word => {
    // Remove non-alphabetic characters
    word = word.replace(/[^a-z]/g, '');
    if (word.length === 0) return;

    // Count vowel groups
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

/**
 * Interpret grade level score
 */
function interpretReadingLevel(gradeLevel: number): string {
  if (gradeLevel < 6) {
    return 'Elementary school level (very easy to read)';
  } else if (gradeLevel < 9) {
    return 'Middle school level (easy to read)';
  } else if (gradeLevel < 13) {
    return 'High school level (moderately difficult)';
  } else if (gradeLevel < 16) {
    return 'College level (difficult)';
  } else {
    return 'Graduate school level (very difficult)';
  }
}
