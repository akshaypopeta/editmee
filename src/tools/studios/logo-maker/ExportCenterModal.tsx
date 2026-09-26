import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  FileCode,
  FileText,
  Image as ImageIcon,
  Archive,
  Check,
  Layers,
  Sparkles,
  Sliders,
  Maximize2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import JSZip from 'jszip';
import { LogoElement, CanvasDimensions, BrandKit } from './types';
import { generateVectorSvg } from './svgExporter';
import { exportVectorAsPdf } from './exportUtils';
import { renderThreeDElement } from './threeDRenderer';
import { drawShapeOnCanvas } from './vectorShapes';

export type ExportFormat = 'png' | 'svg' | 'jpg' | 'webp' | 'pdf' | 'pack';
export type ExportBg = 'transparent' | 'canvas' | 'white' | 'black';
export type ExportVariation = 'original' | 'monochrome-black' | 'monochrome-white' | 'icon-only' | 'inverted' | '3d-variant';

interface ExportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: LogoElement[];
  canvasSize: CanvasDimensions;
  bgType: 'transparent' | 'solid' | 'gradient';
  bgColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  projectName: string;
  brandKit: BrandKit;
}

interface DimensionPreset {
  id: string;
  name: string;
  category: 'Scale' | 'Social' | 'Logo' | 'Print';
  width: number;
  height: number;
  description: string;
}

const DIMENSION_PRESETS: DimensionPreset[] = [
  // Scale
  { id: '1x', name: 'Original 1x', category: 'Scale', width: 0, height: 0, description: 'Standard resolution' },
  { id: '2x', name: 'Retina 2x', category: 'Scale', width: 0, height: 0, description: 'Crisp display screens' },
  { id: '3x', name: 'Ultra 3x', category: 'Scale', width: 0, height: 0, description: 'High density displays' },
  { id: '4x', name: 'Master 4x', category: 'Scale', width: 0, height: 0, description: 'Ultra-res print & master' },
  // Social
  { id: 'ig-sq', name: 'Instagram Avatar', category: 'Social', width: 1080, height: 1080, description: '1080 × 1080 px' },
  { id: 'yt-icon', name: 'YouTube Channel', category: 'Social', width: 800, height: 800, description: '800 × 800 px' },
  { id: 'li-logo', name: 'LinkedIn Company', category: 'Social', width: 400, height: 400, description: '400 × 400 px' },
  { id: 'x-avatar', name: 'X / Twitter Profile', category: 'Social', width: 400, height: 400, description: '400 × 400 px' },
  // Logo
  { id: 'fav-32', name: 'Browser Favicon', category: 'Logo', width: 32, height: 32, description: '32 × 32 px standard' },
  { id: 'app-512', name: 'Mobile App Icon', category: 'Logo', width: 512, height: 512, description: '512 × 512 px store icon' },
  { id: 'web-hdr', name: 'Website Header', category: 'Logo', width: 600, height: 200, description: 'Wide horizontal lockup' },
  // Print
  { id: 'print-300', name: '300 DPI Print Master', category: 'Print', width: 2400, height: 2400, description: 'Commercial print ready' },
];

