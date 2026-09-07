import { ToolDefinition } from '../../../types';

export const ai_writing_ToolDef: ToolDefinition = {
  "id": "ai-writing",
  "name": "AI Writing & Content Studio",
  "category": "ai",
  "subcategory": "writing",
  "description": "Enterprise copywriter for technical specs, executive briefings, ATS resume profiles, and billing memos.",
  "iconName": "PenTool",
  "version": "2.0.0",
  "tags": [
    "ai",
    "writing",
    "copywriting",
    "resume",
    "proposal",
    "spec",
    "sql"
  ],
  "executionMode": "hybrid",
  "supportsBatch": false,
  "supportsWorkflow": true,
  "requiresAI": true,
  "capabilities": {
    "clientSide": true,
    "workerSupported": false,
    "batchSupported": false,
    "workflowSupported": true,
    "aiPowered": true,
    "offlineReady": false,
    "requiresKey": false
  },
  "inputSchema": {
    "fields": [
      {
        "name": "prompt",
        "label": "Instruction / Topic",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Draft an executive briefing on system performance..."
      },
      {
        "name": "sourceText",
        "label": "Source Text to Rewrite/Summarize",
        "type": "textarea",
        "required": false
      },
      {
        "name": "tone",
        "label": "Tone",
        "type": "select",
        "required": false,
        "defaultValue": "executive",
        "options": [
          {
            "label": "Executive",
            "value": "executive"
          },
          {
            "label": "Formal Business",
            "value": "formal"
          },
          {
            "label": "Concise",
            "value": "concise"
          },
          {
            "label": "Technical",
            "value": "technical"
          },
          {
            "label": "Persuasive",
            "value": "persuasive"
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
      toolId: 'ai-writing',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ai_writing_ToolDef;
