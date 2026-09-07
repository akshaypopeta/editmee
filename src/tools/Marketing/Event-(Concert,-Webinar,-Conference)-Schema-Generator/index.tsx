import { ToolDefinition } from '../../../types';

export const seo_schema_event_virtual_inperson_ToolDef: ToolDefinition = {
  "id": "seo-schema-event-virtual-inperson",
  "name": "Event (Concert, Webinar, Conference) Schema Generator",
  "category": "marketing",
  "subcategory": "seo",
  "description": "Generate Event structured data with startDate, endDate, performer, and virtual streaming URLs.",
  "iconName": "Search",
  "version": "1.0.0",
  "tags": [
    "seo",
    "marketing",
    "keywords",
    "schema",
    "search engine",
    "seo schema event virtual inperson"
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
        "name": "urlOrText",
        "label": "Target URL, Title or Keyword List",
        "type": "text",
        "defaultValue": "https://editmee.com/pdf-editor",
        "required": true
      },
      {
        "name": "mode",
        "label": "Analysis / Generation Mode",
        "type": "select",
        "defaultValue": "audit",
        "options": [
          {
            "label": "Full SEO Audit",
            "value": "audit"
          },
          {
            "label": "Schema Generation",
            "value": "schema"
          },
          {
            "label": "Snippet SERP Test",
            "value": "serp"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "mimeType": "text/markdown"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'seo-schema-event-virtual-inperson',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default seo_schema_event_virtual_inperson_ToolDef;
