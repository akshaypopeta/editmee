import React, { useState, useEffect, useRef } from 'react';
import {
  Stamp,
  Download,
  Upload,
  Type,
  Image as ImageIcon,
  Grid,
  Sliders,
  RotateCcw,
  Check,
  Shield,
  Layers,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';

type PositionPreset = 'tl' | 'tc' | 'tr' | 'ml' | 'center' | 'mr' | 'bl' | 'bc' | 'br' | 'tiled';

export const ImageWatermarkWorkspace: React.FC = () => {
  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);

  // Watermark Type
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');

  // Text Watermark Settings
  const [text, setText] = useState<string>('© COPYRIGHT PROTECTED');
  const [fontSize, setFontSize] = useState<number>(36);
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [opacity, setOpacity] = useState<number>(65);
  const [rotation, setRotation] = useState<number>(-30);

  // Image Logo Watermark Settings
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [logoScale, setLogoScale] = useState<number>(25);

  // Position
  const [position, setPosition] = useState<PositionPreset>('br');
  const [margin, setMargin] = useState<number>(24);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Load Base Image
  const handleBaseUpload = async (f: File) => {
    try {
      setBaseFile(f);
      const img = await FileEngine.loadImage(f);
      setBaseImg(img);
    } catch (err) {
      console.error('Error loading base image:', err);
    }
  };

  // Load Logo Overlay
  const handleLogoUpload = async (f: File) => {
    try {
      const img = await FileEngine.loadImage(f);
      setLogoImg(img);
    } catch (err) {
      console.error('Error loading logo overlay:', err);
    }
  };

  // Render Watermark on Canvas
  useEffect(() => {
    if (!baseImg) return;
    setIsProcessing(true);

    const timer = setTimeout(() => {
      const canvas = document.createElement('canvas');
      const w = baseImg.naturalWidth;
      const h = baseImg.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw base
      ctx.drawImage(baseImg, 0, 0);

      ctx.save();
      ctx.globalAlpha = opacity / 100;

      if (position === 'tiled') {
        // Repeated tiled watermark across the entire image
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const stepX = Math.max(150, fontSize * 6);
        const stepY = Math.max(120, fontSize * 4);

        for (let y = -h; y < h * 2; y += stepY) {
          for (let x = -w; x < w * 2; x += stepX) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((rotation * Math.PI) / 180);
            if (watermarkType === 'text') {
              ctx.fillText(text, 0, 0);
            } else if (logoImg) {
              const lw = (w * (logoScale / 100)) / 2;
              const lh = (logoImg.naturalHeight / logoImg.naturalWidth) * lw;
              ctx.drawImage(logoImg, -lw / 2, -lh / 2, lw, lh);
            }
            ctx.restore();
          }
        }
      } else {
        // Single placement calculation
        let posX = margin;
        let posY = margin;

        if (watermarkType === 'text') {
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillStyle = textColor;
          const textMetrics = ctx.measureText(text);
          const tw = textMetrics.width;
          const th = fontSize;

          if (position.includes('l')) posX = margin + tw / 2;
          else if (position.includes('c')) posX = w / 2;
          else if (position.includes('r')) posX = w - margin - tw / 2;

          if (position.startsWith('t')) posY = margin + th / 2;
          else if (position.startsWith('m') || position === 'center') posY = h / 2;
          else if (position.startsWith('b')) posY = h - margin - th / 2;

          ctx.save();
          ctx.translate(posX, posY);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, 0, 0);
          ctx.restore();
        } else if (logoImg) {
          const lw = w * (logoScale / 100);
          const lh = (logoImg.naturalHeight / logoImg.naturalWidth) * lw;

          if (position.includes('l')) posX = margin;
          else if (position.includes('c')) posX = (w - lw) / 2;
          else if (position.includes('r')) posX = w - margin - lw;

          if (position.startsWith('t')) posY = margin;
          else if (position.startsWith('m') || position === 'center') posY = (h - lh) / 2;
          else if (position.startsWith('b')) posY = h - margin - lh;

          ctx.drawImage(logoImg, posX, posY, lw, lh);
        }
      }

      ctx.restore();

      // Render to display canvas
      if (canvasRef.current) {
        canvasRef.current.width = w;
        canvasRef.current.height = h;
        const dCtx = canvasRef.current.getContext('2d');
        if (dCtx) {
          dCtx.clearRect(0, 0, w, h);
          dCtx.drawImage(canvas, 0, 0);
        }
      }

      canvas.toBlob(
        (b) => {
          setOutputBlob(b);
          setIsProcessing(false);
        },
        'image/jpeg',
        0.95
      );
    }, 120);

    return () => clearTimeout(timer);
  }, [baseImg, watermarkType, text, fontSize, textColor, opacity, rotation, logoImg, logoScale, position, margin]);

  // Download watermarked image
  const handleDownload = () => {
    if (!outputBlob || !baseFile) return;
    const baseName = baseFile.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_watermarked.jpg`;
    FileEngine.downloadBlob(outputBlob, filename);

    storageEngine.addHistoryItem({
      toolId: 'image-watermark',
      toolName: 'Image Watermark Studio',
      category: 'images',
      status: 'completed',
      outputFilename: filename,
      outputSummary: `Watermarked with ${watermarkType === 'text' ? `"${text}"` : 'Logo Overlay'}`,
    });
  };

  return (
    <div id="image-watermark-workspace" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
              <Stamp className="w-5 h-5" />
            </span>
            Image Watermark & Copyright Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Apply branded text, custom logos, copyright notices, and diagonal anti-theft security patterns.
          </p>
        </div>

        {baseFile && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={!outputBlob || isProcessing}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Watermarked
          </button>
        )}
      </div>

      {!baseFile ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-cyan-500 transition-colors">
          <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stamp className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Select an image to watermark</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Add copyright watermarks or security grids to protect your creative intellectual property.
          </p>
          <label
            htmlFor="watermark-base-input"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Upload className="w-4 h-4" /> Choose Base Image
            <input
              id="watermark-base-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleBaseUpload(e.target.files[0])}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Watermark Config</h3>
              <label
                htmlFor="watermark-change-base"
                className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 cursor-pointer"
              >
                Change Image
                <input
                  id="watermark-change-base"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleBaseUpload(e.target.files[0])}
                />
              </label>
            </div>

            {/* Type Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setWatermarkType('text')}
                className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  watermarkType === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                <Type className="w-3.5 h-3.5" /> Text Notice
              </button>
              <button
                type="button"
                onClick={() => setWatermarkType('image')}
                className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  watermarkType === 'image' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Logo Overlay
              </button>
            </div>

            {/* Text Inputs */}
            {watermarkType === 'text' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Watermark Text</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="e.g. © 2025 Your Brand"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200"
                      />
                      <span className="font-mono text-xs text-slate-700">{textColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Size ({fontSize}px)</label>
                    <input
                      type="range"
                      min="14"
                      max="120"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                    <span>Angle Rotation</span>
                    <span className="font-mono text-cyan-600">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              /* Image / Logo Upload */
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block mb-1">Upload PNG / SVG Logo</label>
                <label
                  htmlFor="logo-overlay-input"
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-600" />
                  {logoImg ? 'Change Logo Image' : 'Select Logo File'}
                  <input
                    id="logo-overlay-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                  />
                </label>

                {logoImg && (
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                      <span>Logo Scale</span>
                      <span className="font-mono text-cyan-600">{logoScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      value={logoScale}
                      onChange={(e) => setLogoScale(Number(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Opacity Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Opacity</span>
                <span className="font-mono text-cyan-600">{opacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
            </div>

            {/* 3x3 Position Grid + Tiled Security */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Position Placement</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-2 rounded-xl">
                {(['tl', 'tc', 'tr', 'ml', 'center', 'mr', 'bl', 'bc', 'br'] as PositionPreset[]).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className={`py-2 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                      position === pos
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pos.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Tiled diagonal grid option */}
              <button
                type="button"
                onClick={() => setPosition('tiled')}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  position === 'tiled'
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Grid className="w-3.5 h-3.5" /> Full Diagonal Security Tile
              </button>
            </div>
          </div>

          {/* Canvas Preview Stage (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700">Watermarked Output Preview</span>
              {baseImg && (
                <span className="text-[11px] font-mono text-slate-400">
                  {baseImg.naturalWidth} × {baseImg.naturalHeight} px
                </span>
              )}
            </div>

            <div className="min-h-[380px] sm:min-h-[460px] bg-slate-950 rounded-xl overflow-auto p-4 flex items-center justify-center border border-slate-800">
              <canvas
                ref={canvasRef}
                className="max-h-[60vh] max-w-full object-contain rounded shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
