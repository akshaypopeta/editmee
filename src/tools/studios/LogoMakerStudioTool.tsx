import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ToolDefinition } from '../../types';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  LogoElement,
  CanvasDimensions,
  BrandKit,
  HistorySnapshot,
  AlignmentGuide,
  ShapeType,
} from './logo-maker/types';
import { LOGO_TEMPLATES, LogoTemplateItem } from './logo-maker/templates';
import { LOGO_ICONS, LogoIconItem } from './logo-maker/iconLibrary';
import { LOGO_PALETTES } from './logo-maker/palettes';
import { generateVectorSvg } from './logo-maker/svgExporter';
import { generateBrandAuditReport } from './logo-maker/designAdvisor';
import {
  exportVectorAsPdf,
  createLogoVariation,
  parseImportedSvg,
} from './logo-maker/exportUtils';

// Modular Subcomponents
import { TopBar } from './logo-maker/TopBar';
import { LeftSidebar, ActiveToolTab } from './logo-maker/LeftSidebar';
import { CanvasWorkspace } from './logo-maker/CanvasWorkspace';
import { RightInspector } from './logo-maker/RightInspector';
import { MobileDock } from './logo-maker/MobileDock';
import { CanvasPresetModal } from './logo-maker/CanvasPresetModal';
import { BrandKitModal } from './logo-maker/BrandKitModal';
import { BrandAuditModal } from './logo-maker/BrandAuditModal';
import { VariationsModal } from './logo-maker/VariationsModal';
import { PreviewModal } from './logo-maker/PreviewModal';
import { MobileTextEditorModal } from './logo-maker/MobileTextEditorModal';
import { MobileObjectBar } from './logo-maker/MobileObjectBar';
import { MobileQuickAdd } from './logo-maker/MobileQuickAdd';
import { ExportCenterModal } from './logo-maker/ExportCenterModal';

