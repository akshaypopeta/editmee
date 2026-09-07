import React, { useState, useMemo } from 'react';
import { ToolDefinition } from '../../../types';
import {
  FileText,
  Sparkles,
  Copy,
  Download,
  Check,
  RotateCcw,
  Sliders,
  Type,
  AlignLeft,
  ArrowRightLeft,
  Clock,
  BookOpen,
} from 'lucide-react';
import { storageEngine } from '../../../core/storage-engine/StorageEngine';

interface Props {
  tool: ToolDefinition;
}

export const TextTransformArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  const initialText = `EditMee is a universal, client-first digital productivity workspace designed for speed, privacy, and high-performance engineering.\n\nEverything operates locally in your browser with zero latency and robust client-side algorithms.`;

  const [inputText, setInputText] = useState<string>(initialText);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchWord, setSearchWord] = useState<string>('');
  const [replaceWord, setReplaceWord] = useState<string>('');

  // Live text metrics
  const metrics = useMemo(() => {
    const charsWithSpaces = inputText.length;
    const charsNoSpaces = inputText.replace(/\s/g, '').length;
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const sentences = inputText.trim() ? (inputText.match(/[^.!?]+[.!?]+/g) || []).length : 0;
    const paragraphs = inputText.trim() ? inputText.split(/\n+/).filter((p) => p.trim()).length : 0;
    const readingTimeMins = (words / 200).toFixed(1);
    const speakingTimeMins = (words / 130).toFixed(1);

    return {
      charsWithSpaces,
      charsNoSpaces,
      words,
      sentences: Math.max(sentences, paragraphs > 0 ? 1 : 0),
      paragraphs,
      readingTime: `${readingTimeMins} min`,
      speakingTime: `${speakingTimeMins} min`,
    };
  }, [inputText]);

  // Transform actions
  const applyCase = (type: string) => {
    switch (type) {
      case 'upper':
        setInputText(inputText.toUpperCase());
        break;
      case 'lower':
        setInputText(inputText.toLowerCase());
        break;
      case 'title':
        setInputText(
          inputText.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          )
        );
        break;
      case 'sentence':
        setInputText(
          inputText.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
        );
        break;
      case 'camel':
        setInputText(
          inputText
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
              index === 0 ? word.toLowerCase() : word.toUpperCase()
            )
            .replace(/\s+/g, '')
        );
        break;
      case 'kebab':
        setInputText(
          inputText
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase()
        );
        break;
      case 'snake':
        setInputText(
          inputText
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/[\s-]+/g, '_')
            .toLowerCase()
        );
        break;
      case 'constant':
        setInputText(
          inputText
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/[\s-]+/g, '_')
            .toUpperCase()
        );
        break;
      case 'inverse':
        setInputText(
          inputText
            .split('')
            .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
            .join('')
        );
        break;
      default:
        break;
    }
  };

  // Cleaning transformations
  const cleanExtraSpaces = () => {
    setInputText(inputText.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim());
  };

  const removeDuplicateLines = () => {
    const lines = inputText.split('\n');
    const unique = Array.from(new Set(lines));
    setInputText(unique.join('\n'));
  };

  const sortLines = (asc: boolean) => {
    const lines = inputText.split('\n');
    lines.sort((a, b) => (asc ? a.localeCompare(b) : b.localeCompare(a)));
    setInputText(lines.join('\n'));
  };

  const stripHtml = () => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = inputText;
    setInputText(tmp.textContent || tmp.innerText || '');
  };

  const addLineNumbers = () => {
    const lines = inputText.split('\n');
    const numbered = lines.map((l, i) => `${(i + 1).toString().padStart(3, ' ')} | ${l}`);
    setInputText(numbered.join('\n'));
  };

  // Search & replace
  const handleReplaceAll = () => {
    if (!searchWord) return;
    try {
      const regex = new RegExp(searchWord, 'gi');
      setInputText(inputText.replace(regex, replaceWord));
    } catch {
      setInputText(inputText.split(searchWord).join(replaceWord));
    }
  };

  // Encoding & decoding
  const handleUrlEncode = (encode: boolean) => {
    try {
      setInputText(encode ? encodeURIComponent(inputText) : decodeURIComponent(inputText));
    } catch {}
  };

  const handleBase64 = (encode: boolean) => {
    try {
      setInputText(encode ? btoa(unescape(encodeURIComponent(inputText))) : decodeURIComponent(escape(atob(inputText))));
    } catch {}
  };

  const handleRot13 = () => {
    setInputText(
      inputText.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(base + ((c.charCodeAt(0) - base + 13) % 26));
      })
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    storageEngine.addHistoryItem({
      toolId: tool.id,
      toolName: tool.name,
      category: tool.category,
      status: 'completed',
      outputSummary: `Transformed text (${metrics.words} words, ${metrics.charsWithSpaces} chars)`,
    });
  };

  const handleDownload = () => {
    const blob = new Blob([inputText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tool.id}-output.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Words</span>
          <span className="text-base font-black text-slate-900 dark:text-white font-mono">{metrics.words}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Characters</span>
          <span className="text-base font-black text-slate-900 dark:text-white font-mono">{metrics.charsWithSpaces}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">No Spaces</span>
          <span className="text-base font-black text-slate-700 dark:text-slate-300 font-mono">{metrics.charsNoSpaces}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Sentences</span>
          <span className="text-base font-black text-slate-900 dark:text-white font-mono">{metrics.sentences}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Reading Time</span>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">{metrics.readingTime}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Speaking Time</span>
          <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">{metrics.speakingTime}</span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Transform Action Hub (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Case Conversions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 text-slate-900 dark:text-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Type className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              Case Transformations
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => applyCase('upper')} className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-800 dark:text-slate-200">UPPERCASE</button>
              <button type="button" onClick={() => applyCase('lower')} className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-800 dark:text-slate-200">lowercase</button>
              <button type="button" onClick={() => applyCase('title')} className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-800 dark:text-slate-200">Title Case</button>
              <button type="button" onClick={() => applyCase('sentence')} className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-800 dark:text-slate-200">Sentence case</button>
              <button type="button" onClick={() => applyCase('camel')} className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-800 dark:text-slate-200">camelCase</button>
              <button type="button" onClick={() => applyCase('kebab')} className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-800 dark:text-slate-200">kebab-case</button>
              <button type="button" onClick={() => applyCase('snake')} className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-800 dark:text-slate-200">snake_case</button>
              <button type="button" onClick={() => applyCase('constant')} className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-800 dark:text-slate-200">CONST_CASE</button>
              <button type="button" onClick={() => applyCase('inverse')} className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-800 dark:text-slate-200">InVeRsE</button>
            </div>
          </div>

          {/* Cleaners & Sorters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 text-slate-900 dark:text-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Cleaners & Line Sorters
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={cleanExtraSpaces} className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer text-slate-700 dark:text-slate-300">Trim Extra Spaces</button>
              <button type="button" onClick={removeDuplicateLines} className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer text-slate-700 dark:text-slate-300">Remove Duplicates</button>
              <button type="button" onClick={() => sortLines(true)} className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer text-slate-700 dark:text-slate-300">Sort Lines (A-Z)</button>
              <button type="button" onClick={() => sortLines(false)} className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer text-slate-700 dark:text-slate-300">Sort Lines (Z-A)</button>
              <button type="button" onClick={stripHtml} className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer text-slate-700 dark:text-slate-300">Strip HTML Tags</button>
              <button type="button" onClick={addLineNumbers} className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer text-slate-700 dark:text-slate-300">Add Line Numbers</button>
            </div>
          </div>

          {/* Search & Replace */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 text-slate-900 dark:text-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              Find & Replace
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Find text or regex..."
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceWord}
                onChange={(e) => setReplaceWord(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={handleReplaceAll}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Replace All Matches
              </button>
            </div>
          </div>

          {/* Encoding & Ciphers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 text-slate-900 dark:text-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              Encoders & Ciphers
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => handleUrlEncode(true)} className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg cursor-pointer">URL Encode</button>
              <button type="button" onClick={() => handleUrlEncode(false)} className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg cursor-pointer">URL Decode</button>
              <button type="button" onClick={() => handleBase64(true)} className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg cursor-pointer">Base64 Encode</button>
              <button type="button" onClick={() => handleBase64(false)} className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg cursor-pointer">Base64 Decode</button>
              <button type="button" onClick={handleRot13} className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg cursor-pointer col-span-2">ROT13 Cipher</button>
            </div>
          </div>
        </div>

        {/* Right Side: Main Text Workspace (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                Live Text Editor
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInputText(initialText)}
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                  Sample
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>

            <textarea
              aria-label="Text Editor Workspace"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={18}
              className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-sans text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed resize-y focus:outline-none focus:border-red-500 selection:bg-red-600 selection:text-white"
              placeholder="Type or paste your text here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
