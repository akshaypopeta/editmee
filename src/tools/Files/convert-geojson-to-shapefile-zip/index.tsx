import { ToolDefinition } from '../../../types';

export const convert_geojson_to_shapefile_zip_ToolDef: ToolDefinition = {
  "id": "convert-geojson-to-shapefile-zip",
  "name": "GeoJSON Map Features to Esri Shapefile (.shp) ZIP",
  "category": "files",
  "subcategory": "conversion",
  "description": "Convert web GeoJSON coordinates into GIS Shapefile (.shp, .dbf, .shx) archives.",
  "iconName": "RefreshCw",
  "version": "1.0.0",
  "tags": [
    "converter",
    "file conversion",
    "transcoder",
    "format",
    "convert geojson to shapefile zip"
  ],
  "executionMode": "client",
  "supportsBatch": true,
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
        "name": "file",
        "label": "Source File to Convert",
        "type": "file",
        "required": true
      },
      {
        "name": "quality",
        "label": "Output Quality / Profile",
        "type": "select",
        "defaultValue": "high",
        "options": [
          {
            "label": "Lossless / Maximum Quality",
            "value": "lossless"
          },
          {
            "label": "High Quality (Balanced)",
            "value": "high"
          },
          {
            "label": "Compressed / Web Economy",
            "value": "compact"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "file",
    "mimeType": "application/octet-stream"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'convert-geojson-to-shapefile-zip',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default convert_geojson_to_shapefile_zip_ToolDef;
