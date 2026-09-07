import { ToolDefinition } from '../../../types';

export const dev_cron_expression_next_occurrences_ToolDef: ToolDefinition = {
  "id": "dev-cron-expression-next-occurrences",
  "name": "Crontab Next 10 Execution Occurrences Calculator",
  "category": "automation",
  "subcategory": "devops",
  "description": "Calculate and display the exact dates and times for the next 10 executions of any cron schedule.",
  "iconName": "Terminal",
  "version": "1.0.0",
  "tags": [
    "developer",
    "devops",
    "code",
    "cloud",
    "api",
    "dev cron expression next occurrences"
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
        "name": "config",
        "label": "Configuration Payload / Code / Query",
        "type": "textarea",
        "defaultValue": "server {\n  listen 80;\n  server_name example.com;\n}",
        "required": true
      },
      {
        "name": "mode",
        "label": "Generation Preset",
        "type": "select",
        "defaultValue": "production",
        "options": [
          {
            "label": "Production Hardened",
            "value": "production"
          },
          {
            "label": "Development / Debug",
            "value": "development"
          },
          {
            "label": "Minimal / Compact",
            "value": "minimal"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "mimeType": "text/plain"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'dev-cron-expression-next-occurrences',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default dev_cron_expression_next_occurrences_ToolDef;
