import React, { useState, useEffect, useRef } from 'react';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine, WatermarkOptions } from '../../core/image-engine/ImageEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Upload,
  Type,
  Download,
  Image as ImageIcon,
  Check,
  Grid,
  Shield,
  Layers,
} from 'lucide-react';

export const ImageWatermarkWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('CONFIDENTIAL © 2025');
  const [color, setColor] = useState('#ffffff');
  const [opacity, setOpacity] = useState(0.4);
  const [fontSize, setFontSize] = useState(36);
  const [rotation, setRotation] = useState(-30);
  const [position, setPosition] = useState<
    'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right' | 'tile'
  >('tile');

  const [watermarkImgFile, setWatermarkImgFile] = useState<File | null>(null);
  const [watermarkImgElement, setWatermarkImgElement] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load Base Image
  const handleFileUpload = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await FileEngine.loadImage(selectedFile);
      setImgElement(img);
    } catch (err) {
      console.error('Error loading image:', err);
    }
  };

  // Load Logo Watermark Image
  const handleLogoUpload = async (selectedFile: File) => {
    try {
      setWatermarkImgFile(selectedFile);
      const img = await FileEngine.loadImage(selectedFile);
      setWatermarkImgElement(img);
      setWatermarkType('image');
    } catch (err) {
      console.error('Error loading logo:', err);
    }
  };

  // Re-render watermarked canvas
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;

    const wmOptions: WatermarkOptions = {
      type: watermarkType,
      text: watermarkType === 'text' ? text : undefined,
      imageSource: watermarkType === 'image' && watermarkImgElement ? watermarkImgElement : undefined,
      color,
      opacity,
      fontSize,
      rotation,
      position,
    };

    ImageEngine.processImage(imgElement, {
      watermark: wmOptions,
    }).then((processedCanvas) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      canvasRef.current.width = processedCanvas.width;
      canvasRef.current.height = processedCanvas.height;
      ctx.drawImage(processedCanvas, 0, 0);
    });
  }, [imgElement, watermarkType, text, watermarkImgElement, color, opacity, fontSize, rotation, position]);

  // Download watermarked image
  const handleDownload = () => {
    if (!canvasRef.current || !file) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}_watermarked.png`;
      FileEngine.downloadBlob(blob, filename);

      storageEngine.addHistoryItem({
        toolId: 'image-watermark',
        toolName: 'Image Watermark',
        category: 'images',
        status: 'completed',
        outputFilename: filename,
        outputSummary: `Applied watermark: "${text}" (${position})`,
      });
    }, 'image/png');
  };

  return (
    <div id="image-watermark-workspace" className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-md">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Image Watermark Studio
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                Copyright Protection
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Add custom text or logo watermarks with diagonal tiling and alpha opacity</p>
          </div>
        </div>

        {file && (
          <button
            onClick={handleDownload}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Protected
          </button>
        )}
      </div>

      {/* Workspace Content */}
      <div className="flex-1 flex overflow-hidden">
        {!file ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/40">
            <div className="w-20 h-20 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <Shield className="w-10 h-10" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Protect your creative assets</h2>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Embed non-destructive text stamps, copyright notices, or logo overlays across your photos.
            </p>
            <label
              htmlFor="watermark-init-file"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4" /> Select Image to Watermark
              <input
                id="watermark-init-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </label>
          </div>
        ) : (
          <>
            {/* Left Control Panel */}
            <div className="w-80 bg-slate-900 border-r border-slate-800 p-4 space-y-4 flex flex-col text-xs overflow-y-auto">
              {/* Type Switcher */}
              <div>
                <span className="font-semibold text-slate-200 block mb-2">Watermark Type</span>
                <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setWatermarkType('text')}
                    className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                      watermarkType === 'text' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Custom Text
                  </button>
                  <button
                    onClick={() => setWatermarkType('image')}
                    className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                      watermarkType === 'image' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Logo Image
                  </button>
                </div>
              </div>

              {watermarkType === 'text' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Watermark Text</label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Color</label>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Font Size ({fontSize}px)</label>
                      <input
                        type="range"
                        min="14"
                        max="80"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer mt-2"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label
                    htmlFor="logo-watermark-upload"
                    className="w-full py-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 hover:bg-slate-800/80 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-6 h-6 text-cyan-400 mb-1" />
                    <span className="text-[11px] text-slate-300 font-medium">
                      {watermarkImgFile ? watermarkImgFile.name : 'Upload Logo (PNG)'}
                    </span>
                    <input
                      id="logo-watermark-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                    />
                  </label>
                </div>
              )}

              {/* Opacity & Rotation */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Opacity</span>
                    <span className="font-mono text-cyan-400">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Angle / Rotation</span>
                    <span className="font-mono text-cyan-400">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Placement Grid */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="font-semibold text-slate-200 block">Position & Layout</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'tile', label: 'Diagonal Tile' },
                    { id: 'center', label: 'Center' },
                    { id: 'bottom-right', label: 'Bottom Right' },
                    { id: 'top-left', label: 'Top Left' },
                    { id: 'top-right', label: 'Top Right' },
                    { id: 'bottom-left', label: 'Bottom Left' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => setPosition(pos.id as any)}
                      className={`p-2 rounded-lg border text-center font-medium cursor-pointer ${
                        position === pos.id
                          ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300 font-semibold'
                          : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Stage: Canvas Viewport */}
            <div className="flex-1 bg-slate-950 p-6 overflow-auto flex items-center justify-center relative select-none">
              <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] bg-[length:24px_24px]">
                <canvas ref={canvasRef} className="max-h-[65vh] max-w-full object-contain block" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
