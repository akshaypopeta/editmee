import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ToolDefinition } from '../../../types';
import {
  Palette,
  Eye,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Check,
  Maximize2,
  Sparkles,
  Sliders,
  Upload,
  Image as ImageIcon,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Layers,
  Crop,
  Sun,
  Contrast,
  Droplet,
  Split,
  FileImage,
  RefreshCw,
  Hash,
  Shield,
  Tag,
  Grid,
} from 'lucide-react';
import { storageEngine } from '../../../core/storage-engine/StorageEngine';

interface Props {
  tool: ToolDefinition;
}

// High-quality default sample image (colorful abstract landscape data URL)
const DEFAULT_SAMPLE_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="40%" stop-color="#312e81" />
        <stop offset="70%" stop-color="#db2777" />
        <stop offset="100%" stop-color="#f97316" />
      </linearGradient>
      <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="100%" stop-color="#f97316" />
      </linearGradient>
      <linearGradient id="mountains" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4338ca" />
        <stop offset="100%" stop-color="#1e1b4b" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#sky)" />
    <circle cx="400" cy="350" r="140" fill="url(#sun)" />
    <polygon points="0,600 180,380 320,500 500,320 680,480 800,400 800,600" fill="url(#mountains)" opacity="0.9" />
    <polygon points="0,600 240,460 420,560 620,440 800,530 800,600" fill="#0f172a" opacity="0.95" />
    <text x="400" y="560" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">EDITMEE IMAGE STUDIO</text>
  </svg>
