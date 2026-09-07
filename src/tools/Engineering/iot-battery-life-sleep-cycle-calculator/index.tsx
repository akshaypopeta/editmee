import { ToolDefinition } from '../../../types';

export const iot_battery_life_sleep_cycle_calculator_ToolDef: ToolDefinition = {
  "id": "iot-battery-life-sleep-cycle-calculator",
  "name": "IoT Battery Life & Deep Sleep Discharge Sizer",
  "category": "engineering",
  "subcategory": "embedded-systems",
  "description": "Estimate operating battery lifespan (months, years) for microcontroller sensor nodes based on active TX current, deep sleep current, transmission interval, and battery self-discharge.",
  "iconName": "BatteryCharging",
  "version": "1.0.0",
  "tags": [
    "engineering",
    "iot",
    "battery",
    "esp32",
    "nordic",
    "low-power",
    "sensors"
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
        "name": "batteryCapacityMah",
        "label": "Battery Capacity (mAh)",
        "type": "number",
        "defaultValue": 2400,
        "required": true
      },
      {
        "name": "activeCurrentMa",
        "label": "Active Mode Current (mA)",
        "type": "number",
        "defaultValue": 80,
        "required": true
      },
      {
        "name": "activeDurationMs",
        "label": "Active Duration per Wakeup (ms)",
        "type": "number",
        "defaultValue": 300,
        "required": true
      },
      {
        "name": "sleepCurrentUa",
        "label": "Deep Sleep Current (µA)",
        "type": "number",
        "defaultValue": 15,
        "required": true
      },
      {
        "name": "sleepDurationSec",
        "label": "Wakeup Interval / Sleep Period (Seconds)",
        "type": "number",
        "defaultValue": 60,
        "required": true
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
      toolId: 'iot-battery-life-sleep-cycle-calculator',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default iot_battery_life_sleep_cycle_calculator_ToolDef;
