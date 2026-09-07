import React, { useState } from 'react';
import { ToolDefinition } from '../../types';
import {
  FolderArchive,
  Upload,
  Download,
  FileCheck,
  Hash,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Files,
  FileSpreadsheet,
} from 'lucide-react';
import JSZip from 'jszip';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

interface StagedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  sha256?: string;
}

export const FileArchiveStudioWorkspace: React.FC = () => {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [zipFileName, setZipFileName] = useState('archive.zip');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFilesAdded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newStaged: StagedFile[] = [];

    for (const f of files) {
      // Compute SHA-256
      const buffer = await f.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', buffer);
      const sha256 = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      newStaged.push({
        id: `f-${Date.now()}-${Math.random()}`,
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        file: f,
        sha256,
      });
    }

    setStagedFiles((prev) => [...prev, ...newStaged]);
  };

  const removeFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const createAndDownloadZip = async () => {
    if (stagedFiles.length === 0) return;
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      for (const item of stagedFiles) {
        zip.file(item.name, item.file);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipFileName.endsWith('.zip') ? zipFileName : `${zipFileName}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      storageEngine.addHistoryItem({
        toolId: 'archive-studio',
        toolName: 'File & Archive Studio Pro',
        category: 'files',
        status: 'completed',
        outputSummary: `Packed ${stagedFiles.length} files into ${zipFileName} (${(blob.size / 1024).toFixed(1)} KB)`,
      });
    } catch (err) {
      console.error('ZIP packaging error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              File & Archive Studio Pro
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                JSZip Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Multi-file ZIP packaging, extraction, SHA-256 integrity hashing, and batch staging.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Add Files</span>
            <input type="file" multiple onChange={handleFilesAdded} className="hidden" />
          </label>
          <button
            type="button"
            disabled={stagedFiles.length === 0 || isProcessing}
            onClick={createAndDownloadZip}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-red-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isProcessing ? 'Compressing...' : 'Build & Download ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Staging Area (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Staged Files Queue ({stagedFiles.length})
              </h3>
              {stagedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setStagedFiles([])}
                  className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {stagedFiles.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Files className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">
                  No files added yet. Click &quot;Add Files&quot; to stage documents, images, or assets.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stagedFiles.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                        <span>{(item.size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">{item.type}</span>
                        <span>•</span>
                        <span className="text-emerald-600 truncate max-w-[140px]">
                          SHA: {item.sha256?.substring(0, 10)}...
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.sha256 || '')}
                        title="Copy SHA-256 checksum"
                        className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <Hash className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFile(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Archive Configuration
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Archive Output Filename</label>
              <input
                type="text"
                value={zipFileName}
                onChange={(e) => setZipFileName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Total Files:</span>
                <span className="text-slate-900">{stagedFiles.length}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Uncompressed Size:</span>
                <span className="text-slate-900 font-mono">
                  {(
                    stagedFiles.reduce((acc, f) => acc + f.size, 0) /
                    (1024 * 1024)
                  ).toFixed(2)}{' '}
                  MB
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Compression Engine:</span>
                <span className="text-red-600 font-bold">Client JSZip (DEFLATE)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const fileArchiveStudioToolDef: ToolDefinition = {
  id: 'archive-studio',
  name: 'File & Archive Studio Pro',
  category: 'files',
  subcategory: 'archive',
  description: 'Multi-file archive studio for client-side ZIP packaging, integrity hashing, and batch file staging.',
  iconName: 'FolderArchive',
  version: '2.0.0',
  tags: ['files', 'archive', 'zip', 'compress', 'hash', 'sha256', 'batch', 'studio'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  inputSchema: { fields: [] },
  outputSchema: { type: 'custom' },
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  customWorkspace: FileArchiveStudioWorkspace,
  execute: async () => {
    return { success: true, text: 'Archive Studio Ready' };
  },
};
