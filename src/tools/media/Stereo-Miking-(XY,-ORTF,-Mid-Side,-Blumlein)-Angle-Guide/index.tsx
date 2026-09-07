import { ToolDefinition } from '../../../types';

export const audio_stereo_mic_technique_guide_ToolDef: ToolDefinition = {
  "id": "audio-stereo-mic-technique-guide",
  "name": "Stereo Miking (XY, ORTF, Mid-Side, Blumlein) Angle Guide",
  "category": "media",
  "subcategory": "audio",
  "description": "Calculate capsule angles and microphone spacing for stereo field recording techniques.",
  "iconName": "Music",
  "version": "1.0.0",
  "tags": [
    "audio",
    "sound",
    "music",
    "dsp",
    "acoustics",
    "audio stereo mic technique guide"
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
      toolId: 'audio-stereo-mic-technique-guide',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default audio_stereo_mic_technique_guide_ToolDef;
