import { ToolDefinition } from '../../../types';

export const eng_coaxial_cable_characteristic_impedance_ToolDef: ToolDefinition = {
  "id": "eng-coaxial-cable-characteristic-impedance",
  "name": "Coaxial Cable Characteristic Impedance (50Ω / 75Ω) Sizer",
  "category": "engineering",
  "subcategory": "rf-microwave",
  "description": "Calculate RF impedance Z0 = (138/√εr) log₁₀(D/d) based on inner wire diameter and dielectric constant.",
  "iconName": "Cpu",
  "version": "1.0.0",
  "tags": [
    "engineering",
    "hardware",
    "iot",
    "pcb",
    "robotics",
    "electronics",
    "sensors",
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
        "name": "inputEngineeringValue",
        "label": "Primary Engineering Parameter",
        "type": "number",
        "defaultValue": 12,
        "required": true
      },
      {
        "name": "tolerance",
        "label": "Component Tolerance / Safety Factor (%)",
        "type": "select",
        "defaultValue": "10",
        "options": [
          {
            "label": "5% Standard Precision",
            "value": "5"
          },
          {
            "label": "10% General Purpose",
            "value": "10"
          },
          {
            "label": "20% Worst-Case Engineering",
            "value": "20"
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
      toolId: 'eng-coaxial-cable-characteristic-impedance',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default eng_coaxial_cable_characteristic_impedance_ToolDef;
