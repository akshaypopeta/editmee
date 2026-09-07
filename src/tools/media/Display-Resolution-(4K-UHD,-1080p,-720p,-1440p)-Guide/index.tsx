import { ToolDefinition } from '../../../types';

export const video_screen_resolution_aspect_guide_ToolDef: ToolDefinition = {
  "id": "video-screen-resolution-aspect-guide",
  "name": "Display Resolution (4K UHD, 1080p, 720p, 1440p) Guide",
  "category": "media",
  "subcategory": "video",
  "description": "Compare pixel dimensions, megapixels, and aspect ratios (16:9, 18:9, 21:9, 4:3) across modern displays.",
  "iconName": "Video",
  "version": "1.0.0",
  "tags": [
    "video",
    "media",
    "motion",
    "broadcast",
    "cinema",
    "video screen resolution aspect guide"
  ],
  "executionMode": "client",
  "supportsBatch": false,
  "supportsWorkflow": true,
  "requiresAI": false,
  "capabilities": {
    "clientSide": true,
    "workerSupported": true,
    "batchSupported": false,
    "workflowSupported": true,
    "aiPowered": false,
    "offlineReady": true,
    "requiresKey": false
  },
  "inputSchema": {
    "fields": [
      {
        "name": "resolution",
        "label": "Target Resolution",
        "type": "select",
        "defaultValue": "1080p",
        "options": [
          {
            "label": "4K Ultra HD (3840x2160)",
            "value": "4k"
          },
          {
            "label": "Full HD 1080p (1920x1080)",
            "value": "1080p"
          },
          {
            "label": "HD 720p (1280x720)",
            "value": "720p"
          },
          {
            "label": "Vertical Reels 9:16 (1080x1920)",
            "value": "reels"
          }
        ]
      },
      {
        "name": "fps",
        "label": "Frame Rate (FPS)",
        "type": "select",
        "defaultValue": "24",
        "options": [
          {
            "label": "24 fps (Cinema)",
            "value": "24"
          },
          {
            "label": "29.97 fps (Broadcast NTSC)",
            "value": "29.97"
          },
          {
            "label": "60 fps (Smooth / Gaming)",
            "value": "60"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "mimeType": "text/markdown"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'video-screen-resolution-aspect-guide',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default video_screen_resolution_aspect_guide_ToolDef;