export const LogoMakerStudioWorkspace: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Project Settings & Geometry
  const [projectName, setProjectName] = useState('My-Brand-Logo');
  const [canvasSize, setCanvasSize] = useState<CanvasDimensions>({ width: 800, height: 800 });
  const [bgType, setBgType] = useState<'transparent' | 'solid' | 'gradient'>('transparent');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [gradientStart, setGradientStart] = useState('#0f172a');
  const [gradientEnd, setGradientEnd] = useState('#1e293b');
  const [gradientAngle, setGradientAngle] = useState(45);

  // Viewport Settings
  const [zoom, setZoom] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [enableSnapping, setEnableSnapping] = useState(true);
  const [activeGuides, setActiveGuides] = useState<AlignmentGuide[]>([]);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // UI Panels state
  const [leftTab, setLeftTab] = useState<ActiveToolTab>('templates');
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // Modal Open states
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [brandKitModalOpen, setBrandKitModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [variationsModalOpen, setVariationsModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [mobileTextEditorOpen, setMobileTextEditorOpen] = useState(false);
  const [exportCenterOpen, setExportCenterOpen] = useState(false);

  // Brand Kit State
  const [brandKit, setBrandKit] = useState<BrandKit>({
    brandName: 'EDITMEE',
    tagline: 'STUDIO PRO',
    industry: 'Technology & Design',
    personality: 'Modern, Premium, Geometric',
    primaryColor: '#1e3a8a',
    secondaryColor: '#3b82f6',
    accentColor: '#eab308',
    fontHeading: 'Outfit, sans-serif',
    fontBody: 'Inter, sans-serif',
  });

  // Initial Elements
  const [elements, setElements] = useState<LogoElement[]>([
    {
      id: 'el-shield-frame',
      name: 'Badge Shield',
      type: 'shape',
      shapeType: 'shield',
      x: 400,
      y: 330,
      width: 240,
      height: 270,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      fillType: 'linear',
      gradient: { type: 'linear', startColor: '#1e3a8a', endColor: '#3b82f6', angle: 45 },
      stroke: { color: '#eab308', width: 4 },
      shadow: { color: 'rgba(0,0,0,0.15)', blur: 12, offsetX: 0, offsetY: 6 },
    },
    {
      id: 'el-crown-symbol',
      name: 'Crown Symbol',
      type: 'icon',
      iconName: 'Royal Crown',
      iconCategory: 'Business',
      svgPath: 'M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 14h14v2H5v-2z',
      viewBox: '0 0 24 24',
      x: 400,
      y: 320,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      fillColor: '#eab308',
    },
    {
      id: 'el-brand-title',
      name: 'Brand Title',
      type: 'text',
      text: 'EDITMEE',
      fontFamily: 'Outfit, sans-serif',
      fontSize: 56,
      fontWeight: '900',
      letterSpacing: 6,
      uppercase: true,
      textAlign: 'center',
      x: 400,
      y: 530,
      width: 380,
      height: 65,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      fillColor: '#0f172a',
    },
    {
      id: 'el-tagline',
      name: 'Tagline',
      type: 'text',
      text: 'STUDIO PRO',
      fontFamily: 'Inter, sans-serif',
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 6,
      uppercase: true,
      textAlign: 'center',
      x: 400,
      y: 585,
      width: 300,
      height: 30,
      rotation: 0,
      opacity: 0.85,
      locked: false,
      visible: true,
      fillColor: '#3b82f6',
    },
  ]);

  const [selectedIds, setSelectedIds] = useState<string[]>(['el-brand-title']);
  const [clipboard, setClipboard] = useState<LogoElement[] | null>(null);

  // Undo / Redo History
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushHistory = useCallback(
    (newElements: LogoElement[]) => {
      const snapshot: HistorySnapshot = {
        elements: JSON.parse(JSON.stringify(newElements)),
        canvasSize: { ...canvasSize },
        bgType,
        bgColor,
        gradientStart,
        gradientEnd,
        gradientAngle,
      };

      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        const next = [...sliced, snapshot];
        if (next.length > 40) next.shift();
        return next;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 39));
    },
    [canvasSize, bgType, bgColor, gradientStart, gradientEnd, gradientAngle, historyIndex]
  );

  // Initial history snapshot
  useEffect(() => {
    if (history.length === 0) {
      const initialSnapshot: HistorySnapshot = {
        elements: JSON.parse(JSON.stringify(elements)),
        canvasSize: { ...canvasSize },
        bgType,
        bgColor,
        gradientStart,
        gradientEnd,
        gradientAngle,
      };
      setHistory([initialSnapshot]);
      setHistoryIndex(0);
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const snapshot = history[targetIndex];
      setElements(JSON.parse(JSON.stringify(snapshot.elements)));
      setCanvasSize({ ...snapshot.canvasSize });
      setBgType(snapshot.bgType);
      setBgColor(snapshot.bgColor);
      if (snapshot.gradientStart) setGradientStart(snapshot.gradientStart);
      if (snapshot.gradientEnd) setGradientEnd(snapshot.gradientEnd);
      if (snapshot.gradientAngle !== undefined) setGradientAngle(snapshot.gradientAngle);
      setHistoryIndex(targetIndex);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const snapshot = history[targetIndex];
      setElements(JSON.parse(JSON.stringify(snapshot.elements)));
      setCanvasSize({ ...snapshot.canvasSize });
      setBgType(snapshot.bgType);
      setBgColor(snapshot.bgColor);
      if (snapshot.gradientStart) setGradientStart(snapshot.gradientStart);
      if (snapshot.gradientEnd) setGradientEnd(snapshot.gradientEnd);
      if (snapshot.gradientAngle !== undefined) setGradientAngle(snapshot.gradientAngle);
      setHistoryIndex(targetIndex);
    }
  }, [historyIndex, history]);

  const handleFitCanvas = useCallback(() => {
    setZoom(1.0);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Selected element convenience accessor
  const primarySelected = useMemo(() => {
    if (selectedIds.length === 0) return null;
    return elements.find((el) => el.id === selectedIds[0]) || null;
  }, [selectedIds, elements]);

  // Real-time Brand Audit score
  const auditReport = useMemo(() => {
    return generateBrandAuditReport(elements, canvasSize, bgType, bgColor, brandKit);
  }, [elements, canvasSize, bgType, bgColor, brandKit]);

  // Element Updates
  const updateSelected = useCallback(
    (updates: Partial<LogoElement>) => {
      if (selectedIds.length === 0) return;
      setElements((prev) => {
        const next = prev.map((el) => (selectedIds.includes(el.id) ? { ...el, ...updates } : el));
        return next;
      });
    },
    [selectedIds]
  );

  const updateElementById = useCallback((id: string, updates: Partial<LogoElement>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  }, []);

  const updateElementsBatch = useCallback(
    (updates: { id: string; changes: Partial<LogoElement> }[]) => {
      setElements((prev) => {
        const map = new Map(updates.map((u) => [u.id, u.changes]));
        return prev.map((el) => (map.has(el.id) ? { ...el, ...map.get(el.id) } : el));
      });
    },
    []
  );

  const handleCommitHistory = useCallback(() => {
    pushHistory(elements);
  }, [elements, pushHistory]);

  // Actions
  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    setElements((prev) => {
      const next = prev.filter((el) => !selectedIds.includes(el.id));
      pushHistory(next);
      return next;
    });
    setSelectedIds([]);
  }, [selectedIds, pushHistory]);

  const duplicateSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const toDuplicate = elements.filter((el) => selectedIds.includes(el.id));
    const newElements: LogoElement[] = toDuplicate.map((el) => ({
      ...JSON.parse(JSON.stringify(el)),
      id: `${el.type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${el.name} (Copy)`,
      x: el.x + 25,
      y: el.y + 25,
    }));

    setElements((prev) => {
      const next = [...prev, ...newElements];
      pushHistory(next);
      return next;
    });
    setSelectedIds(newElements.map((el) => el.id));
  }, [selectedIds, elements, pushHistory]);

  const alignSelected = useCallback(
    (type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => {
      if (selectedIds.length === 0) return;
      const canvasCenterX = canvasSize.width / 2;
      const canvasCenterY = canvasSize.height / 2;

      setElements((prev) => {
        const next = prev.map((el) => {
          if (!selectedIds.includes(el.id)) return el;
          const hw = el.width / 2;
          const hh = el.height / 2;

          switch (type) {
            case 'left':
              return { ...el, x: hw + 20 };
            case 'center-h':
              return { ...el, x: canvasCenterX };
            case 'right':
              return { ...el, x: canvasSize.width - hw - 20 };
            case 'top':
              return { ...el, y: hh + 20 };
            case 'center-v':
              return { ...el, y: canvasCenterY };
            case 'bottom':
              return { ...el, y: canvasSize.height - hh - 20 };
            default:
              return el;
          }
        });
        pushHistory(next);
        return next;
      });
    },
    [selectedIds, canvasSize, pushHistory]
  );

  const reorderLayer = useCallback(
    (direction: 'up' | 'down' | 'top' | 'bottom') => {
      if (selectedIds.length === 0) return;
      const targetId = selectedIds[0];
      setElements((prev) => {
        const idx = prev.findIndex((el) => el.id === targetId);
        if (idx === -1) return prev;
        const copy = [...prev];
        const [removed] = copy.splice(idx, 1);

        if (direction === 'up') {
          copy.splice(Math.min(idx + 1, copy.length), 0, removed);
        } else if (direction === 'down') {
          copy.splice(Math.max(idx - 1, 0), 0, removed);
        } else if (direction === 'top') {
          copy.push(removed);
        } else if (direction === 'bottom') {
          copy.unshift(removed);
        }
        pushHistory(copy);
        return copy;
      });
    },
    [selectedIds, pushHistory]
  );

  // Add Element Helpers
  const addTextElement = (type: 'title' | 'tagline' | 'curved' | 'custom') => {
    let newEl: LogoElement;
    const baseId = `text-${Date.now()}`;

    if (type === 'title') {
      newEl = {
        id: baseId,
        name: 'Brand Title',
        type: 'text',
        text: brandKit.brandName.toUpperCase(),
        fontFamily: brandKit.fontHeading,
        fontSize: 52,
        fontWeight: '900',
        letterSpacing: 4,
        uppercase: true,
        textAlign: 'center',
        x: canvasSize.width / 2,
        y: canvasSize.height / 2,
        width: 360,
        height: 60,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        fillColor: '#0f172a',
      };
    } else if (type === 'curved') {
      newEl = {
        id: baseId,
        name: 'Curved Text',
        type: 'text',
        text: 'ESTABLISHED 2026',
        fontFamily: brandKit.fontHeading,
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: 5,
        uppercase: true,
        isCurved: true,
        curveRadius: 160,
        curveArc: 160,
        curveDirection: 'convex',
        textAlign: 'center',
        x: canvasSize.width / 2,
        y: canvasSize.height / 2 - 120,
        width: 320,
        height: 70,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        fillColor: brandKit.secondaryColor || '#3b82f6',
      };
    } else {
      newEl = {
        id: baseId,
        name: 'Sub-tagline',
        type: 'text',
        text: brandKit.tagline.toUpperCase(),
        fontFamily: brandKit.fontBody,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 6,
        uppercase: true,
        textAlign: 'center',
        x: canvasSize.width / 2,
        y: canvasSize.height / 2 + 50,
        width: 300,
        height: 30,
        rotation: 0,
        opacity: 0.85,
        locked: false,
        visible: true,
        fillColor: brandKit.secondaryColor || '#3b82f6',
      };
    }

    setElements((prev) => {
      const next = [...prev, newEl];
      pushHistory(next);
      return next;
    });
    setSelectedIds([newEl.id]);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileTextEditorOpen(true);
    }
  };

  const addShapeElement = (shapeType: ShapeType) => {
    const newEl: LogoElement = {
      id: `shape-${Date.now()}`,
      name: `${shapeType.toUpperCase()} Shape`,
      type: 'shape',
      shapeType,
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      width: 180,
      height: 180,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      fillType: 'solid',
      fillColor: brandKit.primaryColor || '#1e3a8a',
      borderRadius: shapeType === 'rounded-rect' ? 24 : 12,
      stroke: { color: brandKit.accentColor || '#eab308', width: 0 },
    };

    setElements((prev) => {
      const next = [...prev, newEl];
      pushHistory(next);
      return next;
    });
    setSelectedIds([newEl.id]);
  };

  const addIconElement = (icon: LogoIconItem) => {
    const newEl: LogoElement = {
      id: `icon-${Date.now()}`,
      name: icon.name,
      type: 'icon',
      iconName: icon.name,
      iconCategory: icon.category,
      svgPath: icon.path,
      viewBox: icon.viewBox,
      x: canvasSize.width / 2,
      y: canvasSize.height / 2 - 40,
      width: 120,
      height: 120,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      fillColor: brandKit.accentColor || '#eab308',
    };

    setElements((prev) => {
      const next = [...prev, newEl];
      pushHistory(next);
      return next;
    });
    setSelectedIds([newEl.id]);
  };

  const applyTemplate = (template: LogoTemplateItem) => {
    setCanvasSize(template.canvasSize);
    setBgType(template.bgType);
    setBgColor(template.bgColor);
    if (template.gradientStart) setGradientStart(template.gradientStart);
    if (template.gradientEnd) setGradientEnd(template.gradientEnd);
    const cloned = JSON.parse(JSON.stringify(template.elements));
    setElements(cloned);
    pushHistory(cloned);
    if (cloned.length > 0) {
      setSelectedIds([cloned[cloned.length - 1].id]);
    }
  };

  const applyPaletteToLogo = (palette: (typeof LOGO_PALETTES)[0]) => {
    setElements((prev) => {
      const next = prev.map((el) => {
        if (el.type === 'text') {
          return {
            ...el,
            fillColor:
              el.fontSize && el.fontSize > 30
                ? palette.colors[3] || '#0f172a'
                : palette.colors[1] || palette.colors[0],
          };
        }
        if (el.type === 'shape') {
          return {
            ...el,
            fillColor: palette.colors[0],
            stroke: el.stroke ? { ...el.stroke, color: palette.colors[2] || palette.colors[1] } : undefined,
          };
        }
        if (el.type === 'icon') {
          return {
            ...el,
            fillColor: palette.colors[2] || palette.colors[1],
          };
        }
        return el;
      });
      pushHistory(next);
      return next;
    });
  };

  const applyBrandKitToDesign = () => {
    setElements((prev) => {
      const next = prev.map((el) => {
        if (el.type === 'text' && el.name.toLowerCase().includes('title')) {
          return {
            ...el,
            text: brandKit.brandName.toUpperCase(),
            fontFamily: brandKit.fontHeading,
            fillColor: brandKit.primaryColor,
          };
        }
        if (el.type === 'text' && el.name.toLowerCase().includes('tagline')) {
          return {
            ...el,
            text: brandKit.tagline.toUpperCase(),
            fontFamily: brandKit.fontBody,
            fillColor: brandKit.secondaryColor,
          };
        }
        if (el.type === 'shape') {
          return {
            ...el,
            fillColor: brandKit.primaryColor,
            stroke: el.stroke ? { ...el.stroke, color: brandKit.accentColor } : undefined,
          };
        }
        if (el.type === 'icon') {
          return {
            ...el,
            fillColor: brandKit.accentColor,
          };
        }
        return el;
      });
      pushHistory(next);
      return next;
    });
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (cmdOrCtrl && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if (cmdOrCtrl && e.key === 'd') {
        e.preventDefault();
        duplicateSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, deleteSelected, duplicateSelected]);

  // Exports
  const handleExportPng = (scaleMultiplier: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const offscreen = document.createElement('canvas');
    offscreen.width = canvasSize.width * scaleMultiplier;
    offscreen.height = canvasSize.height * scaleMultiplier;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);

    const link = document.createElement('a');
    link.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${scaleMultiplier}x.png`;
    link.href = offscreen.toDataURL('image/png');
    link.click();
  };

  const handleExportSvg = () => {
    const svgString = generateVectorSvg({
      elements,
      canvasSize,
      bgType,
      bgColor,
      gradientStart,
      gradientEnd,
      gradientAngle,
    });
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const handleExportPdf = () => {
    const svgString = generateVectorSvg({
      elements,
      canvasSize,
      bgType,
      bgColor,
      gradientStart,
      gradientEnd,
      gradientAngle,
    });
    exportVectorAsPdf(svgString, canvasSize.width, canvasSize.height, `${projectName}.pdf`);
  };

  const handleExportJson = () => {
    const projectData = {
      projectName,
      canvasSize,
      bgType,
      bgColor,
      gradientStart,
      gradientEnd,
      gradientAngle,
      elements,
      brandKit,
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.editmee-logo`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  // Import File Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.svg') || file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const svgText = ev.target?.result as string;
        if (svgText) {
          const imported = parseImportedSvg(svgText, canvasSize);
          if (imported.length > 0) {
            setElements((prev) => {
              const next = [...prev, ...imported];
              pushHistory(next);
              return next;
            });
            setSelectedIds(imported.map((el) => el.id));
          }
        }
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          const imgEl: LogoElement = {
            id: `img-${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            type: 'icon',
            iconName: 'Imported Graphic',
            iconCategory: 'Imported',
            svgPath: 'M4 4h16v16H4z',
            viewBox: '0 0 24 24',
            x: canvasSize.width / 2,
            y: canvasSize.height / 2,
            width: 200,
            height: 200,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            fillColor: '#3b82f6',
          };
          setElements((prev) => {
            const next = [...prev, imgEl];
            pushHistory(next);
            return next;
          });
          setSelectedIds([imgEl.id]);
        }
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  const handleSaveProject = async () => {
    const projectData = {
      projectName,
      canvasSize,
      bgType,
      bgColor,
      gradientStart,
      gradientEnd,
      gradientAngle,
      elements,
      brandKit,
    };
    try {
      localStorage.setItem('editmee-saved-logo-project', JSON.stringify(projectData));
      alert('Logo project successfully saved to local vault!');
    } catch (e) {
      console.error('Failed to save project', e);
    }
  };

  // Quick fix audit handler
  const handleQuickFixAudit = (fixType: string) => {
    if (fixType === 'center-canvas') {
      alignSelected('center-h');
      alignSelected('center-v');
    } else if (fixType === 'fit-safe-area') {
      const margin = 45;
      setElements((prev) => {
        const next = prev.map((el) => {
          let nx = el.x;
          let ny = el.y;
          const hw = el.width / 2;
          const hh = el.height / 2;
          if (nx - hw < margin) nx = margin + hw;
          if (nx + hw > canvasSize.width - margin) nx = canvasSize.width - margin - hw;
          if (ny - hh < margin) ny = margin + hh;
          if (ny + hh > canvasSize.height - margin) ny = canvasSize.height - margin - hh;
          return { ...el, x: nx, y: ny };
        });
        pushHistory(next);
        return next;
      });
    } else if (fixType === 'boost-text-size') {
      setElements((prev) => {
        const next = prev.map((el) => {
          if (el.type === 'text' && (el.fontSize || 12) < 16) {
            return { ...el, fontSize: 16 };
          }
          return el;
        });
        pushHistory(next);
        return next;
      });
    } else if (fixType === 'simplify-palette') {
      applyBrandKitToDesign();
    }
  };

  const canvasDataUrl = useMemo(() => {
    if (canvasRef.current) {
      try {
        return canvasRef.current.toDataURL('image/png');
      } catch {
        return '';
      }
    }
    return '';
  }, [elements, canvasSize, bgType, bgColor, gradientStart, gradientEnd, gradientAngle]);

  return (
    <div className="w-full h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".svg,.png,.jpg,.jpeg"
        className="hidden"
      />

      {/* 1. TOP BAR */}
      <TopBar
        projectName={projectName}
        setProjectName={setProjectName}
        canvasSize={canvasSize}
        onOpenPresetModal={() => setPresetModalOpen(true)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomIn={() => setZoom((prev) => Math.min(prev * 1.2, 4.0))}
        onZoomOut={() => setZoom((prev) => Math.max(prev / 1.2, 0.2))}
        onFitCanvas={handleFitCanvas}
        showRulers={showRulers}
        setShowRulers={setShowRulers}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        enableSnapping={enableSnapping}
        setEnableSnapping={setEnableSnapping}
        showSafeArea={showSafeArea}
        setShowSafeArea={setShowSafeArea}
        onOpenBrandKit={() => setBrandKitModalOpen(true)}
        onOpenAudit={() => setAuditModalOpen(true)}
        auditScore={auditReport.overallScore}
        onOpenVariations={() => setVariationsModalOpen(true)}
        onOpenPreview={() => setPreviewModalOpen(true)}
        onImportClick={() => fileInputRef.current?.click()}
        onSaveProject={handleSaveProject}
        onExportPng={handleExportPng}
        onExportSvg={handleExportSvg}
        onExportPdf={handleExportPdf}
        onExportJson={handleExportJson}
        onOpenExportCenter={() => setExportCenterOpen(true)}
      />

      {/* 2. MAIN WORKSPACE (LEFT PANEL | CANVAS WORKSPACE | RIGHT INSPECTOR) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Desktop & Tablet) */}
        <div className="hidden md:flex">
          <LeftSidebar
            activeTab={leftTab}
            setActiveTab={setLeftTab}
            isCollapsed={leftCollapsed}
            setIsCollapsed={setLeftCollapsed}
            elements={elements}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onApplyTemplate={applyTemplate}
            onAddText={addTextElement}
            onAddShape={addShapeElement}
            onAddIcon={addIconElement}
            onApplyPalette={applyPaletteToLogo}
            bgType={bgType}
            setBgType={setBgType}
            bgColor={bgColor}
            setBgColor={setBgColor}
            gradientStart={gradientStart}
            setGradientStart={setGradientStart}
            gradientEnd={gradientEnd}
            setGradientEnd={setGradientEnd}
            gradientAngle={gradientAngle}
            setGradientAngle={setGradientAngle}
            onReorderLayer={reorderLayer}
            onToggleVisibility={(id) => {
              setElements((prev) => {
                const next = prev.map((el) => (el.id === id ? { ...el, visible: !el.visible } : el));
                pushHistory(next);
                return next;
              });
            }}
            onToggleLock={(id) => {
              setElements((prev) => {
                const next = prev.map((el) => (el.id === id ? { ...el, locked: !el.locked } : el));
                pushHistory(next);
                return next;
              });
            }}
            onDeleteElement={(id) => {
              setElements((prev) => {
                const next = prev.filter((el) => el.id !== id);
                pushHistory(next);
                return next;
              });
              setSelectedIds((prev) => prev.filter((item) => item !== id));
            }}
            onDuplicateElement={(id) => {
              const target = elements.find((el) => el.id === id);
              if (target) {
                const dup: LogoElement = {
                  ...JSON.parse(JSON.stringify(target)),
                  id: `${target.type}-${Date.now()}`,
                  name: `${target.name} (Copy)`,
                  x: target.x + 20,
                  y: target.y + 20,
                };
                setElements((prev) => {
                  const next = [...prev, dup];
                  pushHistory(next);
                  return next;
                });
                setSelectedIds([dup.id]);
              }
            }}
          />
        </div>

        {/* Center: Dynamically Scaled Canvas Workspace */}
        <CanvasWorkspace
          canvasSize={canvasSize}
          bgType={bgType}
          bgColor={bgColor}
          gradientStart={gradientStart}
          gradientEnd={gradientEnd}
          gradientAngle={gradientAngle}
          zoom={zoom}
          setZoom={setZoom}
          panOffset={panOffset}
          setPanOffset={setPanOffset}
          isPanMode={isPanMode}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          showRulers={showRulers}
          setShowRulers={setShowRulers}
          showSafeArea={showSafeArea}
          setShowSafeArea={setShowSafeArea}
          enableSnapping={enableSnapping}
          setEnableSnapping={setEnableSnapping}
          elements={elements}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          activeGuides={activeGuides}
          setActiveGuides={setActiveGuides}
          onUpdateElement={updateElementById}
          onUpdateElementsBatch={updateElementsBatch}
          onCommitHistory={handleCommitHistory}
          cursorPos={cursorPos}
          setCursorPos={setCursorPos}
          canvasRef={canvasRef}
          containerRef={containerRef}
          onFitCanvas={handleFitCanvas}
        />

        {/* Right Inspector (Desktop & Tablet) */}
        <div className="hidden md:flex">
          <RightInspector
            selectedElement={primarySelected}
            onUpdateSelected={updateSelected}
            onDeleteSelected={deleteSelected}
            onDuplicateSelected={duplicateSelected}
            onAlignSelected={alignSelected}
            onReorderLayer={reorderLayer}
            canvasSize={canvasSize}
            onOpenPresetModal={() => setPresetModalOpen(true)}
            bgType={bgType}
            setBgType={setBgType}
            bgColor={bgColor}
            setBgColor={setBgColor}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            showRulers={showRulers}
            setShowRulers={setShowRulers}
            showSafeArea={showSafeArea}
            setShowSafeArea={setShowSafeArea}
            enableSnapping={enableSnapping}
            setEnableSnapping={setEnableSnapping}
            isCollapsed={rightCollapsed}
            setIsCollapsed={setRightCollapsed}
          />
        </div>
      </div>

      {/* 3. MOBILE TOOL DOCK & BOTTOM SHEET (Mobile devices only) */}
      <MobileDock
        elements={elements}
        selectedElement={primarySelected}
        selectedIds={selectedIds}
        onSelectElement={(id) => setSelectedIds([id])}
        onDeselect={() => setSelectedIds([])}
        onDuplicateSelected={duplicateSelected}
        onDeleteSelected={deleteSelected}
        onReorderLayer={reorderLayer}
        onApplyTemplate={applyTemplate}
        onAddText={addTextElement}
        onAddShape={addShapeElement}
        onAddIcon={addIconElement}
        onApplyPalette={applyPaletteToLogo}
        bgType={bgType}
        setBgType={setBgType}
        bgColor={bgColor}
        setBgColor={setBgColor}
        onOpenBrandKit={() => setBrandKitModalOpen(true)}
        onOpenAudit={() => setAuditModalOpen(true)}
        onOpenVariations={() => setVariationsModalOpen(true)}
        onOpenExportCenter={() => setExportCenterOpen(true)}
        onToggleVisibility={(id) => {
          setElements((prev) => {
            const next = prev.map((el) => (el.id === id ? { ...el, visible: !el.visible } : el));
            pushHistory(next);
            return next;
          });
        }}
        onToggleLock={(id) => {
          setElements((prev) => {
            const next = prev.map((el) => (el.id === id ? { ...el, locked: !el.locked } : el));
            pushHistory(next);
            return next;
          });
        }}
      />

      {/* 4. MOBILE CONTEXTUAL OBJECT MANIPULATION BAR (Mobile & small screens) */}
      {primarySelected && (
        <MobileObjectBar
          element={primarySelected}
          canvasSize={canvasSize}
          onUpdateElement={updateElementById}
          onDuplicate={duplicateSelected}
          onDelete={deleteSelected}
          onDeselect={() => setSelectedIds([])}
          onReorder={reorderLayer}
          onAlign={alignSelected}
          onOpenTextEditor={() => setMobileTextEditorOpen(true)}
        />
      )}

      {/* 5. MOBILE FLOATING QUICK ADD FAB */}
      <MobileQuickAdd
        onAddText={addTextElement}
        onAddShape={addShapeElement}
        onOpenIcons={() => {}}
        onOpenTemplates={() => {}}
        onOpenPalettes={() => {}}
        isCanvasEmpty={elements.length === 0}
      />

      {/* 6. MOBILE TEXT EDITOR MODAL */}
      <MobileTextEditorModal
        isOpen={mobileTextEditorOpen}
        onClose={() => setMobileTextEditorOpen(false)}
        element={primarySelected?.type === 'text' ? primarySelected : null}
        onUpdateElement={updateElementById}
      />

      {/* 4. MODALS */}
      <CanvasPresetModal
        isOpen={presetModalOpen}
        onClose={() => setPresetModalOpen(false)}
        currentDimensions={canvasSize}
        onApplyDimensions={(newDims) => setCanvasSize(newDims)}
      />

      <BrandKitModal
        isOpen={brandKitModalOpen}
        onClose={() => setBrandKitModalOpen(false)}
        brandKit={brandKit}
        onSaveBrandKit={(updated) => setBrandKit(updated)}
        onApplyToCanvas={applyBrandKitToDesign}
      />

      <BrandAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        report={auditReport}
        onRunAction={handleQuickFixAudit}
        onReAudit={() => {}}
      />

      <VariationsModal
        isOpen={variationsModalOpen}
        onClose={() => setVariationsModalOpen(false)}
        elements={elements}
        canvasSize={canvasSize}
        onApplyVariation={(variants) => {
          setElements(variants);
          pushHistory(variants);
        }}
        onExportVariantPng={(variants, title) => {
          setElements(variants);
          setTimeout(() => handleExportPng(2), 100);
        }}
      />

      <PreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        elements={elements}
        canvasSize={canvasSize}
        canvasDataUrl={canvasDataUrl}
      />

      <ExportCenterModal
        isOpen={exportCenterOpen}
        onClose={() => setExportCenterOpen(false)}
        elements={elements}
        canvasSize={canvasSize}
        bgType={bgType}
        bgColor={bgColor}
        gradientStart={gradientStart}
        gradientEnd={gradientEnd}
        gradientAngle={gradientAngle}
        projectName={projectName}
        brandKit={brandKit}
      />
    </div>
  );
};

export const logoMakerStudioToolDef: ToolDefinition = {
  id: 'logo-maker-studio',
  name: 'Logo Maker Studio Pro',
  category: 'logo',
  subcategory: 'branding',
  description:
    'Professional vector logo design studio with curated starting templates, 120+ authentic vector symbols, precision typography, curved text, layer management, brand kit, and vector SVG & high-res PNG export.',
  iconName: 'Sparkles',
  version: '2.0.0',
  tags: ['logo', 'brand', 'vector', 'svg', 'canvas', 'badge', 'typography', 'design', 'symbols', 'icons'],
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
      text: 'Logo Maker Studio Pro ready',
    };
  },
};
