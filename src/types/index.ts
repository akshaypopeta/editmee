import type React from 'react';

export type ExecutionMode = 'client' | 'hybrid' | 'server';

export type ToolExecutionState = 
  | 'idle' 
  | 'validating' 
  | 'loading' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export type ToolCategory =
  | 'pdf'
  | 'images'
  | 'documents'
  | 'resumes'
  | 'ai'
  | 'data'
  | 'developer'
  | 'calculators'
  | 'business'
  | 'media'
  | 'security'
  | 'files'
  | 'seo'
  | 'marketing'
  | 'automation'
  | 'design'
  | 'analytics'
  | 'productivity'
  | 'network'
  | 'utilities';

export interface ToolValidationResult {
  valid: boolean;
  error?: string;
}

export interface ToolInputField {
  name: string;
  label: string;
  type: 'file' | 'files' | 'text' | 'textarea' | 'number' | 'select' | 'boolean' | 'color' | 'range' | 'json' | 'string' | 'password';
  required?: boolean;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  multiple?: boolean;
  description?: string;
}

export interface ToolInputSchema {
  fields: ToolInputField[];
}

export interface ToolOutputSchema {
  type: 'file' | 'files' | 'text' | 'json' | 'image' | 'pdf' | 'audio' | 'table' | 'custom';
  mimeType?: string;
  filename?: string;
  previewType?: 'image' | 'pdf' | 'text' | 'json' | 'table' | 'audio' | 'canvas';
}

export interface ToolCapabilities {
  clientSide: boolean;
  workerSupported: boolean;
  batchSupported: boolean;
  workflowSupported: boolean;
  aiPowered: boolean;
  offlineReady: boolean;
  requiresKey: boolean;
}

export interface ToolExecutionContext {
  onProgress?: (percent: number, message?: string) => void;
  signal?: AbortSignal;
  aiGateway?: any;
  workerEngine?: any;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  blob?: Blob;
  downloadUrl?: string;
  filename?: string;
  mimeType?: string;
  text?: string;
  metadata?: Record<string, any>;
  error?: string;
  executionTimeMs?: number;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  subcategory?: string;
  iconName: string;
  version: string;
  tags: string[];
  executionMode: ExecutionMode;
  supportsBatch: boolean;
  supportsWorkflow: boolean;
  requiresAI: boolean;
  requiresAuthentication?: boolean;
  capabilities: ToolCapabilities;
  inputSchema: ToolInputSchema;
  outputSchema: ToolOutputSchema;
  
  // Lifecycle methods
  validateInput?: (input: any) => { valid: boolean; error?: string };
  execute: (input: any, context?: ToolExecutionContext) => Promise<ToolResult>;
  cancel?: () => void;
  cleanup?: () => void;
  
  // Custom dedicated workspace component if tool has rich interactive UI (e.g. Edit PDF, Image Studio, Resume Builder, etc.)
  customWorkspace?: React.ComponentType<any>;
}

export interface HistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  category: ToolCategory;
  timestamp: number;
  status: 'completed' | 'failed' | 'cancelled';
  inputsSummary?: string;
  executionTimeMs?: number;
  outputFilename?: string;
  outputSummary?: string;
  blobKey?: string;
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'tool' | 'ai' | 'condition' | 'transform' | 'output';
  toolId?: string;
  label: string;
  config?: Record<string, any>;
  position?: { x: number; y: number };
  status?: 'idle' | 'running' | 'completed' | 'failed' | 'skipped';
  outputData?: any;
  error?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges?: WorkflowEdge[];
  createdAt?: number;
  updatedAt?: number;
  tags?: string[];
  icon?: string;
}

export interface BatchItemResult {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: ToolResult;
  error?: string;
}

export interface AppPreferences {
  theme: 'dark' | 'light' | 'system';
  sidebarCollapsed: boolean;
  favorites: string[];
  recentTools: string[];
  autoDownload: boolean;
}
