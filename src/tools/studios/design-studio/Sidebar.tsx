import React, { useState } from 'react';
import {
  LayoutTemplate,
  Square,
  Type,
  Image as ImageIcon,
  PenTool,
  QrCode,
  Palette,
  Sparkles,
  Layers,
  Smile,
  Plus,
  Upload,
  Search,
  Check,
  Zap,
  ChevronLeft,
  X,
} from 'lucide-react';
import {
  ActiveSidebarTab,
  DesignElement,
  CanvasSettings,
  ShapeType,
  BrandKit,
} from './types';
import { DESIGN_TEMPLATES, DesignTemplate } from './templates';
import { VECTOR_SHAPES, VECTOR_ICONS } from './vectorAssets';
import { generateQrDataUrl } from './qrGenerator';

interface SidebarProps {
  activeTab: ActiveSidebarTab;
  onSelectTab: (tab: ActiveSidebarTab) => void;
  onAddElement: (element: Partial<DesignElement>) => void;
  onLoadTemplate: (template: DesignTemplate) => void;
  canvasSettings: CanvasSettings;
  onUpdateCanvasSettings: (updates: Partial<CanvasSettings>) => void;
  brandKit: BrandKit;
  onUpdateBrandKit: (kit: Partial<BrandKit>) => void;
  onApplyBrandPalette: () => void;
  onTriggerImport: () => void;
  onOpenAi: () => void;
  drawingTool: 'brush' | 'pencil' | 'highlighter' | 'eraser';
  onChangeDrawingTool: (tool: 'brush' | 'pencil' | 'highlighter' | 'eraser') => void;
  drawColor: string;
  onChangeDrawColor: (color: string) => void;
  drawWidth: number;
  onChangeDrawWidth: (width: number) => void;
  isDrawingMode: boolean;
  onToggleDrawingMode: () => void;
  isDrawerOpen?: boolean;
  onToggleDrawer?: (open: boolean) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onAddElement,
  onLoadTemplate,
  canvasSettings,
  onUpdateCanvasSettings,
  brandKit,
  onUpdateBrandKit,
  onApplyBrandPalette,
  onTriggerImport,
  onOpenAi,
  drawingTool,
  onChangeDrawingTool,
  drawColor,
  onChangeDrawColor,
  drawWidth,
  onChangeDrawWidth,
  isDrawingMode,
  onToggleDrawingMode,
  isDrawerOpen = true,
  onToggleDrawer,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [templateFilter, setTemplateFilter] = useState<string>('All');
  const [qrInput, setQrInput] = useState<string>('https://editmee.com');
  const [qrColor, setQrColor] = useState<string>('#000000');
  const [qrBgColor, setQrBgColor] = useState<string>('#ffffff');
  const [iconSearch, setIconSearch] = useState<string>('');

