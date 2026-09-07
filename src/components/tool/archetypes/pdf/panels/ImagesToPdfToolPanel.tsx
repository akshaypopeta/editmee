import React, { useRef } from 'react';
import { Image, Upload, Trash2, ArrowUp, ArrowDown, Settings2, Sliders, CheckCircle2, FileImage, Plus } from 'lucide-react';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export interface ImagesToPdfOptions {
  pageSize: 'fit' | 'a4' | 'letter';
  orientation: 'auto' | 'portrait' | 'landscape';
  fitMode: 'contain' | 'cover' | 'original';
  margin: number;
}

interface ImagesToPdfToolPanelProps {
  imageFiles: File[];
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
  options: ImagesToPdfOptions;
  setOptions: React.Dispatch<React.SetStateAction<ImagesToPdfOptions>>;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
  onConvert: () => void;
  processing: boolean;
}

export const ImagesToPdfToolPanel: React.FC<ImagesToPdfToolPanelProps> = ({
  imageFiles,
  setImageFiles,
  options,
  setOptions,
  isAdvancedMode,
  setIsAdvancedMode,
  onConvert,
  processing,
}) => {
  const addFilesInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).filter(
        (f) => f.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|tiff|svg)$/i.test(f.name)
      );
      setImageFiles((prev) => [...prev, ...newImages]);
      e.target.value = '';
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setImageFiles((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= imageFiles.length - 1) return;
    setImageFiles((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleRemove = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setImageFiles([]);
  };

  const totalSize = imageFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <input
        type="file"
        ref={addFilesInputRef}
        onChange={handleAddMoreFiles}
        accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp"
        multiple
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Image className="w-4 h-4 text-red-500" />
            Images to PDF Document Builder
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Convert JPG, PNG, WebP, GIF, or BMP pictures into a clean multi-page PDF document.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => addFilesInputRef.current?.click()}
            disabled={processing}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 transition-all cursor-pointer hover:bg-red-100"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Images
          </button>
          <button
            type="button"
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              isAdvancedMode
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            {isAdvancedMode ? 'Page Layout' : 'Quick Mode'}
          </button>
        </div>
      </div>

      {/* Image Conversion Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Page Dimension
          </label>
          <select
            value={options.pageSize}
            onChange={(e) => setOptions((prev) => ({ ...prev, pageSize: e.target.value as any }))}
            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="fit">Fit to Image Size</option>
            <option value="a4">Standard A4 (210 x 297 mm)</option>
            <option value="letter">US Letter (8.5 x 11 in)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Page Orientation
          </label>
          <select
            value={options.orientation}
            onChange={(e) => setOptions((prev) => ({ ...prev, orientation: e.target.value as any }))}
            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="auto">Auto (Match Image Ratio)</option>
            <option value="portrait">Portrait (Vertical)</option>
            <option value="landscape">Landscape (Horizontal)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Scaling Mode
          </label>
          <select
            value={options.fitMode}
            onChange={(e) => setOptions((prev) => ({ ...prev, fitMode: e.target.value as any }))}
            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="contain">Contain (Keep Proportion)</option>
            <option value="cover">Cover (Fill Entire Page)</option>
            <option value="original">Original Resolution</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Page Margins
          </label>
          <select
            value={options.margin}
            onChange={(e) => setOptions((prev) => ({ ...prev, margin: parseInt(e.target.value, 10) }))}
            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value={0}>No Margin (0 pt)</option>
            <option value={18}>Narrow (18 pt / 0.25 in)</option>
            <option value={36}>Standard (36 pt / 0.5 in)</option>
            <option value={54}>Wide (54 pt / 0.75 in)</option>
          </select>
        </div>
      </div>

      {/* Image List / Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>Image Sequence ({imageFiles.length} pages)</span>
            <span className="text-slate-400 font-normal">({formatBytes(totalSize)})</span>
          </h4>
          {imageFiles.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={processing}
              className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>

        {imageFiles.length === 0 ? (
          <div
            onClick={() => addFilesInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center cursor-pointer hover:border-red-400 transition-colors"
          >
            <FileImage className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No images queued yet. Click to browse JPG, PNG, WebP images.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
            {imageFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="relative bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2.5 flex items-center gap-3 group"
              >
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {file.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatBytes(file.size)}
                  </p>
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0 || processing}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === imageFiles.length - 1 || processing}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    disabled={processing}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature Checklist */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          High-Fidelity PDF Image Compilation:
        </div>
        <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
          <li>Supports JPG, PNG, WebP, GIF, and BMP formats with alpha transparency preservation.</li>
          <li>Auto-scales images to fit A4/Letter or maintains original picture pixel bounds.</li>
          <li>Lossless embedded rendering with 100% private in-browser compilation.</li>
        </ul>
      </div>
    </div>
  );
};
