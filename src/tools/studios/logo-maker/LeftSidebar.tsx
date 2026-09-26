import React, { useState } from 'react';
import {
  Sparkles,
  Type,
  Square,
  Palette,
  Layers,
  Image as ImageIcon,
  Search,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Shapes,
  FolderOpen,
  Plus,
} from 'lucide-react';
import { LogoElement, ShapeType } from './types';
import { LOGO_TEMPLATES, LogoTemplateItem } from './templates';
import { LOGO_ICONS, LOGO_ICON_CATEGORIES, LogoIconItem } from './iconLibrary';
import { LOGO_PALETTES } from './palettes';
import { SHAPE_ITEMS, getShapeSvgPath } from './vectorShapes';

export type ActiveToolTab =
  | 'templates'
  | 'text'
  | 'icons'
  | 'shapes'
  | 'palettes'
  | 'background'
  | 'layers';

interface LeftSidebarProps {
  activeTab: ActiveToolTab;
  setActiveTab: (tab: ActiveToolTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  elements: LogoElement[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  onApplyTemplate: (template: LogoTemplateItem) => void;
  onAddText: (type: 'title' | 'tagline' | 'curved' | 'custom') => void;
  onAddShape: (type: ShapeType) => void;
  onAddIcon: (icon: LogoIconItem) => void;
  onApplyPalette: (palette: (typeof LOGO_PALETTES)[0]) => void;
  bgType: 'transparent' | 'solid' | 'gradient';
  setBgType: (t: 'transparent' | 'solid' | 'gradient') => void;
  bgColor: string;
  setBgColor: (c: string) => void;
  gradientStart: string;
  setGradientStart: (c: string) => void;
  gradientEnd: string;
  setGradientEnd: (c: string) => void;
  gradientAngle: number;
  setGradientAngle: (a: number) => void;
  onReorderLayer: (direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  elements,
  selectedIds,
  setSelectedIds,
  onApplyTemplate,
  onAddText,
  onAddShape,
  onAddIcon,
  onApplyPalette,
  bgType,
  setBgType,
  bgColor,
  setBgColor,
  gradientStart,
  setGradientStart,
  gradientEnd,
  setGradientEnd,
  gradientAngle,
  setGradientAngle,
  onReorderLayer,
  onToggleVisibility,
  onToggleLock,
  onDeleteElement,
  onDuplicateElement,
}) => {
  const [iconSearch, setIconSearch] = useState('');
  const [iconCategory, setIconCategory] = useState('All');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('All');

  const filteredIcons = LOGO_ICONS.filter((icon) => {
    const matchesSearch =
      !iconSearch ||
      icon.name.toLowerCase().includes(iconSearch.toLowerCase()) ||
      icon.tags.some((t) => t.toLowerCase().includes(iconSearch.toLowerCase()));
    const matchesCategory = iconCategory === 'All' || icon.category === iconCategory;
    return matchesSearch && matchesCategory;
  });

  const templateCategories = ['All', 'Technology', 'Finance', 'Creative', 'Culinary', 'Wellness', 'Corporate'];
  const filteredTemplates = LOGO_TEMPLATES.filter((tmpl) => {
    const matchesSearch =
      !templateSearch ||
      tmpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tmpl.category.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCategory = templateCategory === 'All' || tmpl.category === templateCategory;
    return matchesSearch && matchesCategory;
  });

  const [shapeSearch, setShapeSearch] = useState('');
  const [shapeCategory, setShapeCategory] = useState('All');
  const shapeCategories = ['All', 'Shields & Badges', 'Basic', 'Polygons', 'Stars & Bursts', 'Abstract & Curves', 'Arrows & Lines', 'Decorative'];

  const filteredShapes = SHAPE_ITEMS.filter((shape) => {
    const matchesSearch =
      !shapeSearch ||
      shape.name.toLowerCase().includes(shapeSearch.toLowerCase()) ||
      shape.tags.some((t) => t.toLowerCase().includes(shapeSearch.toLowerCase()));
    const matchesCategory = shapeCategory === 'All' || shape.category === shapeCategory;
    return matchesSearch && matchesCategory;
  });

  const navTabs: { id: ActiveToolTab; label: string; icon: React.ReactNode }[] = [
    { id: 'templates', label: 'Templates', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'text', label: 'Text', icon: <Type className="w-5 h-5" /> },
    { id: 'icons', label: 'Icons', icon: <Shapes className="w-5 h-5" /> },
    { id: 'shapes', label: 'Shapes', icon: <Square className="w-5 h-5" /> },
    { id: 'palettes', label: 'Colors', icon: <Palette className="w-5 h-5" /> },
    { id: 'background', label: 'Canvas', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 'layers', label: 'Layers', icon: <Layers className="w-5 h-5" /> },
  ];

  return (
    <aside className="h-full flex bg-slate-900 border-r border-slate-800 shrink-0 z-20">
      {/* Icon Tab Strip */}
      <nav className="w-16 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-3 space-y-1 shrink-0">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id && !isCollapsed;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (activeTab === tab.id && !isCollapsed) {
                  setIsCollapsed(true);
                } else {
                  setActiveTab(tab.id);
                  setIsCollapsed(false);
                }
              }}
              title={tab.label}
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {tab.icon}
              <span className="text-[9px] font-medium leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Expanded Panel Body */}
      {!isCollapsed && (
        <div className="w-72 bg-slate-900 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {navTabs.find((t) => t.id === activeTab)?.label}
            </span>
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="text-slate-500 hover:text-slate-300 text-xs p-1"
              title="Collapse panel"
            >
              Hide
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. TEMPLATES */}
            {activeTab === 'templates' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {templateCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTemplateCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors ${
                        templateCategory === cat
                          ? 'bg-blue-600 text-white font-medium'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {filteredTemplates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => onApplyTemplate(tmpl)}
                      className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/60 rounded-xl text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {tmpl.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {tmpl.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{tmpl.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. TEXT BUILDERS */}
            {activeTab === 'text' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Click to place typography onto the canvas:</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onAddText('title')}
                    className="w-full p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500 rounded-xl text-left transition-all cursor-pointer"
                  >
                    <div className="text-sm font-black text-white tracking-wide">Add Brand Title</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Heavy display weight for primary wordmark</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddText('tagline')}
                    className="w-full p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500 rounded-xl text-left transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-white tracking-widest uppercase">Add Tagline / Slogan</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Spaced sub-heading for positioning statements</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddText('curved')}
                    className="w-full p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500 rounded-xl text-left transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-blue-400 tracking-wider">Add Curved / Arc Text</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Circular badge text with adjustable arc radius</div>
                  </button>
                </div>
              </div>
            )}

            {/* 3. ICONS (120+ authentic vector symbols) */}
            {activeTab === 'icons' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search 120+ icons..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {LOGO_ICON_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setIconCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors ${
                        iconCategory === cat
                          ? 'bg-blue-600 text-white font-medium'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {filteredIcons.map((icon) => (
                    <button
                      key={icon.id}
                      type="button"
                      onClick={() => onAddIcon(icon)}
                      title={icon.name}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
                    >
                      <svg
                        viewBox={icon.viewBox}
                        className="w-6 h-6 fill-slate-300 group-hover:fill-blue-400 transition-colors"
                      >
                        <path d={icon.path} />
                      </svg>
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-200 mt-1 truncate max-w-full">
                        {icon.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SHAPES, BADGES, SEALS & CRESTS */}
            {activeTab === 'shapes' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search 40+ shapes & badges..."
                    value={shapeSearch}
                    onChange={(e) => setShapeSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {shapeCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setShapeCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors ${
                        shapeCategory === cat
                          ? 'bg-blue-600 text-white font-medium'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 max-h-[520px] overflow-y-auto pr-1">
                  {filteredShapes.map((shape) => {
                    const pathData = getShapeSvgPath(shape.type, 32, 32);
                    return (
                      <button
                        key={shape.type}
                        type="button"
                        onClick={() => onAddShape(shape.type)}
                        title={shape.name}
                        className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
                      >
                        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-slate-300 group-hover:fill-blue-400 transition-colors">
                          <path d={pathData} />
                        </svg>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-200 mt-1 truncate max-w-full">
                          {shape.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. DESIGNER COLOR PALETTES */}
            {activeTab === 'palettes' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Apply harmonious 4-color palettes across your logo marks:</p>
                <div className="space-y-2">
                  {LOGO_PALETTES.map((pal) => (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => onApplyPalette(pal)}
                      className="w-full p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500 rounded-xl text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-white">{pal.name}</span>
                        <span className="text-[10px] text-slate-400">{pal.category}</span>
                      </div>
                      <div className="flex h-5 rounded-md overflow-hidden border border-slate-800">
                        {pal.colors.map((c, idx) => (
                          <div key={idx} className="flex-1 h-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 6. CANVAS BACKGROUND */}
            {activeTab === 'background' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Background Mode
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['transparent', 'solid', 'gradient'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setBgType(t)}
                        className={`py-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                          bgType === t
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {bgType === 'solid' && (
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Solid Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {bgType === 'gradient' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Start Color</label>
                        <input
                          type="color"
                          value={gradientStart}
                          onChange={(e) => setGradientStart(e.target.value)}
                          className="w-full h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">End Color</label>
                        <input
                          type="color"
                          value={gradientEnd}
                          onChange={(e) => setGradientEnd(e.target.value)}
                          className="w-full h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Gradient Angle</span>
                        <span>{gradientAngle}°</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={gradientAngle}
                        onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. LAYERS & Z-ORDER */}
            {activeTab === 'layers' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{elements.length} Elements</span>
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => onReorderLayer('top')}
                      disabled={selectedIds.length === 0}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                      title="Bring to Front"
                    >
                      <ChevronsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onReorderLayer('up')}
                      disabled={selectedIds.length === 0}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                      title="Bring Forward"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onReorderLayer('down')}
                      disabled={selectedIds.length === 0}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                      title="Send Backward"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onReorderLayer('bottom')}
                      disabled={selectedIds.length === 0}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                      title="Send to Back"
                    >
                      <ChevronsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Display layers in top-to-bottom visual order (frontmost first) */}
                <div className="space-y-1.5">
                  {[...elements].reverse().map((el) => {
                    const isSelected = selectedIds.includes(el.id);

                    return (
                      <div
                        key={el.id}
                        onClick={() => setSelectedIds([el.id])}
                        className={`p-2 rounded-lg border flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate mr-2">
                          <span className="text-xs truncate font-medium">{el.name}</span>
                          <span className="text-[10px] text-slate-500 uppercase">{el.type}</span>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleVisibility(el.id);
                            }}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            {el.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-red-400" />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleLock(el.id);
                            }}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            {el.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicateElement(el.id);
                            }}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Duplicate"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteElement(el.id);
                            }}
                            className="p-1 text-slate-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
