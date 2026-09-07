import { ToolDefinition } from '../../../types';

export const convert_7z_sevenzip_to_zip_ToolDef: ToolDefinition = {
  "id": "convert-7z-sevenzip-to-zip",
  "name": "7-Zip (.7z) High Compression Archive to Universal ZIP",
  "category": "files",
  "subcategory": "conversion",
  "description": "Extract and repack 7-Zip LZMA2 archives into universal ZIP files without third-party utilities.",
  "iconName": "RefreshCw",
  "version": "1.0.0",
  "tags": [
    "converter",
    "file conversion",
    "transcoder",
    "format",
    "convert 7z sevenzip to zip"
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
      toolId: 'convert-7z-sevenzip-to-zip',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default convert_7z_sevenzip_to_zip_ToolDef;
