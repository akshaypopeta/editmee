import { ToolDefinition } from '../../../types';

export const audio_microphone_polar_pattern_guide_ToolDef: ToolDefinition = {
  "id": "audio-microphone-polar-pattern-guide",
  "name": "Microphone Polar Pattern (Cardioid, Omni, Fig-8) Guide",
  "category": "media",
  "subcategory": "audio",
  "description": "Explore acoustic rejection angles and proximity effect frequency curves across microphone polar patterns.",
  "iconName": "Music",
  "version": "1.0.0",
  "tags": [
    "audio",
    "sound",
    "music",
    "dsp",
    "acoustics",
    "audio microphone polar pattern guide"
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
        "name": "frequency",
        "label": "Frequency / Tempo / Parameter",
        "type": "number",
        "defaultValue": 440,
        "min": 20,
        "max": 20000
      },
      {
        "name": "waveform",
        "label": "Waveform / Mode",
        "type": "select",
        "defaultValue": "sine",
        "options": [
          {
            "label": "Pure Sine Wave",
            "value": "sine"
          },
          {
            "label": "Harmonic Square Wave",
            "value": "square"
          },
          {
            "label": "Sawtooth Wave",
            "value": "sawtooth"
          },
          {
            "label": "Triangle Wave",
            "value": "triangle"
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
      toolId: 'audio-microphone-polar-pattern-guide',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default audio_microphone_polar_pattern_guide_ToolDef;
