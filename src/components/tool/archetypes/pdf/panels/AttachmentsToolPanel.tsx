import React, { useRef } from 'react';
import { Paperclip, Upload, Trash2, FileText, Sliders } from 'lucide-react';
import { PdfDocumentInfo } from '../../../../../core/pdf-engine/PdfEngine';
import { FileEngine } from '../../../../../core/file-engine/FileEngine';

export interface EmbeddedFileQueueItem {
  id: string;
  name: string;
  size: number;
  buffer: ArrayBuffer;
}

interface AttachmentsToolPanelProps {
  docInfo: PdfDocumentInfo | null;
  embeddedFilesQueue: EmbeddedFileQueueItem[];
  setEmbeddedFilesQueue: React.Dispatch<React.SetStateAction<EmbeddedFileQueueItem[]>>;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
  formatBytes: (bytes: number) => string;
}

export const AttachmentsToolPanel: React.FC<AttachmentsToolPanelProps> = ({
  docInfo,
  embeddedFilesQueue,
  setEmbeddedFilesQueue,
  isAdvancedMode,
  setIsAdvancedMode,
  formatBytes,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAttachFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const buf = await FileEngine.readAsArrayBuffer(f);
      setEmbeddedFilesQueue((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          name: f.name,
          size: f.size,
          buffer: buf,
        },
      ]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (id: string) => {
    setEmbeddedFilesQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-red-500" />
            PDF Embedded Files & Portfolio Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Embed arbitrary data files, spreadsheets (XLSX/CSV), archives (ZIP), images, and documents into the PDF stream.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
            isAdvancedMode
              ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          {isAdvancedMode ? 'Portfolio Spec' : 'Standard'}
        </button>
      </div>

      {/* Upload Attachment Dropzone */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleAttachFiles}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-red-500 rounded-2xl text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center gap-2"
      >
        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-500">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Click to Browse & Embed Files
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Supports XML, CSV, XLSX, DOCX, ZIP, MP3, PNG, JPG, and raw data streams.
          </div>
        </div>
      </div>

      {/* Embedded File Queue */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Enclosed Files Queue ({embeddedFilesQueue.length})
        </h4>

        {embeddedFilesQueue.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            No files attached yet. Click the upload area above to bundle files into the PDF container.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {embeddedFilesQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-slate-500 shrink-0 font-mono">
                    ({formatBytes(item.size)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
