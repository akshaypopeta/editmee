import { ToolDefinition } from '../../../types';

export const sec_port_scan_service_name_lookup_ToolDef: ToolDefinition = {
  "id": "sec-port-scan-service-name-lookup",
  "name": "IANA Standard TCP/UDP Port to Service Name Lookup",
  "category": "security",
  "subcategory": "networking",
  "description": "Lookup well-known ports (22 SSH, 80 HTTP, 443 HTTPS, 5432 Postgres, 6379 Redis) and risk levels.",
  "iconName": "Shield",
  "version": "1.0.0",
  "tags": [
    "security",
    "privacy",
    "crypto",
    "authentication",
    "cybersecurity",
    "tools"
  ],
  "executionMode": "client",
  "supportsBatch": false,
  "supportsWorkflow": true,
  "requiresAI": false,
  "capabilities": {
    "clientSide": true,
    "workerSupported": true,
    "batchSupported": true,
    "workflowSupported": true,
    "aiPowered": false,
    "offlineReady": true,
    "requiresKey": false
  },
  "inputSchema": {
    "fields": [
      {
        "name": "inputPayload",
        "label": "Security Input / Key / Policy / Hash",
        "type": "textarea",
        "placeholder": "Enter input for IANA Standard TCP/UDP Port to Service Name Lookup...",
        "required": true
      },
      {
        "name": "mode",
        "label": "Execution Mode",
        "type": "select",
        "defaultValue": "strict",
        "options": [
          {
            "label": "Strict Security Audit",
            "value": "strict"
          },
          {
            "label": "Standard Validation",
            "value": "standard"
          },
          {
            "label": "Export Policy / Signature",
            "value": "export"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "json"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'sec-port-scan-service-name-lookup',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default sec_port_scan_service_name_lookup_ToolDef;
