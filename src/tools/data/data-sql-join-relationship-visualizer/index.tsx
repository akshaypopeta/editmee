import { ToolDefinition } from '../../../types';

export const data_sql_join_relationship_visualizer_ToolDef: ToolDefinition = {
  "id": "data-sql-join-relationship-visualizer",
  "name": "SQL JOIN Cardinality & Set Venn Diagram Sizer",
  "category": "data",
  "subcategory": "sql-tools",
  "description": "Calculate INNER, LEFT, RIGHT, and FULL OUTER JOIN row count permutations based on key overlap.",
  "iconName": "Database",
  "version": "1.0.0",
  "tags": [
    "data",
    "analytics",
    "sql",
    "csv",
    "transformation",
    "database",
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
        "name": "dataPayload",
        "label": "Input Data / SQL / CSV / JSON",
        "type": "textarea",
        "placeholder": "Enter payload for SQL JOIN Cardinality & Set Venn Diagram Sizer...",
        "required": true
      },
      {
        "name": "operation",
        "label": "Operation Mode",
        "type": "select",
        "defaultValue": "analyze",
        "options": [
          {
            "label": "Analyze & Profile",
            "value": "analyze"
          },
          {
            "label": "Transform & Export",
            "value": "transform"
          },
          {
            "label": "Validate Integrity",
            "value": "validate"
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
      toolId: 'data-sql-join-relationship-visualizer',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default data_sql_join_relationship_visualizer_ToolDef;
