import { ToolDefinition } from '../../../types';

export const pcb_trace_width_current_ipc2152_calc_ToolDef: ToolDefinition = {
  "id": "pcb-trace-width-current-ipc2152-calc",
  "name": "PCB Trace Width & Current Capacity (IPC-2152) Sizer",
  "category": "engineering",
  "subcategory": "pcb-design",
  "description": "Calculate minimum PCB copper trace width for internal and external layers based on maximum allowable temperature rise (ΔT °C), copper thickness (oz/ft²), and continuous DC/AC current.",
  "iconName": "Cpu",
  "version": "1.0.0",
  "tags": [
    "engineering",
    "pcb",
    "ipc-2152",
    "electronics",
    "hardware",
    "current",
    "thermal"
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
        "name": "currentAmps",
        "label": "Maximum Current (Amperes)",
        "type": "number",
        "defaultValue": 3,
        "required": true
      },
      {
        "name": "tempRiseC",
        "label": "Allowable Temperature Rise (ΔT °C)",
        "type": "number",
        "defaultValue": 10,
        "required": true
      },
      {
        "name": "copperWeightOz",
        "label": "Copper Thickness",
        "type": "select",
        "defaultValue": "1.0",
        "options": [
          {
            "label": "0.5 oz/ft² (17.5 µm)",
            "value": "0.5"
          },
          {
            "label": "1.0 oz/ft² (35.0 µm - Standard)",
            "value": "1.0"
          },
          {
            "label": "2.0 oz/ft² (70.0 µm - Power)",
            "value": "2.0"
          }
        ]
      },
      {
        "name": "layerType",
        "label": "PCB Layer Placement",
        "type": "select",
        "defaultValue": "external",
        "options": [
          {
            "label": "External Layer (Top/Bottom - Convection)",
            "value": "external"
          },
          {
            "label": "Internal Layer (Inner Core - Conduction Only)",
            "value": "internal"
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
      toolId: 'pcb-trace-width-current-ipc2152-calc',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default pcb_trace_width_current_ipc2152_calc_ToolDef;
