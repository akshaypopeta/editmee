import React, { useState } from 'react';
import {
  FileSearch,
  Upload,
  Sparkles,
  FileText,
  Table,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Check,
  RefreshCw,
  Layers,
  ArrowRight,
  Database,
  Receipt,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { aiGateway } from '../../core/ai-gateway/AiGateway';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

export function DocIntelligenceWorkspace() {
  const [docText, setDocText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [taskType, setTaskType] = useState<'invoice' | 'contract' | 'resume' | 'summary' | 'qa'>('invoice');
  const [customQuery, setCustomQuery] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const sampleDocuments = [
    {
      label: '🧾 Sample Cloud Invoice',
      task: 'invoice' as const,
      text: `INVOICE #INV-2026-9041
Vendor: Apex Cloud Infrastructure LLC (EIN: 84-2938102)
Client: Globex Global Corporation
Billing Date: October 14, 2026
Payment Terms: Net 30
Due Date: November 13, 2026

LINE ITEMS:
1. Dedicated GPU Cluster (4x H100 Instance) - 720 Hours @ $3.20/hr = $2,304.00
2. Enterprise Storage Vault (10TB NVMe) - 1 Month @ $450.00 = $450.00
3. Bandwidth Egress (25TB Tier 1 CDN) - $0.05/GB = $1,250.00
4. 24/7 Mission-Critical SLA Support Package = $600.00

Subtotal: $4,604.00
Sales Tax (8.25%): $379.83
Total Amount Due: $4,983.83
Bank Transfer Wire: US-CHASE-002938491823`,
    },
    {
      label: '📜 Sample Enterprise MSA Contract',
      task: 'contract' as const,
      text: `MASTER SERVICES AGREEMENT (MSA)
Parties:
- Vendor: CyberDyne Systems Corp ("Provider")
- Customer: Initech Technologies Inc ("Client")
Effective Date: January 1, 2026
Term: 36 Months with automatic annual renewal unless 60 days prior written notice.

KEY TERMS:
Section 4 (Payment): Invoices payable Net 45 days. 1.5% monthly late fee applies.
Section 8 (Indemnity): Provider shall indemnify and defend Client against third-party IP infringement claims up to the Liability Cap.
Section 9 (Limitation of Liability): Total aggregate liability of either party shall not exceed fees paid in previous 12 months, capped at $1,000,000 USD.
Section 12 (Governing Law): State of Delaware, USA.`,
    },
    {
      label: '👤 Sample Senior Engineer Resume',
      task: 'resume' as const,
      text: `JORDAN RILEY - PRINCIPAL SOFTWARE ARCHITECT
Email: jordan.riley.dev@example.com | GitHub: github.com/jriley-arch | San Francisco, CA

SUMMARY:
Staff / Principal Architect with 11+ years leading high-throughput distributed systems, WebAssembly tooling, and cloud database engines in Rust, TypeScript, and Go.

SKILLS:
- Languages: TypeScript, Rust, Go, Python, SQL, C++
- Infrastructure: Kubernetes, Docker, AWS, GCP, Cloudflare Workers, Terraform
- Architecture: Zero-latency client architectures, Web Workers, Event-driven microservices

EXPERIENCE:
Staff Infrastructure Engineer - StratoScale Systems (2021 - Present)
- Architected zero-latency client-side processing pipeline reducing server compute cost by 74% ($480k annual savings).
- Led team of 14 senior engineers building real-time distributed data synchronization engines.

Senior Backend Engineer - DataForge Labs (2017 - 2021)
- Designed partitioned columnar analytics store handling 250k events/second with 99.999% uptime.`,
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result as string);
        setDocText('');
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setDocText(reader.result as string);
        setImageBase64(null);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (!docText.trim() && !imageBase64) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await aiGateway.analyzeDocument({
        documentText: docText,
        imageBase64: imageBase64 || undefined,
        taskType,
        query: customQuery,
      });

      setAnalysisResult(res);

      storageEngine.addHistory({
        toolId: 'ai-doc-intel',
        toolName: 'Document Intelligence',
        category: 'ai',
        status: 'completed',
        inputsSummary: `Extracted ${taskType.toUpperCase()} from ${fileName || 'input text'}`,
        outputSummary: `Successfully extracted structured entities`,
      });
    } catch (err: any) {
      setAnalysisResult(`Analysis failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    if (!analysisResult) return;
    const blob = new Blob([analysisResult], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-${taskType}-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">AI Document Intelligence</h2>
            <p className="text-xs text-slate-400">Multimodal extraction for invoices, contracts, resumes & tables</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {analysisResult && (
            <>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                Export Data
              </button>
            </>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!docText.trim() && !imageBase64)}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isAnalyzing ? 'Extracting Intelligence...' : 'Run Extraction'}
          </button>
        </div>
      </div>

      {/* Main Studio Body: 2 Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Ingestion & Target Schema Column (5 cols) */}
        <div className="lg:col-span-5 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
          {/* Target Extraction Mode */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Extraction Model Target</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'invoice', label: '🧾 Invoice / Receipt' },
                { id: 'contract', label: '📜 Contract & MSA' },
                { id: 'resume', label: '👤 Resume & CV' },
                { id: 'summary', label: '📑 Executive Brief' },
                { id: 'qa', label: '🔍 Semantic Q&A' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTaskType(t.id as any)}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left border ${
                    taskType === t.id
                      ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Preloaded Samples */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Test with Live Samples</span>
            <div className="flex flex-wrap gap-2">
              {sampleDocuments.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDocText(s.text);
                    setImageBase64(null);
                    setFileName(s.label);
                    setTaskType(s.task);
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* File Upload Zone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Upload Document / Scan (PDF, Text, Image)</label>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl bg-slate-900/60 hover:bg-slate-900 transition-all cursor-pointer">
              <Upload className="w-6 h-6 text-slate-500 mb-2" />
              <span className="text-xs font-medium text-slate-300">
                {fileName ? fileName : 'Click to select or drag document file'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">PDF, TXT, CSV, JSON, PNG, JPEG</span>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".txt,.csv,.json,.pdf,image/*"
                className="hidden"
              />
            </label>
          </div>

          {/* Raw Text View / Edit */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Document Text Payload</label>
              {docText && (
                <button
                  onClick={() => {
                    setDocText('');
                    setFileName(null);
                  }}
                  className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              rows={8}
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              placeholder="Paste raw text, OCR dump, financial receipt, or contract clauses here..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono leading-relaxed"
            />
          </div>

          {/* Optional Query (for Q&A) */}
          {taskType === 'qa' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Specific Semantic Question</label>
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="e.g. What is the governing jurisdiction and liability cap?"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Right Output & Intelligence Report Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0 bg-slate-950/20">
          <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Intelligence Extraction Report
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 font-bold">
                {taskType}
              </span>
            </div>
          </div>

          <div className="flex-1 p-5 overflow-y-auto">
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-xs font-medium">Extracting structured entities and clauses with EditMee Intelligence...</p>
              </div>
            ) : !analysisResult ? (
              <div className="h-full flex flex-col items-center justify-center space-y-2 text-slate-500 text-center p-6">
                <FileSearch className="w-8 h-8 opacity-30" />
                <p className="text-xs max-w-sm">
                  Upload an invoice, contract, or resume, or click one of the live samples on the left to extract structured entities.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                  {analysisResult}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
