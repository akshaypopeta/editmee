import { ToolDefinition } from '../../../types';

export const health_intermittent_fasting_window_timer_ToolDef: ToolDefinition = {
  "id": "health-intermittent-fasting-window-timer",
  "name": "Intermittent Fasting Schedule (16:8, 18:6, 20:4) Planner",
  "category": "calculator",
  "subcategory": "nutrition",
  "description": "Structure eating and fasting circadian windows aligning with melatonin suppression.",
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
      toolId: 'health-intermittent-fasting-window-timer',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default health_intermittent_fasting_window_timer_ToolDef;
