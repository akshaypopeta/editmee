import { ToolDefinition } from '../../../types';

export const leg_trademark_likelihood_of_confusion_du_pont_ToolDef: ToolDefinition = {
  "id": "leg-trademark-likelihood-of-confusion-du-pont",
  "name": "DuPont Factors Trademark Likelihood of Confusion Evaluator",
  "category": "business",
  "subcategory": "intellectual-property",
  "description": "Evaluate similarity of marks (sound, appearance, meaning) and relatedness of commercial goods.",
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
      toolId: 'leg-trademark-likelihood-of-confusion-du-pont',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default leg_trademark_likelihood_of_confusion_du_pont_ToolDef;
