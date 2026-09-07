import { ToolDefinition } from '../../../types';

export const design_business_card_canvas_ToolDef: ToolDefinition = {
  "id": "design-business-card-canvas",
  "name": "Print-Ready Business Card (3.5x2 inch) Canvas",
  "category": "design",
  "subcategory": "canvas",
  "description": "Design front and back corporate business cards with 300 DPI export and standard 0.125-inch bleed.",
  "iconName": "Layout",
  "version": "1.0.0",
  "tags": [
    "design",
    "graphics",
    "canvas",
    "mockup",
    "template",
    "design business card canvas"
  ],
  "executionMode": "client",
  "supportsBatch": false,
  "supportsWorkflow": true,
  "requiresAI": false,
  "capabilities": {
    "clientSide": true,
    "workerSupported": true,
    "batchSupported": false,
    "workflowSupported": true,
    "aiPowered": false,
    "offlineReady": true,
    "requiresKey": false
  },
  "inputSchema": {
    "fields": [
      {
        "name": "headline",
        "label": "Main Headline / Text",
        "type": "text",
        "defaultValue": "Special Announcement",
        "required": true
      },
      {
        "name": "subtext",
        "label": "Sub-Headline / Details",
        "type": "text",
        "defaultValue": "High Quality Production by EditMee"
      },
      {
        "name": "bgColor",
        "label": "Background Accent Color",
        "type": "color",
        "defaultValue": "#dc2626"
      }
    ]
  },
  "outputSchema": {
    "type": "image",
    "mimeType": "image/png"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'design-business-card-canvas',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default design_business_card_canvas_ToolDef;
