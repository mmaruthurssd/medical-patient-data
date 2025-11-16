/**
 * Content Generation Tools
 *
 * MCP tools for AI-powered content creation and enhancement.
 * These tools provide structured scaffolding that Claude (the user's AI assistant)
 * will review and populate with intelligent content.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  generateMarkdownStructure,
  slugify,
  type ContentGenerationParams
} from '../lib/content-generator.js';
import {
  enhanceContent,
  calculateReadingLevel,
  type EnhancementType,
  type EnhancementResult
} from '../lib/content-enhancer.js';

const TEMPLATES_DIR = path.join(process.cwd(), 'print-materials', 'templates');

/**
 * Tool 1: create_from_prompt
 *
 * Generate print material content from natural language prompt
 */
export const createFromPromptTool = {
  name: 'create_from_prompt',
  description: 'Generate print material content from natural language prompt using AI. Creates structured markdown templates for patient handouts, discharge instructions, consent forms, and other medical materials.',
  inputSchema: {
    type: 'object',
    properties: {
      description: {
        type: 'string',
        description: "What to create (e.g., 'patient handout about diabetes management', 'discharge instructions for knee replacement surgery')"
      },
      requirements: {
        type: 'array',
        items: { type: 'string' },
        description: "Additional requirements (e.g., '8th grade reading level', 'include diet section', 'friendly tone')"
      },
      tokens: {
        type: 'array',
        items: { type: 'string' },
        description: "Token placeholders to include (e.g., ['PATIENT_NAME', 'DOCTOR_NAME', 'CLINIC_PHONE'])"
      },
      outputFormat: {
        type: 'string',
        enum: ['doc', 'slides'],
        description: 'Target format: "doc" for text-heavy documents, "slides" for visual presentations'
      },
      saveToDrive: {
        type: 'boolean',
        description: 'Also upload to Drive Templates folder (requires Drive integration)'
      }
    },
    required: ['description'],
    additionalProperties: false
  }
};

export interface CreateFromPromptParams {
  description: string;
  requirements?: string[];
  tokens?: string[];
  outputFormat?: 'doc' | 'slides';
  saveToDrive?: boolean;
}

export interface CreateFromPromptResult {
  success: boolean;
  localMarkdownPath: string;
  content: string;
  metadata: {
    title: string;
    sections: string[];
    tokenCount: number;
    readingLevel?: {
      score: number;
      gradeLevel: number;
      interpretation: string;
    };
  };
  driveFileId?: string;
  message: string;
}

