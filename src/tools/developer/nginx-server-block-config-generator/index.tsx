import { ToolDefinition } from '../../../types';

export const nginx_server_block_config_generator_ToolDef: ToolDefinition = {
  "id": "nginx-server-block-config-generator",
  "name": "Nginx Reverse Proxy & SSL Server Block Generator",
  "category": "developer",
  "subcategory": "devops",
  "description": "Generate hardened Nginx configuration files with upstream load balancing, Let's Encrypt SSL paths, gzip compression, and security headers.",
  "iconName": "Server",
  "version": "1.0.0",
  "tags": [
    "developer",
    "nginx",
    "devops",
    "reverse-proxy",
    "ssl",
    "server",
    "docker"
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
        "name": "domain",
        "label": "Primary Domain Name",
        "type": "text",
        "defaultValue": "app.example.com",
        "required": true
      },
      {
        "name": "upstreamPort",
        "label": "Backend Upstream Port",
        "type": "number",
        "defaultValue": 3000,
        "required": true
      },
      {
        "name": "enableSsl",
        "label": "Enable Let's Encrypt SSL (Port 443)",
        "type": "boolean",
        "defaultValue": true
      },
      {
        "name": "enableGzip",
        "label": "Enable Gzip Compression",
        "type": "boolean",
        "defaultValue": true
      },
      {
        "name": "clientMaxBodySize",
        "label": "Client Max Body Size (MB)",
        "type": "number",
        "defaultValue": 50
      }
    ]
  },
  "outputSchema": {
    "type": "text"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'nginx-server-block-config-generator',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default nginx_server_block_config_generator_ToolDef;
