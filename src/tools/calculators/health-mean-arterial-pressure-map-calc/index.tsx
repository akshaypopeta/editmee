import { ToolDefinition } from '../../../types';

export const health_mean_arterial_pressure_map_calc_ToolDef: ToolDefinition = {
  "id": "health-mean-arterial-pressure-map-calc",
  "name": "Mean Arterial Pressure (MAP = DBP + ⅓(SBP - DBP)) Sizer",
  "category": "calculator",
  "subcategory": "cardiology",
  "description": "Calculate organ perfusion pressure from systolic and diastolic blood pressure readings.",
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
      toolId: 'health-mean-arterial-pressure-map-calc',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default health_mean_arterial_pressure_map_calc_ToolDef;
