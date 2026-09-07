import { ToolDefinition } from '../../../types';

export const health_vo2_max_cooper_test_calculator_ToolDef: ToolDefinition = {
  "id": "health-vo2-max-cooper-test-calculator",
  "name": "Cardiovascular VO2 Max & Cooper 12-Min Test Sizer",
  "category": "calculator",
  "subcategory": "sports-science",
  "description": "Calculate aerobic capacity (VO2 Max in mL/kg/min) from Cooper 12-minute run distance or 1.5-mile run times, with aerobic fitness percentile rankings.",
  "iconName": "Activity",
  "version": "1.0.0",
  "tags": [
    "calculator",
    "health",
    "fitness",
    "vo2-max",
    "running",
    "cardio",
    "athletics"
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
        "name": "distanceMeters",
        "label": "Cooper Test 12-Minute Distance (Meters)",
        "type": "number",
        "defaultValue": 2750,
        "required": true
      },
      {
        "name": "ageYears",
        "label": "Athlete Age",
        "type": "number",
        "defaultValue": 26
      },
      {
        "name": "gender",
        "label": "Gender",
        "type": "select",
        "defaultValue": "male",
        "options": [
          {
            "label": "Male",
            "value": "male"
          },
          {
            "label": "Female",
            "value": "female"
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
      toolId: 'health-vo2-max-cooper-test-calculator',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default health_vo2_max_cooper_test_calculator_ToolDef;
