/**
 * AI Router: Validates and executes tool calls exclusively through the ToolRegistry
 * Mandates:
 * 1. AI must ONLY call registered tools
 * 2. Validate all AI-generated tool calls with ToolValidator
 * 3. Never expose API keys
 */

import { toolRegistry } from '../tool-registry/ToolRegistry';
import { toolValidator } from '../tool-validator/ToolValidator';
import { toolExecutor } from '../tool-executor/ToolExecutor';
import { ToolDefinition, ToolResult, ToolValidationResult } from '../../types';
import { aiGateway } from './AiGateway';

export interface ValidatedToolCall {
  toolId: string;
  tool: ToolDefinition;
  rawArguments: Record<string, any>;
  validatedArguments: Record<string, any>;
  isValid: boolean;
  validationError?: string;
  explanation: string;
}

export interface RouterPlanResult {
  requiresToolExecution: boolean;
  rationale: string;
  directAnswer?: string;
  toolCalls: ValidatedToolCall[];
  allCallsValid: boolean;
}

export interface ExecutedPlanStep {
  toolId: string;
  toolName: string;
  arguments: Record<string, any>;
  result: ToolResult;
  durationMs: number;
}

export interface ExecutedPlanResult {
  success: boolean;
  steps: ExecutedPlanStep[];
  finalOutput?: any;
  error?: string;
}

export class AiRouter {
  private static instance: AiRouter;

  private constructor() {}

  public static getInstance(): AiRouter {
    if (!AiRouter.instance) {
      AiRouter.instance = new AiRouter();
    }
    return AiRouter.instance;
  }

  /**
   * Routes user prompt to registered tools and strictly validates each tool call
   */
  public async routeAndValidate(prompt: string): Promise<RouterPlanResult> {
    const allRegisteredTools = toolRegistry.getAll();

    // Query AI Router endpoint / provider
    const routeRes = await aiGateway.routeIntent(prompt, allRegisteredTools);
    const rawRoute = routeRes.route;

    const validatedCalls: ValidatedToolCall[] = [];
    let allValid = true;

    if (rawRoute.toolCalls && Array.isArray(rawRoute.toolCalls)) {
      for (const call of rawRoute.toolCalls) {
        // 1. Strict Check: Does tool exist in ToolRegistry?
        const registeredTool = toolRegistry.get(call.toolId);

        if (!registeredTool) {
          allValid = false;
          // Unregistered or hallucinated tool ID -> Mark strictly invalid
          validatedCalls.push({
            toolId: call.toolId,
            tool: null as any,
            rawArguments: call.arguments || {},
            validatedArguments: {},
            isValid: false,
            validationError: `Tool "${call.toolId}" is NOT a registered tool in EditMee Registry. AI calls are restricted strictly to registered tools.`,
            explanation: call.explanation || 'Unregistered tool invocation attempted.',
          });
          continue;
        }

        // 2. Strict Check: Validate input parameters against tool's inputSchema
        const args = call.arguments || {};
        const validation: ToolValidationResult = toolValidator.validate(registeredTool, args);

        if (!validation.valid) {
          allValid = false;
          validatedCalls.push({
            toolId: registeredTool.id,
            tool: registeredTool,
            rawArguments: args,
            validatedArguments: args,
            isValid: false,
            validationError: validation.error || 'Parameter schema validation failed.',
            explanation: call.explanation || `Validation failed for ${registeredTool.name}.`,
          });
        } else {
          validatedCalls.push({
            toolId: registeredTool.id,
            tool: registeredTool,
            rawArguments: args,
            validatedArguments: args,
            isValid: true,
            explanation: call.explanation || `Valid execution call for ${registeredTool.name}.`,
          });
        }
      }
    }

    return {
      requiresToolExecution: rawRoute.requiresToolExecution && validatedCalls.length > 0,
      rationale: rawRoute.rationale || 'Analysis complete.',
      directAnswer: rawRoute.directAnswer,
      toolCalls: validatedCalls,
      allCallsValid: allValid && validatedCalls.length > 0,
    };
  }

  /**
   * Safely executes a validated plan of tool calls
   */
  public async executeValidatedPlan(
    plan: RouterPlanResult,
    initialPayload: Record<string, any> = {},
    onProgress?: (stepIndex: number, total: number, toolName: string) => void
  ): Promise<ExecutedPlanResult> {
    if (!plan.allCallsValid || plan.toolCalls.length === 0) {
      return {
        success: false,
        steps: [],
        error: 'Cannot execute plan with invalid or unregistered tool calls.',
      };
    }

    const executedSteps: ExecutedPlanStep[] = [];
    let currentPayload = { ...initialPayload };

    for (let i = 0; i < plan.toolCalls.length; i++) {
      const call = plan.toolCalls[i];
      if (!call.isValid || !call.tool) {
        return {
          success: false,
          steps: executedSteps,
          error: `Step ${i + 1} (${call.toolId}) failed validation: ${call.validationError}`,
        };
      }

      onProgress?.(i + 1, plan.toolCalls.length, call.tool.name);

      const startTime = performance.now();
      const combinedInput = {
        ...call.validatedArguments,
        ...currentPayload,
      };

      try {
        const result = await toolExecutor.execute(call.tool, combinedInput);
        const duration = Math.round(performance.now() - startTime);

        executedSteps.push({
          toolId: call.tool.id,
          toolName: call.tool.name,
          arguments: combinedInput,
          result,
          durationMs: duration,
        });

        if (!result.success) {
          return {
            success: false,
            steps: executedSteps,
            error: result.error || `Execution of ${call.tool.name} failed.`,
          };
        }

        // Pass forward output data to next step if applicable
        if (result.data) {
          currentPayload = { ...currentPayload, ...result.data };
        }
        if (result.blob) {
          currentPayload.file = result.blob;
        }
      } catch (err: any) {
        return {
          success: false,
          steps: executedSteps,
          error: `Error running tool "${call.tool.name}": ${err.message}`,
        };
      }
    }

    const lastStep = executedSteps[executedSteps.length - 1];
    return {
      success: true,
      steps: executedSteps,
      finalOutput: lastStep?.result,
    };
  }
}

export const aiRouter = AiRouter.getInstance();
