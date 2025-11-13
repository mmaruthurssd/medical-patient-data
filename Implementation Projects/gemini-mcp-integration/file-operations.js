/**
 * File Operations for Gemini
 *
 * Provides file system access similar to Claude Code's Read/Write/Edit tools.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class FileOperations {
  constructor(workspacePath) {
    this.workspacePath = workspacePath || process.cwd();
  }

  /**
   * Read file contents
   */
  async readFile(filePath) {
    try {
      const absolutePath = this.resolvePath(filePath);
      const content = await fs.readFile(absolutePath, 'utf-8');

      return {
        success: true,
        path: filePath,
        content,
        lines: content.split('\n').length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Write file contents (create or overwrite)
   */
  async writeFile(filePath, content) {
    try {
      const absolutePath = this.resolvePath(filePath);

      // Create directory if it doesn't exist
      const dir = path.dirname(absolutePath);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(absolutePath, content, 'utf-8');

      return {
        success: true,
        path: filePath,
        bytesWritten: content.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List files in directory
   */
  async listFiles(dirPath = '.', pattern = '*') {
    try {
      const absolutePath = this.resolvePath(dirPath);
      const files = await fs.readdir(absolutePath, { withFileTypes: true });

      const fileList = files.map(file => ({
        name: file.name,
        type: file.isDirectory() ? 'directory' : 'file',
        path: path.join(dirPath, file.name)
      }));

      // Simple pattern matching
      const filtered = pattern === '*' ? fileList : fileList.filter(f =>
        f.name.includes(pattern)
      );

      return {
        success: true,
        directory: dirPath,
        files: filtered,
        count: filtered.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Search for text in files (like grep)
   */
  async searchFiles(pattern, dirPath = '.') {
    try {
      const absolutePath = this.resolvePath(dirPath);

      // Use grep for efficient search
      const command = `grep -r "${pattern}" "${absolutePath}" 2>/dev/null || true`;
      const output = execSync(command, { encoding: 'utf-8', maxBuffer: 1024 * 1024 });

      const lines = output.trim().split('\n').filter(l => l);
      const results = lines.slice(0, 50).map(line => {
        const [file, ...rest] = line.split(':');
        return {
          file: path.relative(this.workspacePath, file),
          match: rest.join(':')
        };
      });

      return {
        success: true,
        pattern,
        results,
        totalMatches: lines.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get file/directory info
   */
  async getInfo(filePath) {
    try {
      const absolutePath = this.resolvePath(filePath);
      const stats = await fs.stat(absolutePath);

      return {
        success: true,
        path: filePath,
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modified: stats.mtime.toISOString(),
        created: stats.birthtime.toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Append to file
   */
  async appendFile(filePath, content) {
    try {
      const absolutePath = this.resolvePath(filePath);
      await fs.appendFile(absolutePath, content, 'utf-8');

      return {
        success: true,
        path: filePath,
        bytesAppended: content.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filePath) {
    try {
      const absolutePath = this.resolvePath(filePath);
      await fs.unlink(absolutePath);

      return {
        success: true,
        path: filePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Resolve path relative to workspace
   */
  resolvePath(filePath) {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.join(this.workspacePath, filePath);
  }

  /**
   * Get Gemini function schemas for all file operations
   */
  static getFunctionSchemas() {
    return [
      {
        name: 'read_file',
        description: 'Read the contents of a file in the workspace',
        parameters: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file to read (relative to workspace root)'
            }
          },
          required: ['filePath']
        }
      },
      {
        name: 'write_file',
        description: 'Write content to a file (creates or overwrites)',
        parameters: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file to write'
            },
            content: {
              type: 'string',
              description: 'Content to write to the file'
            }
          },
          required: ['filePath', 'content']
        }
      },
      {
        name: 'list_files',
        description: 'List files and directories in a path',
        parameters: {
          type: 'object',
          properties: {
            dirPath: {
              type: 'string',
              description: 'Directory path to list (default: current directory)',
              default: '.'
            },
            pattern: {
              type: 'string',
              description: 'Filter pattern (default: show all)',
              default: '*'
            }
          }
        }
      },
      {
        name: 'search_files',
        description: 'Search for text pattern in files (like grep)',
        parameters: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Text pattern to search for'
            },
            dirPath: {
              type: 'string',
              description: 'Directory to search in (default: current directory)',
              default: '.'
            }
          },
          required: ['pattern']
        }
      },
      {
        name: 'get_file_info',
        description: 'Get information about a file or directory',
        parameters: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file or directory'
            }
          },
          required: ['filePath']
        }
      },
      {
        name: 'append_to_file',
        description: 'Append content to the end of a file',
        parameters: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file'
            },
            content: {
              type: 'string',
              description: 'Content to append'
            }
          },
          required: ['filePath', 'content']
        }
      }
    ];
  }

  /**
   * Execute a file operation
   */
  async execute(functionName, args) {
    switch (functionName) {
      case 'read_file':
        return await this.readFile(args.filePath);

      case 'write_file':
        return await this.writeFile(args.filePath, args.content);

      case 'list_files':
        return await this.listFiles(args.dirPath, args.pattern);

      case 'search_files':
        return await this.searchFiles(args.pattern, args.dirPath);

      case 'get_file_info':
        return await this.getInfo(args.filePath);

      case 'append_to_file':
        return await this.appendFile(args.filePath, args.content);

      case 'delete_file':
        return await this.deleteFile(args.filePath);

      default:
        return {
          success: false,
          error: `Unknown file operation: ${functionName}`
        };
    }
  }
}

module.exports = { FileOperations };
