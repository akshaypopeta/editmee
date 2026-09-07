import { ToolDefinition, ToolResult } from '../../types';
import { ALL_50_CALCULATORS } from '../../core/calculators/allCalculators';

export const calculatorsCatalog: ToolDefinition[] = ALL_50_CALCULATORS.map((calcDef) => ({
  id: calcDef.id,
  name: calcDef.name,
  description: calcDef.description,
  category: 'calculators',
  subcategory: calcDef.subcategory,
  iconName: calcDef.iconName || 'Calculator',
  version: '2.0.0',
  tags: [...calcDef.tags, 'calculator', 'online tool', 'editmee'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: false,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: calcDef.inputs.map((field) => ({
      name: field.id,
      label: field.label,
      type: (field.type === 'select'
        ? 'select'
        : field.type === 'number'
        ? 'number'
        : 'text') as any,
      required: true,
      defaultValue: field.defaultValue,
      options: field.options,
      min: field.min,
      max: field.max,
      step: field.step,
      description: field.helperText,
    })),
  },
  outputSchema: {
    type: 'json',
    mimeType: 'application/json',
  },
  execute: async (inputs): Promise<ToolResult> => {
    const res = calcDef.calculate(inputs);
    return {
      success: res.success,
      data: res,
      text: `${res.primary.label}: ${res.primary.value} ${res.primary.unit || ''}`.trim(),
      error: res.error,
      metadata: {
        calculatedAt: new Date().toISOString(),
        calculatorId: calcDef.id,
        category: calcDef.category,
      },
    };
  },
}));
