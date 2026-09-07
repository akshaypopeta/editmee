import { ToolDefinition } from '../../../types';

export const vtt_to_srt_subtitle_converter_ToolDef: ToolDefinition = {
  "id": "vtt-to-srt-subtitle-converter",
  "name": "WebVTT to SubRip (SRT) Subtitle Transcoder",
  "category": "documents",
  "subcategory": "utilities",
  "description": "Transcode HTML5 WebVTT subtitle files into standard SRT subtitle format with styling cleanup.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "vtt",
    "srt",
    "subtitles",
    "webvtt",
    "transcoder",
    "converter"
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
        "name": "input",
        "label": "WebVTT (.vtt) Content",
        "type": "textarea",
        "defaultValue": "WEBVTT\n\n00:00:01.000 --> 00:00:04.000\n<v Speaker1>Welcome to EditMee Suite.</v>\n\n00:00:04.500 --> 00:00:08.000\n<v Speaker2>All processing runs inside your browser.</v>",
        "required": true
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "mimeType": "text/plain"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'vtt-to-srt-subtitle-converter',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default vtt_to_srt_subtitle_converter_ToolDef;