export const ExportCenterModal: React.FC<ExportCenterModalProps> = ({
  isOpen,
  onClose,
  elements,
  canvasSize,
  bgType,
  bgColor,
  gradientStart,
  gradientEnd,
  gradientAngle,
  projectName,
  brandKit,
}) => {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scalePreset, setScalePreset] = useState<string>('2x');
  const [bgOption, setBgOption] = useState<ExportBg>('transparent');
  const [variation, setVariation] = useState<ExportVariation>('original');
  const [customFilename, setCustomFilename] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const baseFilename = (customFilename.trim() || projectName || 'my-logo')
    .toLowerCase()
    .replace(/\s+/g, '-');

  // Compute target width and height based on selected preset
  const selectedPreset = DIMENSION_PRESETS.find((p) => p.id === scalePreset);
  let targetWidth = canvasSize.width;
  let targetHeight = canvasSize.height;

  if (selectedPreset) {
    if (selectedPreset.category === 'Scale') {
      const mult = selectedPreset.id === '1x' ? 1 : selectedPreset.id === '2x' ? 2 : selectedPreset.id === '3x' ? 3 : 4;
      targetWidth = canvasSize.width * mult;
      targetHeight = canvasSize.height * mult;
    } else {
      targetWidth = selectedPreset.width;
      targetHeight = selectedPreset.height;
    }
  }

  // Generate transformed elements for the chosen variation
  const getTransformedElements = (chosenVar: ExportVariation): LogoElement[] => {
    return elements.map((el) => {
      const clone: LogoElement = JSON.parse(JSON.stringify(el));

      if (chosenVar === 'monochrome-black') {
        clone.fillColor = '#000000';
        clone.fillType = 'solid';
        if (clone.stroke) clone.stroke.color = '#000000';
        if (clone.threeD) clone.threeD.enabled = false;
      } else if (chosenVar === 'monochrome-white') {
        clone.fillColor = '#ffffff';
        clone.fillType = 'solid';
        if (clone.stroke) clone.stroke.color = '#ffffff';
        if (clone.threeD) clone.threeD.enabled = false;
      } else if (chosenVar === 'inverted') {
        clone.fillColor = '#f8fafc';
        clone.fillType = 'solid';
        if (clone.threeD) clone.threeD.enabled = false;
      } else if (chosenVar === 'icon-only') {
        if (clone.type === 'text') clone.visible = false;
      } else if (chosenVar === '3d-variant') {
        if (!clone.threeD || !clone.threeD.enabled) {
          clone.threeD = {
            enabled: true,
            depth: 26,
            perspective: 0.35,
            rotX: 12,
            rotY: -14,
            rotZ: 0,
            lightAngle: 315,
            lightElevation: 45,
            lightIntensity: 1.2,
            ambientLight: 0.4,
            specular: 0.85,
            material: 'gold',
            roughness: 0.2,
            reflectivity: 0.85,
            bevelSize: 3,
            bevelStyle: 'sharp',
            shadowType: 'extrusion',
            shadowAngle: 315,
            shadowDistance: 22,
            shadowBlur: 18,
            shadowOpacity: 0.6,
            shadowColor: '#000000',
          };
        }
      }

      return clone;
    });
  };

  // Render preview canvas whenever options change
  useEffect(() => {
    if (!isOpen) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previewW = 360;
    const previewH = 360;
    canvas.width = previewW;
    canvas.height = previewH;

    ctx.clearRect(0, 0, previewW, previewH);

    // Background rendering
    if (bgOption === 'transparent') {
      const checkSize = 12;
      for (let x = 0; x < previewW; x += checkSize) {
        for (let y = 0; y < previewH; y += checkSize) {
          ctx.fillStyle = (Math.floor(x / checkSize) + Math.floor(y / checkSize)) % 2 === 0 ? '#1e293b' : '#0f172a';
          ctx.fillRect(x, y, checkSize, checkSize);
        }
      }
    } else if (bgOption === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, previewW, previewH);
    } else if (bgOption === 'black') {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, previewW, previewH);
    } else {
      // Canvas background
      if (bgType === 'solid') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, previewW, previewH);
      } else if (bgType === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, previewW, previewH);
        grad.addColorStop(0, gradientStart);
        grad.addColorStop(1, gradientEnd);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, previewW, previewH);
      } else {
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, previewW, previewH);
      }
    }

    // Scale elements to fit inside preview
    const scale = Math.min(previewW / canvasSize.width, previewH / canvasSize.height) * 0.85;
    const offsetX = (previewW - canvasSize.width * scale) / 2;
    const offsetY = (previewH - canvasSize.height * scale) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    const transformed = getTransformedElements(variation);

    transformed.forEach((el) => {
      if (!el.visible) return;

      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;
      if (el.blendMode) ctx.globalCompositeOperation = el.blendMode;

      ctx.translate(el.x, el.y);
      ctx.rotate((el.rotation * Math.PI) / 180);

      if (el.threeD && el.threeD.enabled) {
        renderThreeDElement(ctx, el);
        ctx.restore();
        return;
      }

      if (el.shadow && el.shadow.blur > 0) {
        ctx.shadowColor = el.shadow.color;
        ctx.shadowBlur = el.shadow.blur;
        ctx.shadowOffsetX = el.shadow.offsetX;
        ctx.shadowOffsetY = el.shadow.offsetY;
      }

      if (el.type === 'text') {
        const textContent = el.uppercase ? (el.text || '').toUpperCase() : el.text || '';
        ctx.font = `${el.fontStyle || 'normal'} ${el.fontWeight || '700'} ${el.fontSize || 36}px ${el.fontFamily || 'Inter, sans-serif'}`;
        ctx.textAlign = el.textAlign || 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = el.fillColor || '#000000';
        ctx.fillText(textContent, 0, 0);
      } else if (el.type === 'shape') {
        ctx.fillStyle = el.fillColor || '#000000';
        drawShapeOnCanvas(ctx, el);
      } else if (el.type === 'icon' && el.svgPath) {
        const iconSize = Math.min(el.width, el.height);
        const p2d = new Path2D(el.svgPath);
        const s = iconSize / 24;
        ctx.save();
        ctx.scale(s, s);
        ctx.translate(-12, -12);
        ctx.fillStyle = el.fillColor || '#000000';
        ctx.fill(p2d);
        ctx.restore();
      }

      ctx.restore();
    });

    ctx.restore();
  }, [isOpen, format, scalePreset, bgOption, variation, elements, canvasSize, bgType, bgColor, gradientStart, gradientEnd]);

  if (!isOpen) return null;

  // Render high-resolution canvas offscreen
  const renderOffscreenCanvas = (
    w: number,
    h: number,
    varType: ExportVariation,
    bg: ExportBg
  ): HTMLCanvasElement => {
    const offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return offscreen;

    // Background
    if (bg === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    } else if (bg === 'black') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
    } else if (bg === 'canvas') {
      if (bgType === 'solid') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);
      } else if (bgType === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, gradientStart);
        grad.addColorStop(1, gradientEnd);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
    }

    const scaleX = w / canvasSize.width;
    const scaleY = h / canvasSize.height;

    ctx.save();
    ctx.scale(scaleX, scaleY);

    const curElements = getTransformedElements(varType);

    curElements.forEach((el) => {
      if (!el.visible) return;

      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;
      if (el.blendMode) ctx.globalCompositeOperation = el.blendMode;

      ctx.translate(el.x, el.y);
      ctx.rotate((el.rotation * Math.PI) / 180);

      if (el.threeD && el.threeD.enabled) {
        renderThreeDElement(ctx, el);
        ctx.restore();
        return;
      }

      if (el.shadow && el.shadow.blur > 0) {
        ctx.shadowColor = el.shadow.color;
        ctx.shadowBlur = el.shadow.blur;
        ctx.shadowOffsetX = el.shadow.offsetX;
        ctx.shadowOffsetY = el.shadow.offsetY;
      }

      if (el.type === 'text') {
        const textContent = el.uppercase ? (el.text || '').toUpperCase() : el.text || '';
        ctx.font = `${el.fontStyle || 'normal'} ${el.fontWeight || '700'} ${el.fontSize || 36}px ${el.fontFamily || 'Inter, sans-serif'}`;
        ctx.textAlign = el.textAlign || 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = el.fillColor || '#000000';
        ctx.fillText(textContent, 0, 0);
      } else if (el.type === 'shape') {
        ctx.fillStyle = el.fillColor || '#000000';
        drawShapeOnCanvas(ctx, el);
      } else if (el.type === 'icon' && el.svgPath) {
        const iconSize = Math.min(el.width, el.height);
        const p2d = new Path2D(el.svgPath);
        const s = iconSize / 24;
        ctx.save();
        ctx.scale(s, s);
        ctx.translate(-12, -12);
        ctx.fillStyle = el.fillColor || '#000000';
        ctx.fill(p2d);
        ctx.restore();
      }

      ctx.restore();
    });

    ctx.restore();
    return offscreen;
  };

  const handleExecuteExport = async () => {
    setIsExporting(true);
    setProgressMsg('Rendering assets...');

    try {
      if (format === 'svg') {
        const svgString = generateVectorSvg({
          elements: getTransformedElements(variation),
          canvasSize: { width: targetWidth, height: targetHeight },
          bgType: bgOption === 'transparent' ? 'transparent' : bgType,
          bgColor: bgOption === 'white' ? '#ffffff' : bgOption === 'black' ? '#000000' : bgColor,
          gradientStart,
          gradientEnd,
          gradientAngle,
        });

        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        triggerDownload(blob, `${baseFilename}.svg`);
      } else if (format === 'png') {
        const canvas = renderOffscreenCanvas(targetWidth, targetHeight, variation, bgOption);
        canvas.toBlob((blob) => {
          if (blob) triggerDownload(blob, `${baseFilename}-${targetWidth}x${targetHeight}.png`);
        }, 'image/png');
      } else if (format === 'jpg') {
        const canvas = renderOffscreenCanvas(targetWidth, targetHeight, variation, bgOption === 'transparent' ? 'white' : bgOption);
        canvas.toBlob((blob) => {
          if (blob) triggerDownload(blob, `${baseFilename}.jpg`);
        }, 'image/jpeg', 0.95);
      } else if (format === 'webp') {
        const canvas = renderOffscreenCanvas(targetWidth, targetHeight, variation, bgOption);
        canvas.toBlob((blob) => {
          if (blob) triggerDownload(blob, `${baseFilename}.webp`);
        }, 'image/webp', 0.92);
      } else if (format === 'pdf') {
        const svgString = generateVectorSvg({
          elements: getTransformedElements(variation),
          canvasSize: { width: targetWidth, height: targetHeight },
          bgType: bgOption === 'transparent' ? 'transparent' : bgType,
          bgColor: bgOption === 'white' ? '#ffffff' : bgOption === 'black' ? '#000000' : bgColor,
          gradientStart,
          gradientEnd,
          gradientAngle,
        });
        exportVectorAsPdf(svgString, targetWidth, targetHeight, `${baseFilename}.pdf`);
      } else if (format === 'pack') {
        setProgressMsg('Building Complete Logo Pack (.zip)...');
        const zip = new JSZip();

        // 1. High-Res PNGs (Transparent & White & Black)
        const c2x = renderOffscreenCanvas(canvasSize.width * 2, canvasSize.height * 2, 'original', 'transparent');
        const c4x = renderOffscreenCanvas(canvasSize.width * 4, canvasSize.height * 4, 'original', 'transparent');
        const cMonoB = renderOffscreenCanvas(canvasSize.width * 2, canvasSize.height * 2, 'monochrome-black', 'transparent');
        const cMonoW = renderOffscreenCanvas(canvasSize.width * 2, canvasSize.height * 2, 'monochrome-white', 'black');
        const cIcon = renderOffscreenCanvas(512, 512, 'icon-only', 'transparent');
        const cFavicon = renderOffscreenCanvas(32, 32, 'icon-only', 'transparent');

        const b2x = await canvasToBlob(c2x, 'image/png');
        const b4x = await canvasToBlob(c4x, 'image/png');
        const bMonoB = await canvasToBlob(cMonoB, 'image/png');
        const bMonoW = await canvasToBlob(cMonoW, 'image/png');
        const bIcon = await canvasToBlob(cIcon, 'image/png');
        const bFav = await canvasToBlob(cFavicon, 'image/png');

        if (b2x) zip.file('01_PNG/logo-full-color-2x.png', b2x);
        if (b4x) zip.file('01_PNG/logo-master-ultra-4x.png', b4x);
        if (bMonoB) zip.file('01_PNG/logo-monochrome-black.png', bMonoB);
        if (bMonoW) zip.file('01_PNG/logo-monochrome-white.png', bMonoW);
        if (bIcon) zip.file('01_PNG/logo-icon-mark.png', bIcon);
        if (bFav) zip.file('03_Favicon/favicon-32x32.png', bFav);

        // 2. Vector SVG
        const svgCode = generateVectorSvg({
          elements: getTransformedElements('original'),
          canvasSize,
          bgType: 'transparent',
          bgColor: '#ffffff',
          gradientStart,
          gradientEnd,
          gradientAngle,
        });
        zip.file('02_Vector_SVG/logo-vector-master.svg', svgCode);

        // 3. Brand info sheet
        const brandNotes = `================================================
${brandKit.brandName.toUpperCase()} — BRAND ASSET PACK
================================================
Tagline: ${brandKit.tagline || 'N/A'}
Primary Color: ${brandKit.primaryColor}
Secondary Color: ${brandKit.secondaryColor}
Accent Color: ${brandKit.accentColor}
Heading Font: ${brandKit.fontHeading}
Body Font: ${brandKit.fontBody}

Exported via EditMee Logo Maker Studio Pro
Generated on: ${new Date().toLocaleDateString()}
`;
        zip.file('brand-guidelines-summary.txt', brandNotes);

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        triggerDownload(zipBlob, `${baseFilename}-brand-pack.zip`);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
      setProgressMsg('');
    }
  };

  const canvasToBlob = (canvas: HTMLCanvasElement, type: string): Promise<Blob | null> => {
    return new Promise((resolve) => canvas.toBlob(resolve, type));
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md">
              <Download className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Export Studio Pro
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Master Formats
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Vector SVG, High-Res PNG, WebP, Print PDF, and Complete Logo Packs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 2 Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left Column: Live Preview & Details (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 flex items-center justify-center shadow-inner">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full max-h-full object-contain shadow-lg"
              />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 bg-slate-950/85 backdrop-blur-md rounded-lg border border-slate-800 text-[11px] text-slate-300">
                <span className="font-mono font-medium">
                  {targetWidth} × {targetHeight} px
                </span>
                <span className="capitalize text-amber-400 font-semibold">{format.toUpperCase()}</span>
              </div>
            </div>

            {/* Filename Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">File Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder={projectName.toLowerCase().replace(/\s+/g, '-')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Background Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Background</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'transparent', label: 'Transparent' },
                  { id: 'canvas', label: 'Canvas BG' },
                  { id: 'white', label: 'Pure White' },
                  { id: 'black', label: 'Pure Black' },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setBgOption(bg.id as ExportBg)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
                      bgOption === bg.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Variation Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Logo Variation</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'original', label: 'Original' },
                  { id: '3d-variant', label: '3D Gold' },
                  { id: 'icon-only', label: 'Icon Only' },
                  { id: 'monochrome-black', label: 'Mono Black' },
                  { id: 'monochrome-white', label: 'Mono White' },
                  { id: 'inverted', label: 'Inverted' },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariation(v.id as ExportVariation)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
                      variation === v.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Format Tabs & Dimensions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            {/* Format Selection Cards */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Export Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'png',
                    title: 'PNG Image',
                    subtitle: 'Lossless & transparent',
                    icon: ImageIcon,
                    badge: 'Raster',
                  },
                  {
                    id: 'svg',
                    title: 'Vector SVG',
                    subtitle: 'Infinite resolution',
                    icon: FileCode,
                    badge: 'Vector',
                  },
                  {
                    id: 'pack',
                    title: 'Logo Pack (.ZIP)',
                    subtitle: 'Complete brand bundle',
                    icon: Archive,
                    badge: 'Pro Bundle',
                  },
                  {
                    id: 'webp',
                    title: 'WebP',
                    subtitle: 'Fast lightweight web',
                    icon: Sparkles,
                    badge: 'Web',
                  },
                  {
                    id: 'pdf',
                    title: 'Print PDF',
                    subtitle: 'Commercial printing',
                    icon: FileText,
                    badge: 'Print',
                  },
                  {
                    id: 'jpg',
                    title: 'JPG / JPEG',
                    subtitle: 'Universal photo',
                    icon: ImageIcon,
                    badge: 'Solid',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = format === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormat(item.id as ExportFormat)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800/90 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-100">{item.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resolution & Dimension Presets */}
            {format !== 'pack' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Scale & Dimension Presets
                  </label>
                  <span className="text-[11px] font-mono text-amber-400">
                    Target: {targetWidth} × {targetHeight} px
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DIMENSION_PRESETS.map((preset) => {
                    const isSelected = scalePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setScalePreset(preset.id)}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                            : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-slate-200">{preset.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{preset.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Logo Pack Contents Overview if pack is selected */}
            {format === 'pack' && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                  <Archive className="w-4 h-4" />
                  <span>Logo Pack Bundle Contents (.zip)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Primary Color PNG (2x Retina)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ultra Master PNG (4x 4096px)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Monochrome Black & White PNGs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Vector Master SVG File</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Browser Favicon (32 × 32 px)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Brand Colors & Font Guidelines</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isExporting ? (
              <span className="text-amber-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                {progressMsg}
              </span>
            ) : (
              <span>
                Ready to download <strong className="text-slate-200">{baseFilename}.{format === 'pack' ? 'zip' : format}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteExport}
              disabled={isExporting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{format === 'pack' ? 'Download Logo Pack (.zip)' : `Download ${format.toUpperCase()}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
