import React, { useState, useRef, useEffect } from 'react';
import { ToolDefinition } from '../../types';
import {
  Layers,
  Type,
  Square,
  Circle,
  Star,
  Shield,
  Download,
  Upload,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RotateCcw,
  Sparkles,
  Palette,
  Sliders,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Grid,
  Move,
  FileCode,
  Check,
  Shapes,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

interface LogoElement {
  id: string;
  type: 'text' | 'shape' | 'icon';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  // Text specific
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  letterSpacing?: number;
  isCurved?: boolean;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  // Shape specific
  shapeType?: 'rect' | 'circle' | 'star' | 'shield' | 'hexagon' | 'triangle';
  fillColor?: string;
  borderRadius?: number;
  // Icon specific
  iconName?: string;
}

export const LogoMakerStudioWorkspace: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });
  const [bgType, setBgType] = useState<'transparent' | 'solid' | 'gradient'>('transparent');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [gradientStart, setGradientStart] = useState('#0f172a');
  const [gradientEnd, setGradientEnd] = useState('#1e293b');
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);

  const [elements, setElements] = useState<LogoElement[]>([
    {
      id: 'el-badge',
      type: 'shape',
      name: 'Badge Shield',
      shapeType: 'shield',
      x: 400,
      y: 350,
      width: 240,
      height: 280,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      fillColor: '#ef4444',
      strokeColor: '#b91c1c',
      strokeWidth: 4,
    },
    {
      id: 'el-brand-title',
      type: 'text',
      name: 'Brand Title',
      text: 'EDITMEE',
      fontFamily: 'Inter, sans-serif',
      fontSize: 54,
      fontWeight: '900',
      letterSpacing: 6,
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 0,
      x: 400,
      y: 350,
      width: 300,
      height: 60,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
    },
    {
      id: 'el-tagline',
      type: 'text',
      name: 'Tagline',
      text: 'STUDIO PRO',
      fontFamily: 'monospace',
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: 8,
      color: '#fca5a5',
      strokeColor: '#000000',
      strokeWidth: 0,
      x: 400,
      y: 410,
      width: 250,
      height: 30,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>('el-brand-title');
  const [activeTab, setActiveTab] = useState<'text' | 'shapes' | 'canvas' | 'layers'>('text');
  const [isExporting, setIsExporting] = useState(false);

  const selectedElement = elements.find((el) => el.id === selectedId);

  // Update selected element helper
  const updateSelected = (updates: Partial<LogoElement>) => {
    if (!selectedId) return;
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, ...updates } : el))
    );
  };

  // Add Element Helpers
  const addTextElement = () => {
    const newEl: LogoElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      name: `Text ${elements.length + 1}`,
      text: 'NEW BRAND',
      fontFamily: 'Inter, sans-serif',
      fontSize: 42,
      fontWeight: '800',
      letterSpacing: 4,
      color: '#0f172a',
      x: 400,
      y: 400,
      width: 260,
      height: 50,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
    setActiveTab('text');
  };

  const addShapeElement = (shapeType: LogoElement['shapeType']) => {
    const newEl: LogoElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      name: `${shapeType?.toUpperCase()} Shape`,
      shapeType,
      fillColor: '#3b82f6',
      strokeColor: '#1d4ed8',
      strokeWidth: 2,
      borderRadius: 16,
      x: 400,
      y: 400,
      width: 180,
      height: 180,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
    setActiveTab('shapes');
  };

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Background
    if (bgType === 'solid') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    } else if (bgType === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, canvasSize.width, canvasSize.height);
      grad.addColorStop(0, gradientStart);
      grad.addColorStop(1, gradientEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    }

    // Grid (if transparent or requested)
    if (showGrid && bgType === 'transparent') {
      ctx.save();
      const gridSize = 20;
      for (let x = 0; x < canvasSize.width; x += gridSize) {
        for (let y = 0; y < canvasSize.height; y += gridSize) {
          if ((x / gridSize + y / gridSize) % 2 === 0) {
            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(x, y, gridSize, gridSize);
          }
        }
      }
      ctx.restore();
    }

    // Render Elements
    elements.forEach((el) => {
      if (!el.visible) return;

      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.globalAlpha = el.opacity;

      if (el.type === 'shape') {
        ctx.fillStyle = el.fillColor || '#ef4444';
        if (el.strokeWidth && el.strokeColor) {
          ctx.lineWidth = el.strokeWidth;
          ctx.strokeStyle = el.strokeColor;
        }

        const hw = el.width / 2;
        const hh = el.height / 2;

        ctx.beginPath();
        if (el.shapeType === 'rect') {
          const r = el.borderRadius || 0;
          ctx.roundRect(-hw, -hh, el.width, el.height, r);
        } else if (el.shapeType === 'circle') {
          ctx.arc(0, 0, hw, 0, Math.PI * 2);
        } else if (el.shapeType === 'triangle') {
          ctx.moveTo(0, -hh);
          ctx.lineTo(hw, hh);
          ctx.lineTo(-hw, hh);
          ctx.closePath();
        } else if (el.shapeType === 'star') {
          const spikes = 5;
          const outerR = hw;
          const innerR = hw * 0.45;
          let rot = (Math.PI / 2) * 3;
          let cx = 0;
          let cy = 0;
          const step = Math.PI / spikes;

          ctx.moveTo(cx, cy - outerR);
          for (let i = 0; i < spikes; i++) {
            cx = Math.cos(rot) * outerR;
            cy = Math.sin(rot) * outerR;
            ctx.lineTo(cx, cy);
            rot += step;

            cx = Math.cos(rot) * innerR;
            cy = Math.sin(rot) * innerR;
            ctx.lineTo(cx, cy);
            rot += step;
          }
          ctx.lineTo(0, -outerR);
          ctx.closePath();
        } else if (el.shapeType === 'shield') {
          ctx.moveTo(0, -hh);
          ctx.lineTo(hw, -hh * 0.6);
          ctx.quadraticCurveTo(hw, hh * 0.4, 0, hh);
          ctx.quadraticCurveTo(-hw, hh * 0.4, -hw, -hh * 0.6);
          ctx.closePath();
        } else if (el.shapeType === 'hexagon') {
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const px = hw * Math.cos(angle);
            const py = hw * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        }

        ctx.fill();
        if (el.strokeWidth && el.strokeColor) {
          ctx.stroke();
        }
      } else if (el.type === 'text') {
        ctx.font = `${el.fontWeight || '700'} ${el.fontSize || 48}px ${el.fontFamily || 'sans-serif'}`;
        ctx.fillStyle = el.color || '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (el.letterSpacing && (ctx as any).letterSpacing !== undefined) {
          (ctx as any).letterSpacing = `${el.letterSpacing}px`;
        }

        if (el.strokeWidth && el.strokeColor && el.strokeWidth > 0) {
          ctx.lineWidth = el.strokeWidth;
          ctx.strokeStyle = el.strokeColor;
          ctx.strokeText(el.text || '', 0, 0);
        }

        ctx.fillText(el.text || '', 0, 0);
      }

      // If Selected Highlight Box
      if (el.id === selectedId) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([6 / zoom, 6 / zoom]);
        ctx.strokeRect(-el.width / 2 - 4, -el.height / 2 - 4, el.width + 8, el.height + 8);
      }

      ctx.restore();
    });
  }, [elements, canvasSize, bgType, bgColor, gradientStart, gradientEnd, showGrid, selectedId, zoom]);

  // Export handlers
  const handleExportPNG = (scale = 1) => {
    setIsExporting(true);
    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvasSize.width * scale;
      exportCanvas.height = canvasSize.height * scale;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);

      // Background
      if (bgType === 'solid') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      } else if (bgType === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, canvasSize.width, canvasSize.height);
        grad.addColorStop(0, gradientStart);
        grad.addColorStop(1, gradientEnd);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      }

      // Draw elements
      elements.forEach((el) => {
        if (!el.visible) return;
        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.globalAlpha = el.opacity;

        if (el.type === 'shape') {
          ctx.fillStyle = el.fillColor || '#ef4444';
          if (el.strokeWidth && el.strokeColor) {
            ctx.lineWidth = el.strokeWidth;
            ctx.strokeStyle = el.strokeColor;
          }

          const hw = el.width / 2;
          const hh = el.height / 2;
          ctx.beginPath();
          if (el.shapeType === 'rect') {
            const r = el.borderRadius || 0;
            ctx.roundRect(-hw, -hh, el.width, el.height, r);
          } else if (el.shapeType === 'circle') {
            ctx.arc(0, 0, hw, 0, Math.PI * 2);
          } else if (el.shapeType === 'shield') {
            ctx.moveTo(0, -hh);
            ctx.lineTo(hw, -hh * 0.6);
            ctx.quadraticCurveTo(hw, hh * 0.4, 0, hh);
            ctx.quadraticCurveTo(-hw, hh * 0.4, -hw, -hh * 0.6);
            ctx.closePath();
          } else if (el.shapeType === 'star') {
            const spikes = 5;
            const outerR = hw;
            const innerR = hw * 0.45;
            let rot = (Math.PI / 2) * 3;
            let cx = 0;
            let cy = 0;
            const step = Math.PI / spikes;
            ctx.moveTo(cx, cy - outerR);
            for (let i = 0; i < spikes; i++) {
              cx = Math.cos(rot) * outerR;
              cy = Math.sin(rot) * outerR;
              ctx.lineTo(cx, cy);
              rot += step;
              cx = Math.cos(rot) * innerR;
              cy = Math.sin(rot) * innerR;
              ctx.lineTo(cx, cy);
              rot += step;
            }
            ctx.lineTo(0, -outerR);
            ctx.closePath();
          }
          ctx.fill();
          if (el.strokeWidth && el.strokeColor) ctx.stroke();
        } else if (el.type === 'text') {
          ctx.font = `${el.fontWeight || '700'} ${el.fontSize || 48}px ${el.fontFamily || 'sans-serif'}`;
          ctx.fillStyle = el.color || '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (el.letterSpacing && (ctx as any).letterSpacing !== undefined) {
            (ctx as any).letterSpacing = `${el.letterSpacing}px`;
          }
          if (el.strokeWidth && el.strokeColor && el.strokeWidth > 0) {
            ctx.lineWidth = el.strokeWidth;
            ctx.strokeStyle = el.strokeColor;
            ctx.strokeText(el.text || '', 0, 0);
          }
          ctx.fillText(el.text || '', 0, 0);
        }
        ctx.restore();
      });

      const url = exportCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `logo-design-${scale}x.png`;
      link.click();

      storageEngine.addHistoryItem({
        toolId: 'logo-maker-studio',
        toolName: 'Logo Maker Studio',
        category: 'logo',
        status: 'completed',
        outputSummary: `Exported ${exportCanvas.width}x${exportCanvas.height}px PNG logo`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSVG = () => {
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasSize.width} ${canvasSize.height}" width="${canvasSize.width}" height="${canvasSize.height}">\n`;

    if (bgType === 'solid') {
      svgContent += `  <rect width="100%" height="100%" fill="${bgColor}"/>\n`;
    }

    elements.forEach((el) => {
      if (!el.visible) return;
      const opacity = el.opacity !== 1 ? ` opacity="${el.opacity}"` : '';
      const transform = ` transform="translate(${el.x}, ${el.y}) rotate(${el.rotation})"`;

      if (el.type === 'shape') {
        const hw = el.width / 2;
        const hh = el.height / 2;
        const fill = ` fill="${el.fillColor || '#ef4444'}"`;
        const stroke = el.strokeWidth ? ` stroke="${el.strokeColor || '#000000'}" stroke-width="${el.strokeWidth}"` : '';

        if (el.shapeType === 'rect') {
          svgContent += `  <rect x="${-hw}" y="${-hh}" width="${el.width}" height="${el.height}" rx="${el.borderRadius || 0}"${fill}${stroke}${transform}${opacity}/>\n`;
        } else if (el.shapeType === 'circle') {
          svgContent += `  <circle cx="0" cy="0" r="${hw}"${fill}${stroke}${transform}${opacity}/>\n`;
        } else if (el.shapeType === 'shield') {
          svgContent += `  <path d="M 0 ${-hh} L ${hw} ${-hh * 0.6} Q ${hw} ${hh * 0.4} 0 ${hh} Q ${-hw} ${hh * 0.4} ${-hw} ${-hh * 0.6} Z"${fill}${stroke}${transform}${opacity}/>\n`;
        }
      } else if (el.type === 'text') {
        const fill = ` fill="${el.color || '#ffffff'}"`;
        const font = ` font-family="${el.fontFamily || 'sans-serif'}" font-size="${el.fontSize || 48}" font-weight="${el.fontWeight || '700'}" letter-spacing="${el.letterSpacing || 0}px" text-anchor="middle" dominant-baseline="middle"`;
        svgContent += `  <text x="0" y="0"${font}${fill}${transform}${opacity}>${el.text}</text>\n`;
      }
    });

    svgContent += '</svg>';

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'logo-vector.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              Logo Maker Studio Pro
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                Vector Canvas
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Design professional vector logos, brandmarks, badges, and typography with transparent exports.
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleExportPNG(1)}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>PNG (1x)</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportPNG(2)}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-red-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>High-Res PNG (2x)</span>
          </button>
          <button
            type="button"
            onClick={handleExportSVG}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <FileCode className="w-4 h-4" />
            <span>Vector SVG</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Toolbar / Inspector (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Tab Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex gap-1 text-xs font-bold text-slate-400">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'text' ? 'bg-red-600 text-white shadow-xs' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shapes')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'shapes' ? 'bg-red-600 text-white shadow-xs' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Shapes className="w-3.5 h-3.5" />
              <span>Shapes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('canvas')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'canvas' ? 'bg-red-600 text-white shadow-xs' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('layers')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'layers' ? 'bg-red-600 text-white shadow-xs' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers</span>
            </button>
          </div>

          {/* Tab 1: Text Inspector */}
          {activeTab === 'text' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Typography Controls
                </h3>
                <button
                  type="button"
                  onClick={addTextElement}
                  className="flex items-center gap-1 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Text</span>
                </button>
              </div>

              {selectedElement && selectedElement.type === 'text' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Text Content
                    </label>
                    <input
                      type="text"
                      value={selectedElement.text || ''}
                      onChange={(e) => updateSelected({ text: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Font Family
                      </label>
                      <select
                        value={selectedElement.fontFamily || 'Inter, sans-serif'}
                        onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value="Inter, sans-serif">Modern Sans</option>
                        <option value="'Playfair Display', serif">Display Serif</option>
                        <option value="monospace">Tech Monospace</option>
                        <option value="cursive">Signature Script</option>
                        <option value="Impact, sans-serif">Bold Headline</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Font Weight
                      </label>
                      <select
                        value={selectedElement.fontWeight || '700'}
                        onChange={(e) => updateSelected({ fontWeight: e.target.value })}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value="400">Regular (400)</option>
                        <option value="600">Semibold (600)</option>
                        <option value="800">ExtraBold (800)</option>
                        <option value="900">Black (900)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Size: {selectedElement.fontSize}px
                      </label>
                      <input
                        type="range"
                        min={12}
                        max={140}
                        value={selectedElement.fontSize || 48}
                        onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                        className="w-full accent-red-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Spacing: {selectedElement.letterSpacing || 0}px
                      </label>
                      <input
                        type="range"
                        min={-4}
                        max={30}
                        value={selectedElement.letterSpacing || 0}
                        onChange={(e) => updateSelected({ letterSpacing: Number(e.target.value) })}
                        className="w-full accent-red-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedElement.color || '#ffffff'}
                          onChange={(e) => updateSelected({ color: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                        />
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {selectedElement.color}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Rotation: {selectedElement.rotation}°
                      </label>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        value={selectedElement.rotation || 0}
                        onChange={(e) => updateSelected({ rotation: Number(e.target.value) })}
                        className="w-full accent-red-600"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-slate-500">
                    Select a text element from the canvas or click "Add Text".
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Shapes Inspector */}
          {activeTab === 'shapes' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-slate-900">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Vector Shape Library
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => addShapeElement('shield')}
                  className="p-3 border border-slate-200 hover:border-red-500 rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Shield className="w-5 h-5 text-red-500" />
                  <span>Shield</span>
                </button>
                <button
                  type="button"
                  onClick={() => addShapeElement('circle')}
                  className="p-3 border border-slate-200 hover:border-red-500 rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Circle className="w-5 h-5 text-blue-500" />
                  <span>Circle</span>
                </button>
                <button
                  type="button"
                  onClick={() => addShapeElement('star')}
                  className="p-3 border border-slate-200 hover:border-red-500 rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Star className="w-5 h-5 text-amber-500" />
                  <span>Star</span>
                </button>
                <button
                  type="button"
                  onClick={() => addShapeElement('rect')}
                  className="p-3 border border-slate-200 hover:border-red-500 rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Square className="w-5 h-5 text-emerald-500" />
                  <span>Rectangle</span>
                </button>
                <button
                  type="button"
                  onClick={() => addShapeElement('triangle')}
                  className="p-3 border border-slate-200 hover:border-red-500 rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 border-b-2 border-r-2 border-indigo-500 rotate-45" />
                  <span>Triangle</span>
                </button>
                <button
                  type="button"
                  onClick={() => addShapeElement('hexagon')}
                  className="p-3 border border-slate-200 hover:border-red-500 rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Shapes className="w-5 h-5 text-purple-500" />
                  <span>Hexagon</span>
                </button>
              </div>

              {selectedElement && selectedElement.type === 'shape' && (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Fill Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedElement.fillColor || '#ef4444'}
                          onChange={(e) => updateSelected({ fillColor: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                        />
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {selectedElement.fillColor}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Stroke Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedElement.strokeColor || '#b91c1c'}
                          onChange={(e) => updateSelected({ strokeColor: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                        />
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {selectedElement.strokeColor}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Size: {selectedElement.width}px
                      </label>
                      <input
                        type="range"
                        min={40}
                        max={600}
                        value={selectedElement.width}
                        onChange={(e) =>
                          updateSelected({
                            width: Number(e.target.value),
                            height: Number(e.target.value),
                          })
                        }
                        className="w-full accent-red-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Stroke: {selectedElement.strokeWidth || 0}px
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        value={selectedElement.strokeWidth || 0}
                        onChange={(e) => updateSelected({ strokeWidth: Number(e.target.value) })}
                        className="w-full accent-red-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Canvas Setup */}
          {activeTab === 'canvas' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-slate-900">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Canvas Background & Guides
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Background Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['transparent', 'solid', 'gradient'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setBgType(mode)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                          bgType === mode
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {bgType === 'solid' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Solid Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-1"
                      />
                      <span className="text-xs font-mono font-bold text-slate-700">{bgColor}</span>
                    </div>
                  </div>
                )}

                {bgType === 'gradient' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Start Color
                      </label>
                      <input
                        type="color"
                        value={gradientStart}
                        onChange={(e) => setGradientStart(e.target.value)}
                        className="w-full h-9 rounded-xl border border-slate-200 cursor-pointer p-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        End Color
                      </label>
                      <input
                        type="color"
                        value={gradientEnd}
                        onChange={(e) => setGradientEnd(e.target.value)}
                        className="w-full h-9 rounded-xl border border-slate-200 cursor-pointer p-1"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Show Grid & Guides</span>
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Layer Manager */}
          {activeTab === 'layers' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-slate-900">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Layers ({elements.length})
                </h3>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {elements.map((el) => (
                  <div
                    key={el.id}
                    onClick={() => setSelectedId(el.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold cursor-pointer transition-colors ${
                      el.id === selectedId
                        ? 'border-red-500 bg-red-50/50 text-red-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {el.type === 'text' ? (
                        <Type className="w-4 h-4 text-slate-500 shrink-0" />
                      ) : (
                        <Shield className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className="truncate">{el.name}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setElements((prev) =>
                            prev.map((item) =>
                              item.id === el.id ? { ...item, visible: !item.visible } : item
                            )
                          );
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                      >
                        {el.visible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-red-500" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setElements((prev) => prev.filter((item) => item.id !== el.id));
                          if (selectedId === el.id) setSelectedId(null);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Canvas Stage (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[560px] relative overflow-hidden">
            {/* Viewport Zoom Controls */}
            <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-xs border border-slate-700 rounded-xl p-1.5 flex items-center gap-2 text-slate-300 text-xs font-bold z-10">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
                className="p-1 hover:bg-slate-700 rounded cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
                className="p-1 hover:bg-slate-700 rounded cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="px-2 py-0.5 hover:bg-slate-700 rounded text-[10px] cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Interactive Canvas Viewport */}
            <div
              className="border-2 border-slate-700/80 rounded-xl shadow-2xl overflow-hidden transition-transform duration-75"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="w-[440px] h-[440px] md:w-[520px] md:h-[520px] block cursor-crosshair"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const logoMakerStudioToolDef: ToolDefinition = {
  id: 'logo-maker-studio',
  name: 'Logo Maker Studio Pro',
  category: 'logo',
  subcategory: 'branding',
  description: 'Design professional vector logos, brand marks, and typography with transparent PNG & SVG export.',
  iconName: 'Sparkles',
  version: '2.0.0',
  tags: ['logo', 'brand', 'vector', 'svg', 'canvas', 'badge', 'typography', 'design'],
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
  customWorkspace: LogoMakerStudioWorkspace,
  execute: async () => {
    return {
      success: true,
      text: 'Logo Maker ready',
    };
  },
};
