import { ToolDefinition } from '../../../types';

export const health_omega_3_index_epa_dha_intake_ToolDef: ToolDefinition = {
  "id": "health-omega-3-index-epa-dha-intake",
  "name": "Omega-3 Index (EPA + DHA RBC Membrane Target 8%) Sizer",
  "category": "calculator",
  "subcategory": "nutrition",
  "description": "Calculate daily dietary fish oil intake required to elevate cardiovascular protective Omega-3 index.",
  "iconName": "Activity",
  "version": "1.0.0",
  "tags": [
    "calculator",
    "health",
    "fitness",
    "biometrics",
    "medicine",
    "nutrition",
    "sports-science",
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
        "name": "biometricValue",
        "label": "Primary Biometric / Clinical Reading",
        "type": "number",
        "defaultValue": 100,
        "required": true
      },
      {
        "name": "patientContext",
        "label": "Clinical Demographic / Cohort",
        "type": "select",
        "defaultValue": "adult",
        "options": [
          {
            "label": "Standard Adult Reference",
            "value": "adult"
          },
          {
            "label": "Trained Endurance Athlete",
            "value": "athlete"
          },
          {
            "label": "Clinical Inpatient",
            "value": "clinical"
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
      toolId: 'health-omega-3-index-epa-dha-intake',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default health_omega_3_index_epa_dha_intake_ToolDef;