  const navTabs = [
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'shapes', label: 'Shapes', icon: Square },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'draw', label: 'Draw', icon: PenTool },
    { id: 'qr', label: 'QR Code', icon: QrCode },
    { id: 'brand', label: 'Brand Kit', icon: Palette },
    { id: 'background', label: 'Canvas', icon: Layers },
    { id: 'ai', label: 'AI Studio', icon: Sparkles },
  ] as const;

  // Filtered Templates
  const filteredTemplates = DESIGN_TEMPLATES.filter((t) => {
    if (templateFilter === 'All') return true;
    return t.category === templateFilter;
  });

  // Filtered Icons
  const filteredIcons = VECTOR_ICONS.filter((i) =>
    i.name.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const renderTabContent = () => (
    <>
      {/* TAB 1: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
              Design Templates
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              One-click responsive creative layouts ready for customization.
            </p>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 mb-4">
              {['All', 'Social', 'Marketing', 'Creative', 'Events'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTemplateFilter(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                    templateFilter === cat
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 gap-3">
              {filteredTemplates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onLoadTemplate(t)}
                  className="group relative rounded-xl border border-slate-800 bg-slate-950/40 p-3 hover:border-red-500/50 transition-all cursor-pointer overflow-hidden"
                >
                  <div
                    className="h-28 rounded-lg mb-2 flex flex-col justify-end p-2.5 relative overflow-hidden border border-slate-800/60"
                    style={{
                      background:
                        t.canvas.bgType === 'gradient'
                          ? `linear-gradient(${t.canvas.gradientAngle}deg, ${t.canvas.gradientStart}, ${t.canvas.gradientEnd})`
                          : t.canvas.bgColor,
                    }}
                  >
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-bold text-slate-300">
                      {t.canvas.width}×{t.canvas.height}
                    </div>
                    <div className="text-xs font-bold text-white drop-shadow truncate">
                      {t.elements[1]?.text || t.name}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{t.category} • {t.elements.length} layers</div>
                    </div>
                    <span className="text-xs text-red-400 font-black opacity-0 group-hover:opacity-100 transition-opacity">
                      Load →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TEXT */}
        {activeTab === 'text' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
              Typography
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Click to insert styled text blocks onto the canvas.
            </p>

            <div className="space-y-2 mb-6">
              <button
                type="button"
                onClick={() =>
                  onAddElement({
                    type: 'text',
                    text: 'Add a bold heading',
                    fontSize: 48,
                    fontWeight: '900',
                    width: 480,
                    height: 70,
                    textColor: '#ffffff',
                  })
                }
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-red-500/50 transition-all cursor-pointer flex items-center justify-between"
              >
                <span className="text-lg font-black text-white">Add a Heading</span>
                <Plus className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() =>
                  onAddElement({
                    type: 'text',
                    text: 'Add a sub-heading line for secondary context',
                    fontSize: 26,
                    fontWeight: '600',
                    width: 440,
                    height: 48,
                    textColor: '#94a3b8',
                  })
                }
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-red-500/50 transition-all cursor-pointer flex items-center justify-between"
              >
                <span className="text-sm font-bold text-slate-300">Add a Sub-heading</span>
                <Plus className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() =>
                  onAddElement({
                    type: 'text',
                    text: 'Write detailed body paragraph text here describing your product or message clearly.',
                    fontSize: 18,
                    fontWeight: 'normal',
                    width: 400,
                    height: 60,
                    textColor: '#cbd5e1',
                    lineHeight: 1.4,
                  })
                }
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-red-500/50 transition-all cursor-pointer flex items-center justify-between"
              >
                <span className="text-xs text-slate-400">Add a Body Paragraph</span>
                <Plus className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Curated Typographic Styles */}
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Featured Text Styles
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() =>
                  onAddElement({
                    type: 'text',
                    text: 'LIMITED OFFER 50% OFF',
                    fontSize: 24,
                    fontWeight: 'bold',
                    width: 340,
                    height: 48,
                    textColor: '#ffffff',
                    textAlign: 'center',
                    textBackground: {
                      enabled: true,
                      color: '#ef4444',
                      padding: 10,
                      radius: 999,
                    },
                  })
                }
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500/40 text-center cursor-pointer"
              >
                <span className="inline-block px-3 py-1 bg-red-600 rounded-full text-xs font-bold text-white">
                  LIMITED OFFER 50% OFF
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onAddElement({
                    type: 'text',
                    text: '“Design is intelligence made visible.”',
                    fontSize: 28,
                    fontStyle: 'italic',
                    fontFamily: 'Georgia, serif',
                    width: 440,
                    height: 80,
                    textColor: '#f59e0b',
                  })
                }
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500/40 text-left cursor-pointer"
              >
                <span className="text-sm italic font-serif text-amber-400">
                  “Design is intelligence made visible.”
                </span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SHAPES & ICONS */}
        {activeTab === 'shapes' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
              Vector Shapes & Icons
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Geometry, heraldic crests, badges, and vector glyphs.
            </p>

            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Geometry & Badges
            </h4>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {VECTOR_SHAPES.map((shape) => (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() =>
                    onAddElement({
                      type: 'shape',
                      name: shape.name,
                      shapeType: shape.type,
                      width: shape.type === 'line' ? 300 : 160,
                      height: shape.type === 'line' ? 4 : 160,
                      fillColor: '#3b82f6',
                      strokeWidth: 0,
                    })
                  }
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-red-500/50 flex flex-col items-center gap-1.5 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded bg-blue-500/20 group-hover:bg-blue-500/30 flex items-center justify-center text-blue-400">
                    <Square className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 truncate w-full text-center">
                    {shape.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Vector Icons Section */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Vector Icons
              </h4>
              <div className="relative w-32">
                <input
                  type="text"
                  placeholder="Search..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {filteredIcons.map((ic) => (
                <button
                  key={ic.name}
                  type="button"
                  onClick={() =>
                    onAddElement({
                      type: 'icon',
                      name: ic.name,
                      iconName: ic.name,
                      iconPath: ic.path,
                      width: 96,
                      height: 96,
                      fillColor: '#38bdf8',
                    })
                  }
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                  title={`Add ${ic.name} icon`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6 fill-cyan-400 text-cyan-400"
                  >
                    <path d={ic.path} />
                  </svg>
                  <span className="text-[9px] text-slate-400 truncate w-full text-center">
                    {ic.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: IMAGES */}
        {activeTab === 'images' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
              Images & Assets
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Upload your own photos or insert high-resolution stock assets.
            </p>

            <button
              type="button"
              onClick={onTriggerImport}
              className="w-full py-3 mb-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload Local Image File
            </button>

            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Royalty-Free Stock Library
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: 'stock-tech',
                  title: 'Tech Architecture',
                  src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'stock-minimal',
                  title: 'Minimal Studio',
                  src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'stock-nature',
                  title: 'Emerald Forest',
                  src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'stock-abstract',
                  title: 'Color Gradients',
                  src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
                },
              ].map((stock) => (
                <div
                  key={stock.id}
                  onClick={() =>
                    onAddElement({
                      type: 'image',
                      name: stock.title,
                      imageSrc: stock.src,
                      width: 400,
                      height: 300,
                      intrinsicWidth: 600,
                      intrinsicHeight: 400,
                    })
                  }
                  className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-red-500/50 cursor-pointer h-24"
                >
                  <img
                    src={stock.src}
                    alt={stock.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[10px] font-bold text-white truncate">
                      {stock.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DRAWING & BRUSHES */}
        {activeTab === 'draw' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Freehand Drawing
              </h3>
              <button
                type="button"
                onClick={onToggleDrawingMode}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  isDrawingMode
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isDrawingMode ? 'Drawing Active' : 'Start Draw'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Illustrate, sign documents, or annotate directly on canvas.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Tool Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'brush', label: 'Marker Brush' },
                    { id: 'pencil', label: 'Fine Pencil' },
                    { id: 'highlighter', label: 'Highlighter' },
                    { id: 'eraser', label: 'Eraser' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onChangeDrawingTool(t.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                        drawingTool === t.id
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Stroke Width: {drawWidth}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={drawWidth}
                  onChange={(e) => onChangeDrawWidth(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Stroke Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={drawColor}
                    onChange={(e) => onChangeDrawColor(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={drawColor}
                    onChange={(e) => onChangeDrawColor(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: QR GENERATOR */}
        {activeTab === 'qr' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
              QR Code Generator
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Generate scannable QR codes for websites, menus, or campaigns.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Destination URL or Text
                </label>
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Foreground
                  </label>
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-full h-9 rounded bg-transparent border border-slate-800 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Background
                  </label>
                  <input
                    type="color"
                    value={qrBgColor}
                    onChange={(e) => setQrBgColor(e.target.value)}
                    className="w-full h-9 rounded bg-transparent border border-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              {/* QR Code Preview */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                <img
                  src={generateQrDataUrl(qrInput, qrColor, qrBgColor, 200)}
                  alt="QR Preview"
                  className="w-36 h-36 rounded shadow"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  onAddElement({
                    type: 'qr',
                    name: 'QR Code',
                    qrText: qrInput,
                    qrColor,
                    qrBgColor,
                    width: 200,
                    height: 200,
                  })
                }
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add QR Code to Canvas
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: BRAND KIT */}
        {activeTab === 'brand' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
              Brand Kit Controls
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Maintain strict brand identity across all creative collateral.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandKit.brandName}
                  onChange={(e) => onUpdateBrandKit({ brandName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Brand Color Palette
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'primaryColor', label: 'Primary Brand' },
                    { key: 'secondaryColor', label: 'Secondary Tone' },
                    { key: 'accentColor', label: 'Accent Highlight' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-xs font-medium text-slate-300">{label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(brandKit as any)[key]}
                          onChange={(e) => onUpdateBrandKit({ [key]: e.target.value })}
                          className="w-7 h-7 rounded bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-xs text-slate-400">
                          {(brandKit as any)[key]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={onApplyBrandPalette}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                Apply Brand Palette to Document
              </button>
            </div>
          </div>
        )}

        {/* TAB 8: BACKGROUND */}
        {activeTab === 'background' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
              Canvas Background
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure canvas backdrops, colors, and gradients.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Background Mode
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['solid', 'gradient', 'transparent'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onUpdateCanvasSettings({ bgType: mode })}
                      className={`py-2 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                        canvasSettings.bgType === mode
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {canvasSettings.bgType === 'solid' && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Solid Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={canvasSettings.bgColor}
                      onChange={(e) => onUpdateCanvasSettings({ bgColor: e.target.value })}
                      className="w-10 h-10 rounded bg-transparent border border-slate-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={canvasSettings.bgColor}
                      onChange={(e) => onUpdateCanvasSettings({ bgColor: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              )}

              {canvasSettings.bgType === 'gradient' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Start Color</label>
                      <input
                        type="color"
                        value={canvasSettings.gradientStart}
                        onChange={(e) => onUpdateCanvasSettings({ gradientStart: e.target.value })}
                        className="w-full h-8 rounded bg-transparent border border-slate-800 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">End Color</label>
                      <input
                        type="color"
                        value={canvasSettings.gradientEnd}
                        onChange={(e) => onUpdateCanvasSettings({ gradientEnd: e.target.value })}
                        className="w-full h-8 rounded bg-transparent border border-slate-800 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Gradient Angle: {canvasSettings.gradientAngle}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={canvasSettings.gradientAngle}
                      onChange={(e) =>
                        onUpdateCanvasSettings({ gradientAngle: Number(e.target.value) })
                      }
                      className="w-full accent-red-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar: slim icon strip + collapsible drawer */}
      <aside
        className={`hidden lg:flex bg-slate-900 border-r border-slate-800 shrink-0 h-full select-none transition-all duration-200 ${
          isDrawerOpen ? 'w-80 xl:w-88' : 'w-16'
        }`}
      >
        {/* Icon Navigation Bar (Left narrow strip) */}
        <div className="w-16 bg-slate-950/60 border-r border-slate-800/80 flex flex-col items-center py-3 gap-1 shrink-0">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'ai') {
                    onOpenAi();
                  } else {
                    if (activeTab === tab.id && isDrawerOpen) {
                      onToggleDrawer?.(false);
                    } else {
                      onSelectTab(tab.id as ActiveSidebarTab);
                      onToggleDrawer?.(true);
                    }
                  }
                }}
                className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                  isActive && isDrawerOpen
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={tab.label}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-semibold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Drawer Content Area */}
        {isDrawerOpen && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900/90 text-slate-200">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                {navTabs.find((t) => t.id === activeTab)?.label}
              </span>
              <button
                type="button"
                onClick={() => onToggleDrawer?.(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Collapse Panel"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{renderTabContent()}</div>
          </div>
        )}
      </aside>

      {/* Mobile Slide-up Sheet */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-slate-900 border-t border-slate-800 flex flex-col shadow-2xl lg:hidden max-h-[80vh] rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80 shrink-0">
              <span className="text-sm font-black text-white uppercase tracking-wider">
                {navTabs.find((t) => t.id === activeTab)?.label}
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{renderTabContent()}</div>
          </div>
        </>
      )}
    </>
  );
};
