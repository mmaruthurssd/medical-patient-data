/**
 * TypeScript Type Definitions
 */

/**
 * Material metadata stored in index
 */
export interface MaterialMetadata {
  id: string;
  title: string;
  type: 'doc' | 'slides' | 'pdf' | 'markdown';
  category?: string;
  tags: string[];
  fileId?: string; // Google Drive file ID
  localPath?: string;
  createdDate: string;
  modifiedDate: string;
  author?: string;
  description?: string;
}

/**
 * Materials index structure
 */
export interface MaterialIndex {
  version: string;
  lastUpdated: string;
  materials: MaterialMetadata[];
}

/**
 * Google Drive sync result
 */
export interface SyncResult {
  success: boolean;
  downloaded?: number;
  uploaded?: number;
  errors?: string[];
  files?: string[];
}

/**
 * Content generation result
 */
export interface GenerationResult {
  fileId: string;
  url: string;
  title: string;
  type: 'doc' | 'slides';
  wordCount?: number;
  slideCount?: number;
}

/**
 * Search result from index
 */
export interface SearchResult {
  metadata: MaterialMetadata;
  relevanceScore: number;
  matchedFields: string[];
}

/**
 * Token replacement configuration
 */
export interface TokenConfig {
  practiceName?: string;
  practicePhone?: string;
  practiceAddress?: string;
  practiceCity?: string;
  practiceState?: string;
  practiceZip?: string;
  [key: string]: string | undefined;
}
