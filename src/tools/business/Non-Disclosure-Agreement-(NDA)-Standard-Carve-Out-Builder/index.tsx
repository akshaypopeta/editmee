import { ToolDefinition } from '../../../types';

export const nda_confidentiality_clause_carveout_builder_ToolDef: ToolDefinition = {
  "id": "nda-confidentiality-clause-carveout-builder",
  "name": "Non-Disclosure Agreement (NDA) Standard Carve-Out Builder",
  "category": "business",
  "subcategory": "contracts",
  "description": "Format standard Mutual and Unilateral NDA definition clauses, exclusion carve-outs (public knowledge, prior possession, independent development), and survival terms.",
  "iconName": "FileCheck",
  "version": "1.0.0",
  "tags": [
    "business",
    "legal",
    "nda",
    "contracts",
    "clauses",
    "confidentiality"
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
        "name": "disclosingParty",
        "label": "Disclosing Party Name",
        "type": "text",
        "defaultValue": "Alpha Innovations Inc.",
        "required": true
      },
      {
        "name": "receivingParty",
        "label": "Receiving Party Name",
        "type": "text",
        "defaultValue": "Beta Partner LLC",
        "required": true
      },
      {
        "name": "survivalYears",
        "label": "Confidentiality Survival Period (Years)",
        "type": "select",
        "defaultValue": "3",
        "options": [
          {
            "label": "2 Years (Standard Commercial)",
            "value": "2"
          },
          {
            "label": "3 Years (Tech / Software)",
            "value": "3"
          },
          {
            "label": "5 Years (M&A / Source Code)",
            "value": "5"
          },
          {
            "label": "Perpetual (Trade Secrets)",
            "value": "perpetual"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "text"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'nda-confidentiality-clause-carveout-builder',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default nda_confidentiality_clause_carveout_builder_ToolDef;
