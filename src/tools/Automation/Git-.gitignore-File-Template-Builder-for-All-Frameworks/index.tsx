import { ToolDefinition } from '../../../types';

export const dev_git_ignore_template_generator_ToolDef: ToolDefinition = {
  "id": "dev-git-ignore-template-generator",
  "name": "Git .gitignore File Template Builder for All Frameworks",
  "category": "automation",
  "subcategory": "devops",
  "description": "Generate comprehensive .gitignore rules for Node.js, Python, React, Rust, Go, macOS, and IDEs.",
  "iconName": "Terminal",
  "version": "1.0.0",
  "tags": [
    "developer",
    "devops",
    "code",
    "cloud",
    "api",
    "dev git ignore template generator"
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
      toolId: 'dev-git-ignore-template-generator',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default dev_git_ignore_template_generator_ToolDef;
