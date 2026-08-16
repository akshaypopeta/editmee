import { ToolDefinition, ToolInputField, ToolValidationResult } from '../../types';

export class ToolValidator {
  private static instance: ToolValidator;

  private constructor() {}

  public static getInstance(): ToolValidator {
    if (!ToolValidator.instance) {
      ToolValidator.instance = new ToolValidator();
    }
    return ToolValidator.instance;
  }

  /**
   * Validate input values against a ToolDefinition's inputSchema and validateInput hook
   */
  public validate(tool: ToolDefinition, input: any): ToolValidationResult {
    if (!tool || !tool.inputSchema) {
      return { valid: true };
    }

    const fields = tool.inputSchema.fields || [];

    // Check required fields
    for (const field of fields) {
      const value = input?.[field.name];
      const isMissing = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

      if (field.required && isMissing) {
        return {
          valid: false,
          error: `Field "${field.label || field.name}" is required.`,
        };
      }

      // If value is provided, validate type & constraints
      if (!isMissing) {
        const fieldError = this.validateField(field, value);
        if (fieldError) {
          return {
            valid: false,
            error: fieldError,
          };
        }
      }
    }

    // Run custom tool validator if present
    if (tool.validateInput) {
      try {
        const customResult = tool.validateInput(input);
        if (!customResult.valid) {
          return customResult;
        }
      } catch (e: any) {
        return {
          valid: false,
          error: `Input validation error: ${e?.message || 'Invalid parameters'}`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Validate a single field's type and constraints
   */
  public validateField(field: ToolInputField, value: any): string | null {
    switch (field.type) {
      case 'number': {
        const num = Number(value);
        if (isNaN(num)) {
          return `"${field.label || field.name}" must be a valid number.`;
        }
        if (field.min !== undefined && num < field.min) {
          return `"${field.label || field.name}" must be at least ${field.min}.`;
        }
        if (field.max !== undefined && num > field.max) {
          return `"${field.label || field.name}" must not exceed ${field.max}.`;
        }
        break;
      }

      case 'select': {
        if (field.options && field.options.length > 0) {
          const validValues = field.options.map((o) => o.value);
          if (!validValues.includes(value)) {
            return `"${value}" is not a valid option for "${field.label || field.name}".`;
          }
        }
        break;
      }

      case 'file': {
        if (!(value instanceof Blob) && !(value instanceof File)) {
          return `"${field.label || field.name}" requires a valid File or Blob.`;
        }
        if (field.accept && value instanceof File && field.accept !== '*/*') {
          const accepted = field.accept.split(',').map((s) => s.trim().toLowerCase());
          const fileName = value.name.toLowerCase();
          const fileType = value.type.toLowerCase();
          
          const match = accepted.some((acc) => {
            if (acc.startsWith('.')) return fileName.endsWith(acc);
            if (acc.endsWith('/*')) return fileType.startsWith(acc.replace('/*', ''));
            return fileType === acc;
          });

          if (!match && !accepted.includes('*')) {
            return `File format not accepted. Allowed: ${field.accept}`;
          }
        }
        break;
      }

      case 'json': {
        if (typeof value === 'string') {
          try {
            JSON.parse(value);
          } catch (e: any) {
            return `"${field.label || field.name}" must be valid JSON: ${e.message}`;
          }
        } else if (typeof value !== 'object' || value === null) {
          return `"${field.label || field.name}" must be a valid JSON object or string.`;
        }
        break;
      }

      case 'string':
      case 'textarea': {
        if (typeof value !== 'string') {
          return `"${field.label || field.name}" must be text.`;
        }
        break;
      }

      case 'boolean': {
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          return `"${field.label || field.name}" must be true or false.`;
        }
        break;
      }
    }

    return null;
  }
}

export const toolValidator = ToolValidator.getInstance();
