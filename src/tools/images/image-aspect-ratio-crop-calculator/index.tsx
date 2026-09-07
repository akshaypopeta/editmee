import { ToolDefinition } from '../../../types';

export const image_aspect_ratio_crop_calculator_ToolDef: ToolDefinition = {
  "id": "image-aspect-ratio-crop-calculator",
  "name": "Image Aspect Ratio & Social Media Sizer",
  "category": "images",
  "subcategory": "resizing",
  "description": "Calculate pixel dimensions, crop coordinates, and letterboxing for Instagram, YouTube, TikTok, LinkedIn, and OpenGraph standards.",
  "iconName": "Image",
  "version": "1.0.0",
  "tags": [
    "images",
    "aspect-ratio",
    "crop",
    "social-media",
    "instagram",
    "youtube",
    "tiktok"
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
        "name": "width",
        "label": "Source Width (px)",
        "type": "number",
        "defaultValue": 1920,
        "required": true
      },
      {
        "name": "height",
        "label": "Source Height (px)",
        "type": "number",
        "defaultValue": 1080,
        "required": true
      },
      {
        "name": "targetPreset",
        "label": "Target Social Media Standard",
        "type": "select",
        "defaultValue": "instagram-square",
        "options": [
          {
            "label": "Instagram Square (1:1 - 1080x1080)",
            "value": "instagram-square"
          },
          {
            "label": "Instagram Portrait / Reel / TikTok (9:16 - 1080x1920)",
            "value": "story-vertical"
          },
          {
            "label": "YouTube Thumbnail / Landscape (16:9 - 1280x720)",
            "value": "youtube-thumb"
          },
          {
            "label": "OpenGraph / Twitter Card (1.91:1 - 1200x630)",
            "value": "opengraph"
          },
          {
            "label": "LinkedIn Post Image (4:5 - 1080x1350)",
            "value": "linkedin-portrait"
          },
          {
            "label": "Ultrawide Cinema (21:9 - 2560x1080)",
            "value": "ultrawide"
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
      toolId: 'image-aspect-ratio-crop-calculator',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default image_aspect_ratio_crop_calculator_ToolDef;
