import React, { useState } from 'react';
import {
  ToolDefinition,
  ToolResult,
  ToolExecutionState,
  BatchItemResult,
} from '../../types';
import { toolExecutor } from '../../core/tool-executor/ToolExecutor';
import { batchEngine } from '../../core/batch-engine/BatchEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { LegalPageId } from '../common/LegalPages';
import {
  Play,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  Star,
  FileArchive,
} from 'lucide-react';

import { ToolPageTemplate } from '../navigation/ToolPageTemplate';

interface ToolShellProps {
  tool: ToolDefinition;
  onNavigateHome?: () => void;
  onNavigateCategory?: (category: string) => void;
  onSelectTool?: (toolId: string) => void;
  onOpenLegalPage?: (pageId: LegalPageId) => void;
}

export const ToolShell: React.FC<ToolShellProps> = ({
  tool,
  onNavigateHome = () => {},
  onNavigateCategory = () => {},
  onSelectTool = () => {},
  onOpenLegalPage,
}) => {
  const [inputs, setInputs] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    tool.inputSchema.fields.forEach((f) => {
      if (f.defaultValue !== undefined) init[f.name] = f.defaultValue;
    });
    return init;
  });

  const [state, setState] = useState<ToolExecutionState>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState<ToolResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Batch mode state
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchResults, setBatchResults] = useState<BatchItemResult[]>([]);
  const [batchZipBlob, setBatchZipBlob] = useState<Blob | null>(null);

  const [isFav, setIsFav] = useState(() => storageEngine.isFavorite(tool.id));

  // Handle single parameter change
  const handleInputChange = (name: string, value: any) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  // Handle single file drop
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, fieldName: string) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (isBatchMode) {
        setBatchFiles(Array.from(e.dataTransfer.files));
      } else {
        handleInputChange(fieldName, e.dataTransfer.files[0]);
      }
    }
  };

  // Run execution
  const handleExecute = async () => {
    setErrorMsg(null);
    setResult(null);

    if (isBatchMode && batchFiles.length > 0) {
      setState('processing');
      setProgress(5);
      setProgressMsg('Starting batch processing...');

      try {
        const { items, zipBlob } = await batchEngine.processBatch(
          tool,
          batchFiles,
          inputs,
          {
            onOverallProgress: (p, comp, tot) => {
              setProgress(p);
              setProgressMsg(`Processed ${comp} of ${tot} files`);
            },
            onItemUpdate: (item) => {
              setBatchResults((prev) => {
                const idx = prev.findIndex((i) => i.id === item.id);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = item;
                  return updated;
                }
                return [...prev, item];
              });
            },
          }
        );

        setBatchResults(items);
        if (zipBlob) setBatchZipBlob(zipBlob);
        setState('completed');
      } catch (err: any) {
        setState('failed');
        setErrorMsg(err.message || 'Batch execution failed');
      }
      return;
    }

    // Single run
    const res = await toolExecutor.execute(tool, inputs, {
      onProgress: (p, msg) => {
        setProgress(p);
        if (msg) setProgressMsg(msg);
      },
      onStateChange: (s) => setState(s),
    });

    setResult(res);
    if (!res.success) {
      setErrorMsg(res.error || 'Execution encountered an issue');
    }
  };

  // Reset tool
  const handleReset = () => {
    const init: Record<string, any> = {};
    tool.inputSchema.fields.forEach((f) => {
      if (f.defaultValue !== undefined) init[f.name] = f.defaultValue;
    });
    setInputs(init);
    setState('idle');
    setProgress(0);
    setProgressMsg('');
    setResult(null);
    setErrorMsg(null);
    setBatchFiles([]);
    setBatchResults([]);
    setBatchZipBlob(null);
  };

  const toggleFav = () => {
    const next = storageEngine.toggleFavorite(tool.id);
    setIsFav(next);
  };

  // Render custom dedicated workspace wrapped in full ToolPageTemplate
  if (tool.customWorkspace) {
    const CustomComp = tool.customWorkspace;
    return (
      <ToolPageTemplate
        tool={tool}
        onNavigateHome={onNavigateHome}
        onNavigateCategory={onNavigateCategory}
        onSelectTool={onSelectTool}
        onOpenLegalPage={onOpenLegalPage}
      >
        <CustomComp tool={tool} />
      </ToolPageTemplate>
    );
  }

  return (
    <ToolPageTemplate
      tool={tool}
      onNavigateHome={onNavigateHome}
      onNavigateCategory={onNavigateCategory}
      onSelectTool={onSelectTool}
      onOpenLegalPage={onOpenLegalPage}
    >
      <div id={`tool-shell-${tool.id}`} className="space-y-6">
        {/* Batch mode toggle bar if supported */}
        {tool.supportsBatch && (
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-300">
              Process multiple files at once using client-side batch queue.
            </span>
            <button
              id={`toggle-batch-${tool.id}`}
              type="button"
              onClick={() => setIsBatchMode(!isBatchMode)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isBatchMode
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {isBatchMode ? 'Batch Mode: Active' : 'Switch to Batch Mode'}
            </button>
          </div>
        )}

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input & Config (7 cols) - Bright White Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-md text-slate-900">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                Input Parameters
              </h2>

              {/* Batch Files Upload Box */}
              {isBatchMode ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Batch Files</label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleFileDrop(e, 'batch')}
                    className="border-2 border-dashed border-slate-300 hover:border-red-500 rounded-2xl p-6 text-center bg-slate-50 transition-colors"
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-800 font-bold">Drag & drop multiple files here, or browse</p>
                    <p className="text-xs text-slate-500 mt-1">Processed concurrently with unified ZIP export</p>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => e.target.files && setBatchFiles(Array.from(e.target.files))}
                      className="hidden"
                      id={`batch-input-${tool.id}`}
                    />
                    <label
                      htmlFor={`batch-input-${tool.id}`}
                      className="mt-3 inline-block px-4 py-2 text-xs font-bold rounded-xl bg-white hover:bg-slate-100 text-slate-700 cursor-pointer border border-slate-300 shadow-xs"
                    >
                      Select Files ({batchFiles.length} selected)
                    </label>
                  </div>
                  {batchFiles.length > 0 && (
                    <div className="max-h-32 overflow-y-auto space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {batchFiles.map((f, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="truncate">{f.name}</span>
                          <span className="font-mono">{FileEngine.formatBytes(f.size)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Dynamic Fields */}
              {tool.inputSchema.fields.map((field) => {
                if (isBatchMode && (field.type === 'file' || field.type === 'files')) {
                  return null;
                }

                if (field.type === 'file') {
                  const currentFile = inputs[field.name] as File | undefined;
                  return (
                    <div key={field.name} className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleFileDrop(e, field.name)}
                        className="border-2 border-dashed border-slate-300 hover:border-red-500 rounded-2xl p-6 text-center bg-slate-50 transition-colors"
                      >
                        <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                        <p className="text-xs text-slate-800 font-bold truncate">
                          {currentFile ? currentFile.name : 'Drag & drop file here or browse'}
                        </p>
                        {currentFile && (
                          <p className="text-xs text-slate-500 mt-1 font-mono">{FileEngine.formatBytes(currentFile.size)}</p>
                        )}
                        <input
                          type="file"
                          accept={field.accept}
                          onChange={(e) => e.target.files?.[0] && handleInputChange(field.name, e.target.files[0])}
                          className="hidden"
                          id={`file-input-${field.name}`}
                        />
                        <label
                          htmlFor={`file-input-${field.name}`}
                          className="mt-3 inline-block px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-slate-100 text-slate-700 cursor-pointer border border-slate-300 shadow-xs"
                        >
                          {currentFile ? 'Change File' : 'Browse File'}
                        </label>
                      </div>
                    </div>
                  );
                }

                if (field.type === 'textarea') {
                  return (
                    <div key={field.name} className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        rows={4}
                        value={inputs[field.name] || ''}
                        placeholder={field.placeholder}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <div key={field.name} className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        value={inputs[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (field.type === 'range') {
                  return (
                    <div key={field.name} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">{field.label}</label>
                        <span className="text-xs font-mono text-slate-700 font-bold">{inputs[field.name] ?? field.defaultValue}</span>
                      </div>
                      <input
                        type="range"
                        min={field.min ?? 0}
                        max={field.max ?? 100}
                        step={field.step ?? 1}
                        value={inputs[field.name] ?? field.defaultValue ?? 50}
                        onChange={(e) => handleInputChange(field.name, Number(e.target.value))}
                        className="w-full accent-red-600"
                      />
                    </div>
                  );
                }

                if (field.type === 'boolean') {
                  return (
                    <div key={field.name} className="flex items-center justify-between py-1">
                      <label className="text-sm text-slate-800 font-semibold">{field.label}</label>
                      <input
                        type="checkbox"
                        checked={Boolean(inputs[field.name])}
                        onChange={(e) => handleInputChange(field.name, e.target.checked)}
                        className="w-4 h-4 accent-red-600 rounded bg-white border-slate-300 cursor-pointer"
                      />
                    </div>
                  );
                }

                return (
                  <div key={field.name} className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={field.type === 'number' ? 'number' : field.type === 'password' ? 'password' : 'text'}
                      value={inputs[field.name] ?? ''}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        handleInputChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)
                      }
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                );
              })}

              {/* Action Buttons - EditMee Red */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  id={`run-btn-${tool.id}`}
                  type="button"
                  onClick={handleExecute}
                  disabled={state === 'processing' || state === 'validating'}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {state === 'processing' ? 'Processing...' : isBatchMode ? 'Run Batch Processing' : 'Execute Tool'}
                </button>

                <button
                  id={`reset-btn-${tool.id}`}
                  type="button"
                  onClick={handleReset}
                  title="Reset All"
                  className="p-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Output & Live Preview (5 cols) - Bright White Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-md text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Execution Results
                </h2>
                {result?.executionTimeMs && (
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {result.executionTimeMs}ms
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {(state === 'processing' || state === 'validating') && (
                <div className="space-y-2 py-4">
                  <div className="flex justify-between text-xs text-slate-600 font-semibold">
                    <span>{progressMsg || 'Processing...'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-red-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error message */}
              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <p className="font-bold">Execution Failed</p>
                    <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Single Result Display */}
              {result?.success && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Operation finished successfully
                  </div>

                  {/* Text / Code Result */}
                  {result.text && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-600 font-bold">
                        <span>Generated Output:</span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(result.text || '')}
                          className="text-red-600 hover:text-red-700 font-bold cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {result.text}
                      </pre>
                    </div>
                  )}

                  {/* Blob Download Button */}
                  {result.blob && (
                    <button
                      type="button"
                      onClick={() => FileEngine.downloadBlob(result.blob!, result.filename || 'editmee_output')}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download {result.filename || 'File'}
                    </button>
                  )}

                  {/* Direct downloadUrl if any */}
                  {result.downloadUrl && !result.blob && (
                    <a
                      href={result.downloadUrl}
                      download={result.filename || 'download'}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors block text-center"
                    >
                      <Download className="w-4 h-4 inline" />
                      Download Result
                    </a>
                  )}
                </div>
              )}

              {/* Batch Results Display */}
              {isBatchMode && batchResults.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700">Batch Items ({batchResults.length})</div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {batchResults.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <span className="text-slate-800 font-semibold truncate max-w-[180px]">{item.file.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            item.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {batchZipBlob && (
                    <button
                      type="button"
                      onClick={() => batchEngine.downloadZip(batchZipBlob, `${tool.id}_batch_results.zip`)}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <FileArchive className="w-4 h-4" />
                      Download Batch ZIP Archive
                    </button>
                  )}
                </div>
              )}

              {/* Empty State */}
              {state === 'idle' && !result && !isBatchMode && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Configure input parameters on the left and click &quot;Execute Tool&quot; to see real results.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
};
