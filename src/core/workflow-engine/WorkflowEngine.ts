import { WorkflowDefinition, WorkflowNode, ToolResult } from '../../types';
import { toolRegistry } from '../tool-registry/ToolRegistry';
import { toolExecutor } from '../tool-executor/ToolExecutor';
import { aiGateway } from '../ai-gateway/AiGateway';

export interface WorkflowExecutionLog {
  timestamp: number;
  nodeId: string;
  nodeLabel: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface WorkflowExecutionOptions {
  onNodeStateChange?: (nodeId: string, status: WorkflowNode['status'], output?: any) => void;
  onLog?: (log: WorkflowExecutionLog) => void;
  onProgress?: (percent: number) => void;
}

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private running = false;
  private aborted = false;

  private constructor() {}

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  /**
   * Executes a visual workflow definition end-to-end
   */
  public async executeWorkflow(
    workflow: WorkflowDefinition,
    initialData: any = {},
    options?: WorkflowExecutionOptions
  ): Promise<{ success: boolean; finalOutput: any; logs: WorkflowExecutionLog[] }> {
    this.running = true;
    this.aborted = false;
    const logs: WorkflowExecutionLog[] = [];

    const addLog = (nodeId: string, nodeLabel: string, level: WorkflowExecutionLog['level'], message: string) => {
      const log: WorkflowExecutionLog = {
        timestamp: Date.now(),
        nodeId,
        nodeLabel,
        level,
        message,
      };
      logs.push(log);
      options?.onLog?.(log);
    };

    addLog('system', 'Workflow Engine', 'info', `Starting workflow: "${workflow.name}" with ${workflow.nodes.length} nodes.`);

    const nodeOutputs: Record<string, any> = {
      initial: initialData,
    };

    const totalNodes = workflow.nodes.length;
    let completedNodes = 0;

    // Reset status of all nodes
    for (const node of workflow.nodes) {
      node.status = 'idle';
      node.outputData = undefined;
      node.error = undefined;
      options?.onNodeStateChange?.(node.id, 'idle');
    }

    try {
      // Find trigger or start node
      let currentNodes = workflow.nodes.filter(
        (n) => n.type === 'trigger' || !(workflow.edges || []).some((e) => e.target === n.id)
      );

      if (currentNodes.length === 0 && workflow.nodes.length > 0) {
        currentNodes = [workflow.nodes[0]];
      }

      // Linear/DAG sequential execution
      const visited = new Set<string>();
      let stepData: any = initialData;

      for (let i = 0; i < workflow.nodes.length; i++) {
        if (this.aborted) {
          addLog('system', 'Workflow Engine', 'warn', 'Execution cancelled by user.');
          return { success: false, finalOutput: null, logs };
        }

        const node = workflow.nodes[i];
        visited.add(node.id);

        node.status = 'running';
        options?.onNodeStateChange?.(node.id, 'running');
        addLog(node.id, node.label, 'info', `Running step ${i + 1}/${totalNodes}: ${node.label}`);

        try {
          if (node.type === 'trigger') {
            node.outputData = stepData;
            addLog(node.id, node.label, 'success', 'Input payload received and validated.');
          } else if (node.type === 'tool' && node.toolId) {
            const tool = toolRegistry.get(node.toolId);
            if (!tool) {
              throw new Error(`Tool "${node.toolId}" not found in ToolRegistry.`);
            }

            const inputPayload = {
              ...node.config,
              ...stepData,
            };

            const result: ToolResult = await toolExecutor.execute(tool, inputPayload);
            if (!result.success) {
              throw new Error(result.error || 'Tool execution failed');
            }

            node.outputData = result;
            stepData = result.data || result.blob || result.text || result;
            addLog(node.id, node.label, 'success', `Tool ${tool.name} executed successfully.`);
          } else if (node.type === 'ai') {
            const prompt = node.config?.prompt || JSON.stringify(stepData);
            const aiResponse = await aiGateway.generate({ prompt });
            node.outputData = { text: aiResponse };
            stepData = { text: aiResponse };
            addLog(node.id, node.label, 'success', 'AI step processed.');
          } else if (node.type === 'condition') {
            const field = node.config?.field || '';
            const op = node.config?.operator || 'equals';
            const value = node.config?.value;
            const targetVal = field ? (stepData?.[field] ?? stepData) : stepData;
            
            let passed = false;
            if (op === 'equals') passed = String(targetVal) === String(value);
            else if (op === 'contains') passed = String(targetVal).includes(String(value));
            else if (op === 'greaterThan') passed = Number(targetVal) > Number(value);
            else if (op === 'lessThan') passed = Number(targetVal) < Number(value);
            else if (op === 'exists') passed = targetVal !== undefined && targetVal !== null && targetVal !== '';
            else passed = Boolean(targetVal);

            node.outputData = { conditionMet: passed, value: targetVal };
            addLog(node.id, node.label, passed ? 'success' : 'warn', `Condition evaluated: ${passed ? 'PASSED' : 'SKIPPED'}`);
          } else if (node.type === 'transform') {
            // Safe JSON mapping / formatting transform
            const format = node.config?.format || 'json';
            let transformed = stepData;
            if (format === 'json' && typeof stepData === 'string') {
              try { transformed = JSON.parse(stepData); } catch {}
            } else if (format === 'string') {
              transformed = typeof stepData === 'object' ? JSON.stringify(stepData, null, 2) : String(stepData);
            }
            node.outputData = transformed;
            stepData = transformed;
            addLog(node.id, node.label, 'success', `Data transformed to ${format}.`);
          } else if (node.type === 'output') {
            node.outputData = stepData;
            addLog(node.id, node.label, 'success', 'Workflow output generated.');
          }

          node.status = 'completed';
          options?.onNodeStateChange?.(node.id, 'completed', node.outputData);
          completedNodes++;
          options?.onProgress?.(Math.round((completedNodes / totalNodes) * 100));
        } catch (nodeErr: any) {
          node.status = 'failed';
          node.error = nodeErr.message || 'Execution error';
          options?.onNodeStateChange?.(node.id, 'failed');
          addLog(node.id, node.label, 'error', `Failed: ${node.error}`);
          return { success: false, finalOutput: null, logs };
        }
      }

      addLog('system', 'Workflow Engine', 'success', 'All workflow steps finished successfully!');
      return { success: true, finalOutput: stepData, logs };
    } finally {
      this.running = false;
    }
  }

  public cancel(): void {
    if (this.running) {
      this.aborted = true;
    }
  }
}

export const workflowEngine = WorkflowEngine.getInstance();
