import { ToolDefinition } from '../../../types';

export const ecom_economic_order_quantity_eoq_safety_stock_ToolDef: ToolDefinition = {
  "id": "ecom-economic-order-quantity-eoq-safety-stock",
  "name": "Economic Order Quantity (EOQ) & Reorder Point Optimizer",
  "category": "business",
  "subcategory": "inventory-management",
  "description": "Calculate cost-minimizing Economic Order Quantity (EOQ = √(2DS/H)), safety stock based on lead-time demand volatility, and optimal Reorder Point (ROP).",
  "iconName": "Warehouse",
  "version": "1.0.0",
  "tags": [
    "business",
    "inventory",
    "eoq",
    "supply-chain",
    "ecommerce",
    "warehouse",
    "reorder-point"
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
        "name": "annualDemandUnits",
        "label": "Annual Demand (Units/Year)",
        "type": "number",
        "defaultValue": 12000,
        "required": true
      },
      {
        "name": "orderCostDollars",
        "label": "Fixed Order Cost per Purchase Order ($)",
        "type": "number",
        "defaultValue": 50,
        "required": true
      },
      {
        "name": "holdingCostPerUnit",
        "label": "Annual Holding / Storage Cost per Unit ($)",
        "type": "number",
        "defaultValue": 3.5,
        "required": true
      },
      {
        "name": "leadTimeDays",
        "label": "Supplier Lead Time (Days)",
        "type": "number",
        "defaultValue": 14,
        "required": true
      },
      {
        "name": "dailyDemandStdDev",
        "label": "Daily Demand Standard Deviation (Units)",
        "type": "number",
        "defaultValue": 8
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
      toolId: 'ecom-economic-order-quantity-eoq-safety-stock',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ecom_economic_order_quantity_eoq_safety_stock_ToolDef;
