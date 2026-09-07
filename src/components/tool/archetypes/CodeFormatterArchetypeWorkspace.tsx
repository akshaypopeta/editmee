import React, { useState, useMemo } from 'react';
import { ToolDefinition } from '../../../types';
import {
  Code,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Check,
  Sparkles,
  Zap,
  RotateCcw,
  Sliders,
  FileCode,
  Key,
  Shield,
  Layers,
  Terminal,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { storageEngine } from '../../../core/storage-engine/StorageEngine';

interface Props {
  tool: ToolDefinition;
}

export const CodeFormatterArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  const name = tool.name.toLowerCase();
  const subcategory = (tool.subcategory || '').toLowerCase();
  const toolId = tool.id.toLowerCase();

  // Detect specific developer tool mode
  const devMode = useMemo(() => {
    if (name.includes('jwt') || toolId.includes('jwt')) return 'jwt';
    if (name.includes('base64') || toolId.includes('base64')) return 'base64';
    if (name.includes('regex') || toolId.includes('regex')) return 'regex';
    if (name.includes('url encode') || toolId.includes('url-encode') || name.includes('query string')) return 'url-encode';
    if (name.includes('html entit') || toolId.includes('html-entit')) return 'html-entity';
    if (name.includes('shadow') || toolId.includes('shadow') || name.includes('neumorphism')) return 'css-shadow';
    if (name.includes('clamp') || toolId.includes('clamp') || name.includes('fluid typo')) return 'css-clamp';
    if (name.includes('git') || toolId.includes('git')) return 'git-command';
    if (name.includes('cron') || toolId.includes('cron')) return 'cron-parser';
    if (name.includes('color') || toolId.includes('color-model') || name.includes('hex / rgb')) return 'color-converter';
    return 'code-format';
  }, [name, subcategory, toolId]);

  // Code Formatter State
  const [formatLang, setFormatLang] = useState<'json' | 'sql' | 'css' | 'xml'>(() => {
    if (name.includes('sql') || toolId.includes('sql')) return 'sql';
    if (name.includes('css') || toolId.includes('css')) return 'css';
    if (name.includes('xml') || toolId.includes('xml') || name.includes('html')) return 'xml';
    return 'json';
  });

  const [inputCode, setInputCode] = useState<string>(() => {
    if (name.includes('sql')) {
      return `SELECT u.id, u.username, u.email, COUNT(p.id) AS total_projects, SUM(p.revenue) AS total_revenue FROM users u LEFT JOIN projects p ON u.id = p.user_id WHERE u.status = 'active' AND u.created_at >= '2026-01-01' GROUP BY u.id, u.username, u.email HAVING COUNT(p.id) > 5 ORDER BY total_revenue DESC LIMIT 50;`;
    }
    if (name.includes('css')) {
      return `.card{display:flex;flex-direction:column;padding:1.5rem;background:#0f172a;border-radius:1rem;color:#fff}.card:hover{transform:translateY(-2px)}`;
    }
    if (name.includes('xml')) {
      return `<project version="2.0"><meta><name>EditMee Engine</name></meta><modules><module id="pdf" enabled="true"/><module id="developer" enabled="true"/></modules></project>`;
    }
    return `{\n  "appName": "EditMee Studio",\n  "version": "4.2.0",\n  "clientSide": true,\n  "toolsCount": 1190,\n  "security": {\n    "zeroTelemetry": true,\n    "gdprCompliant": true\n  }\n}`;
  });

  const [indentSize, setIndentSize] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  // JWT Decoder State
  const [jwtInput, setJwtInput] = useState<string>(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggVmFuY2UiLCJhZG1pbiI6dHJ1ZSwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3OTk5OTk5OTl9.4peccIIpmGTrceOmDY9fsn4jhF4y-X20r2bXqDq2bVk'
  );

  // Base64 State
  const [base64Input, setBase64Input] = useState<string>('Hello EditMee Developer Suite 2026!');
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');

  // RegEx State
  const [regexPattern, setRegexPattern] = useState<string>('([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})');
  const [regexFlags, setRegexFlags] = useState<string>('g');
  const [regexTestText, setRegexTestText] = useState<string>(
    'Contact support at help@editmee.com or alex.vance@company.org for assistance.'
  );

  // CSS Box Shadow State
  const [shadowX, setShadowX] = useState<number>(0);
  const [shadowY, setShadowY] = useState<number>(12);
  const [shadowBlur, setShadowBlur] = useState<number>(24);
  const [shadowSpread, setShadowSpread] = useState<number>(-4);
  const [shadowColor, setShadowColor] = useState<string>('rgba(0, 0, 0, 0.25)');
  const [isInset, setIsInset] = useState<boolean>(false);

  // CSS Clamp State
  const [minFontSize, setMinFontSize] = useState<number>(16);
  const [maxFontSize, setMaxFontSize] = useState<number>(32);
  const [minViewport, setMinViewport] = useState<number>(375);
  const [maxViewport, setMaxViewport] = useState<number>(1440);

  // JWT Decoded Objects
  const decodedJwt = useMemo(() => {
    try {
      const parts = jwtInput.trim().split('.');
      if (parts.length !== 3) return { valid: false, error: 'JWT must have 3 parts separated by dots' };
      const decodePart = (str: string) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(json);
      };
      const header = decodePart(parts[0]);
      const payload = decodePart(parts[1]);
      return { valid: true, header, payload, signature: parts[2] };
    } catch (e: any) {
      return { valid: false, error: e.message || 'Invalid JWT format' };
    }
  }, [jwtInput]);

  // Base64 Result
  const base64Result = useMemo(() => {
    try {
      if (base64Mode === 'encode') {
        return btoa(unescape(encodeURIComponent(base64Input)));
      } else {
        return decodeURIComponent(escape(atob(base64Input)));
      }
    } catch (e) {
      return 'Error in conversion: Invalid input for chosen operation';
    }
  }, [base64Input, base64Mode]);

  // RegEx Matches
  const regexMatches = useMemo(() => {
    try {
      const re = new RegExp(regexPattern, regexFlags);
      const matches = Array.from(regexTestText.matchAll(re));
      return { valid: true, matches };
    } catch (e: any) {
      return { valid: false, error: e.message, matches: [] };
    }
  }, [regexPattern, regexFlags, regexTestText]);

  // CSS Box Shadow Code
  const generatedShadowCss = useMemo(() => {
    return `box-shadow: ${isInset ? 'inset ' : ''}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor};`;
  }, [shadowX, shadowY, shadowBlur, shadowSpread, shadowColor, isInset]);

  // CSS Clamp Formula
  const generatedClampCss = useMemo(() => {
    const slope = (maxFontSize - minFontSize) / (maxViewport - minViewport);
    const yAxisIntersection = -minViewport * slope + minFontSize;
    const preferredVal = `${(slope * 100).toFixed(2)}vw + ${(yAxisIntersection / 16).toFixed(2)}rem`;
    const minRem = (minFontSize / 16).toFixed(2);
    const maxRem = (maxFontSize / 16).toFixed(2);
    return `font-size: clamp(${minRem}rem, ${preferredVal}, ${maxRem}rem);`;
  }, [minFontSize, maxFontSize, minViewport, maxViewport]);

  // Code Formatter Action
  const handleFormat = () => {
    if (formatLang === 'json') {
      try {
        const parsed = JSON.parse(inputCode);
        setInputCode(JSON.stringify(parsed, null, indentSize));
      } catch {}
    } else if (formatLang === 'sql') {
      const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'VALUES'];
      let formatted = inputCode;
      keywords.forEach((kw) => {
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        formatted = formatted.replace(regex, `\n${kw}`);
      });
      setInputCode(formatted.trim());
    } else if (formatLang === 'css') {
      const formatted = inputCode
        .replace(/\{/g, ' {\n  ')
        .replace(/;/g, ';\n  ')
        .replace(/\}/g, '\n}\n\n')
        .trim();
      setInputCode(formatted);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. JWT Decoder */}
      {devMode === 'jwt' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              Encoded JWT Token
            </h2>
            <textarea
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              rows={4}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-mono break-all focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">Decoded Header</span>
              <pre className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-emerald-600 dark:text-emerald-400 overflow-x-auto">
                {decodedJwt.valid ? JSON.stringify(decodedJwt.header, null, 2) : 'Invalid Token'}
              </pre>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">Decoded Payload Claims</span>
              <pre className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-sky-600 dark:text-sky-300 overflow-x-auto">
                {decodedJwt.valid ? JSON.stringify(decodedJwt.payload, null, 2) : 'Invalid Token'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 2. Base64 Encoder / Decoder */}
      {devMode === 'base64' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Input Text / Base64</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBase64Mode('encode')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                    base64Mode === 'encode' ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Encode
                </button>
                <button
                  type="button"
                  onClick={() => setBase64Mode('decode')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                    base64Mode === 'decode' ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Decode
                </button>
              </div>
            </div>
            <textarea
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
              rows={8}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Result Output</h2>
              <button
                type="button"
                onClick={() => handleCopy(base64Result)}
                className="px-3 py-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={base64Result}
              rows={8}
              className="w-full p-3 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* 3. RegEx Tester & Explainer */}
      {devMode === 'regex' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-red-600 dark:text-red-400" />
              Regular Expression Tester & Match Inspector
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">RegEx Pattern</label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 font-bold">/</span>
                <input
                  type="text"
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <span className="font-mono text-slate-400 font-bold">/</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Flags</label>
              <input
                type="text"
                value={regexFlags}
                onChange={(e) => setRegexFlags(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Test String</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                {regexMatches.valid ? `${regexMatches.matches.length} Matches Found` : 'Invalid Expression'}
              </span>
            </div>
            <textarea
              value={regexTestText}
              onChange={(e) => setRegexTestText(e.target.value)}
              rows={4}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {regexMatches.valid && regexMatches.matches.length > 0 && (
            <div className="p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">Captured Matches:</span>
              <div className="space-y-1 font-mono text-xs max-h-48 overflow-y-auto">
                {regexMatches.matches.map((m, idx) => (
                  <div key={idx} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-emerald-600 dark:text-emerald-300 flex items-center justify-between">
                    <span>Match {idx + 1}: "{m[0]}"</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Index: {m.index}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. CSS Box Shadow Studio */}
      {devMode === 'css-shadow' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                Shadow Dimensions
              </h2>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Horizontal Offset</span>
                  <span className="font-mono text-red-600 dark:text-red-400">{shadowX}px</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={shadowX}
                  onChange={(e) => setShadowX(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Vertical Offset</span>
                  <span className="font-mono text-red-600 dark:text-red-400">{shadowY}px</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={shadowY}
                  onChange={(e) => setShadowY(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Blur Radius</span>
                  <span className="font-mono text-red-600 dark:text-red-400">{shadowBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shadowBlur}
                  onChange={(e) => setShadowBlur(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Spread Radius</span>
                  <span className="font-mono text-red-600 dark:text-red-400">{shadowSpread}px</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="50"
                  value={shadowSpread}
                  onChange={(e) => setShadowSpread(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center min-h-[300px]">
              <div
                style={{
                  boxShadow: `${isInset ? 'inset ' : ''}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`,
                }}
                className="w-48 h-48 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 text-sm border border-slate-200 dark:border-slate-700"
              >
                Preview Box
              </div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-white flex items-center justify-between">
              <span className="font-mono text-xs text-emerald-400">{generatedShadowCss}</span>
              <button
                type="button"
                onClick={() => handleCopy(generatedShadowCss)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold cursor-pointer"
              >
                Copy CSS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Standard Code Formatter (Default) */}
      {devMode === 'code-format' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {tool.name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFormat}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Format Code
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(inputCode)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              rows={14}
              className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
