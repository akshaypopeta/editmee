import React, { useState } from 'react';
import {
  Sparkles,
  Type,
  Square,
  Palette,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Shapes,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Search,
  Download,
} from 'lucide-react';
import { LogoElement, ShapeType } from './types';
import { LOGO_TEMPLATES, LogoTemplateItem } from './templates';
import { LOGO_ICONS, LogoIconItem } from './iconLibrary';
import { LOGO_PALETTES } from './palettes';
import { SHAPE_ITEMS, getShapeSvgPath } from './vectorShapes';

interface MobileDockProps {
  elements: LogoElement[];
  selectedElement: LogoElement | null;
  selectedIds: string[];
  onSelectElement: (id: string) => void;
  onDeselect: () => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  onReorderLayer: (direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onApplyTemplate: (t: LogoTemplateItem) => void;
  onAddText: (type: 'title' | 'tagline' | 'curved' | 'custom') => void;
  onAddShape: (type: ShapeType) => void;
  onAddIcon: (icon: LogoIconItem) => void;
  onApplyPalette: (pal: (typeof LOGO_PALETTES)[0]) => void;
  bgType: 'transparent' | 'solid' | 'gradient';
  setBgType: (t: 'transparent' | 'solid' | 'gradient') => void;
  bgColor: string;
  setBgColor: (c: string) => void;
  onOpenBrandKit: () => void;
  onOpenAudit: () => void;
  onOpenVariations: () => void;
  onOpenExportCenter?: () => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
}

export const MobileDock: React.FC<MobileDockProps> = ({
  elements,
  selectedElement,
  selectedIds,
  onSelectElement,
  onDeselect,
  onDuplicateSelected,
  onDeleteSelected,
  onReorderLayer,
  onApplyTemplate,
  onAddText,
  onAddShape,
  onAddIcon,
  onApplyPalette,
  bgType,
  setBgType,
  bgColor,
  setBgColor,
  onOpenBrandKit,
  onOpenAudit,
  onOpenVariations,
  onOpenExportCenter,
  onToggleVisibility,
  onToggleLock,
}) => {
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const [iconSearch, setIconSearch] = useState('');
  const [iconCategory, setIconCategory] = useState('all');

  const dockTabs = [
    { id: 'templates', label: 'Templates', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
    { id: 'icons', label: 'Icons', icon: <Shapes className="w-4 h-4" /> },
    { id: 'shapes', label: 'Shapes', icon: <Square className="w-4 h-4" /> },
    { id: 'colors', label: 'Colors', icon: <Palette className="w-4 h-4" /> },
    { id: 'canvas', label: 'Canvas', icon: <ImageIcon className="w-4 h-4" /> },
    {
      id: 'layers',
      label: `Layers (${elements.length})`,
      icon: <Layers className="w-4 h-4" />,
    },
    { id: 'brandkit', label: 'Brand Kit', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
    { id: 'audit', label: 'Audit', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
    { id: 'variations', label: 'Variations', icon: <Layers className="w-4 h-4 text-blue-400" /> },
    { id: 'export', label: 'Export', icon: <Download className="w-4 h-4 text-amber-400" /> },
  ];

  const handleTabClick = (id: string) => {
    if (id === 'brandkit') {
      onOpenBrandKit();
      setActiveDrawer(null);
      return;
    }
    if (id === 'audit') {
      onOpenAudit();
      setActiveDrawer(null);
      return;
    }
    if (id === 'variations') {
      onOpenVariations();
      setActiveDrawer(null);
      return;
    }
    if (id === 'export') {
      if (onOpenExportCenter) onOpenExportCenter();
      setActiveDrawer(null);
      return;
    }

    setActiveDrawer(activeDrawer === id ? null : id);
  };

  const filteredIcons = LOGO_ICONS.filter((icon) => {
    const matchesCat = iconCategory === 'all' || icon.category === iconCategory;
    const matchesSearch = icon.name.toLowerCase().includes(iconSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = [
    'all',
    'geometric',
    'nature',
    'technology',
    'heraldic',
    'typography',
    'modern',
  ];

  return (
    <div className="md:hidden shrink-0 z-40 bg-slate-900 border-t border-slate-800 flex flex-col relative">
      {/* Expandable Bottom Sheet / Drawer */}
      {activeDrawer && (
        <div className="bg-slate-900 border-b border-slate-800 max-h-[46vh] flex flex-col animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900/90">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {activeDrawer === 'templates' && 'Curated Brand Templates'}
              {activeDrawer === 'text' && 'Add Typography Element'}
              {activeDrawer === 'icons' && 'Vector Emblem & Icon Library'}
              {activeDrawer === 'shapes' && 'Geometric Shapes & Badges'}
              {activeDrawer === 'colors' && 'Color Harmonies & Palettes'}
              {activeDrawer === 'canvas' && 'Canvas & Background Setup'}
              {activeDrawer === 'layers' && `Layer Stack Hierarchy (${elements.length})`}
            </span>
            <button
              type="button"
              onClick={() => setActiveDrawer(null)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="p-3 overflow-y-auto flex-1">
            {/* 1. Templates Drawer */}
            {activeDrawer === 'templates' && (
              <div className="grid grid-cols-2 gap-2">
                {LOGO_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      onApplyTemplate(tmpl);
                      setActiveDrawer(null);
                    }}
                    className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors"
                  >
                    <div className="text-xs font-bold text-white truncate">{tmpl.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize mt-0.5">
                      {tmpl.category}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 2. Text Drawer */}
            {activeDrawer === 'text' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onAddText('title');
                    setActiveDrawer(null);
                  }}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left"
                >
                  <div className="text-xs font-black text-white">Brand Name</div>
                  <div className="text-[10px] text-slate-400 mt-1">Bold Display Heading</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddText('tagline');
                    setActiveDrawer(null);
                  }}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left"
                >
                  <div className="text-xs font-bold text-slate-300">Tagline / Slogan</div>
                  <div className="text-[10px] text-slate-400 mt-1">Wide Spaced Subtitle</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddText('curved');
                    setActiveDrawer(null);
                  }}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left col-span-2"
                >
                  <div className="text-xs font-bold text-blue-400">Curved / Arc Text</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Circular Stamp & Emblem Arc Text
                  </div>
                </button>
              </div>
            )}

            {/* 3. Icons Drawer */}
            {activeDrawer === 'icons' && (
              <div className="space-y-2.5">
                {/* Search & Category Filter */}
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search icons..."
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <select
                    value={iconCategory}
                    onChange={(e) => setIconCategory(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white capitalize"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Icons Grid */}
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredIcons.map((icon) => (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => {
                        onAddIcon(icon);
                        setActiveDrawer(null);
                      }}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center transition-colors group"
                      title={icon.name}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-6 h-6 fill-current text-slate-300 group-hover:text-blue-400 transition-colors"
                      >
                        <path d={icon.path} />
                      </svg>
                      <span className="text-[9px] text-slate-400 mt-1 truncate w-full text-center">
                        {icon.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Shapes Drawer */}
            {activeDrawer === 'shapes' && (
              <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {SHAPE_ITEMS.map((s) => {
                  const pathData = getShapeSvgPath(s.type, 24, 24);
                  return (
                    <button
                      key={s.type}
                      type="button"
                      onClick={() => {
                        onAddShape(s.type);
                        setActiveDrawer(null);
                      }}
                      className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
                      title={s.name}
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-slate-300 group-hover:fill-blue-400 transition-colors">
                        <path d={pathData} />
                      </svg>
                      <span className="text-[10px] text-slate-300 group-hover:text-white mt-1 truncate max-w-full font-medium">
                        {s.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 5. Colors Drawer */}
            {activeDrawer === 'colors' && (
              <div className="grid grid-cols-2 gap-2">
                {LOGO_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    type="button"
                    onClick={() => {
                      onApplyPalette(pal);
                      setActiveDrawer(null);
                    }}
                    className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left"
                  >
                    <div className="text-xs text-white font-bold mb-1.5">{pal.name}</div>
                    <div className="flex h-5 rounded-lg overflow-hidden border border-slate-800">
                      {pal.colors.map((c, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 6. Canvas Drawer */}
            {activeDrawer === 'canvas' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {(['transparent', 'solid', 'gradient'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBgType(t)}
                      className={`py-2 rounded-xl text-xs capitalize border transition-all ${
                        bgType === t
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {bgType === 'solid' && (
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-700 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 7. Layers Drawer (Front-to-Back deterministic hierarchy) */}
            {activeDrawer === 'layers' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-mono px-1 pb-1">
                  <span>Front (Top-most)</span>
                  <span>Back (Bottom-most)</span>
                </div>

                {/* Display layers in reverse order: array end is at top of panel (Front), array start is at bottom (Back) */}
                {elements.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No layers on canvas. Add text, an icon, or a shape!
                  </div>
                ) : (
                  [...elements].reverse().map((el, revIdx) => {
                    const actualIdx = elements.length - 1 - revIdx;
                    const isSelected = selectedIds.includes(el.id);
                    const isTop = actualIdx === elements.length - 1;
                    const isBottom = actualIdx === 0;

                    return (
                      <div
                        key={el.id}
                        onClick={() => onSelectElement(el.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Layer Info */}
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                            {el.type === 'text' && <Type className="w-3 h-3 text-blue-400" />}
                            {el.type === 'shape' && <Square className="w-3 h-3 text-emerald-400" />}
                            {el.type === 'icon' && <Shapes className="w-3 h-3 text-amber-400" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">{el.name}</div>
                            <div className="text-[9px] text-slate-400 font-mono">
                              {isTop
                                ? 'Layer: Front'
                                : isBottom
                                ? 'Layer: Back'
                                : `Z-Index: #${actualIdx + 1}`}
                            </div>
                          </div>
                        </div>

                        {/* Layer Actions */}
                        <div
                          className="flex items-center space-x-1 shrink-0 ml-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Reorder Up (Bring Forward) */}
                          <button
                            type="button"
                            disabled={isTop}
                            onClick={() => {
                              onSelectElement(el.id);
                              onReorderLayer('up');
                            }}
                            className={`p-1 rounded ${
                              isTop
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title="Bring Forward"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Reorder Down (Send Backward) */}
                          <button
                            type="button"
                            disabled={isBottom}
                            onClick={() => {
                              onSelectElement(el.id);
                              onReorderLayer('down');
                            }}
                            className={`p-1 rounded ${
                              isBottom
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title="Send Backward"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Visibility Toggle */}
                          <button
                            type="button"
                            onClick={() => onToggleVisibility(el.id)}
                            className="p-1 text-slate-400 hover:text-white rounded"
                            title={el.visible ? 'Hide Layer' : 'Show Layer'}
                          >
                            {el.visible ? (
                              <Eye className="w-3.5 h-3.5 text-blue-400" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                            )}
                          </button>

                          {/* Lock Toggle */}
                          <button
                            type="button"
                            onClick={() => onToggleLock(el.id)}
                            className="p-1 text-slate-400 hover:text-white rounded"
                            title={el.locked ? 'Unlock Layer' : 'Lock Layer'}
                          >
                            {el.locked ? (
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5 text-slate-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Horizontal Scrollable Dock */}
      <div className="h-14 flex items-center px-2 space-x-1.5 overflow-x-auto no-scrollbar">
        {dockTabs.map((tab) => {
          const isActive = activeDrawer === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[58px] h-11 rounded-xl transition-colors shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span className="text-[9px] mt-0.5 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
