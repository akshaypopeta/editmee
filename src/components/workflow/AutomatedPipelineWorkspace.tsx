import React, { useState, useEffect, useRef } from 'react';
import {
  Workflow,
  Play,
  RotateCcw,
  Download,
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Eye,
  Check,
  Loader2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { PdfEngine } from '../../core/pdf-engine/PdfEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import { BackButton } from '../navigation/BackButton';

export interface PipelineStageState {
  id: string;
  name: string;
  simpleName: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  progress: number;
  outputSummary?: string;
  outputBytes?: number;
  durationMs?: number;
  error?: string;
}

export interface PipelineConfig {
  invoiceNumber: string;
  clientName: string;
  amount: number;
  watermarkText: string;
}

export const AutomatedPipelineWorkspace: React.FC = () => {
  // Simple, clear user inputs
  const [config, setConfig] = useState<PipelineConfig>({
    invoiceNumber: 'INV-1001',
    clientName: 'John Smith',
    amount: 1500.0,
    watermarkText: 'CONFIDENTIAL',
  });

  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [overallProgress, setOverallProgress] = useState<number>(0);

  // 3 sequential stages
  const [stages, setStages] = useState<PipelineStageState[]>([
    {
      id: 'stage-1',
      name: '1. Create Invoice',
      simpleName: 'Create Invoice',
      description: 'Generates a clean PDF invoice with your invoice number, client details, and amount.',
      status: 'idle',
      progress: 0,
    },
    {
      id: 'stage-2',
      name: '2. Add Watermark',
      simpleName: 'Add Watermark',
      description: 'Stamps a crisp diagonal security watermark across the document.',
      status: 'idle',
      progress: 0,
    },
    {
      id: 'stage-3',
      name: '3. Optimize PDF',
      simpleName: 'Optimize PDF',
      description: 'Compresses and optimizes the PDF for fast sharing and small file size.',
      status: 'idle',
      progress: 0,
    },
  ]);

  // Intermediate and final artifacts
  const [stage1PdfBytes, setStage1PdfBytes] = useState<Uint8Array | null>(null);
  const [stage2PdfBytes, setStage2PdfBytes] = useState<Uint8Array | null>(null);
  const [finalPdfBytes, setFinalPdfBytes] = useState<Uint8Array | null>(null);
  const [finalPdfUrl, setFinalPdfUrl] = useState<string | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Preview URL management & Memory cleanup
  const activeUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
      }
    };
  }, []);

  const createAndSetPreviewUrl = (bytes: Uint8Array) => {
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    activeUrlRef.current = url;
    setFinalPdfUrl(url);
  };

  // Reset pipeline
  const handleReset = () => {
    if (isRunning) return;
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }
    setFinalPdfUrl(null);
    setFinalPdfBytes(null);
    setStage1PdfBytes(null);
    setStage2PdfBytes(null);
    setPipelineError(null);
    setCurrentStepIndex(0);
    setOverallProgress(0);
    setShowPreviewModal(false);
    setStages((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'idle',
        progress: 0,
        outputSummary: undefined,
        outputBytes: undefined,
        durationMs: undefined,
        error: undefined,
      }))
    );
  };

  // Run the 3-stage automated pipeline sequentially
  const handleRunPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setPipelineError(null);
    setOverallProgress(10);
    setCurrentStepIndex(1);

    const updateStage = (idx: number, patch: Partial<PipelineStageState>) => {
      setStages((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], ...patch };
        return next;
      });
    };

    // Reset stages to waiting
    setStages((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'idle',
        progress: 0,
        error: undefined,
      }))
    );

    let t1Start = performance.now();

    try {
      // -------------------------------------------------------------
      // STEP 1: Generate Invoice PDF
      // -------------------------------------------------------------
      updateStage(0, { status: 'running', progress: 40 });
      setOverallProgress(25);
      t1Start = performance.now();

      const doc = await PDFDocument.create();
      const page = doc.addPage([595.28, 841.89]); // A4
      const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

      const margin = 50;
      let y = 841.89 - margin;

      // Header Banner
      page.drawRectangle({
        x: margin,
        y: y - 55,
        width: 595.28 - margin * 2,
        height: 55,
        color: rgb(0.08, 0.12, 0.22),
      });

      page.drawText('INVOICE', {
        x: margin + 18,
        y: y - 36,
        size: 20,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      page.drawText(config.invoiceNumber || 'INV-1001', {
        x: 410,
        y: y - 34,
        size: 13,
        font: fontBold,
        color: rgb(0.9, 0.4, 0.4),
      });

      y -= 80;

      // Date info
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      page.drawText(`Date Issued: ${today}   •   Payment Terms: Due Upon Receipt`, {
        x: margin,
        y,
        size: 10,
        font: fontRegular,
        color: rgb(0.4, 0.45, 0.5),
      });

      y -= 30;

      // Issuer and Client details
      page.drawText('FROM:', { x: margin, y, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
      page.drawText('BILLED TO:', { x: 300, y, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
      y -= 15;

      page.drawText('EditMee Platform Services', {
        x: margin,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      page.drawText(config.clientName || 'Client Name', {
        x: 300,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 14;

      page.drawText('support@editmee.com', {
        x: margin,
        y,
        size: 9,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });
      page.drawText('Verified Client Account', {
        x: 300,
        y,
        size: 9,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });
      y -= 35;

      // Table Header
      page.drawRectangle({
        x: margin,
        y: y - 8,
        width: 595.28 - margin * 2,
        height: 24,
        color: rgb(0.94, 0.95, 0.97),
      });

      page.drawText('DESCRIPTION', {
        x: margin + 8,
        y: y - 2,
        size: 9,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      page.drawText('QTY', { x: 340, y: y - 2, size: 9, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawText('RATE', { x: 400, y: y - 2, size: 9, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawText('AMOUNT', {
        x: 465,
        y: y - 2,
        size: 9,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 25;

      // Line item
      const amt = Number(config.amount) || 0;
      page.drawText('Professional Creative & Document Processing Services', {
        x: margin + 8,
        y,
        size: 9,
        font: fontRegular,
        color: rgb(0.15, 0.15, 0.15),
      });
      page.drawText('1', { x: 345, y, size: 9, font: fontRegular, color: rgb(0.15, 0.15, 0.15) });
      page.drawText(`$${amt.toFixed(2)}`, {
        x: 400,
        y,
        size: 9,
        font: fontRegular,
        color: rgb(0.15, 0.15, 0.15),
      });
      page.drawText(`$${amt.toFixed(2)}`, {
        x: 465,
        y,
        size: 9,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 30;

      // Total Line
      page.drawLine({
        start: { x: 300, y },
        end: { x: 595.28 - margin, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });
      y -= 20;

      page.drawText('TOTAL DUE:', {
        x: 320,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      page.drawText(`$${amt.toFixed(2)} USD`, {
        x: 440,
        y,
        size: 12,
        font: fontBold,
        color: rgb(0.85, 0.15, 0.15),
      });
      y -= 45;

      // Footer
      page.drawText('Thank you for choosing EditMee. 100% In-Browser Private Processing.', {
        x: margin,
        y,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5),
      });

      const genPdfBytes = await doc.save();
      const t1Duration = Math.round(performance.now() - t1Start);
      setStage1PdfBytes(genPdfBytes);

      updateStage(0, {
        status: 'success',
        progress: 100,
        outputSummary: `Invoice created (${(genPdfBytes.length / 1024).toFixed(1)} KB)`,
        outputBytes: genPdfBytes.length,
        durationMs: t1Duration,
      });

      // -------------------------------------------------------------
      // STEP 2: Apply Security Watermark
      // -------------------------------------------------------------
      setCurrentStepIndex(2);
      updateStage(1, { status: 'running', progress: 40 });
      setOverallProgress(60);
      const t2Start = performance.now();

      const watermarkedBytes = await PdfEngine.addWatermark(
        genPdfBytes,
        config.watermarkText || 'CONFIDENTIAL',
        {
          opacity: 0.22,
          size: 44,
          rotation: 45,
          color: { r: 0.85, g: 0.15, b: 0.15 },
        }
      );

      const t2Duration = Math.round(performance.now() - t2Start);
      setStage2PdfBytes(watermarkedBytes);

      updateStage(1, {
        status: 'success',
        progress: 100,
        outputSummary: `Watermark stamped (${(watermarkedBytes.length / 1024).toFixed(1)} KB)`,
        outputBytes: watermarkedBytes.length,
        durationMs: t2Duration,
      });

      // -------------------------------------------------------------
      // STEP 3: Optimize and Compress PDF
      // -------------------------------------------------------------
      setCurrentStepIndex(3);
      updateStage(2, { status: 'running', progress: 50 });
      setOverallProgress(85);
      const t3Start = performance.now();

      const compressionResult = await PdfEngine.compressPdf(watermarkedBytes, 'recommended');
      const finalBytes = compressionResult.compressedBytes;
      const t3Duration = Math.round(performance.now() - t3Start);

      setFinalPdfBytes(finalBytes);
      createAndSetPreviewUrl(finalBytes);

      updateStage(2, {
        status: 'success',
        progress: 100,
        outputSummary: `Optimized to ${(finalBytes.length / 1024).toFixed(1)} KB`,
        outputBytes: finalBytes.length,
        durationMs: t3Duration,
      });

      setOverallProgress(100);

      // Record in storage history
      storageEngine.addHistoryItem({
        toolId: 'workflow-automated-pipeline',
        toolName: 'Automated Multi-Tool Pipeline (Invoice → Watermark → Compress)',
        category: 'pdf',
        status: 'completed',
        inputsSummary: `${config.invoiceNumber} ($${config.amount})`,
        outputSummary: `Generated, watermarked, and optimized PDF (${(finalBytes.length / 1024).toFixed(1)} KB)`,
        outputFilename: `${(config.invoiceNumber || 'invoice').toLowerCase()}-secured.pdf`,
        executionTimeMs: Math.round(performance.now() - t1Start),
      });
    } catch (err: any) {
      console.error('Pipeline execution error:', err);
      const activeIdx = stages.findIndex((s) => s.status === 'running');
      if (activeIdx >= 0) {
        updateStage(activeIdx, {
          status: 'failed',
          error: "We couldn't process this stage.",
        });
      }
      setPipelineError("We couldn't complete the pipeline. Please check your inputs and try again.");
    } finally {
      setIsRunning(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = () => {
    if (!finalPdfBytes) return;
    const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
    const filename = `${(config.invoiceNumber || 'invoice').toLowerCase()}-secured.pdf`;
    FileEngine.downloadBlob(blob, filename);
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between">
        <BackButton customLabel="Back" />
      </div>

      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-md space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-950/70 border border-red-800 text-red-300">
            Active
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300">
            In-Browser Engine
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/70 border border-emerald-800 text-emerald-300 flex items-center gap-1">
            <Shield className="w-3 h-3" /> 100% Client-Side Privacy
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Workflow className="w-6 h-6 text-red-500" />
            Automated Multi-Tool Pipelines
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chain real document tools sequentially in your browser. Your files are processed directly on your device and are never uploaded to any server.
          </p>
        </div>
      </div>

      {/* Input Parameters Section */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-md space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Pipeline Information
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter your details below to generate, watermark, and optimize your document automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Invoice Number
            </label>
            <input
              type="text"
              placeholder="INV-1001"
              value={config.invoiceNumber}
              disabled={isRunning}
              onChange={(e) => setConfig({ ...config, invoiceNumber: e.target.value })}
              className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Client Name
            </label>
            <input
              type="text"
              placeholder="John Smith"
              value={config.clientName}
              disabled={isRunning}
              onChange={(e) => setConfig({ ...config, clientName: e.target.value })}
              className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Invoice Amount ($)
            </label>
            <input
              type="number"
              placeholder="1500.00"
              value={config.amount}
              disabled={isRunning}
              onChange={(e) => setConfig({ ...config, amount: Number(e.target.value) })}
              className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Watermark Text
            </label>
            <input
              type="text"
              placeholder="CONFIDENTIAL"
              value={config.watermarkText}
              disabled={isRunning}
              onChange={(e) => setConfig({ ...config, watermarkText: e.target.value })}
              className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleRunPipeline}
            disabled={isRunning}
            className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Automated Pipeline</span>
              </>
            )}
          </button>

          {isRunning && (
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Step {currentStepIndex} of 3 in progress...
            </span>
          )}
        </div>
      </div>

      {/* Progress & Real-Time Status */}
      {(isRunning || finalPdfBytes || pipelineError) && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pipeline Status
            </h3>
            {isRunning && (
              <span className="text-xs font-mono font-bold text-red-400">
                Step {currentStepIndex} of 3 ({overallProgress}%)
              </span>
            )}
          </div>

          {/* Sequential Steps List */}
          <div className="space-y-3">
            {stages.map((stage, idx) => (
              <div
                key={stage.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  stage.status === 'success'
                    ? 'bg-emerald-950/20 border-emerald-800/60'
                    : stage.status === 'running'
                    ? 'bg-red-950/30 border-red-600 shadow-sm'
                    : stage.status === 'failed'
                    ? 'bg-rose-950/30 border-rose-800'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{stage.name}</span>
                  </div>
                  <p className="text-xs text-slate-400">{stage.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {stage.status === 'success' ? (
                    <span className="px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : stage.status === 'running' ? (
                    <span className="px-3 py-1 rounded-lg bg-red-950 border border-red-800 text-red-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing
                    </span>
                  ) : stage.status === 'failed' ? (
                    <span className="px-3 py-1 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 text-xs font-bold">
                      ✕ Failed
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold">
                      Waiting
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Error Message with Try Again */}
          {pipelineError && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{pipelineError}</span>
              </div>
              <button
                type="button"
                onClick={handleRunPipeline}
                className="px-4 py-2 min-h-[44px] rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Final Output Result Box */}
      {finalPdfBytes && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Final PDF Ready</h3>
                <p className="text-xs text-slate-400">
                  Your secured and optimized PDF invoice is ready for download or preview.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-red-400" />
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Run Again</span>
              </button>
            </div>
          </div>

          {/* Interactive In-Page Preview */}
          <div className="w-full h-80 sm:h-96 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden relative">
            {finalPdfUrl && (
              <iframe
                src={finalPdfUrl}
                title="Secure PDF Preview"
                className="w-full h-full border-0 bg-white"
              />
            )}
          </div>
        </div>
      )}

      {/* Modal Preview */}
      {showPreviewModal && finalPdfUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Document Preview</h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-950 p-2">
              <iframe
                src={finalPdfUrl}
                title="Full Preview"
                className="w-full h-full rounded-lg bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
