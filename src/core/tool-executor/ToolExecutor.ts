import { ToolDefinition, ToolResult, ToolExecutionState } from '../../types';
import { storageEngine } from '../storage-engine/StorageEngine';
import { aiGateway } from '../ai-gateway/AiGateway';
import { toolValidator } from '../tool-validator/ToolValidator';

export interface ExecuteOptions {
  onProgress?: (percent: number, message?: string) => void;
  onStateChange?: (state: ToolExecutionState) => void;
}

export class ToolExecutor {
  private static instance: ToolExecutor;
  private activeControllers: Map<string, AbortController> = new Map();

  private constructor() {}

  public static getInstance(): ToolExecutor {
    if (!ToolExecutor.instance) {
      ToolExecutor.instance = new ToolExecutor();
    }
    return ToolExecutor.instance;
  }

  /**
   * Validates input values against the tool's input schema and custom validator
   */
  public validate(tool: ToolDefinition, input: any): { valid: boolean; error?: string } {
    return toolValidator.validate(tool, input);
  }

  /**
   * Executes a tool end-to-end with validation, progress updates, timing, and history recording
   */
  public async execute(
    tool: ToolDefinition,
    input: any,
    options?: ExecuteOptions
  ): Promise<ToolResult> {
    const startTime = performance.now();
    const abortController = new AbortController();
    this.activeControllers.set(tool.id, abortController);

    try {
      options?.onStateChange?.('validating');
      const validation = this.validate(tool, input);
      if (!validation.valid) {
        options?.onStateChange?.('failed');
        return {
          success: false,
          error: validation.error || 'Validation failed',
          executionTimeMs: Math.round(performance.now() - startTime),
        };
      }

      options?.onStateChange?.('processing');
      options?.onProgress?.(10, 'Initializing processor...');

      const context = {
        signal: abortController.signal,
        aiGateway,
        onProgress: (percent: number, msg?: string) => {
          options?.onProgress?.(percent, msg);
        },
      };

      const result = await tool.execute(input, context);
      const executionTimeMs = Math.round(performance.now() - startTime);
      result.executionTimeMs = executionTimeMs;

      if (result.success) {
        options?.onStateChange?.('completed');
        options?.onProgress?.(100, 'Processing complete');

        // Record in history
        storageEngine.addHistoryItem({
          toolId: tool.id,
          toolName: tool.name,
          category: tool.category,
          status: 'completed',
          executionTimeMs,
          outputFilename: result.filename,
          outputSummary: result.text ? result.text.slice(0, 100) : (result.filename || 'Output generated successfully'),
        });
      } else {
        options?.onStateChange?.('failed');
        storageEngine.addHistoryItem({
          toolId: tool.id,
          toolName: tool.name,
          category: tool.category,
          status: 'failed',
          executionTimeMs,
          outputSummary: result.error || 'Execution failed',
        });
      }

      return result;
    } catch (err: any) {
      const executionTimeMs = Math.round(performance.now() - startTime);
      const isCancelled = abortController.signal.aborted;
      const state: ToolExecutionState = isCancelled ? 'cancelled' : 'failed';
      options?.onStateChange?.(state);

      const errorMessage = isCancelled ? 'Operation was cancelled' : (err.message || 'An unexpected error occurred during execution');

      storageEngine.addHistoryItem({
        toolId: tool.id,
        toolName: tool.name,
        category: tool.category,
        status: isCancelled ? 'cancelled' : 'failed',
        executionTimeMs,
        outputSummary: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
        executionTimeMs,
      };
    } finally {
      this.activeControllers.delete(tool.id);
      if (tool.cleanup) {
        try {
          tool.cleanup();
        } catch (e) {
          console.warn('Tool cleanup error', e);
        }
      }
    }
  }

  /**
   * Cancels a running tool execution
   */
  public cancel(toolId: string): void {
    const controller = this.activeControllers.get(toolId);
    if (controller) {
      controller.abort();
      this.activeControllers.delete(toolId);
    }
  }
}

export const toolExecutor = ToolExecutor.getInstance();
