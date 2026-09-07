import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PenTool, Type, Upload, RotateCcw, Trash2, Check, Sparkles } from 'lucide-react';

interface SignatureDrawingCanvasProps {
  onSignatureChange: (signatureDataUrl: string, typedText?: string) => void;
  defaultSignerName?: string;
}

export const SignatureDrawingCanvas: React.FC<SignatureDrawingCanvasProps> = ({
  onSignatureChange,
  defaultSignerName = 'John Doe',
}) => {
  const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#0f172a'); // Slate 900 / dark ink
  const [strokeWidth, setStrokeWidth] = useState(2.5);
  const [strokesHistory, setStrokesHistory] = useState<ImageData[]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Type mode
  const [typedName, setTypedName] = useState(defaultSignerName);
  const [selectedFont, setSelectedFont] = useState<'cursive' | 'serif' | 'script' | 'handwriting'>('cursive');

  // Upload mode
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [autoTransparent, setAutoTransparent] = useState(true);

  // Initialize canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
  }, [strokeColor, strokeWidth]);

  useEffect(() => {
    if (tab === 'draw') {
      initCanvas();
    }
  }, [tab, initCanvas]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save history state for undo
    setStrokesHistory((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokesHistory([]);
    setHasDrawn(false);
    onSignatureChange('');
  };

  const undoLastStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokesHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = strokesHistory[strokesHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setStrokesHistory((prev) => prev.slice(0, -1));
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  // Generate image for typed signature
  const renderTypedSignatureToCanvas = useCallback(() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 400;
    offscreen.height = 160;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    ctx.fillStyle = strokeColor;

    let fontStyle = 'italic 36px "Brush Script MT", "Caveat", "Dancing Script", cursive';
    if (selectedFont === 'serif') fontStyle = 'italic 34px "Playfair Display", "Times New Roman", serif';
    if (selectedFont === 'script') fontStyle = 'italic 38px "Great Vibes", "Alex Brush", cursive';
    if (selectedFont === 'handwriting') fontStyle = 'italic 34px "Caveat", "Kalam", cursive';

    ctx.font = fontStyle;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName || 'Signer', offscreen.width / 2, offscreen.height / 2);

    // Decorative underline loop
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.moveTo(60, 115);
    ctx.bezierCurveTo(150, 130, 250, 100, 340, 120);
    ctx.stroke();

    const dataUrl = offscreen.toDataURL('image/png');
    onSignatureChange(dataUrl, typedName);
  }, [typedName, selectedFont, strokeColor, onSignatureChange]);

  useEffect(() => {
    if (tab === 'type') {
      renderTypedSignatureToCanvas();
    }
  }, [tab, typedName, selectedFont, strokeColor, renderTypedSignatureToCanvas]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const offscreen = document.createElement('canvas');
        offscreen.width = img.width;
        offscreen.height = img.height;
        const ctx = offscreen.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        if (autoTransparent) {
          // Remove white/light backgrounds
          const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // If near white, make transparent
            if (r > 220 && g > 220 && b > 220) {
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }

        const dataUrl = offscreen.toDataURL('image/png');
        setUploadedPreview(dataUrl);
        onSignatureChange(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(uploaded);
  };

  return (
    <div className="space-y-4">
      {/* Mode Selector Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 gap-2">
        <button
          type="button"
          onClick={() => setTab('draw')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            tab === 'draw'
              ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          Draw Signature
        </button>
        <button
          type="button"
          onClick={() => setTab('type')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            tab === 'type'
              ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          Type Signature
        </button>
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            tab === 'upload'
              ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Image
        </button>
      </div>

      {/* DRAW TAB */}
      {tab === 'draw' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Color Palette */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px] font-medium">Ink Color:</span>
              {[
                { color: '#0f172a', name: 'Dark Slate' },
                { color: '#1e3a8a', name: 'Classic Blue' },
                { color: '#047857', name: 'Emerald' },
                { color: '#b91c1c', name: 'Red' },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setStrokeColor(c.color)}
                  style={{ backgroundColor: c.color }}
                  className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-all ${
                    strokeColor === c.color ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' : 'border-transparent'
                  }`}
                  title={c.name}
                />
              ))}
            </div>

            {/* Thickness */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px] font-medium">Stroke:</span>
              {[
                { width: 1.5, label: 'Fine' },
                { width: 2.5, label: 'Medium' },
                { width: 4.0, label: 'Thick' },
              ].map((s) => (
                <button
                  key={s.width}
                  type="button"
                  onClick={() => setStrokeWidth(s.width)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                    strokeWidth === s.width
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={undoLastStroke}
                disabled={strokesHistory.length === 0}
                className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                title="Undo last stroke"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={clearCanvas}
                className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                title="Clear signature pad"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas Box */}
          <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 overflow-hidden shadow-xs">
            <canvas
              ref={canvasRef}
              width={480}
              height={160}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-36 touch-none cursor-crosshair block"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400 dark:text-slate-600">
                <span>Draw your signature above using mouse, stylus, or touch screen</span>
              </div>
            )}
            <div className="absolute bottom-2 right-2 pointer-events-none text-[10px] text-slate-400">
              Sign above baseline
            </div>
          </div>
        </div>
      )}

      {/* TYPE TAB */}
      {tab === 'type' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Full Legal Name
            </label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="e.g. Jane M. Doe"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>

          {/* Script Styles */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'cursive', name: 'Classic Script', sample: 'Brush Script' },
              { id: 'script', name: 'Formal Calligraphy', sample: 'Great Vibes' },
              { id: 'handwriting', name: 'Casual Hand', sample: 'Caveat' },
              { id: 'serif', name: 'Executive Italic', sample: 'Playfair' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFont(f.id as any)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedFont === f.id
                    ? 'border-red-500 bg-red-50/40 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{f.name}</div>
                <div className="text-base italic truncate mt-1">{typedName || 'Signer Name'}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* UPLOAD TAB */}
      {tab === 'upload' && (
        <div className="space-y-3">
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleFileUpload}
            className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 dark:file:bg-red-950 dark:file:text-red-300 hover:file:bg-red-100 cursor-pointer"
          />

          <div
            onClick={() => setAutoTransparent(!autoTransparent)}
            className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400"
          >
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center ${
                autoTransparent ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300'
              }`}
            >
              {autoTransparent && <Check className="w-3 h-3" />}
            </div>
            <span>Auto-detect & remove white background for transparent overlay</span>
          </div>

          {uploadedPreview && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <img src={uploadedPreview} alt="Signature Preview" className="max-h-24 object-contain" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
