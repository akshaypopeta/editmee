import { ToolDefinition } from '../../../types';

export const leg_limit_of_liability_cap_12_months_fees_ToolDef: ToolDefinition = {
  "id": "leg-limit-of-liability-cap-12-months-fees",
  "name": "Limitation of Liability (12-Month Aggregate Fees Cap) Clause",
  "category": "business",
  "subcategory": "contracts",
  "description": "Format mutual aggregate liability caps excluding gross negligence, willful misconduct, and confidentiality.",
  "iconName": "Scale",
  "version": "1.0.0",
  "tags": [
    "business",
    "legal",
    "compliance",
    "contracts",
    "gdpr",
    "regulations",
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
        "name": "contractParties",
        "label": "Contracting Parties / Company Name",
        "type": "text",
        "defaultValue": "Enterprise Corp",
        "required": true
      },
      {
        "name": "governingJurisdiction",
        "label": "Governing Law Jurisdiction",
        "type": "select",
        "defaultValue": "delaware",
        "options": [
          {
            "label": "Delaware, USA",
            "value": "delaware"
          },
          {
            "label": "California, USA",
            "value": "california"
          },
          {
            "label": "New York, USA",
            "value": "newyork"
          },
          {
            "label": "United Kingdom / England & Wales",
            "value": "uk"
          },
          {
            "label": "European Union (Ireland / Germany)",
            "value": "eu"
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
      toolId: 'leg-limit-of-liability-cap-12-months-fees',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default leg_limit_of_liability_cap_12_months_fees_ToolDef;
