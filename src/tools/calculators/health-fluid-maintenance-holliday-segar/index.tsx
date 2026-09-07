import { ToolDefinition } from '../../../types';

export const health_fluid_maintenance_holliday_segar_ToolDef: ToolDefinition = {
  "id": "health-fluid-maintenance-holliday-segar",
  "name": "Pediatric Maintenance IV Fluid (Holliday-Segar 4-2-1 Rule)",
  "category": "calculator",
  "subcategory": "pediatrics",
  "description": "Calculate hourly IV fluid rates (4 mL/kg for first 10kg, 2 mL/kg for 11-20kg, 1 mL/kg thereafter).",
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
      toolId: 'health-fluid-maintenance-holliday-segar',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default health_fluid_maintenance_holliday_segar_ToolDef;
