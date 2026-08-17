import React, { useState, useRef, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { PdfEngine } from '../../core/pdf-engine/PdfEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Upload,
  FileText,
  Trash2,
  ArrowUp,
  ArrowDown,
  Merge,
  Download,
  AlertCircle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Eye,
  FileCheck,
  Layers,
  Sparkles,
  ArrowUpDown,
  X,
} from 'lucide-react';

interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  buffer: ArrayBuffer;
}

export const MergePdfTool: React.FC = () => {
  const [pdfQueue, setPdfQueue] = useState<PdfFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [mergedStats, setMergedStats] = useState<{ pageCount: number; size: number; filename: string } | null>(null);
  const [outputFilename, setOutputFilename] = useState('merged_document.pdf');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const appendInputRef = useRef<HTMLInputElement | null>(null);

  // Parse uploaded PDF files
  const processFiles = async (files: FileList | File[]) => {
    setLoadingFiles(true);
    setErrorMessage(null);
    setMergedBlob(null);
    setMergedStats(null);

    const newItems: PdfFileItem[] = [];
    const validPdfFiles = Array.from(files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (validPdfFiles.length === 0) {
      setErrorMessage('Please select valid PDF document files (.pdf).');
      setLoadingFiles(false);
      return;
    }

    for (const file of validPdfFiles) {
      try {
        const buffer = await FileEngine.readAsArrayBuffer(file);
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const pageCount = doc.getPageCount();

        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          name: file.name,
          size: file.size,
          pageCount,
          buffer,
        });
      } catch (err: any) {
        console.warn(`Could not parse ${file.name}:`, err);
        setErrorMessage(`Could not parse "${file.name}". Ensure it is a valid, uncorrupted PDF.`);
      }
    }

    setPdfQueue((prev) => [...prev, ...newItems]);
    setLoadingFiles(false);
  };

  const handleInitialUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleAppendUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setPdfQueue((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= pdfQueue.length - 1) return;
    setPdfQueue((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleRemove = (id: string) => {
    setPdfQueue((prev) => prev.filter((item) => item.id !== id));
    setMergedBlob(null);
    setMergedStats(null);
  };

  const handleClearAll = () => {
    setPdfQueue([]);
    setMergedBlob(null);
    setMergedStats(null);
    setErrorMessage(null);
  };

  const handleSortAZ = () => {
    setPdfQueue((prev) => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleSortZA = () => {
    setPdfQueue((prev) => [...prev].sort((a, b) => b.name.localeCompare(a.name)));
  };

  const handleReverse = () => {
    setPdfQueue((prev) => [...prev].reverse());
  };

  // Perform Merge
  const handleMerge = async () => {
    if (pdfQueue.length < 2) {
      setErrorMessage('Select at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const buffers = pdfQueue.map((item) => item.buffer);
      const mergedBytes = await PdfEngine.mergePdfs(buffers);
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });

      // Verify page count of merged document
      const mergedDoc = await PDFDocument.load(mergedBytes, { ignoreEncryption: true });
      const totalPages = mergedDoc.getPageCount();

      const finalName = outputFilename.endsWith('.pdf') ? outputFilename : `${outputFilename}.pdf`;

      setMergedBlob(blob);
      setMergedStats({
        pageCount: totalPages,
        size: blob.size,
        filename: finalName,
      });

      storageEngine.addHistoryItem({
        toolId: 'merge-pdf',
        toolName: 'PDF Merger',
        category: 'pdf',
        status: 'completed',
        outputFilename: finalName,
        outputSummary: `Merged ${pdfQueue.length} files into ${totalPages} pages (${(blob.size / 1024 / 1024).toFixed(2)} MB)`,
      });
    } catch (err: any) {
      console.error('Merge error:', err);
      setErrorMessage(err.message || 'An error occurred while merging the PDF files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedBlob || !mergedStats) return;
    FileEngine.downloadBlob(mergedBlob, mergedStats.filename);
  };

  const totalInputPages = pdfQueue.reduce((acc, curr) => acc + curr.pageCount, 0);
  const totalInputSize = pdfQueue.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div id="merge-pdf-workspace" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-8 shadow-sm">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Merge className="w-5 h-5 text-blue-400" />
            Merge PDF Documents
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Combine multiple PDF files into a single ordered document with 100% client-side precision.
          </p>
        </div>

        {pdfQueue.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => appendInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              Add More PDFs
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-red-950/40 text-slate-400 hover:text-red-400 text-xs font-medium border border-slate-800 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="application/pdf"
        onChange={handleInitialUpload}
        className="hidden"
        id="merge-pdf-file-picker"
      />
      <input
        ref={appendInputRef}
        type="file"
        multiple
        accept="application/pdf"
        onChange={handleAppendUpload}
        className="hidden"
      />

      {/* Alert / Error Banner */}
      {errorMessage && (
        <div className="mt-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Queue < 2 validation notice */}
      {pdfQueue.length === 1 && !mergedBlob && (
        <div className="mt-6 p-4 rounded-xl bg-amber-950/50 border border-amber-800 text-amber-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>1 file added.</strong> Select at least 2 PDF files to merge into a single document.
          </span>
        </div>
      )}

      {/* 1. Upload Empty State */}
      {pdfQueue.length === 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`mt-6 border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-blue-500 bg-blue-950/30'
              : 'border-slate-800 hover:border-blue-500/60 bg-slate-950/60'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Choose 2 or More PDF Files</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            Drag and drop multiple PDF files here, or click to select them from your computer. Files are processed
            locally in your browser with zero server uploads.
          </p>
          <button
            type="button"
            className="mt-6 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md transition-colors cursor-pointer"
          >
            Select PDF Files
          </button>
        </div>
      )}

      {/* 2. File Queue & Order Manager */}
      {pdfQueue.length > 0 && !mergedBlob && (
        <div className="mt-6 space-y-6">
          {/* Quick Sorting Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-400 flex items-center gap-3">
              <span>
                <strong className="text-white font-semibold">{pdfQueue.length}</strong> {pdfQueue.length === 1 ? 'file' : 'files'} selected
              </span>
              <span>•</span>
              <span>
                <strong className="text-white font-semibold">{totalInputPages}</strong> total pages
              </span>
              <span>•</span>
              <span>{(totalInputSize / 1024 / 1024).toFixed(2)} MB total</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 mr-1">Sort:</span>
              <button
                onClick={handleSortAZ}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Sort alphabetically A-Z"
              >
                A → Z
              </button>
              <button
                onClick={handleSortZA}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Sort alphabetically Z-A"
              >
                Z → A
              </button>
              <button
                onClick={handleReverse}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reverse current order"
              >
                <ArrowUpDown className="w-3 h-3 inline mr-1" />
                Reverse
              </button>
            </div>
          </div>

          {/* Files List */}
          <div className="space-y-2.5">
            {pdfQueue.map((item, idx) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 transition-all"
              >
                {/* Index badge + File info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-800/80 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <FileText className="w-6 h-6 text-red-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-200 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}</span>
                      <span>•</span>
                      <span>{(item.size / 1024 / 1024).toFixed(2)} MB</span>
                    </p>
                  </div>
                </div>

                {/* Actions: Move up / Move down / Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === pdfQueue.length - 1}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-950/40 cursor-pointer transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Execution Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex items-center gap-2">
              <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Output Filename:</label>
              <input
                type="text"
                value={outputFilename}
                onChange={(e) => setOutputFilename(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-64"
                placeholder="merged_document.pdf"
              />
            </div>

            <button
              onClick={handleMerge}
              disabled={pdfQueue.length < 2 || isProcessing}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                pdfQueue.length >= 2 && !isProcessing
                  ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-900/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Merging {pdfQueue.length} PDFs...
                </>
              ) : (
                <>
                  <Merge className="w-4 h-4" />
                  Merge {pdfQueue.length} PDFs
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. Merged Success & Download View */}
      {mergedBlob && mergedStats && (
        <div className="mt-6 p-8 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">PDFs Successfully Merged!</h3>
            <p className="text-xs text-slate-400 mt-1">
              All {pdfQueue.length} files have been combined into a clean, ISO-compliant PDF.
            </p>
          </div>

          {/* Stats Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Pages</p>
              <p className="text-lg font-bold text-white mt-0.5">{mergedStats.pageCount}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Merged Size</p>
              <p className="text-lg font-bold text-white mt-0.5">{(mergedStats.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Source Files</p>
              <p className="text-lg font-bold text-white mt-0.5">{pdfQueue.length} Files</p>
            </div>
          </div>

          {/* Download & Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Merged PDF
            </button>

            <button
              onClick={() => {
                setMergedBlob(null);
                setMergedStats(null);
              }}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              Reorder or Modify Batch
            </button>

            <button
              onClick={handleClearAll}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              Merge Another Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
