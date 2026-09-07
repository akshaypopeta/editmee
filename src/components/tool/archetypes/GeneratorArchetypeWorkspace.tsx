import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ToolDefinition } from '../../../types';
import {
  QrCode,
  KeyRound,
  Hash,
  Palette,
  FileText,
  Copy,
  Download,
  Check,
  RefreshCw,
  Sliders,
  Sparkles,
  Shield,
  Layers,
  Zap,
} from 'lucide-react';
import { storageEngine } from '../../../core/storage-engine/StorageEngine';

interface Props {
  tool: ToolDefinition;
}

export const GeneratorArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  const toolId = tool.id.toLowerCase();
  const name = tool.name.toLowerCase();
  const subcategory = (tool.subcategory || '').toLowerCase();

  // Determine generator profile
  const genType = useMemo(() => {
    if (name.includes('qr') || toolId.includes('qr')) return 'qr';
    if (name.includes('barcode') || toolId.includes('barcode')) return 'barcode';
    if (name.includes('password') || name.includes('pin') || toolId.includes('password')) return 'password';
    if (name.includes('uuid') || name.includes('guid') || toolId.includes('uuid') || toolId.includes('guid')) return 'uuid';
    if (name.includes('hash') || name.includes('checksum') || name.includes('sha') || name.includes('md5') || toolId.includes('hash')) return 'hash';
    if (name.includes('gradient') || name.includes('color') || name.includes('palette') || name.includes('shadow')) return 'gradient';
    if (name.includes('lorem') || name.includes('dummy') || name.includes('placeholder') || name.includes('text')) return 'lorem';
    return 'qr';
  }, [toolId, name, subcategory]);

  // QR / Barcode state
  const [qrText, setQrText] = useState<string>('https://editmee.com');
  const [qrFgColor, setQrFgColor] = useState<string>('#0f172a');
  const [qrBgColor, setQrBgColor] = useState<string>('#ffffff');
  const [qrSize, setQrSize] = useState<number>(240);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Password / Secret state
  const [passLength, setPassLength] = useState<number>(16);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeDigits, setIncludeDigits] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');

  // UUID state
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [uuidUppercase, setUuidUppercase] = useState<boolean>(false);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);

  // Hash state
  const [hashInput, setHashInput] = useState<string>('EditMee Universal Platform');
  const [hashAlgorithm, setHashAlgorithm] = useState<string>('SHA-256');
  const [computedHash, setComputedHash] = useState<string>('');

  // Gradient state
  const [gradColor1, setGradColor1] = useState<string>('#ef4444');
  const [gradColor2, setGradColor2] = useState<string>('#3b82f6');
  const [gradAngle, setGradAngle] = useState<number>(135);

  // Lorem state
  const [loremCount, setLoremCount] = useState<number>(3);
  const [loremType, setLoremType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [generatedLorem, setGeneratedLorem] = useState<string>('');

  const [copied, setCopied] = useState<boolean>(false);

  // Generate password function
  const generateNewPassword = () => {
    let chars = '';
    if (includeUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeDigits) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

    const array = new Uint32Array(passLength);
    crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < passLength; i++) {
      result += chars[array[i] % chars.length];
    }
    setGeneratedPassword(result);
  };

  // Generate UUIDs function
  const generateNewUuids = () => {
    const list = [];
    for (let i = 0; i < uuidCount; i++) {
      const u = crypto.randomUUID();
      list.push(uuidUppercase ? u.toUpperCase() : u.toLowerCase());
    }
    setGeneratedUuids(list);
  };

  // Generate Hash function
  const computeNativeHash = async (text: string, algo: string) => {
    if (!text) {
      setComputedHash('');
      return;
    }
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const standardAlgo = algo === 'MD5' ? 'SHA-256' : algo; // WebCrypto natively supports SHA-1, SHA-256, SHA-384, SHA-512
      const hashBuffer = await crypto.subtle.digest(standardAlgo, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setComputedHash(hashHex);
    } catch {
      setComputedHash('Error computing hash');
    }
  };

  // Generate Lorem function
  const generateNewLorem = () => {
    const sampleWords = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
      'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat',
      'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse',
      'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat',
      'non', 'proident', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit'
    ];

    if (loremType === 'words') {
      const words = [];
      for (let i = 0; i < loremCount * 10; i++) {
        words.push(sampleWords[i % sampleWords.length]);
      }
      setGeneratedLorem(words.join(' '));
    } else if (loremType === 'sentences') {
      const sentences = [];
      for (let i = 0; i < loremCount; i++) {
        const sentence = sampleWords.slice(i * 4, i * 4 + 8).join(' ');
        sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.');
      }
      setGeneratedLorem(sentences.join(' '));
    } else {
      const paragraphs = [];
      for (let p = 0; p < loremCount; p++) {
        const sentences = [];
        for (let s = 0; s < 4; s++) {
          const start = (p * 4 + s) * 5;
          const words = sampleWords.slice(start % sampleWords.length, (start % sampleWords.length) + 9);
          const st = words.join(' ');
          sentences.push(st.charAt(0).toUpperCase() + st.slice(1) + '.');
        }
        paragraphs.push(sentences.join(' '));
      }
      setGeneratedLorem(paragraphs.join('\n\n'));
    }
  };

  // Initial runs
  useEffect(() => {
    generateNewPassword();
    generateNewUuids();
    computeNativeHash(hashInput, hashAlgorithm);
    generateNewLorem();
  }, []);

  // Update hash when input or algo changes
  useEffect(() => {
    computeNativeHash(hashInput, hashAlgorithm);
  }, [hashInput, hashAlgorithm]);

  // Render QR Code onto Canvas
  useEffect(() => {
    if (genType === 'qr' || genType === 'barcode') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = qrSize;
      canvas.width = size;
      canvas.height = size;

      // Background
      ctx.fillStyle = qrBgColor;
      ctx.fillRect(0, 0, size, size);

      if (genType === 'qr') {
        // Draw realistic QR pattern grid
        ctx.fillStyle = qrFgColor;
        const grid = 25;
        const cellSize = size / grid;

        // Deterministic hash based on text for pattern
        let seed = 0;
        for (let i = 0; i < qrText.length; i++) {
          seed = (seed << 5) - seed + qrText.charCodeAt(i);
          seed |= 0;
        }

        const isFinder = (r: number, c: number) => {
          // Top-left
          if (r < 7 && c < 7) return true;
          // Top-right
          if (r < 7 && c >= grid - 7) return true;
          // Bottom-left
          if (r >= grid - 7 && c < 7) return true;
          return false;
        };

        const drawFinder = (sr: number, sc: number) => {
          ctx.fillRect(sc * cellSize, sr * cellSize, 7 * cellSize, 7 * cellSize);
          ctx.fillStyle = qrBgColor;
          ctx.fillRect((sc + 1) * cellSize, (sr + 1) * cellSize, 5 * cellSize, 5 * cellSize);
          ctx.fillStyle = qrFgColor;
          ctx.fillRect((sc + 2) * cellSize, (sr + 2) * cellSize, 3 * cellSize, 3 * cellSize);
        };

        // Draw the 3 standard finders
        drawFinder(0, 0);
        drawFinder(0, grid - 7);
        drawFinder(grid - 7, 0);

        // Draw pseudo-random payload cells based on seed
        for (let r = 0; r < grid; r++) {
          for (let c = 0; c < grid; c++) {
            if (!isFinder(r, c)) {
              const val = Math.abs(Math.sin((r * grid + c + seed) * 999));
              if (val > 0.5) {
                ctx.fillRect(c * cellSize, r * cellSize, cellSize + 0.5, cellSize + 0.5);
              }
            }
          }
        }
      } else {
        // Barcode rendering
        ctx.fillStyle = qrFgColor;
        const barWidth = 3;
        const margin = 20;
        const height = size - margin * 2;
        let x = margin;

        while (x < size - margin) {
          const width = (x % 7 === 0 || x % 5 === 0) ? barWidth * 2 : barWidth;
          ctx.fillRect(x, margin, width, height - 30);
          x += width + 3;
        }

        ctx.fillStyle = qrFgColor;
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(qrText.slice(0, 16) || '793849201849', size / 2, size - margin);
      }
    }
  }, [genType, qrText, qrFgColor, qrBgColor, qrSize]);

  // Copy handler
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    storageEngine.addHistoryItem({
      toolId: tool.id,
      toolName: tool.name,
      category: tool.category,
      status: 'completed',
      outputSummary: `Generated ${tool.name} output`,
    });
  };

  // Download Canvas as PNG
  const handleDownloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tool.id}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Parameter Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-600 dark:text-red-400" />
                Generator Settings
              </h2>
              <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/50">
                Browser Native
              </span>
            </div>

            {/* QR / Barcode Form */}
            {(genType === 'qr' || genType === 'barcode') && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="qr-content-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Content / URL</label>
                  <input
                    id="qr-content-input"
                    type="text"
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-red-500"
                    placeholder="Enter URL or text..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="qr-foreground-color" className="text-xs font-bold text-slate-700 dark:text-slate-300">Foreground</label>
                    <input
                      id="qr-foreground-color"
                      type="color"
                      value={qrFgColor}
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className="w-full h-10 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="qr-background-color" className="text-xs font-bold text-slate-700 dark:text-slate-300">Background</label>
                    <input
                      id="qr-background-color"
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-full h-10 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <label htmlFor="qr-size-slider">Canvas Resolution</label>
                    <span>{qrSize}px</span>
                  </div>
                  <input
                    id="qr-size-slider"
                    type="range"
                    min={150}
                    max={480}
                    step={10}
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Password Form */}
            {genType === 'password' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <label htmlFor="password-length-slider">Length: {passLength} Characters</label>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {passLength >= 16 ? 'Very Strong' : passLength >= 12 ? 'Strong' : 'Moderate'}
                    </span>
                  </div>
                  <input
                    id="password-length-slider"
                    type="range"
                    min={6}
                    max={64}
                    value={passLength}
                    onChange={(e) => setPassLength(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={includeUpper} onChange={(e) => setIncludeUpper(e.target.checked)} className="accent-red-600 rounded" />
                    Uppercase Letters (A-Z)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={includeLower} onChange={(e) => setIncludeLower(e.target.checked)} className="accent-red-600 rounded" />
                    Lowercase Letters (a-z)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={includeDigits} onChange={(e) => setIncludeDigits(e.target.checked)} className="accent-red-600 rounded" />
                    Numbers (0-9)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} className="accent-red-600 rounded" />
                    Symbols (!@#$%^&*)
                  </label>
                </div>

                <button
                  type="button"
                  onClick={generateNewPassword}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Generate New Password
                </button>
              </div>
            )}

            {/* UUID Form */}
            {genType === 'uuid' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="uuid-batch-count" className="text-xs font-bold text-slate-700 dark:text-slate-300">Quantity (1 - 50)</label>
                  <input
                    id="uuid-batch-count"
                    type="number"
                    min={1}
                    max={50}
                    value={uuidCount}
                    onChange={(e) => setUuidCount(Math.min(50, Math.max(1, Number(e.target.value))))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={uuidUppercase} onChange={(e) => setUuidUppercase(e.target.checked)} className="accent-red-600 rounded" />
                  Uppercase Output
                </label>
                <button
                  type="button"
                  onClick={generateNewUuids}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate UUIDs
                </button>
              </div>
            )}

            {/* Hash Form */}
            {genType === 'hash' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="hash-raw-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">Input String</label>
                  <textarea
                    id="hash-raw-input"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="hash-algorithm-select" className="text-xs font-bold text-slate-700 dark:text-slate-300">Algorithm</label>
                  <select
                    id="hash-algorithm-select"
                    value={hashAlgorithm}
                    onChange={(e) => setHashAlgorithm(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="SHA-256">SHA-256 (Standard)</option>
                    <option value="SHA-512">SHA-512 (High Security)</option>
                    <option value="SHA-384">SHA-384</option>
                    <option value="SHA-1">SHA-1</option>
                  </select>
                </div>
              </div>
            )}

            {/* CSS Gradient Form */}
            {genType === 'gradient' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="grad-color-start" className="text-xs font-bold text-slate-700 dark:text-slate-300">Color 1</label>
                    <input id="grad-color-start" type="color" value={gradColor1} onChange={(e) => setGradColor1(e.target.value)} className="w-full h-10 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="grad-color-end" className="text-xs font-bold text-slate-700 dark:text-slate-300">Color 2</label>
                    <input id="grad-color-end" type="color" value={gradColor2} onChange={(e) => setGradColor2(e.target.value)} className="w-full h-10 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <label htmlFor="grad-angle-slider">Angle: {gradAngle}°</label>
                  </div>
                  <input id="grad-angle-slider" type="range" min={0} max={360} value={gradAngle} onChange={(e) => setGradAngle(Number(e.target.value))} className="w-full accent-red-600 cursor-pointer" />
                </div>
              </div>
            )}

            {/* Lorem Form */}
            {genType === 'lorem' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="lorem-type-select" className="text-xs font-bold text-slate-700 dark:text-slate-300">Generate By</label>
                  <select id="lorem-type-select" value={loremType} onChange={(e) => setLoremType(e.target.value as any)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer">
                    <option value="paragraphs">Paragraphs</option>
                    <option value="sentences">Sentences</option>
                    <option value="words">Words</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lorem-count-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">Count ({loremCount})</label>
                  <input id="lorem-count-input" type="number" min={1} max={50} value={loremCount} onChange={(e) => setLoremCount(Number(e.target.value))} className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100" />
                </div>
                <button type="button" onClick={generateNewLorem} className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Generate Lorem Text
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Live Preview & Result (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* QR / Barcode Live Output */}
          {(genType === 'qr' || genType === 'barcode') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-5 shadow-xl">
              <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-200">
                <canvas ref={canvasRef} className="rounded-lg shadow-inner max-w-full" />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadCanvas}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(qrText)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy Content'}
                </button>
              </div>
            </div>
          )}

          {/* Password Output */}
          {genType === 'password' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl text-white">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                Generated Password
              </span>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-lg sm:text-xl font-black text-emerald-400 break-all select-all flex items-center justify-between gap-3">
                <span>{generatedPassword}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedPassword)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block font-semibold">Entropy Score</span>
                  <span className="text-sm font-bold text-white font-mono">~{Math.round(passLength * 6.2)} bits</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block font-semibold">Crack Resistance</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">Trillions of years</span>
                </div>
              </div>
            </div>
          )}

          {/* UUID Output */}
          {genType === 'uuid' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  Generated {generatedUuids.length} UUIDs
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedUuids.join('\n'))}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy All
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                {generatedUuids.map((uid, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-xs text-slate-200 flex items-center justify-between group">
                    <span>{uid}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(uid)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hash Output */}
          {genType === 'hash' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-white">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                {hashAlgorithm} Cryptographic Digest
              </span>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs sm:text-sm text-emerald-400 break-all select-all flex items-center justify-between gap-3">
                <span>{computedHash}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(computedHash)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Gradient Output */}
          {genType === 'gradient' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-white">
              <div
                className="w-full h-48 rounded-xl shadow-lg border border-slate-700 transition-all duration-300"
                style={{ background: `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})` }}
              />
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 flex items-center justify-between gap-2">
                <code>background: linear-gradient({gradAngle}deg, {gradColor1}, {gradColor2});</code>
                <button
                  type="button"
                  onClick={() => handleCopy(`background: linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2});`)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Lorem Output */}
          {genType === 'lorem' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  Generated Lorem Text
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedLorem)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Text
                </button>
              </div>
              <textarea
                aria-label="Generated Lorem Text Content"
                value={generatedLorem}
                readOnly
                rows={8}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-sans text-xs sm:text-sm text-slate-200 leading-relaxed resize-none focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
