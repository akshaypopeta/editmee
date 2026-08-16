import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  FileText,
  Image as ImageIcon,
  Code,
  Database,
  Cpu,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Shield,
  Layers,
  Terminal,
} from 'lucide-react';
import { aiGateway } from '../../core/ai-gateway/AiGateway';
import { aiRouter, ValidatedToolCall, RouterPlanResult, ExecutedPlanResult } from '../../core/ai-gateway/AiRouter';
import { toolRegistry } from '../../core/tool-registry/ToolRegistry';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  plan?: RouterPlanResult;
  executedPlan?: ExecutedPlanResult;
  executionStatus?: 'idle' | 'running' | 'completed' | 'failed';
}

export function WorkAssistantWorkspace() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        "Hello! I am your EditMee AI Assistant. I can plan, decompose, and execute tasks across our client-side tools (PDF editing, Image processing, CSV analytics, Developer utilities, Invoice creation, and ATS Resumes). Tell me what you'd like to achieve!",
      timestamp: Date.now(),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'registry' | 'audit'>('chat');
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryCategory, setRegistryCategory] = useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const openToolById = (toolId: string) => {
    window.dispatchEvent(new CustomEvent('editmee:open-tool', { detail: toolId }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsProcessing(true);

    try {
      // 1. Analyze prompt & route to registered tools
      const plan = await aiRouter.routeAndValidate(text);

      let responseText = plan.directAnswer || '';
      if (!responseText && plan.requiresToolExecution) {
        responseText = `I analyzed your request and prepared an execution plan using ${plan.toolCalls.length} registered tool(s).`;
      } else if (!responseText) {
        // Fallback chat response
        responseText = await aiGateway.chat({
          message: text,
          toolsContext: toolRegistry.getAll().map((t) => ({ id: t.id, name: t.name, category: t.category })),
        });
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
        plan: plan.requiresToolExecution ? plan : undefined,
        executionStatus: 'idle',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          role: 'assistant',
          content: `I encountered an issue processing your request: ${err?.message || 'Execution error'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const executePlan = async (messageId: string, plan: RouterPlanResult) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, executionStatus: 'running' } : m))
    );

    try {
      const execResult = await aiRouter.executeValidatedPlan(plan, {});

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                executionStatus: execResult.success ? 'completed' : 'failed',
                executedPlan: execResult,
              }
            : m
        )
      );

      // Record to activity audit
      if (execResult.success && execResult.steps.length > 0) {
        for (const step of execResult.steps) {
          storageEngine.addHistory({
            toolId: step.toolId,
            toolName: step.toolName,
            category: 'ai',
            status: 'completed',
            inputsSummary: JSON.stringify(step.arguments),
            outputSummary: `AI execution completed in ${step.durationMs}ms`,
            executionTimeMs: step.durationMs,
          });
        }
      }
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                executionStatus: 'failed',
                executedPlan: { success: false, steps: [], error: e.message },
              }
            : m
        )
      );
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { label: '🧾 Generate Consulting Invoice', prompt: 'Create an invoice for Acronis Digital for $3,500 consulting with 3 line items' },
    { label: '📊 Analyze CSV Dataset', prompt: 'Summarize statistical metrics and clean headers for a financial CSV dataset' },
    { label: '📄 ATS Resume Summary', prompt: 'Write an ATS-optimized professional summary for a Principal Fullstack Engineer' },
    { label: '🖼️ Compress & WebP Convert', prompt: 'Optimize high-res PNG images for modern web delivery with WebP conversion' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Top Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">AI Work Assistant</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400">Decomposes and validates agentic tool calls on client engines</p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'chat' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chat & Execution
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'registry' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tool Registry ({toolRegistry.getAll().length})
          </button>
        </div>
      </div>

      {/* Main Body */}
      {activeTab === 'chat' ? (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-900/60">
          {/* Chat message stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shrink-0 text-purple-400 mt-1">
                    <Cpu className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-xl p-4 text-sm leading-relaxed space-y-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white ml-12'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 mr-12'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Validated Plan Cards */}
                  {msg.plan && (
                    <div className="pt-3 border-t border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
                          <Zap className="w-3.5 h-3.5" />
                          Validated Tool Plan ({msg.plan.toolCalls.length} Steps)
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            msg.plan.allCallsValid
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {msg.plan.allCallsValid ? '100% REGISTRY VERIFIED' : 'PARTIAL / NEEDS INPUT'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {msg.plan.toolCalls.map((call, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border text-xs space-y-2 ${
                              call.isValid
                                ? 'bg-slate-900/80 border-slate-800'
                                : 'bg-red-950/30 border-red-800/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px]">
                                  {idx + 1}
                                </span>
                                {call.tool ? call.tool.name : call.toolId}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openToolById(call.toolId)}
                                  className="px-2 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-[10px] font-semibold border border-purple-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Open real tool workspace"
                                >
                                  Open Tool <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                    call.isValid ? 'text-emerald-400 bg-emerald-950/50' : 'text-red-400 bg-red-950/50'
                                  }`}
                                >
                                  {call.isValid ? 'Valid Schema' : 'Invalid'}
                                </span>
                              </div>
                            </div>

                            <p className="text-slate-400 text-[11px]">{call.explanation}</p>

                            {Object.keys(call.validatedArguments).length > 0 && (
                              <div className="font-mono text-[10px] bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto border border-slate-800/60">
                                {JSON.stringify(call.validatedArguments, null, 2)}
                              </div>
                            )}

                            {call.validationError && (
                              <div className="text-red-400 text-[11px] flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                {call.validationError}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Execute Button */}
                      {msg.executionStatus === 'idle' && msg.plan.allCallsValid && (
                        <button
                          onClick={() => msg.plan && executePlan(msg.id, msg.plan)}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          Execute Validated Plan
                        </button>
                      )}

                      {msg.executionStatus === 'running' && (
                        <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-800/40 text-purple-300 text-xs flex items-center justify-center gap-2 font-medium">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Executing tool pipeline client-side...
                        </div>
                      )}

                      {/* Execution Results */}
                      {msg.executedPlan && (
                        <div
                          className={`p-3 rounded-lg border text-xs space-y-2 ${
                            msg.executedPlan.success
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                              : 'bg-red-950/20 border-red-800/40 text-red-300'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              {msg.executedPlan.success ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                              )}
                              {msg.executedPlan.success ? 'Execution Finished Successfully' : 'Execution Failed'}
                            </span>
                            <span className="text-[10px] font-mono opacity-80">
                              {msg.executedPlan.steps.length} Steps Executed
                            </span>
                          </div>

                          {msg.executedPlan.error && <p className="text-red-400">{msg.executedPlan.error}</p>}

                          {msg.executedPlan.steps.map((step, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-slate-300 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-white">{step.toolName}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openToolById(step.toolId)}
                                    className="px-2 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-[10px] font-semibold border border-purple-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Open real tool workspace"
                                  >
                                    Open Tool <ArrowRight className="w-2.5 h-2.5" />
                                  </button>
                                  <span className="text-[10px] font-mono text-slate-400">{step.durationMs}ms</span>
                                </div>
                              </div>
                              {step.result.text && <p className="text-[11px] text-slate-400">{step.result.text}</p>}
                              {step.result.blob && (
                                <button
                                  onClick={() => {
                                    if (step.result.blob) {
                                      const url = URL.createObjectURL(step.result.blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = step.result.filename || 'editmee_output';
                                      a.click();
                                    }
                                  }}
                                  className="mt-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] flex items-center gap-1 font-medium transition-colors cursor-pointer"
                                >
                                  <Download className="w-3 h-3" />
                                  Download Result ({step.result.filename || 'file'})
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message footer timestamp and copy */}
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                  Decomposing intent and verifying tool schemas...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="p-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Quick Tasks:
            </span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isProcessing}
                className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-md text-xs whitespace-nowrap transition-colors border border-slate-700/60 cursor-pointer disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask EditMee Assistant to plan or execute any tool workflow..."
                disabled={isProcessing}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isProcessing}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Registry View: Shows all verified tools available across the system */
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-white text-base">Registered Tool Inventory</h3>
                <p className="text-xs text-slate-400">
                  Browse and open any verified tool directly in its full dedicated execution workspace.
                </p>
              </div>
              <span className="text-xs font-mono text-purple-400 bg-purple-950/50 px-3 py-1 rounded-md border border-purple-800/40 w-fit">
                {toolRegistry.getAll().length} Verified Tools
              </span>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={registrySearch}
                onChange={(e) => setRegistrySearch(e.target.value)}
                placeholder="Search tools by name, tag, or description..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <select
                value={registryCategory}
                onChange={(e) => setRegistryCategory(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="pdf">PDF & Documents</option>
                <option value="images">Images & Graphics</option>
                <option value="documents">Document Utilities</option>
                <option value="resumes">Resumes & Careers</option>
                <option value="data">Data & CSV</option>
                <option value="developer">Developer Tools</option>
                <option value="calculators">Calculators</option>
                <option value="business">Business & Finance</option>
                <option value="media">Audio & Media</option>
                <option value="security">Security</option>
                <option value="ai">AI & Intelligence</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolRegistry
              .getAll()
              .filter((t) => {
                if (registryCategory !== 'all' && t.category !== registryCategory) return false;
                if (!registrySearch.trim()) return true;
                const q = registrySearch.toLowerCase().trim();
                return (
                  t.name.toLowerCase().includes(q) ||
                  t.description.toLowerCase().includes(q) ||
                  t.id.toLowerCase().includes(q) ||
                  t.tags.some((tag) => tag.toLowerCase().includes(q))
                );
              })
              .map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => openToolById(tool.id)}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 hover:bg-slate-900/60 transition-all cursor-pointer space-y-3 flex flex-col justify-between group shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-purple-400 font-bold">{tool.id}</span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {tool.category}
                      </span>
                    </div>
                    <h4 className="font-semibold text-white text-sm group-hover:text-purple-300 transition-colors">
                      {tool.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{tool.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Inputs: {tool.inputSchema.fields.length}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openToolById(tool.id);
                      }}
                      className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-sm"
                    >
                      Open Tool <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
