import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Download,
  FolderArchive,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { SeoIssue, UploadedFileItem, FileDiffPatch } from '../types';
import { extractZipSafely, applySafeCodePatches, createDownloadableZip } from '../safeCodeFixer';

interface CodeFixerWorkspaceProps {
  issues: SeoIssue[];
  siteUrl: string;
  initialSelectedIssueId?: string;
  onNavigateToVerify: () => void;
}

export const CodeFixerWorkspace: React.FC<CodeFixerWorkspaceProps> = ({
  issues,
  siteUrl,
  initialSelectedIssueId,
  onNavigateToVerify,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>(() => {
    const autoFixable = issues.filter((i) => i.canAutoFix).map((i) => i.id);
    if (initialSelectedIssueId && !autoFixable.includes(initialSelectedIssueId)) {
      return [...autoFixable, initialSelectedIssueId];
    }
    return autoFixable;
  });

  const [correctedFiles, setCorrectedFiles] = useState<UploadedFileItem[]>([]);
  const [patches, setPatches] = useState<FileDiffPatch[]>([]);
  const [selectedDiffPath, setSelectedDiffPath] = useState<string>('');
  const [isPatching, setIsPatching] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fixable issues list
  const fixableIssues = issues.filter((i) => i.canAutoFix);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsExtracting(true);
    const newItems: UploadedFileItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name.toLowerCase().endsWith('.zip')) {
          const extracted = await extractZipSafely(file);
          newItems.push(...extracted);
        } else {
          const text = await file.text();
          newItems.push({
            path: file.name,
            name: file.name,
            content: text,
            size: file.size,
          });
        }
      }

      setUploadedFiles(newItems);
      // Reset previous patch state
      setCorrectedFiles([]);
      setPatches([]);
    } catch (err: any) {
      alert(`Error reading uploaded files: ${err.message}`);
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Provide a quick starter HTML sample if user wants to test auto-fix immediately
  const handleLoadSampleHtml = () => {
    const sampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Sample website missing meta description, viewport, canonical, and OG tags -->
  <title>Acme Corporation</title>
  <link rel="stylesheet" href="/styles.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Acme",, // malformed trailing comma
  }
  </script>
</head>
<body>
  <header>
    <h1>Welcome to Acme Corporation</h1>
    <nav><a href="/">Home</a> | <a href="/products">Products</a></nav>
  </header>
  <main>
    <p>Discover our range of industrial solutions.</p>
    <img src="/banner-hero.png">
  </main>
</body>
</html>`;

    setUploadedFiles([
      {
        path: 'index.html',
        name: 'index.html',
        content: sampleHtml,
        size: sampleHtml.length,
      },
    ]);
    setCorrectedFiles([]);
    setPatches([]);
  };

  const handleToggleIssue = (id: string) => {
    setSelectedIssueIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyPatches = () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload your website files or ZIP project first.');
      return;
    }

    setIsPatching(true);
    setTimeout(() => {
      try {
        const { correctedFiles: newFiles, patches: newPatches } = applySafeCodePatches(
          uploadedFiles,
          selectedIssueIds,
          issues,
          siteUrl
        );

        setCorrectedFiles(newFiles);
        setPatches(newPatches);
        if (newPatches.length > 0) {
          setSelectedDiffPath(newPatches[0].filePath);
        }
      } catch (err: any) {
        alert(`Error applying safe patches: ${err.message}`);
      } finally {
        setIsPatching(false);
      }
    }, 250);
  };

  const handleDownloadZip = async () => {
    if (correctedFiles.length === 0) return;
    try {
      const blob = await createDownloadableZip(correctedFiles);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `editmee-corrected-website-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to package ZIP: ${err.message}`);
    }
  };

  const handleDownloadSingleFile = (file: UploadedFileItem) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentDiff = patches.find((p) => p.filePath === selectedDiffPath);

  return (
    <div className="space-y-6">
      {/* Overview & Security Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-black tracking-tight">Safe Automatic Code Fixer</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Upload your website HTML or ZIP project. EditMee identifies the exact code location and applies the smallest safe patch. Original files are NEVER modified; a validated, corrected copy is generated for download.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSampleHtml}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Test with Sample HTML
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Patch Selection */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Upload Files */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Upload Website Source Files</span>
              </h3>
              {uploadedFiles.length > 0 && (
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {uploadedFiles.length} file(s) loaded
                </span>
              )}
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-red-500/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".zip,.html,.htm,.php,.xml,.json,.txt,.css,.js"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-slate-500 group-hover:text-red-400 mx-auto mb-2 transition-colors" />
              <div className="text-xs font-bold text-slate-200">
                {isExtracting ? 'Extracting safely in memory...' : 'Click to upload ZIP or HTML files'}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Supports .zip, .html, .php, .xml, .json</p>
            </div>

            {/* Loaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {uploadedFiles.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="font-mono truncate">{f.path}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Select Issues to Safe-Patch */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Select Issues to Safe-Patch</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                {selectedIssueIds.length} of {fixableIssues.length} selected
              </span>
            </div>

            {fixableIssues.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-xs text-slate-400">
                No auto-fixable issues detected in the current audit. All primary meta and structure tags are compliant!
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {fixableIssues.map((issue) => {
                  const isChecked = selectedIssueIds.includes(issue.id);
                  return (
                    <label
                      key={issue.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-slate-950 border-red-500/40 text-white'
                          : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleIssue(issue.id)}
                        className="mt-0.5 rounded border-slate-700 text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white">{issue.title}</div>
                        <div className="text-[10px] text-slate-400 leading-tight">{issue.howToFix}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Execute Patch Button */}
            <button
              type="button"
              onClick={handleApplyPatches}
              disabled={uploadedFiles.length === 0 || selectedIssueIds.length === 0 || isPatching}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isPatching ? 'Applying Safe Patches...' : 'Apply Safe Patches & Generate Diff'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Diff Viewer & Download Center */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Before / After Code Changes</span>
              </h3>

              {patches.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Validated Clean Patch
                  </span>
                </div>
              )}
            </div>

            {patches.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3 bg-slate-950/40 rounded-xl border border-slate-800">
                <FileCode className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="text-sm font-bold text-slate-300">No Patches Applied Yet</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload your website source files on the left and click "Apply Safe Patches" to inspect the exact line-by-line diff.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Tabs for Patched Files */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
                  {patches.map((patch) => (
                    <button
                      key={patch.filePath}
                      type="button"
                      onClick={() => setSelectedDiffPath(patch.filePath)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                        selectedDiffPath === patch.filePath
                          ? 'bg-red-600 text-white font-bold'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>{patch.filePath}</span>
                      <span className="text-[10px] text-emerald-300 font-sans">
                        +{patch.diffLinesCount.added}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Diff View Container */}
                {currentDiff && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>Inspecting: <strong className="text-sky-300">{currentDiff.filePath}</strong></span>
                      <span className="text-[11px] text-slate-500">
                        Lines Added: +{currentDiff.diffLinesCount.added} | Removed: -{currentDiff.diffLinesCount.removed}
                      </span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs max-h-[380px] overflow-y-auto space-y-1">
                      {currentDiff.patchedContent.split('\n').map((line, idx) => {
                        // Check if this line was newly injected in patched content
                        const isAdded =
                          !currentDiff.originalContent.includes(line.trim()) && line.trim().length > 0;
                        return (
                          <div
                            key={idx}
                            className={`flex gap-3 px-2 py-0.5 rounded ${
                              isAdded
                                ? 'bg-emerald-950/60 text-emerald-300 font-bold border-l-2 border-emerald-500'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className="w-8 text-right text-slate-600 select-none text-[11px]">{idx + 1}</span>
                            <span className="whitespace-pre overflow-x-auto">{line || ' '}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Download & Verification Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDownloadZip}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                          <FolderArchive className="w-4 h-4" />
                          <span>{downloadSuccess ? 'Downloaded!' : 'Download Corrected Project (ZIP)'}</span>
                        </button>

                        {correctedFiles.find((f) => f.path === currentDiff.filePath) && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadSingleFile(
                                correctedFiles.find((f) => f.path === currentDiff.filePath)!
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download {currentDiff.filePath}</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={onNavigateToVerify}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                      >
                        <span>Next: Verify Published Website</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