`);

export const ImageColorArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  const toolId = tool.id.toLowerCase();
  const name = tool.name.toLowerCase();

  // Detect specific operational mode
  const mode = useMemo(() => {
    if (name.includes('pixel') || toolId.includes('pixel') || name.includes('mosaic') || toolId.includes('mosaic')) return 'pixel-art';
    if (name.includes('dither') || toolId.includes('dither') || name.includes('halftone')) return 'dither';
    if (name.includes('glitch') || toolId.includes('glitch') || name.includes('chromatic')) return 'glitch';
    if (name.includes('duotone') || toolId.includes('duotone') || name.includes('gradient map')) return 'duotone';
    if (name.includes('vignette') || toolId.includes('vignette')) return 'vignette';
    if (name.includes('selective color') || toolId.includes('selective-color') || name.includes('splash')) return 'selective-color';
    if (name.includes('hdr') || toolId.includes('hdr') || name.includes('dynamic range')) return 'hdr';
    if (name.includes('sharpen') || toolId.includes('sharpen') || name.includes('unsharp')) return 'sharpen';
    if (name.includes('tilt') || toolId.includes('tilt') || name.includes('depth of field')) return 'tilt-shift';
    if (name.includes('sobel') || toolId.includes('sobel') || name.includes('edge detect') || name.includes('solarize')) return 'sobel';
    if (name.includes('emboss') || toolId.includes('emboss') || name.includes('relief')) return 'emboss';
    if (name.includes('oil paint') || toolId.includes('oil-paint') || name.includes('watercolor')) return 'oil-paint';
    if (name.includes('thermal') || toolId.includes('thermal') || name.includes('infrared')) return 'thermal';
    if (name.includes('channel mixer') || toolId.includes('channel-mixer') || name.includes('channel isolat')) return 'channel-mixer';
    if (name.includes('dominant') || toolId.includes('dominant') || name.includes('swatch')) return 'dominant-palette';
    if (name.includes('temperature') || toolId.includes('temperature') || name.includes('white balance') || name.includes('tint')) return 'temperature';
    if (name.includes('geolocation') || toolId.includes('geolocation') || name.includes('exif metadata & gps')) return 'exif-stripper';
    if (name.includes('inspector') || toolId.includes('exif-inspector') || name.includes('header inspector')) return 'exif-inspector';
    if (name.includes('favicon') || toolId.includes('favicon')) return 'favicon';
    if (name.includes('social banner') || toolId.includes('social-banner') || name.includes('cover cropper')) return 'social-banner';
    if (name.includes('square fit') || toolId.includes('square-fit') || name.includes('no-crop')) return 'square-fit';
    if (name.includes('dpi') || toolId.includes('dpi') || name.includes('resampler')) return 'dpi-resampler';
    if (name.includes('flip') || toolId.includes('flip') || name.includes('mirror') || name.includes('lossless jpeg')) return 'flip-mirror';
    if (name.includes('polaroid') || toolId.includes('polaroid')) return 'polaroid';
    if (name.includes('corner') || toolId.includes('corner') || name.includes('squircle') || name.includes('radiuser')) return 'rounded-corners';
    if (name.includes('perspective') || toolId.includes('perspective') || name.includes('skew')) return 'perspective';
    if (name.includes('stitch') || toolId.includes('stitch') || name.includes('side-by-side')) return 'stitcher';
    if (name.includes('contact sheet') || toolId.includes('contact-sheet') || name.includes('proof grid')) return 'contact-sheet';
    if (name.includes('grid') || toolId.includes('split') || name.includes('panorama splitter')) return 'split-tiles';
    if (name.includes('watermark') || toolId.includes('watermark')) return 'watermark';
    if (name.includes('histogram') || toolId.includes('histogram') || name.includes('waveform')) return 'histogram';
    if (name.includes('aspect') || name.includes('ratio') || toolId.includes('aspect')) return 'aspect-calculator';
    if (name.includes('contrast') || toolId.includes('contrast') || name.includes('wcag')) return 'contrast';
    return 'pixel-art'; // fallback default image canvas processor
  }, [name, toolId]);

  // Image source state
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_SAMPLE_IMAGE);
  const [fileName, setFileName] = useState<string>('sample-artwork.jpg');
  const [imageDims, setImageDims] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // References
  const sourceImgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dedicated controls per tool
  const [pixelSize, setPixelSize] = useState<number>(16);
  const [colorCount, setColorCount] = useState<number>(16);
  const [ditherMode, setDitherMode] = useState<'floyd' | 'halftone'>('floyd');
  const [glitchShift, setGlitchShift] = useState<number>(14);
  const [glitchScanlines, setGlitchScanlines] = useState<boolean>(true);
  const [duoColor1, setDuoColor1] = useState<string>('#0f172a');
  const [duoColor2, setDuoColor2] = useState<string>('#38bdf8');
  const [vignetteRadius, setVignetteRadius] = useState<number>(60);
  const [vignetteDarkness, setVignetteDarkness] = useState<number>(85);
  const [targetHue, setTargetHue] = useState<number>(0); // Red
  const [hueTolerance, setHueTolerance] = useState<number>(35);
  const [exposureBoost, setExposureBoost] = useState<number>(25);
  const [contrastBoost, setContrastBoost] = useState<number>(30);
  const [sharpenAmount, setSharpenAmount] = useState<number>(40);
  const [tiltFocusY, setTiltFocusY] = useState<number>(50);
  const [tiltBandHeight, setTiltBandHeight] = useState<number>(30);
  const [sobelNeon, setSobelNeon] = useState<string>('#00ffcc');
  const [sobelInvert, setSobelInvert] = useState<boolean>(false);
  const [embossDepth, setEmbossDepth] = useState<number>(3);
  const [oilRadius, setOilRadius] = useState<number>(4);
  const [thermalPalette, setThermalPalette] = useState<'ironbow' | 'rainbow' | 'nightvision'>('ironbow');
  const [channelRed, setChannelRed] = useState<boolean>(true);
  const [channelGreen, setChannelGreen] = useState<boolean>(true);
  const [channelBlue, setChannelBlue] = useState<boolean>(true);
  const [kelvinTemp, setKelvinTemp] = useState<number>(0); // -100 to 100
  const [tintShift, setTintShift] = useState<number>(0);
  const [squareBgMode, setSquareBgMode] = useState<'blur' | 'white' | 'black'>('blur');
  const [polaroidCaption, setPolaroidCaption] = useState<string>('Memories • EditMee Studio');
  const [cornerRadius, setCornerRadius] = useState<number>(40);
  const [watermarkText, setWatermarkText] = useState<string>('© EditMee Protected');
  const [watermarkPos, setWatermarkPos] = useState<'center' | 'bottom-right' | 'diagonal'>('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(70);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [targetDpi, setTargetDpi] = useState<number>(300);

  // Extracted dominant swatches
  const [extractedSwatches, setExtractedSwatches] = useState<string[]>(['#0f172a', '#312e81', '#db2777', '#f97316', '#4338ca', '#fef08a']);

  // Contrast checker state
  const [fgColor, setFgColor] = useState<string>('#ffffff');
  const [bgColor, setBgColor] = useState<string>('#0f172a');

  // Aspect ratio state
  const [aspectWidth, setAspectWidth] = useState<number>(1920);
  const [aspectHeight, setAspectHeight] = useState<number>(1080);
  const [targetWidth, setTargetWidth] = useState<number>(1280);

  // Load image dimensions when source changes
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      sourceImgRef.current = img;
      setImageDims({ width: img.naturalWidth || 800, height: img.naturalHeight || 600 });
      applyProcessing(img);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Trigger processing on settings change
  useEffect(() => {
    if (sourceImgRef.current) {
      applyProcessing(sourceImgRef.current);
    }
  }, [
    mode,
    pixelSize,
    colorCount,
    ditherMode,
    glitchShift,
    glitchScanlines,
    duoColor1,
    duoColor2,
    vignetteRadius,
    vignetteDarkness,
    targetHue,
    hueTolerance,
    exposureBoost,
    contrastBoost,
    sharpenAmount,
    tiltFocusY,
    tiltBandHeight,
    sobelNeon,
    sobelInvert,
    embossDepth,
    oilRadius,
    thermalPalette,
    channelRed,
    channelGreen,
    channelBlue,
    kelvinTemp,
    tintShift,
    squareBgMode,
    polaroidCaption,
    cornerRadius,
    watermarkText,
    watermarkPos,
    watermarkOpacity,
    flipH,
    flipV,
    rotationDeg,
    targetDpi,
  ]);

  // Core Canvas Processing Engine
  const applyProcessing = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const w = img.naturalWidth || 800;
    const h = img.naturalHeight || 600;

    // Set canvas dimensions based on mode
    if (mode === 'square-fit') {
      const maxSide = Math.max(w, h);
      canvas.width = maxSide;
      canvas.height = maxSide;
    } else if (mode === 'polaroid') {
      canvas.width = w + 80;
      canvas.height = h + 180;
    } else if (rotationDeg === 90 || rotationDeg === 270) {
      canvas.width = h;
      canvas.height = w;
    } else {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mode: Square Fit
    if (mode === 'square-fit') {
      const maxSide = Math.max(w, h);
      if (squareBgMode === 'blur') {
        ctx.save();
        ctx.filter = 'blur(20px)';
        ctx.drawImage(img, -20, -20, maxSide + 40, maxSide + 40);
        ctx.restore();
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, 0, maxSide, maxSide);
      } else if (squareBgMode === 'white') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, maxSide, maxSide);
      } else {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, maxSide, maxSide);
      }
      const offsetX = (maxSide - w) / 2;
      const offsetY = (maxSide - h) / 2;
      ctx.drawImage(img, offsetX, offsetY, w, h);
      return;
    }

    // Mode: Polaroid
    if (mode === 'polaroid') {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.shadowColor = 'transparent';

      // Draw photo
      ctx.drawImage(img, 40, 40, w, h);

      // Draw caption
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 24px cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(polaroidCaption, canvas.width / 2, h + 110);
      return;
    }

    // Standard base draw with transforms (Flip & Rotate)
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (rotationDeg !== 0) ctx.rotate((rotationDeg * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();

    // Mode: Rounded Corners / Squircle
    if (mode === 'rounded-corners') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      const r = Math.min(cornerRadius, Math.min(w, h) / 2);
      ctx.moveTo(r, 0);
      ctx.lineTo(w - r, 0);
      ctx.quadraticCurveTo(w, 0, w, r);
      ctx.lineTo(w, h - r);
      ctx.quadraticCurveTo(w, h, w - r, h);
      ctx.lineTo(r, h);
      ctx.quadraticCurveTo(0, h, 0, h - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    // Pixel Manipulation Operations
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const len = data.length;

    // 1. Pixel Art & Mosaic
    if (mode === 'pixel-art') {
      const size = Math.max(2, pixelSize);
      for (let y = 0; y < canvas.height; y += size) {
        for (let x = 0; x < canvas.width; x += size) {
          const redIdx = (y * canvas.width + x) * 4;
          let r = data[redIdx];
          let g = data[redIdx + 1];
          let b = data[redIdx + 2];

          // Reduce colors if needed
          if (colorCount < 64) {
            const step = 256 / colorCount;
            r = Math.floor(r / step) * step;
            g = Math.floor(g / step) * step;
            b = Math.floor(b / step) * step;
          }

          for (let dy = 0; dy < size && y + dy < canvas.height; dy++) {
            for (let dx = 0; dx < size && x + dx < canvas.width; dx++) {
              const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
            }
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    // 2. Duotone & Gradient Map
    if (mode === 'duotone') {
      const hexToRgb = (hex: string) => {
        const num = parseInt(hex.replace('#', ''), 16);
        return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
      };
      const [r1, g1, b1] = hexToRgb(duoColor1);
      const [r2, g2, b2] = hexToRgb(duoColor2);

      for (let i = 0; i < len; i += 4) {
        const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
        data[i] = Math.round(r1 + (r2 - r1) * lum);
        data[i + 1] = Math.round(g1 + (g2 - g1) * lum);
        data[i + 2] = Math.round(b1 + (b2 - b1) * lum);
      }
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    // 3. Thermal / Infrared Heatmap
    if (mode === 'thermal') {
      for (let i = 0; i < len; i += 4) {
        const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
        if (thermalPalette === 'ironbow') {
          data[i] = Math.min(255, lum * 350); // Red
          data[i + 1] = Math.max(0, Math.sin(lum * Math.PI) * 220); // Green
          data[i + 2] = Math.max(0, 255 - lum * 300); // Blue
        } else if (thermalPalette === 'nightvision') {
          data[i] = 0;
          data[i + 1] = Math.min(255, lum * 280);
          data[i + 2] = Math.min(60, lum * 60);
        } else {
          // Rainbow
          data[i] = Math.round(Math.sin(lum * Math.PI * 2) * 127 + 128);
          data[i + 1] = Math.round(Math.sin((lum + 0.33) * Math.PI * 2) * 127 + 128);
          data[i + 2] = Math.round(Math.sin((lum + 0.66) * Math.PI * 2) * 127 + 128);
        }
      }
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    // 4. Glitch & Chromatic Aberration
    if (mode === 'glitch') {
      const shift = glitchShift;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          const shiftIdx = (y * canvas.width + Math.min(canvas.width - 1, x + shift)) * 4;
          data[idx] = data[shiftIdx]; // Offset red channel
          if (glitchScanlines && y % 4 === 0) {
            data[idx] *= 0.65;
            data[idx + 1] *= 0.65;
            data[idx + 2] *= 0.65;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    // 5. Channel Mixer
    if (mode === 'channel-mixer') {
      for (let i = 0; i < len; i += 4) {
        if (!channelRed) data[i] = 0;
        if (!channelGreen) data[i + 1] = 0;
        if (!channelBlue) data[i + 2] = 0;
      }
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    // 6. Color Temperature & Tint
    if (mode === 'temperature') {
      const rMod = kelvinTemp > 0 ? (kelvinTemp / 100) * 45 : 0;
      const bMod = kelvinTemp < 0 ? (-kelvinTemp / 100) * 45 : 0;
      const gMod = (tintShift / 100) * 35;

      for (let i = 0; i < len; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i] + rMod));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + gMod));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + bMod));
      }
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    // 7. Vignette
    if (mode === 'vignette') {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy) * (vignetteRadius / 100);
      const darkness = vignetteDarkness / 100;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
          if (dist > maxDist) {
            const factor = Math.max(0, 1 - ((dist - maxDist) / (Math.sqrt(cx * cx + cy * cy) - maxDist)) * darkness);
            data[idx] *= factor;
            data[idx + 1] *= factor;
            data[idx + 2] *= factor;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    // 8. Watermark Stamper
    if (mode === 'watermark') {
      ctx.putImageData(imgData, 0, 0);
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${watermarkOpacity / 100})`;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 8;
      ctx.font = 'bold 36px system-ui, sans-serif';

      if (watermarkPos === 'center') {
        ctx.textAlign = 'center';
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);
      } else if (watermarkPos === 'bottom-right') {
        ctx.textAlign = 'right';
        ctx.fillText(watermarkText, canvas.width - 30, canvas.height - 30);
      } else {
        // Diagonal
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.textAlign = 'center';
        ctx.fillText(watermarkText, 0, 0);
      }
      ctx.restore();
      return;
    }

    // Default put
    ctx.putImageData(imgData, 0, 0);
  };

  // Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
      }
    };
    reader.readAsDataURL(f);
  };

  // Download handler
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `processed-${tool.id}-${fileName.replace(/\.[^/.]+$/, '')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    storageEngine.addHistoryItem({
      toolId: tool.id,
      toolName: tool.name,
      category: tool.category,
      status: 'completed',
      outputSummary: `Processed and downloaded ${tool.name} result (${canvas.width}×${canvas.height}px)`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Primary 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Control Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-600 dark:text-red-400" />
                {tool.name} Parameters
              </h2>
              <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/50">
                100% In-Browser Engine
              </span>
            </div>

            {/* Upload or Change Source */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Input Source</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageSrc(DEFAULT_SAMPLE_IMAGE);
                    setFileName('sample-artwork.jpg');
                  }}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset Sample
                </button>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block font-mono">
                Active: {fileName} ({imageDims.width}×{imageDims.height}px)
              </span>
            </div>

            {/* Dynamic Controls depending on mode */}
            {mode === 'pixel-art' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Mosaic Pixel Size</span>
                    <span className="font-mono text-red-600">{pixelSize} px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="64"
                    value={pixelSize}
                    onChange={(e) => setPixelSize(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Color Reduction Palette</span>
                    <span className="font-mono text-red-600">{colorCount} colors</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[4, 8, 16, 64].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setColorCount(count)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                          colorCount === count
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {count === 64 ? 'Full' : `${count}-bit`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {mode === 'duotone' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Shadows Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={duoColor1}
                        onChange={(e) => setDuoColor1(e.target.value)}
                        className="w-10 h-8 p-0.5 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-600">{duoColor1}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Highlights Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={duoColor2}
                        onChange={(e) => setDuoColor2(e.target.value)}
                        className="w-10 h-8 p-0.5 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-600">{duoColor2}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Curated Presets
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setDuoColor1('#09203f'); setDuoColor2('#537895'); }}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 cursor-pointer"
                    >
                      Midnight Blue
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDuoColor1('#1e1b4b'); setDuoColor2('#ec4899'); }}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 cursor-pointer"
                    >
                      Cyberpunk Neon
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDuoColor1('#14532d'); setDuoColor2('#facc15'); }}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 cursor-pointer"
                    >
                      Forest Gold
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDuoColor1('#451a03'); setDuoColor2('#fde047'); }}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 cursor-pointer"
                    >
                      Vintage Amber
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mode === 'glitch' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>RGB Split Displacement</span>
                    <span className="font-mono text-red-600">{glitchShift} px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={glitchShift}
                    onChange={(e) => setGlitchShift(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">CRT Scanlines Overlay</span>
                  <input
                    type="checkbox"
                    checked={glitchScanlines}
                    onChange={(e) => setGlitchScanlines(e.target.checked)}
                    className="w-4 h-4 accent-red-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {mode === 'vignette' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Vignette Radius</span>
                    <span className="font-mono text-red-600">{vignetteRadius}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    value={vignetteRadius}
                    onChange={(e) => setVignetteRadius(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Vignette Darkness</span>
                    <span className="font-mono text-red-600">{vignetteDarkness}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={vignetteDarkness}
                    onChange={(e) => setVignetteDarkness(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {mode === 'temperature' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Kelvin Balance (Cool to Warm)</span>
                    <span className="font-mono text-red-600">{kelvinTemp > 0 ? `+${kelvinTemp}` : kelvinTemp}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={kelvinTemp}
                    onChange={(e) => setKelvinTemp(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Tint (Green to Magenta)</span>
                    <span className="font-mono text-red-600">{tintShift > 0 ? `+${tintShift}` : tintShift}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={tintShift}
                    onChange={(e) => setTintShift(Number(e.target.value))}
                    className="w-full accent-fuchsia-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {mode === 'watermark' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Watermark Text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Position Placement</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['center', 'bottom-right', 'diagonal'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setWatermarkPos(pos)}
                        className={`py-1.5 text-xs font-bold capitalize rounded-lg border cursor-pointer ${
                          watermarkPos === pos
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {pos.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Opacity</span>
                    <span className="font-mono text-red-600">{watermarkOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {mode === 'polaroid' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Polaroid Bottom Caption</label>
                  <input
                    type="text"
                    value={polaroidCaption}
                    onChange={(e) => setPolaroidCaption(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {mode === 'rounded-corners' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Corner Border Radius</span>
                    <span className="font-mono text-red-600">{cornerRadius} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    value={cornerRadius}
                    onChange={(e) => setCornerRadius(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {mode === 'flip-mirror' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFlipH(!flipH)}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer ${
                      flipH ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <FlipHorizontal className="w-4 h-4" /> Flip Horizontal
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipV(!flipV)}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer ${
                      flipV ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <FlipVertical className="w-4 h-4" /> Flip Vertical
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[0, 90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setRotationDeg(deg)}
                      className={`py-2 text-xs font-bold rounded-lg border cursor-pointer ${
                        rotationDeg === deg
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer touch-manipulation"
              >
                <Download className="w-4 h-4" /> Download Processed Output (PNG)
              </button>
            </div>
          </div>
        </div>

        {/* Right Canvas Live Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Generated Canvas Preview
              </span>
              <span className="text-xs font-mono text-slate-400">
                {imageDims.width} × {imageDims.height} px
              </span>
            </div>

            {/* Canvas Container */}
            <div className="w-full min-h-[360px] max-h-[580px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center p-4 relative">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[520px] object-contain rounded-lg shadow-md border border-slate-800/60"
              />
            </div>

            {/* Status Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero server telemetry • Processed strictly in client browser memory</span>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Save PNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
