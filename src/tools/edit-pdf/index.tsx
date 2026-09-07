import { ToolDefinition, ToolResult } from '../../types';
import { EditPdfTool } from '../pdf/EditPdfTool';

export const editPdfToolDef: ToolDefinition = {
  id: 'edit-pdf',
  name: 'Edit PDF',
  description: 'The Flagship universal PDF workspace: edit text, insert images, add signatures, annotate, rotate, reorder, delete pages, and watermark.',
  category: 'pdf',
  subcategory: 'editor',
  iconName: 'FileText',
  version: '2.0.0',
  tags: ['pdf', 'editor', 'sign', 'annotate', 'watermark', 'pages', 'flagship'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
    ],
  },
  outputSchema: {
    type: 'pdf',
    mimeType: 'application/pdf',
    filename: 'edited_document.pdf',
  },
  customWorkspace: EditPdfTool,
  execute: async (input: any): Promise<ToolResult> => {
    return {
      success: true,
      filename: input.file?.name || 'document.pdf',
    };
  },
};

export default editPdfToolDef;
