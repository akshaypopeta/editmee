import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  PdfEngine,
  PdfDocumentInfo,
  PdfAnnotationObject,
  PdfSearchMatch,
  AnnotationType,
  PdfTextItem,
} from '../../core/pdf-engine/PdfEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Upload,
  Download,
  Printer,
  FilePlus,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Undo,
  Redo,
  Search,
  Replace,
  Type,
  Edit3,
  PenTool,
  Highlighter,
  Square,
  Circle as CircleIcon,
  Stamp,
  FileSignature,
  Image as ImageIcon,
  ShieldAlert,
  Sliders,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Layers,
  Settings,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  MousePointer,
  CheckSquare,
  FileText,
  HelpCircle,
} from 'lucide-react';

export const EditPdfTool: React.FC = () => {
  // --- Document State ---
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [docInfo, setDocInfo] = useState<PdfDocumentInfo | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.1);

  // --- UI Modes & Panels ---
  const [activeMode, setActiveMode] = useState<
    | 'select'
    | 'text-edit'
    | 'text-add'
    | 'draw'
    | 'highlight'
    | 'redact'
    | 'rect'
    | 'circle'
    | 'stamp'
    | 'signature'
    | 'image'
    | 'form-text'
    | 'form-check'
  >('select');

  const [activeSidebarTab, setActiveSidebarTab] = useState<'pages' | 'layers' | 'search' | 'watermark' | 'metadata'>('pages');
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // --- Selection & Editing State ---
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [pageTextItems, setPageTextItems] = useState<PdfTextItem[]>([]);
  const [hoveredTextItem, setHoveredTextItem] = useState<PdfTextItem | null>(null);

  // --- Typography & Formatting Settings ---
  const [selectedFont, setSelectedFont] = useState<'Helvetica' | 'TimesRoman' | 'Courier'>('Helvetica');
  const [fontSize, setFontSize] = useState<number>(14);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [textColor, setTextColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('transparent');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [highlightColor, setHighlightColor] = useState<string>('#fef08a'); // soft yellow

  // --- Stamp State ---
  const [stampText, setStampText] = useState<string>('APPROVED');
  const [stampColor, setStampColor] = useState<string>('#dc2626');

  // --- Watermark & Page Numbers Settings ---
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.2);
  const [watermarkFontSize, setWatermarkFontSize] = useState<number>(44);
  const [watermarkRotation, setWatermarkRotation] = useState<number>(45);
  const [watermarkColor, setWatermarkColor] = useState<string>('#64748b');

  const [pageNumberingEnabled, setPageNumberingEnabled] = useState<boolean>(false);
  const [pageNumberFormat, setPageNumberFormat] = useState<'Page {n} of {total}' | '{n} / {total}' | '{n}'>('Page {n} of {total}');
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'top-right'>('bottom-center');

  // --- Metadata State ---
  const [metaTitle, setMetaTitle] = useState<string>('');
  const [metaAuthor, setMetaAuthor] = useState<string>('');
  const [metaSubject, setMetaSubject] = useState<string>('');
  const [metaKeywords, setMetaKeywords] = useState<string>('');

  // --- Search & Replace State ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<PdfSearchMatch[]>([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState<number>(-1);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // --- Annotations & History (Undo / Redo) ---
  const [annotations, setAnnotations] = useState<PdfAnnotationObject[]>([]);
  const [history, setHistory] = useState<PdfAnnotationObject[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // --- Drawing / Dragging Tracking ---
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawPoints, setDrawPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDraggingObject, setIsDraggingObject] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; objX: number; objY: number } | null>(null);

  // --- Signature Modal State ---
  const [showSigModal, setShowSigModal] = useState<boolean>(false);
  const [sigTab, setSigTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedSigText, setTypedSigText] = useState<string>('Alex Vance');
  const [typedSigFont, setTypedSigFont] = useState<string>('font-serif italic');
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isWritingSig, setIsWritingSig] = useState<boolean>(false);

  // --- Canvas DOM Refs ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageOverlayRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Push state to undo/redo history
  const recordHistory = useCallback(
    (newAnnotations: PdfAnnotationObject[]) => {
      const updatedHistory = history.slice(0, historyIndex + 1);
      updatedHistory.push(newAnnotations);
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
      setAnnotations(newAnnotations);
    },
    [history, historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setAnnotations(history[historyIndex - 1]);
      setSelectedObjectId(null);
      setEditingTextId(null);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setAnnotations(history[historyIndex + 1]);
      setSelectedObjectId(null);
      setEditingTextId(null);
    }
  }, [historyIndex, history]);

  // Global Keyboard Shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObjectId && !editingTextId) {
          e.preventDefault();
          const next = annotations.filter((a) => a.id !== selectedObjectId);
          recordHistory(next);
          setSelectedObjectId(null);
        }
      } else if (e.key === 'Escape') {
        setSelectedObjectId(null);
        setEditingTextId(null);
        setActiveMode('select');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedObjectId, editingTextId, annotations, recordHistory]);

  // --- Load PDF File from Source ---
  const loadPdf = async (fileOrBuffer: File | ArrayBuffer | Uint8Array, fileName = 'document.pdf') => {
    setIsLoadingPdf(true);
    setLoadError(null);
    try {
      let buffer: ArrayBuffer;
      if (fileOrBuffer instanceof ArrayBuffer) {
        buffer = fileOrBuffer.slice(0);
        setPdfFile(new File([buffer], fileName, { type: 'application/pdf' }));
      } else if (fileOrBuffer instanceof Uint8Array) {
        buffer = fileOrBuffer.buffer.slice(fileOrBuffer.byteOffset, fileOrBuffer.byteOffset + fileOrBuffer.byteLength);
        setPdfFile(new File([buffer], fileName, { type: 'application/pdf' }));
      } else {
        const raw = await FileEngine.readAsArrayBuffer(fileOrBuffer);
        buffer = raw.slice(0);
        setPdfFile(fileOrBuffer);
      }
      setPdfBuffer(buffer);

      // Load PDF.js proxy
      const doc = await PdfEngine.loadPdfJsDoc(buffer);
      setPdfDocProxy(doc);

      // Extract document info directly from the loaded proxy (avoids duplicate worker parse)
      const info = await PdfEngine.getDocumentInfo(doc);
      setDocInfo(info);
      setNumPages(info.numPages);
      setCurrentPage(1);

      setMetaTitle(info.title || fileName.replace('.pdf', ''));
      setMetaAuthor(info.author || '');
      setMetaSubject(info.subject || '');
      setMetaKeywords(info.keywords || '');

      setAnnotations([]);
      setHistory([[]]);
      setHistoryIndex(0);
      setSelectedObjectId(null);
      setEditingTextId(null);
      setSearchResults([]);
      setCurrentMatchIdx(-1);
    } catch (err: any) {
      console.error('Failed to load PDF:', err);
      setLoadError(err?.message || 'Failed to render PDF document.');
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Load Built-in Sample PDF for instant interactive testing
  const handleLoadSample = async () => {
    setIsLoadingPdf(true);
    setLoadError(null);
    try {
      const sampleBytes = await PdfEngine.createSamplePdf();
      await loadPdf(sampleBytes, 'EditMee_Sample_Document.pdf');
    } catch (err: any) {
      console.error('Failed to generate sample PDF:', err);
      setLoadError(err?.message || 'Failed to generate sample document.');
      setIsLoadingPdf(false);
    }
  };

  // Create New Blank PDF
  const handleCreateBlank = async () => {
    try {
      const blankBytes = await PdfEngine.createBlankPdf({ pageSize: 'A4', orientation: 'portrait' });
      await loadPdf(blankBytes, 'New_Document.pdf');
    } catch (err) {
      console.error('Failed to create blank PDF:', err);
    }
  };

  // --- Render Current Page to Canvas ---
  useEffect(() => {
    if (!pdfDocProxy || !canvasRef.current || currentPage < 1) return;

    let isMounted = true;
    PdfEngine.renderPageToCanvas(pdfDocProxy, currentPage, scale, canvasRef.current)
      .then(async (res) => {
        if (!isMounted) return;
        // Extract native text items for in-place text replacement & searching
        try {
          const textContent = await PdfEngine.extractPageText(pdfDocProxy, currentPage);
          if (isMounted) {
            setPageTextItems(textContent.items);
          }
        } catch {
          // ignore extraction error
        }
      })
      .catch((err) => {
        console.warn('Page render error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [pdfDocProxy, currentPage, scale]);

  // Current page dimensions
  const pageSize = docInfo?.pageSizes[currentPage - 1] || { width: 595.28, height: 841.89 };
  const stageWidth = Math.floor(pageSize.width * scale);
  const stageHeight = Math.floor(pageSize.height * scale);

  // --- Stage Mouse Events (Draw / Add / Drag) ---
  const handleStageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageOverlayRef.current) return;
    const rect = stageOverlayRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / scale;
    const clickY = (e.clientY - rect.top) / scale;

    if (activeMode === 'text-add') {
      const newAnn: PdfAnnotationObject = {
        id: `text_${Date.now()}`,
        page: currentPage,
        type: 'text',
        x: Math.round(clickX),
        y: Math.round(clickY),
        width: 180,
        height: 36,
        text: 'Click or type here...',
        fontSize,
        fontFamily: selectedFont,
        fontBold: isBold,
        fontItalic: isItalic,
        color: textColor,
        backgroundColor: bgColor,
        textAlign,
      };
      recordHistory([...annotations, newAnn]);
      setSelectedObjectId(newAnn.id);
      setEditingTextId(newAnn.id);
      setActiveMode('select');
      return;
    }

    if (activeMode === 'draw') {
      setIsDrawing(true);
      setDrawPoints([{ x: clickX, y: clickY }]);
      return;
    }

    if (activeMode === 'highlight') {
      const newAnn: PdfAnnotationObject = {
        id: `hl_${Date.now()}`,
        page: currentPage,
        type: 'highlight',
        x: Math.round(clickX),
        y: Math.round(clickY - 8),
        width: 140,
        height: 18,
        color: highlightColor,
        opacity: 0.45,
      };
      recordHistory([...annotations, newAnn]);
      setSelectedObjectId(newAnn.id);
      return;
    }

    if (activeMode === 'redact') {
      const newAnn: PdfAnnotationObject = {
        id: `redact_${Date.now()}`,
        page: currentPage,
        type: 'redact',
        x: Math.round(clickX),
        y: Math.round(clickY - 10),
        width: 120,
        height: 22,
        color: '#000000',
        opacity: 1.0,
      };
      recordHistory([...annotations, newAnn]);
      setSelectedObjectId(newAnn.id);
      return;
    }

    if (activeMode === 'rect') {
      const newAnn: PdfAnnotationObject = {
        id: `rect_${Date.now()}`,
        page: currentPage,
        type: 'rect',
        x: Math.round(clickX),
        y: Math.round(clickY),
        width: 120,
        height: 70,
        borderColor: textColor || '#ef4444',
        borderWidth: strokeWidth,
      };
      recordHistory([...annotations, newAnn]);
      setSelectedObjectId(newAnn.id);
      return;
    }

    if (activeMode === 'circle') {
      const newAnn: PdfAnnotationObject = {
        id: `circle_${Date.now()}`,
        page: currentPage,
        type: 'circle',
        x: Math.round(clickX),
        y: Math.round(clickY),
        width: 80,
        height: 80,
        borderColor: textColor || '#ef4444',
        borderWidth: strokeWidth,
      };
      recordHistory([...annotations, newAnn]);
      setSelectedObjectId(newAnn.id);
      return;
    }

    if (activeMode === 'stamp') {
      const newAnn: PdfAnnotationObject = {
        id: `stamp_${Date.now()}`,
        page: currentPage,
        type: 'stamp',
        x: Math.round(clickX - 65),
        y: Math.round(clickY - 21),
        width: 130,
        height: 42,
        stampText,
        color: stampColor,
      };
      recordHistory([...annotations, newAnn]);
      setSelectedObjectId(newAnn.id);
      setActiveMode('select');
      return;
    }

    if (activeMode === 'form-text') {
      const newAnn: PdfAnnotationObject = {
        id: `form_text_${Date.now()}`,
        page: currentPage,
        type: 'form-text',
        x: Math.round(clickX),
        y: Math.round(clickY),
        width: 160,
        height: 26,
        formFieldName: `Field_${Date.now()}`,
        formFieldValue: '',
        formPlaceholder: 'Type here...',
      };
      recordHistory([...annotations, newAnn]);
      setSelectedObjectId(newAnn.id);
      setActiveMode('select');
      return;
    }

    if (activeMode === 'form-check') {
      const newAnn: PdfAnnotationObject = {
        id: `form_check_${Date.now()}`,
        page: currentPage,
        type: 'form-check',
        x: Math.round(clickX),
        y: Math.round(clickY),
        width: 18,
        height: 18,
        formFieldValue: false,
      };
      recordHistory([...annotations, newAnn]);
      setSelectedObjectId(newAnn.id);
      setActiveMode('select');
      return;
    }

    // In select mode: clicking blank area clears selection
    if (activeMode === 'select') {
      setSelectedObjectId(null);
      setEditingTextId(null);
    }
  };

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageOverlayRef.current) return;
    const rect = stageOverlayRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    // Freehand drawing stroke
    if (isDrawing && activeMode === 'draw') {
      setDrawPoints((prev) => [...prev, { x: mouseX, y: mouseY }]);
      return;
    }

    // Dragging selected object
    if (isDraggingObject && selectedObjectId && dragStart) {
      const deltaX = mouseX - dragStart.mouseX;
      const deltaY = mouseY - dragStart.mouseY;

      setAnnotations((prev) =>
        prev.map((ann) => {
          if (ann.id === selectedObjectId) {
            return {
              ...ann,
              x: Math.round(dragStart.objX + deltaX),
              y: Math.round(dragStart.objY + deltaY),
            };
          }
          return ann;
        })
      );
    }
  };

  const handleStageMouseUp = () => {
    if (isDrawing && activeMode === 'draw' && drawPoints.length > 1) {
      const newAnn: PdfAnnotationObject = {
        id: `draw_${Date.now()}`,
        page: currentPage,
        type: 'draw',
        x: drawPoints[0].x,
        y: drawPoints[0].y,
        points: drawPoints,
        color: textColor || '#2563eb',
        strokeWidth,
      };
      recordHistory([...annotations, newAnn]);
      setIsDrawing(false);
      setDrawPoints([]);
      return;
    }

    if (isDraggingObject) {
      setIsDraggingObject(false);
      setDragStart(null);
      recordHistory(annotations);
    }
  };

  // Convert Native PDF Text block into an In-place Editable Text Annotation
  const handleEditNativeText = (item: PdfTextItem) => {
    // Match existing annotation by page and coordinates
    const existingIndex = annotations.findIndex(
      (a) =>
        a.page === currentPage &&
        a.originalTextItem &&
        Math.abs(a.originalTextItem.x - item.x) < 3 &&
        Math.abs(a.originalTextItem.y - item.y) < 3
    );
    if (existingIndex >= 0) {
      setSelectedObjectId(annotations[existingIndex].id);
      setEditingTextId(annotations[existingIndex].id);
      return;
    }

    const fontLower = (item.fontName || '').toLowerCase();
    const isSerif = fontLower.includes('times') || fontLower.includes('serif') || fontLower.includes('roman');
    const isMono = fontLower.includes('courier') || fontLower.includes('mono');
    const resolvedFont: 'Helvetica' | 'TimesRoman' | 'Courier' = isMono ? 'Courier' : isSerif ? 'TimesRoman' : 'Helvetica';
    const isFontBold = fontLower.includes('bold') || fontLower.includes('heavy') || fontLower.includes('black');
    const isFontItalic = fontLower.includes('italic') || fontLower.includes('oblique');
    const resolvedSize = Math.round(item.fontSize || 12);

    setSelectedFont(resolvedFont);
    setFontSize(resolvedSize);
    setIsBold(isFontBold);
    setIsItalic(isFontItalic);

    const newAnn: PdfAnnotationObject = {
      id: `edit_native_${Date.now()}`,
      page: currentPage,
      type: 'text',
      x: item.x,
      y: item.y,
      width: Math.max(item.width, 100),
      height: item.height,
      text: item.str,
      fontSize: resolvedSize,
      fontFamily: resolvedFont,
      fontBold: isFontBold,
      fontItalic: isFontItalic,
      color: '#000000',
      backgroundColor: '#ffffff',
      originalTextItem: {
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        originalStr: item.str,
      },
    };

    const nextAnnotations = [...annotations, newAnn];
    recordHistory(nextAnnotations);
    setSelectedObjectId(newAnn.id);
    setEditingTextId(newAnn.id);
  };

  // --- Search & Replace Handlers ---
  const handlePerformSearch = async () => {
    if (!pdfDocProxy || !searchQuery.trim()) {
      setSearchResults([]);
      setCurrentMatchIdx(-1);
      return;
    }
    setIsSearching(true);
    try {
      const matches = await PdfEngine.searchInPdf(pdfDocProxy, searchQuery, caseSensitive);
      setSearchResults(matches);
      if (matches.length > 0) {
        setCurrentMatchIdx(0);
        setCurrentPage(matches[0].page);
      } else {
        setCurrentMatchIdx(-1);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleNextMatch = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentMatchIdx + 1) % searchResults.length;
    setCurrentMatchIdx(nextIdx);
    setCurrentPage(searchResults[nextIdx].page);
  };

  const handlePrevMatch = () => {
    if (searchResults.length === 0) return;
    const prevIdx = (currentMatchIdx - 1 + searchResults.length) % searchResults.length;
    setCurrentMatchIdx(prevIdx);
    setCurrentPage(searchResults[prevIdx].page);
  };

  const handleReplaceCurrent = () => {
    if (searchResults.length === 0 || currentMatchIdx < 0) return;
    const match = searchResults[currentMatchIdx];

    const replacementAnn: PdfAnnotationObject = {
      id: `rep_${Date.now()}`,
      page: match.page,
      type: 'text',
      x: match.x,
      y: match.y,
      width: match.width * 1.2,
      height: match.height,
      text: replaceQuery,
      fontSize: 11,
      fontFamily: 'Helvetica',
      color: '#0f172a',
      backgroundColor: '#ffffff',
      originalTextItem: {
        x: match.x,
        y: match.y,
        width: match.width,
        height: match.height,
        originalStr: match.text,
      },
    };

    recordHistory([...annotations, replacementAnn]);
    // Remove match from list
    const nextMatches = searchResults.filter((_, idx) => idx !== currentMatchIdx);
    setSearchResults(nextMatches);
    if (nextMatches.length > 0) {
      setCurrentMatchIdx(Math.min(currentMatchIdx, nextMatches.length - 1));
      setCurrentPage(nextMatches[Math.min(currentMatchIdx, nextMatches.length - 1)].page);
    } else {
      setCurrentMatchIdx(-1);
    }
  };

  const handleReplaceAll = () => {
    if (searchResults.length === 0) return;
    const newAnns: PdfAnnotationObject[] = [...annotations];

    searchResults.forEach((match, idx) => {
      newAnns.push({
        id: `rep_all_${Date.now()}_${idx}`,
        page: match.page,
        type: 'text',
        x: match.x,
        y: match.y,
        width: match.width * 1.2,
        height: match.height,
        text: replaceQuery,
        fontSize: 11,
        fontFamily: 'Helvetica',
        color: '#0f172a',
        backgroundColor: '#ffffff',
        originalTextItem: {
          x: match.x,
          y: match.y,
          width: match.width,
          height: match.height,
          originalStr: match.text,
        },
      });
    });

    recordHistory(newAnns);
    setSearchResults([]);
    setCurrentMatchIdx(-1);
  };

  // --- Page Management Handlers ---
  const handleRotatePage = async (pageIdx: number) => {
    if (!pdfBuffer) return;
    try {
      const updated = await PdfEngine.rotatePages(pdfBuffer, 90, [pageIdx]);
      await loadPdf(updated.buffer, pdfFile?.name || 'document.pdf');
    } catch (e) {
      console.error('Failed to rotate page', e);
    }
  };

  const handleDuplicatePage = async (pageIdx: number) => {
    if (!pdfBuffer) return;
    try {
      const updated = await PdfEngine.duplicatePage(pdfBuffer, pageIdx);
      await loadPdf(updated.buffer, pdfFile?.name || 'document.pdf');
    } catch (e) {
      console.error('Failed to duplicate page', e);
    }
  };

  const handleDeletePage = async (pageIdx: number) => {
    if (!pdfBuffer || numPages <= 1) return;
    try {
      const updated = await PdfEngine.deletePage(pdfBuffer, pageIdx);
      await loadPdf(updated.buffer, pdfFile?.name || 'document.pdf');
    } catch (e) {
      console.error('Failed to delete page', e);
    }
  };

  const handleMovePage = async (fromIdx: number, toIdx: number) => {
    if (!pdfBuffer || toIdx < 0 || toIdx >= numPages || fromIdx === toIdx) return;
    try {
      const order = Array.from({ length: numPages }, (_, i) => i);
      const [removed] = order.splice(fromIdx, 1);
      order.splice(toIdx, 0, removed);
      const updated = await PdfEngine.reorderPages(pdfBuffer, order);
      await loadPdf(updated.buffer, pdfFile?.name || 'document.pdf');
      setCurrentPage(toIdx + 1);
    } catch (e) {
      console.error('Failed to reorder pages', e);
    }
  };

  // --- Insert Image Handler ---
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const newAnn: PdfAnnotationObject = {
        id: `img_${Date.now()}`,
        page: currentPage,
        type: 'image',
        x: 100,
        y: 100,
        width: 180,
        height: 120,
        imageDataUrl: dataUrl,
      };
      recordHistory([...annotations, newAnn]);
      setSelectedObjectId(newAnn.id);
    };
    reader.readAsDataURL(file);
  };

  // --- Signature Pad Placement ---
  const handleSaveSignature = () => {
    let sigDataUrl = '';
    if (sigTab === 'draw' && sigCanvasRef.current) {
      sigDataUrl = sigCanvasRef.current.toDataURL('image/png');
    } else if (sigTab === 'type') {
      // Render typed cursive signature to virtual canvas
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = '36px "Dancing Script", "Caveat", "Brush Script MT", cursive';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(typedSigText || 'Signed', 30, 75);
        sigDataUrl = canvas.toDataURL('image/png');
      }
    }

    if (sigDataUrl) {
      const newAnn: PdfAnnotationObject = {
        id: `sig_${Date.now()}`,
        page: currentPage,
        type: 'signature',
        x: 120,
        y: 200,
        width: 160,
        height: 60,
        imageDataUrl: sigDataUrl,
      };
      recordHistory([...annotations, newAnn]);
      setSelectedObjectId(newAnn.id);
    }
    setShowSigModal(false);
  };

  // --- Master Export Function ---
  const handleExportPdf = async () => {
    if (!pdfBuffer) return;
    try {
      const exportedBytes = await PdfEngine.exportDocument(pdfBuffer, {
        annotations,
        watermark: watermarkText
          ? {
              text: watermarkText,
              opacity: watermarkOpacity,
              fontSize: watermarkFontSize,
              rotation: watermarkRotation,
              colorHex: watermarkColor,
            }
          : undefined,
        pageNumbers: {
          enabled: pageNumberingEnabled,
          format: pageNumberFormat,
          position: pageNumberPosition,
        },
        metadata: {
          title: metaTitle,
          author: metaAuthor,
          subject: metaSubject,
          keywords: metaKeywords,
        },
      });

      const exportBlob = new Blob([exportedBytes], { type: 'application/pdf' });
      const outName = `edited_${pdfFile?.name || 'document.pdf'}`;
      FileEngine.downloadBlob(exportBlob, outName);

      storageEngine.addHistoryItem({
        toolId: 'edit-pdf',
        toolName: 'Edit PDF Studio',
        category: 'pdf',
        status: 'completed',
        outputFilename: outName,
        outputSummary: `Exported ${numPages} pages with ${annotations.length} modifications`,
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
    }
  };

  // Active object selected in inspector
  const selectedObject = annotations.find((a) => a.id === selectedObjectId);
  const pageAnnotations = annotations.filter((a) => a.page === currentPage);

  return (
    <div id="edit-pdf-workspace" className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-md">
      {/* 1. TOP MASTER TOOLBAR */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0">
        {/* Left Section: File Operations & Mode Switchers */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {!pdfBuffer ? (
            <div className="flex items-center gap-2">
              <label
                htmlFor="pdf-file-picker"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Open PDF
              </label>
              <button
                onClick={handleLoadSample}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Load Sample PDF
              </button>
              <button
                onClick={handleCreateBlank}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FilePlus className="w-3.5 h-3.5 text-blue-400" />
                New Blank
              </button>
            </div>
          ) : (
            <>
              {/* Select Tool */}
              <button
                onClick={() => {
                  setActiveMode('select');
                  setEditingTextId(null);
                }}
                className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeMode === 'select'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title="Select & Move (V)"
              >
                <MousePointer className="w-4 h-4" />
              </button>

              {/* Text Edit / Replace Mode */}
              <button
                onClick={() => setActiveMode('text-edit')}
                className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeMode === 'text-edit'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title="Edit Existing PDF Text (Double-click any text block)"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {/* Add New Text */}
              <button
                onClick={() => setActiveMode('text-add')}
                className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeMode === 'text-add'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title="Add Text Box (T)"
              >
                <Type className="w-4 h-4" />
              </button>

              {/* Draw / Pen */}
              <button
                onClick={() => setActiveMode('draw')}
                className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeMode === 'draw'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title="Freehand Pen Tool"
              >
                <PenTool className="w-4 h-4" />
              </button>

              {/* Highlighter */}
              <button
                onClick={() => setActiveMode('highlight')}
                className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeMode === 'highlight'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title="Highlighter Tool"
              >
                <Highlighter className="w-4 h-4" />
              </button>

              {/* Redact */}
              <button
                onClick={() => setActiveMode('redact')}
                className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeMode === 'redact'
                    ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title="Redact Blackout"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>

              {/* Shapes */}
              <button
                onClick={() => setActiveMode('rect')}
                className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeMode === 'rect'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title="Rectangle Shape"
              >
                <Square className="w-4 h-4" />
              </button>

              {/* Stamp */}
              <button
                onClick={() => setActiveMode('stamp')}
                className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeMode === 'stamp'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title="Approved / Confidential Stamp"
              >
                <Stamp className="w-4 h-4" />
              </button>

              {/* Signature */}
              <button
                onClick={() => setShowSigModal(true)}
                className="p-2 rounded-lg text-xs font-medium border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sign PDF"
              >
                <FileSignature className="w-4 h-4 text-emerald-400" />
              </button>

              {/* Image upload */}
              <button
                onClick={() => imageInputRef.current?.click()}
                className="p-2 rounded-lg text-xs font-medium border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Insert Image"
              >
                <ImageIcon className="w-4 h-4 text-blue-400" />
              </button>

              {/* Form Controls */}
              <button
                onClick={() => setActiveMode('form-text')}
                className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeMode === 'form-text'
                    ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title="Add Fillable Form Field"
              >
                <CheckSquare className="w-4 h-4" />
              </button>

              <div className="h-5 w-px bg-slate-800 mx-1"></div>

              {/* Undo / Redo */}
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => e.target.files?.[0] && loadPdf(e.target.files[0])}
            className="hidden"
            id="pdf-file-picker"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            className="hidden"
          />
        </div>

        {/* Center: Page Jump & Quick Search */}
        {pdfBuffer && (
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-400">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-slate-200">
                Page <span className="font-bold text-blue-400">{currentPage}</span> of {numPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                disabled={currentPage >= numPages}
                className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Right Section: Zoom & Master Export */}
        <div className="flex items-center gap-2">
          {pdfBuffer && (
            <>
              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-slate-400">
                <button
                  onClick={() => setScale((s) => Math.max(0.4, Number((s - 0.15).toFixed(2))))}
                  className="p-1 hover:text-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs px-1.5 font-mono text-slate-200">{Math.round(scale * 100)}%</span>
                <button
                  onClick={() => setScale((s) => Math.min(2.5, Number((s + 0.15).toFixed(2))))}
                  className="p-1 hover:text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rotate Page Button */}
              <button
                onClick={() => handleRotatePage(currentPage - 1)}
                className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                title="Rotate Current Page 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Master Export Button */}
              <button
                onClick={handleExportPdf}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. SECONDARY CONTEXTUAL FORMATTING BAR */}
      {pdfBuffer && (
        <div className="h-10 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 overflow-x-auto gap-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Font Family */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-mono text-[11px]">Font:</span>
              <select
                value={selectedObject?.fontFamily || selectedFont}
                onChange={(e) => {
                  const f = e.target.value as any;
                  setSelectedFont(f);
                  if (selectedObjectId) {
                    recordHistory(annotations.map((a) => (a.id === selectedObjectId ? { ...a, fontFamily: f } : a)));
                  }
                }}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 outline-none"
              >
                <option value="Helvetica">Helvetica (Standard)</option>
                <option value="TimesRoman">Times Roman (Serif)</option>
                <option value="Courier">Courier (Monospace)</option>
              </select>
            </div>

            {/* Font Size */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-mono text-[11px]">Size:</span>
              <select
                value={selectedObject?.fontSize || fontSize}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  setFontSize(s);
                  if (selectedObjectId) {
                    recordHistory(annotations.map((a) => (a.id === selectedObjectId ? { ...a, fontSize: s } : a)));
                  }
                }}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 outline-none"
              >
                {[9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((s) => (
                  <option key={s} value={s}>
                    {s} pt
                  </option>
                ))}
              </select>
            </div>

            {/* Bold / Italic */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
              <button
                onClick={() => {
                  const next = !isBold;
                  setIsBold(next);
                  if (selectedObjectId) {
                    recordHistory(annotations.map((a) => (a.id === selectedObjectId ? { ...a, fontBold: next } : a)));
                  }
                }}
                className={`p-1 rounded ${isBold ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  const next = !isItalic;
                  setIsItalic(next);
                  if (selectedObjectId) {
                    recordHistory(annotations.map((a) => (a.id === selectedObjectId ? { ...a, fontItalic: next } : a)));
                  }
                }}
                className={`p-1 rounded ${isItalic ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Text Color Picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-mono text-[11px]">Color:</span>
              <input
                type="color"
                value={selectedObject?.color || textColor}
                onChange={(e) => {
                  const c = e.target.value;
                  setTextColor(c);
                  if (selectedObjectId) {
                    recordHistory(annotations.map((a) => (a.id === selectedObjectId ? { ...a, color: c } : a)));
                  }
                }}
                className="w-5 h-5 rounded border border-slate-700 bg-transparent cursor-pointer"
                title="Text / Stroke Color"
              >
              </input>
            </div>

            {/* Text Alignment */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
              <button
                onClick={() => {
                  setTextAlign('left');
                  if (selectedObjectId) {
                    recordHistory(annotations.map((a) => (a.id === selectedObjectId ? { ...a, textAlign: 'left' } : a)));
                  }
                }}
                className={`p-1 rounded ${textAlign === 'left' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Align Left"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setTextAlign('center');
                  if (selectedObjectId) {
                    recordHistory(annotations.map((a) => (a.id === selectedObjectId ? { ...a, textAlign: 'center' } : a)));
                  }
                }}
                className={`p-1 rounded ${textAlign === 'center' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Align Center"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setTextAlign('right');
                  if (selectedObjectId) {
                    recordHistory(annotations.map((a) => (a.id === selectedObjectId ? { ...a, textAlign: 'right' } : a)));
                  }
                }}
                className={`p-1 rounded ${textAlign === 'right' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Align Right"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Mode Status indicator */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span>Mode:</span>
            <span className="font-semibold text-blue-400 uppercase tracking-wider">{activeMode}</span>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR TABS & PANELS */}
        {pdfBuffer && (
          <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
            {/* Sidebar Navigation Tabs */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950 p-1">
              <button
                onClick={() => setActiveSidebarTab('pages')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeSidebarTab === 'pages' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pages
              </button>
              <button
                onClick={() => setActiveSidebarTab('layers')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeSidebarTab === 'layers' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Layers
              </button>
              <button
                onClick={() => setActiveSidebarTab('search')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeSidebarTab === 'search' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Search
              </button>
              <button
                onClick={() => setActiveSidebarTab('watermark')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeSidebarTab === 'watermark' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Stamp
              </button>
              <button
                onClick={() => setActiveSidebarTab('metadata')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeSidebarTab === 'metadata' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Meta
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* TAB 1: PAGES MANAGEMENT */}
              {activeSidebarTab === 'pages' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">All Pages ({numPages})</span>
                    <button
                      onClick={handleCreateBlank}
                      className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                    >
                      <FilePlus className="w-3 h-3" />
                      Add Blank
                    </button>
                  </div>

                  {Array.from({ length: numPages }, (_, i) => i + 1).map((pg) => (
                    <div
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        currentPage === pg
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 font-bold">{pg}</span>
                        <span>Page {pg}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovePage(pg - 1, pg - 2);
                          }}
                          disabled={pg === 1}
                          className="p-1 hover:text-white disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovePage(pg - 1, pg);
                          }}
                          disabled={pg === numPages}
                          className="p-1 hover:text-white disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRotatePage(pg - 1);
                          }}
                          className="p-1 hover:text-white"
                          title="Rotate 90°"
                        >
                          <RotateCw className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicatePage(pg - 1);
                          }}
                          className="p-1 hover:text-white"
                          title="Duplicate Page"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePage(pg - 1);
                          }}
                          disabled={numPages <= 1}
                          className="p-1 hover:text-red-400 disabled:opacity-20"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: LAYERS & OBJECTS */}
              {activeSidebarTab === 'layers' && (
                <div className="space-y-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Page {currentPage} Objects ({pageAnnotations.length})
                  </div>
                  {pageAnnotations.length === 0 ? (
                    <div className="text-xs text-slate-500 py-6 text-center">
                      No annotations or text blocks added to Page {currentPage} yet.
                    </div>
                  ) : (
                    pageAnnotations.map((ann, idx) => (
                      <div
                        key={ann.id}
                        onClick={() => setSelectedObjectId(ann.id)}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer ${
                          selectedObjectId === ann.id
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'border-slate-800 hover:bg-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[10px] text-slate-500">#{idx + 1}</span>
                          <span className="capitalize font-medium">{ann.type}</span>
                          <span className="text-slate-500 truncate text-[11px]">
                            {ann.text || ann.stampText || ann.formFieldName || 'Object'}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            recordHistory(annotations.filter((a) => a.id !== ann.id));
                            if (selectedObjectId === ann.id) setSelectedObjectId(null);
                          }}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: SEARCH & REPLACE */}
              {activeSidebarTab === 'search' && (
                <div className="space-y-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Search & Replace
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Find Text</label>
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                        <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
                        <input
                          type="text"
                          placeholder="Search inside PDF..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handlePerformSearch()}
                          className="bg-transparent text-xs text-white outline-none w-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={caseSensitive}
                          onChange={(e) => setCaseSensitive(e.target.checked)}
                          className="rounded border-slate-700"
                        />
                        Match case
                      </label>
                      <button
                        onClick={handlePerformSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-40"
                      >
                        Find
                      </button>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-blue-400 font-medium">
                            Match {currentMatchIdx + 1} of {searchResults.length}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={handlePrevMatch}
                              className="p-1 rounded hover:bg-slate-800 text-slate-300"
                              title="Previous Match"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handleNextMatch}
                              className="p-1 rounded hover:bg-slate-800 text-slate-300"
                              title="Next Match"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Replace Input */}
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Replace With</label>
                          <input
                            type="text"
                            placeholder="New replacement text..."
                            value={replaceQuery}
                            onChange={(e) => setReplaceQuery(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-md px-2 py-1.5 text-xs text-white outline-none w-full"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={handleReplaceCurrent}
                            className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
                          >
                            Replace
                          </button>
                          <button
                            onClick={handleReplaceAll}
                            className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white"
                          >
                            Replace All
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: WATERMARK & NUMBERING */}
              {activeSidebarTab === 'watermark' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Watermark Settings
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Watermark Text</label>
                      <input
                        type="text"
                        placeholder="e.g. CONFIDENTIAL, DRAFT"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-white outline-none w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Opacity</span>
                        <span>{Math.round(watermarkOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.8"
                        step="0.05"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Font Size</span>
                        <span>{watermarkFontSize} pt</span>
                      </div>
                      <input
                        type="range"
                        min="24"
                        max="96"
                        step="4"
                        value={watermarkFontSize}
                        onChange={(e) => setWatermarkFontSize(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Page Numbering
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pageNumberingEnabled}
                        onChange={(e) => setPageNumberingEnabled(e.target.checked)}
                        className="rounded border-slate-700"
                      />
                      Add page numbers
                    </label>

                    {pageNumberingEnabled && (
                      <div className="space-y-2 pt-1">
                        <select
                          value={pageNumberFormat}
                          onChange={(e) => setPageNumberFormat(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 outline-none"
                        >
                          <option value="Page {n} of {total}">Page 1 of 5</option>
                          <option value="{n} / {total}">1 / 5</option>
                          <option value="{n}">1</option>
                        </select>

                        <select
                          value={pageNumberPosition}
                          onChange={(e) => setPageNumberPosition(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 outline-none"
                        >
                          <option value="bottom-center">Bottom Center</option>
                          <option value="bottom-right">Bottom Right</option>
                          <option value="top-right">Top Right</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: DOCUMENT METADATA */}
              {activeSidebarTab === 'metadata' && (
                <div className="space-y-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    PDF Document Metadata
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Document Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-white outline-none w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Author</label>
                    <input
                      type="text"
                      value={metaAuthor}
                      onChange={(e) => setMetaAuthor(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-white outline-none w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Subject</label>
                    <input
                      type="text"
                      value={metaSubject}
                      onChange={(e) => setMetaSubject(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-white outline-none w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Keywords</label>
                    <input
                      type="text"
                      value={metaKeywords}
                      onChange={(e) => setMetaKeywords(e.target.value)}
                      placeholder="e.g. invoice, report, confidential"
                      className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-white outline-none w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CENTER: INTERACTIVE CANVAS STAGE */}
        <div className="flex-1 bg-slate-950 p-6 overflow-auto flex items-center justify-center relative">
          {isLoadingPdf && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-300">Rendering high-resolution PDF pages...</p>
            </div>
          )}

          {loadError && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 border border-red-800 text-red-200 px-4 py-2.5 rounded-lg text-xs flex items-center gap-3 shadow-xl backdrop-blur-md">
              <span>{loadError}</span>
              <button
                onClick={() => setLoadError(null)}
                className="text-red-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {!pdfBuffer ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) loadPdf(e.dataTransfer.files[0]);
              }}
              className="max-w-lg w-full border-2 border-dashed border-slate-800 hover:border-blue-500/60 rounded-2xl p-10 text-center bg-slate-900/60 transition-all space-y-5 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Full-Featured PDF Workspace</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Direct text editing, annotations, digital signatures, vector highlighter, shapes, redaction, search & replace, page reordering, and watermarks in your browser.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <label
                  htmlFor="pdf-file-picker"
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-sm font-semibold text-white cursor-pointer shadow-lg transition-all"
                >
                  Choose PDF File
                </label>
                <button
                  onClick={handleLoadSample}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Load Sample PDF
                </button>
              </div>
            </div>
          ) : (
            <div
              className="relative shadow-2xl rounded-lg bg-white overflow-hidden select-none"
              style={{
                width: `${stageWidth}px`,
                height: `${stageHeight}px`,
              }}
            >
              {/* Layer 1: Native PDF.js Canvas Layer */}
              <canvas ref={canvasRef} className="block absolute top-0 left-0 pointer-events-none" />

              {/* Layer 2: Search Highlight Boxes */}
              {searchResults
                .filter((m) => m.page === currentPage)
                .map((match, mIdx) => (
                  <div
                    key={`match_${mIdx}`}
                    style={{
                      left: `${match.x * scale}px`,
                      top: `${match.y * scale}px`,
                      width: `${match.width * scale}px`,
                      height: `${match.height * scale}px`,
                    }}
                    className="absolute bg-amber-400/50 border border-amber-500 pointer-events-none rounded-xs animate-pulse"
                  />
                ))}

              {/* Layer 3: Interactive Native Text Hover Blocks (In text-edit or select mode) */}
              {(activeMode === 'text-edit' || activeMode === 'select') &&
                pageTextItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditNativeText(item);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleEditNativeText(item);
                    }}
                    style={{
                      left: `${item.x * scale}px`,
                      top: `${item.y * scale}px`,
                      width: `${Math.max(item.width * scale, 24)}px`,
                      height: `${Math.max(item.height * scale, 14)}px`,
                    }}
                    className={`absolute z-20 transition-all cursor-text group ${
                      activeMode === 'text-edit'
                        ? 'border border-dashed border-blue-400 bg-blue-500/10 hover:bg-blue-500/25'
                        : 'hover:border hover:border-dashed hover:border-blue-400/60 hover:bg-blue-500/15'
                    }`}
                    title={`Click to edit text: "${item.str}"`}
                  >
                    {activeMode === 'text-edit' && (
                      <span className="hidden group-hover:flex items-center gap-1 absolute -top-6 left-0 bg-blue-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-30 pointer-events-none">
                        ✏️ Click to edit
                      </span>
                    )}
                  </div>
                ))}

              {/* Layer 4: Interactive Annotations & Placed Objects */}
              {pageAnnotations.map((ann) => {
                const isSelected = selectedObjectId === ann.id;
                const isEditingThis = editingTextId === ann.id;

                return (
                  <div
                    key={ann.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedObjectId(ann.id);
                    }}
                    onMouseDown={(e) => {
                      if (activeMode === 'select' && !isEditingThis) {
                        e.stopPropagation();
                        setSelectedObjectId(ann.id);
                        setIsDraggingObject(true);
                        const rect = stageOverlayRef.current?.getBoundingClientRect();
                        if (rect) {
                          setDragStart({
                            mouseX: (e.clientX - rect.left) / scale,
                            mouseY: (e.clientY - rect.top) / scale,
                            objX: ann.x,
                            objY: ann.y,
                          });
                        }
                      }
                    }}
                    style={{
                      left: `${ann.x * scale}px`,
                      top: `${ann.y * scale}px`,
                      width: ann.width ? `${Math.max(ann.width * scale, 40)}px` : undefined,
                      minHeight: ann.height ? `${ann.height * scale}px` : undefined,
                    }}
                    className={`absolute z-30 ${isSelected ? 'ring-2 ring-blue-500 rounded-sm' : ''} ${
                      activeMode === 'select' && !isEditingThis ? 'cursor-move' : ''
                    }`}
                  >
                    {/* Render by Object Type */}
                    {ann.type === 'text' && (
                      <div
                        style={{
                          fontSize: `${(ann.fontSize || 14) * scale}px`,
                          color: ann.color || '#000000',
                          backgroundColor: ann.backgroundColor || '#ffffff',
                          fontFamily:
                            ann.fontFamily === 'Courier'
                              ? 'Courier, monospace'
                              : ann.fontFamily === 'TimesRoman'
                              ? 'Times New Roman, serif'
                              : 'Inter, Helvetica, sans-serif',
                          fontWeight: ann.fontBold ? 'bold' : 'normal',
                          fontStyle: ann.fontItalic ? 'italic' : 'normal',
                          textAlign: ann.textAlign || 'left',
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingTextId(ann.id);
                        }}
                        className="px-1 py-0.5 outline-none whitespace-pre-wrap leading-tight relative shadow-xs"
                      >
                        {isEditingThis ? (
                          <div className="relative">
                            <textarea
                              autoFocus
                              value={ann.text || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAnnotations((prev) =>
                                  prev.map((a) => (a.id === ann.id ? { ...a, text: val } : a))
                                );
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  setEditingTextId(null);
                                  setAnnotations((curr) => {
                                    recordHistory(curr);
                                    return curr;
                                  });
                                } else if (e.key === 'Escape') {
                                  setEditingTextId(null);
                                }
                              }}
                              onBlur={() => {
                                setEditingTextId(null);
                                setAnnotations((curr) => {
                                  recordHistory(curr);
                                  return curr;
                                });
                              }}
                              style={{
                                fontSize: `${(ann.fontSize || 14) * scale}px`,
                                fontFamily:
                                  ann.fontFamily === 'Courier'
                                    ? 'Courier, monospace'
                                    : ann.fontFamily === 'TimesRoman'
                                    ? 'Times New Roman, serif'
                                    : 'Inter, Helvetica, sans-serif',
                                fontWeight: ann.fontBold ? 'bold' : 'normal',
                                fontStyle: ann.fontItalic ? 'italic' : 'normal',
                                color: ann.color || '#000000',
                              }}
                              className="bg-white text-slate-900 border-2 border-blue-600 rounded p-1 w-full min-w-[140px] min-h-[34px] outline-none shadow-xl resize font-sans"
                            />
                            <div className="absolute -top-7 right-0 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded shadow flex items-center gap-1 font-medium pointer-events-none">
                              Press Enter to Save
                            </div>
                          </div>
                        ) : (
                          ann.text || <span className="opacity-40 italic">Empty text</span>
                        )}
                      </div>
                    )}

                    {ann.type === 'highlight' && (
                      <div
                        style={{
                          width: `${(ann.width || 140) * scale}px`,
                          height: `${(ann.height || 18) * scale}px`,
                          backgroundColor: ann.color || '#fef08a',
                          opacity: ann.opacity || 0.45,
                        }}
                        className="rounded-xs"
                      />
                    )}

                    {ann.type === 'redact' && (
                      <div
                        style={{
                          width: `${(ann.width || 120) * scale}px`,
                          height: `${(ann.height || 20) * scale}px`,
                        }}
                        className="bg-black text-white font-mono text-[9px] flex items-center justify-center font-bold tracking-widest uppercase opacity-95"
                      >
                        REDACTED
                      </div>
                    )}

                    {ann.type === 'rect' && (
                      <div
                        style={{
                          width: `${(ann.width || 100) * scale}px`,
                          height: `${(ann.height || 60) * scale}px`,
                          borderColor: ann.borderColor || '#ef4444',
                          borderWidth: `${(ann.borderWidth || 2) * scale}px`,
                        }}
                        className="border rounded-xs"
                      />
                    )}

                    {ann.type === 'circle' && (
                      <div
                        style={{
                          width: `${(ann.width || 80) * scale}px`,
                          height: `${(ann.height || 80) * scale}px`,
                          borderColor: ann.borderColor || '#ef4444',
                          borderWidth: `${(ann.borderWidth || 2) * scale}px`,
                        }}
                        className="border rounded-full"
                      />
                    )}

                    {ann.type === 'stamp' && (
                      <div
                        style={{
                          width: `${130 * scale}px`,
                          height: `${42 * scale}px`,
                          borderColor: ann.color || '#dc2626',
                          color: ann.color || '#dc2626',
                          fontSize: `${13 * scale}px`,
                        }}
                        className="border-2 border-dashed rounded font-black tracking-widest flex items-center justify-center uppercase bg-red-500/10 rotate-[-4deg]"
                      >
                        {ann.stampText || 'APPROVED'}
                      </div>
                    )}

                    {ann.type === 'signature' && ann.imageDataUrl && (
                      <img
                        src={ann.imageDataUrl}
                        alt="Signature"
                        style={{
                          width: `${(ann.width || 160) * scale}px`,
                          height: `${(ann.height || 60) * scale}px`,
                        }}
                        className="object-contain pointer-events-none"
                      />
                    )}

                    {ann.type === 'image' && ann.imageDataUrl && (
                      <img
                        src={ann.imageDataUrl}
                        alt="Inserted Media"
                        style={{
                          width: `${(ann.width || 180) * scale}px`,
                          height: `${(ann.height || 120) * scale}px`,
                        }}
                        className="object-contain pointer-events-none rounded shadow-sm"
                      />
                    )}

                    {ann.type === 'form-text' && (
                      <input
                        type="text"
                        placeholder={ann.formPlaceholder || 'Enter value...'}
                        value={String(ann.formFieldValue || '')}
                        onChange={(e) => {
                          const v = e.target.value;
                          setAnnotations((prev) =>
                            prev.map((a) => (a.id === ann.id ? { ...a, formFieldValue: v } : a))
                          );
                        }}
                        style={{
                          width: `${(ann.width || 160) * scale}px`,
                          height: `${(ann.height || 26) * scale}px`,
                          fontSize: `${11 * scale}px`,
                        }}
                        className="bg-blue-50/70 border border-blue-400 text-slate-900 rounded px-2 py-0.5 outline-none font-medium"
                      />
                    )}

                    {ann.type === 'form-check' && (
                      <input
                        type="checkbox"
                        checked={ann.formFieldValue === true || ann.formFieldValue === 'true'}
                        onChange={(e) => {
                          const c = e.target.checked;
                          setAnnotations((prev) =>
                            prev.map((a) => (a.id === ann.id ? { ...a, formFieldValue: c } : a))
                          );
                        }}
                        style={{
                          width: `${(ann.width || 18) * scale}px`,
                          height: `${(ann.height || 18) * scale}px`,
                        }}
                        className="rounded border-slate-500 cursor-pointer accent-blue-600"
                      />
                    )}
                  </div>
                );
              })}

              {/* Layer 5: Interactive Master Stage Overlay (Captures drawing actions) */}
              <div
                ref={stageOverlayRef}
                onMouseDown={handleStageMouseDown}
                onMouseMove={handleStageMouseMove}
                onMouseUp={handleStageMouseUp}
                className={`absolute top-0 left-0 w-full h-full z-10 ${
                  activeMode === 'text-add'
                    ? 'cursor-text'
                    : activeMode === 'draw' || activeMode === 'highlight' || activeMode === 'rect' || activeMode === 'circle'
                    ? 'cursor-crosshair'
                    : 'pointer-events-none'
                }`}
              >
                {/* Real-time Freehand Drawing Canvas */}
                {isDrawing && drawPoints.length > 1 && (
                  <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <polyline
                      points={drawPoints.map((p) => `${p.x * scale},${p.y * scale}`).join(' ')}
                      fill="none"
                      stroke={textColor || '#2563eb'}
                      strokeWidth={strokeWidth * scale}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}

                {/* Real-time Watermark Preview */}
                {watermarkText && (
                  <div
                    style={{
                      opacity: watermarkOpacity,
                      fontSize: `${watermarkFontSize * scale}px`,
                      color: watermarkColor,
                      transform: `translate(-50%, -50%) rotate(${watermarkRotation}deg)`,
                    }}
                    className="absolute top-1/2 left-1/2 font-black tracking-widest uppercase pointer-events-none whitespace-nowrap select-none"
                  >
                    {watermarkText}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. DIGITAL SIGNATURE STUDIO MODAL */}
      {showSigModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-emerald-400" />
                Digital Signature Studio
              </h3>
              <button onClick={() => setShowSigModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Signature Mode Tabs */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setSigTab('draw')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  sigTab === 'draw' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Draw Signature
              </button>
              <button
                onClick={() => setSigTab('type')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  sigTab === 'type' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Type Signature
              </button>
            </div>

            {/* DRAW TAB */}
            {sigTab === 'draw' && (
              <div className="border border-slate-800 rounded-xl bg-white overflow-hidden">
                <canvas
                  ref={sigCanvasRef}
                  width={420}
                  height={160}
                  onMouseDown={(e) => {
                    const ctx = sigCanvasRef.current?.getContext('2d');
                    if (!ctx) return;
                    setIsWritingSig(true);
                    ctx.lineWidth = 3.0;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.strokeStyle = '#0f172a';
                    ctx.beginPath();
                    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                  }}
                  onMouseMove={(e) => {
                    if (!isWritingSig) return;
                    const ctx = sigCanvasRef.current?.getContext('2d');
                    ctx?.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                    ctx?.stroke();
                  }}
                  onMouseUp={() => setIsWritingSig(false)}
                  className="cursor-crosshair w-full h-40 block"
                />
              </div>
            )}

            {/* TYPE TAB */}
            {sigTab === 'type' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter full name..."
                  value={typedSigText}
                  onChange={(e) => setTypedSigText(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none w-full"
                />
                <div className="border border-slate-800 rounded-xl bg-white p-6 text-center text-slate-900 text-3xl font-serif italic shadow-inner">
                  {typedSigText || 'Your Signature'}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  const ctx = sigCanvasRef.current?.getContext('2d');
                  ctx?.clearRect(0, 0, 420, 160);
                }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg hover:bg-slate-800"
              >
                Clear Pad
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSigModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSignature}
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  Apply Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