export async function createFromPrompt(
  params: CreateFromPromptParams
): Promise<CreateFromPromptResult> {
  try {
    // Ensure templates directory exists
    await fs.mkdir(TEMPLATES_DIR, { recursive: true });

    // Generate markdown structure
    const contentParams: ContentGenerationParams = {
      description: params.description,
      requirements: params.requirements,
      tokens: params.tokens,
      outputFormat: params.outputFormat || 'doc'
    };

    const generated = generateMarkdownStructure(contentParams);

    // Create filename
    const filename = slugify(params.description) + '.md';
    const localPath = path.join(TEMPLATES_DIR, filename);

    // Save to file
    await fs.writeFile(localPath, generated.markdown, 'utf-8');

    // Calculate reading level
    const readingLevel = calculateReadingLevel(generated.markdown);

    // TODO: Upload to Drive if requested
    let driveFileId: string | undefined;
    if (params.saveToDrive) {
      // This would integrate with Google Drive API
      // driveFileId = await uploadToDrive(localPath);
      console.warn('Drive upload not yet implemented');
    }

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
      driveFileId,
      message: `Markdown template created at ${localPath}. Review and edit as needed. ${
        readingLevel.gradeLevel > 0
          ? `Current reading level: ${readingLevel.gradeLevel}th grade.`
          : ''
      }`
    };
  } catch (error) {
    return {
      success: false,
      localMarkdownPath: '',
      content: '',
      metadata: {
        title: '',
        sections: [],
        tokenCount: 0
      },
      message: `Error creating template: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Tool 2: ai_enhance
 *
 * Improve existing content for reading level, tone, or clarity
 */
export const aiEnhanceTool = {
  name: 'ai_enhance',
  description: 'Improve existing content for reading level, tone, or clarity. Applies enhancements while preserving {{TOKEN}} placeholders. Returns enhanced content with reading level score.',
  inputSchema: {
    type: 'object',
    properties: {
      markdownPath: {
        type: 'string',
        description: 'Path to markdown file to enhance (absolute or relative to templates directory)'
      },
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
        },
        description: 'Enhancement types to apply. Multiple enhancements are applied in order.'
      },
      preserveTokens: {
        type: 'boolean',
        description: 'Keep {{TOKEN}} placeholders unchanged (default: true)'
      },
      outputSuffix: {
        type: 'string',
        description: 'Suffix for output filename (default: ".enhanced" - use empty string to overwrite)'
      }
    },
    required: ['markdownPath', 'enhancements'],
    additionalProperties: false
  }
};

export interface AiEnhanceParams {
  markdownPath: string;
  enhancements: EnhancementType[];
  preserveTokens?: boolean;
  outputSuffix?: string;
}

export interface AiEnhanceResult {
  success: boolean;
  originalPath: string;
  enhancedPath: string;
  enhancedContent: string;
  originalReadingLevel: {
    score: number;
    gradeLevel: number;
    interpretation: string;
  };
  enhancedReadingLevel: {
    score: number;
    gradeLevel: number;
    interpretation: string;
  };
  enhancementsApplied: EnhancementType[];
  tokensPreserved: string[];
  improvements: {
    gradeReduction?: number;
    scoreIncrease?: number;
  };
  message: string;
}

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
    const result: EnhancementResult = enhanceContent(
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
    const scoreIncrease = result.readingLevel.score - originalReadingLevel.score;

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
        gradeReduction: Math.round(gradeReduction * 10) / 10,
        scoreIncrease: Math.round(scoreIncrease * 10) / 10
      },
      message: generateEnhancementMessage(
        enhancedPath,
        originalReadingLevel.gradeLevel,
        result.readingLevel.gradeLevel,
        result.tokensPreserved
      )
    };
  } catch (error) {
    return {
      success: false,
      originalPath: params.markdownPath,
      enhancedPath: '',
      enhancedContent: '',
      originalReadingLevel: { score: 0, gradeLevel: 0, interpretation: '' },
      enhancedReadingLevel: { score: 0, gradeLevel: 0, interpretation: '' },
      enhancementsApplied: [],
      tokensPreserved: [],
      improvements: {},
      message: `Error enhancing content: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Generate user-friendly enhancement message
 */
function generateEnhancementMessage(
  path: string,
  originalGrade: number,
  enhancedGrade: number,
  tokens: string[]
): string {
  let message = `Enhanced content saved to ${path}.\n`;

  if (originalGrade > 0 && enhancedGrade > 0) {
    const improvement = originalGrade - enhancedGrade;
    if (improvement > 0) {
      message += `Reading level improved from ${originalGrade.toFixed(1)}th grade to ${enhancedGrade.toFixed(1)}th grade (${improvement.toFixed(1)} grade reduction). `;
    } else if (improvement < 0) {
      message += `Reading level changed from ${originalGrade.toFixed(1)}th grade to ${enhancedGrade.toFixed(1)}th grade. `;
    } else {
      message += `Reading level maintained at ${enhancedGrade.toFixed(1)}th grade. `;
    }
  }

  if (tokens.length > 0) {
    message += `Preserved ${tokens.length} token(s): ${tokens.join(', ')}.`;
  }

  return message;
}

/**
 * Helper: List available templates
 */
export async function listTemplates(): Promise<string[]> {
  try {
    await fs.mkdir(TEMPLATES_DIR, { recursive: true });
    const files = await fs.readdir(TEMPLATES_DIR);
    return files.filter(f => f.endsWith('.md'));
  } catch (error) {
    console.error('Error listing templates:', error);
    return [];
  }
}

/**
 * Helper: Get template content
 */
export async function getTemplate(filename: string): Promise<string | null> {
  try {
    const filePath = path.join(TEMPLATES_DIR, filename);
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error('Error reading template:', error);
    return null;
  }
}
