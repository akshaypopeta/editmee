import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Sliders,
  Palette,
} from 'lucide-react';
import { LogoElement } from './types';
import { POPULAR_FONTS, LOGO_PALETTES } from './palettes';

interface MobileTextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: LogoElement | null;
  onUpdateElement: (id: string, updates: Partial<LogoElement>) => void;
}

export const MobileTextEditorModal: React.FC<MobileTextEditorModalProps> = ({
  isOpen,
  onClose,
  element,
  onUpdateElement,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localText, setLocalText] = useState(element?.text || '');

  useEffect(() => {
    if (element) {
      setLocalText(element.text || '');
    }
  }, [element?.id, element?.text]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !element) return null;

  const handleTextChange = (newVal: string) => {
    setLocalText(newVal);
    onUpdateElement(element.id, { text: newVal });
  };

  const handleApplyFont = (fontFamily: string) => {
    onUpdateElement(element.id, { fontFamily });
  };

  const handleToggleUppercase = () => {
    const nextVal = !element.uppercase;
    onUpdateElement(element.id, {
      uppercase: nextVal,
      text: nextVal ? localText.toUpperCase() : localText,
    });
    if (nextVal) setLocalText((prev) => prev.toUpperCase());
  };

  const handleToggleWeight = () => {
    const nextWeight = element.fontWeight === '900' || element.fontWeight === '800' || element.fontWeight === 'bold' ? '400' : '900';
    onUpdateElement(element.id, { fontWeight: nextWeight });
  };

  const handleToggleItalic = () => {
    onUpdateElement(element.id, {
      fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 animate-in fade-in duration-150">
      <div className="w-full md:max-w-md bg-slate-900 border-t md:border border-slate-800 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Type className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Edit Text
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 font-semibold text-xs flex items-center space-x-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Main Text Input */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Text Content
            </label>
            <input
              ref={inputRef}
              type="text"
              value={localText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none"
              placeholder="Enter brand text..."
            />
          </div>

          {/* Quick Style Controls */}
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={handleToggleUppercase}
              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                element.uppercase
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              ALL CAPS
            </button>
            <button
              type="button"
              onClick={handleToggleWeight}
              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                element.fontWeight === '900' || element.fontWeight === 'bold'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-black'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Bold
            </button>
            <button
              type="button"
              onClick={handleToggleItalic}
              className={`py-2 rounded-xl text-xs italic font-bold border transition-all ${
                element.fontStyle === 'italic'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Italic
            </button>
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onUpdateElement(element.id, { textAlign: align })}
                  className={`flex-1 flex items-center justify-center rounded-lg text-xs ${
                    element.textAlign === align
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400'
                  }`}
                >
                  {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                  {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                  {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size & Spacing Steppers */}
          <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Font Size</span>
                <span className="font-mono text-blue-400">{element.fontSize || 36}px</span>
              </div>
              <input
                type="range"
                min={12}
                max={120}
                value={element.fontSize || 36}
                onChange={(e) =>
                  onUpdateElement(element.id, { fontSize: parseInt(e.target.value) })
                }
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Letter Spacing</span>
                <span className="font-mono text-blue-400">{element.letterSpacing || 0}px</span>
              </div>
              <input
                type="range"
                min={-2}
                max={20}
                value={element.letterSpacing || 0}
                onChange={(e) =>
                  onUpdateElement(element.id, { letterSpacing: parseInt(e.target.value) })
                }
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          {/* Curated Typeface Quick Picker */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Typography / Font
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {POPULAR_FONTS.map((font) => (
                <button
                  key={font.name}
                  type="button"
                  onClick={() => handleApplyFont(font.family)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all ${
                    element.fontFamily === font.family
                      ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  <div className="truncate">{font.label}</div>
                  <div className="text-[9px] text-slate-500 uppercase">{font.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Text Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={element.fillColor || '#ffffff'}
                onChange={(e) => onUpdateElement(element.id, { fillColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-slate-700 bg-transparent cursor-pointer shrink-0"
              />
              <div className="flex-1 flex flex-wrap gap-1.5">
                {[
                  '#ffffff',
                  '#0f172a',
                  '#3b82f6',
                  '#6366f1',
                  '#8b5cf6',
                  '#ec4899',
                  '#ef4444',
                  '#f59e0b',
                  '#10b981',
                  '#06b6d4',
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdateElement(element.id, { fillColor: c })}
                    className="w-6 h-6 rounded-md border border-slate-700 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
