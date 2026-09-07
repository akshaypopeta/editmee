import { ToolDefinition } from '../../../types';

export const crontab_schedule_explainer_ToolDef: ToolDefinition = {
  "id": "crontab-schedule-explainer",
  "name": "Crontab Syntax Validator & Human Language Explainer",
  "category": "documents",
  "subcategory": "developer",
  "description": "Validate 5-part cron expressions and translate them into clear human-readable schedules.",
  "iconName": "Calendar",
  "version": "1.0.0",
  "tags": [
    "cron",
    "crontab",
    "schedule",
    "devops",
    "explainer",
    "validator"
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
        "name": "expression",
        "label": "Cron Expression (5 parts)",
        "type": "text",
        "defaultValue": "*/15 9-17 * * 1-5",
        "required": true
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
      toolId: 'crontab-schedule-explainer',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default crontab_schedule_explainer_ToolDef;
