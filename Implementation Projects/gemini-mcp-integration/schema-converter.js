/**
 * Schema Converter
 *
 * Converts MCP tool schemas to Gemini function calling schemas.
 * Handles type mapping and validation.
 */

class SchemaConverter {
  /**
   * Convert MCP tool schema to Gemini function schema
   */
  static mcpToGemini(mcpTool) {
    const geminiFunction = {
      name: mcpTool.name,
      description: mcpTool.description || `Tool: ${mcpTool.name}`,
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    };

    // Convert input schema if present
    if (mcpTool.inputSchema) {
      const inputSchema = mcpTool.inputSchema;

      // Copy properties
      if (inputSchema.properties) {
        geminiFunction.parameters.properties = this.convertProperties(
          inputSchema.properties
        );
      }

      // Copy required fields
      if (inputSchema.required && Array.isArray(inputSchema.required)) {
        geminiFunction.parameters.required = inputSchema.required;
      }
    }

    return geminiFunction;
  }

  /**
   * Convert property definitions
   */
  static convertProperties(properties) {
    const converted = {};

    for (const [key, value] of Object.entries(properties)) {
      converted[key] = this.convertProperty(value);
    }

    return converted;
  }

  /**
   * Convert individual property
   */
  static convertProperty(property) {
    const converted = {
      type: this.mapType(property.type)
    };

    // Add description
    if (property.description) {
      converted.description = property.description;
    }

    // Add enum values
    if (property.enum) {
      converted.enum = property.enum;
    }

    // Handle array items
    if (property.type === 'array' && property.items) {
      converted.items = this.convertProperty(property.items);
    }

    // Handle object properties
    if (property.type === 'object') {
      if (property.properties) {
        converted.properties = this.convertProperties(property.properties);
      }
      if (property.required) {
        converted.required = property.required;
      }
    }

    // Add default value
    if (property.default !== undefined) {
      converted.default = property.default;
    }

    // Add constraints
    if (property.minimum !== undefined) {
      converted.minimum = property.minimum;
    }
    if (property.maximum !== undefined) {
      converted.maximum = property.maximum;
    }
    if (property.minLength !== undefined) {
      converted.minLength = property.minLength;
    }
    if (property.maxLength !== undefined) {
      converted.maxLength = property.maxLength;
    }
    if (property.minItems !== undefined) {
      converted.minItems = property.minItems;
    }
    if (property.maxItems !== undefined) {
      converted.maxItems = property.maxItems;
    }

    return converted;
  }

  /**
   * Map MCP types to Gemini types
   */
  static mapType(mcpType) {
    // MCP and Gemini both use JSON Schema types, so mostly 1:1 mapping
    const typeMap = {
      'string': 'string',
      'number': 'number',
      'integer': 'integer',
      'boolean': 'boolean',
      'array': 'array',
      'object': 'object',
      'null': 'null'
    };

    return typeMap[mcpType] || 'string';
  }

  /**
   * Convert multiple MCP tools to Gemini functions
   */
  static convertMultiple(mcpTools) {
    return mcpTools.map(tool => this.mcpToGemini(tool));
  }

  /**
   * Validate Gemini function schema
   */
  static validateGeminiSchema(schema) {
    const errors = [];

    // Required fields
    if (!schema.name) {
      errors.push('Missing required field: name');
    }
    if (!schema.description) {
      errors.push('Missing required field: description');
    }
    if (!schema.parameters) {
      errors.push('Missing required field: parameters');
    }

    // Parameters validation
    if (schema.parameters) {
      if (schema.parameters.type !== 'object') {
        errors.push('parameters.type must be "object"');
      }
      if (!schema.parameters.properties) {
        errors.push('parameters.properties is required');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate example function call from schema
   */
  static generateExample(geminiFunction) {
    const example = {
      name: geminiFunction.name,
      arguments: {}
    };

    if (geminiFunction.parameters && geminiFunction.parameters.properties) {
      for (const [key, prop] of Object.entries(geminiFunction.parameters.properties)) {
        example.arguments[key] = this.generateExampleValue(prop);
      }
    }

    return example;
  }

  /**
   * Generate example value for property type
   */
  static generateExampleValue(property) {
    if (property.default !== undefined) {
      return property.default;
    }

    if (property.enum && property.enum.length > 0) {
      return property.enum[0];
    }

    switch (property.type) {
      case 'string':
        return property.description || 'example-value';
      case 'number':
      case 'integer':
        return property.minimum || 0;
      case 'boolean':
        return true;
      case 'array':
        return property.items ? [this.generateExampleValue(property.items)] : [];
      case 'object':
        const obj = {};
        if (property.properties) {
          for (const [key, prop] of Object.entries(property.properties)) {
            obj[key] = this.generateExampleValue(prop);
          }
        }
        return obj;
      default:
        return null;
    }
  }
}

module.exports = { SchemaConverter };
