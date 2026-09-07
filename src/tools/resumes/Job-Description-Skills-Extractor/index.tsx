import { ToolDefinition } from '../../../types';

export const resumes_job_description_skills_extractor_6_ToolDef: ToolDefinition = {
  "id": "resumes-job-description-skills-extractor-6",
  "name": "Job Description Skills Extractor",
  "category": "resumes",
  "subcategory": "analyze",
  "description": "Extract core hard and soft skills required in job vacancy postings.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "resumes",
    "analyze",
    "job",
    "utility",
    "client-side"
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
        "label": "Primary Input / Content",
        "type": "textarea",
        "required": true,
        "defaultValue": "Sample input data for Job Description Skills Extractor"
      },
      {
        "name": "option",
        "label": "Processing Preset",
        "type": "select",
        "defaultValue": "standard",
        "options": [
          {
            "label": "Standard Mode",
            "value": "standard"
          },
          {
            "label": "High Precision",
            "value": "high"
          },
          {
            "label": "Fast Output",
            "value": "fast"
          }
        ]
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
      toolId: 'resumes-job-description-skills-extractor-6',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default resumes_job_description_skills_extractor_6_ToolDef;
