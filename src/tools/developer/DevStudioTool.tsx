import React, { useState } from 'react';
import { DevEngine } from '../../core/developer-engine/DevEngine';
import {
  Code,
  Braces,
  Binary,
  Key,
  Hash,
  Regex,
  GitCompare,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const DevStudioTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'json' | 'base64' | 'jwt' | 'hash' | 'regex' | 'diff' | 'uuid'
  >('json');

  // JSON state
  const [jsonInput, setJsonInput] = useState('{\n  "status": "success",\n  "code": 200,\n  "data": {\n    "name": "EditMee",\n    "tools": 50\n  }\n}');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Base64 state
  const [b64Input, setB64Input] = useState('Hello EditMee Developers!');
  const [b64Output, setB64Output] = useState('');
  const [b64Mode, setB64Mode] = useState<'encode' | 'decode'>('encode');

  // JWT state
  const [jwtInput, setJwtInput] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggVmFuY2UiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTkyOTM4MjkyMn0.4zO4eS_70T6oPjZ4F3Qp1yT-Hh7f5L0k6m7a1b2c3d4'
  );
  const [jwtResult, setJwtResult] = useState<any>(null);

  // Hash state
  const [hashInput, setHashInput] = useState('SecureEditMee2026');
  const [hashAlgorithm, setHashAlgorithm] = useState<'SHA-256' | 'SHA-512' | 'SHA-1'>('SHA-256');
  const [hashOutput, setHashOutput] = useState('');

  // Regex state
  const [regexPattern, setRegexPattern] = useState('([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexText, setRegexText] = useState('Contact alex@example.com or support@editmee.app for inquiries.');
  const [regexMatches, setRegexMatches] = useState<string[]>([]);

  // Diff state
  const [diffOriginal, setDiffOriginal] = useState('const user = {\n  name: "Alex",\n  role: "engineer"\n};');
  const [diffModified, setDiffModified] = useState('const user = {\n  name: "Alex Vance",\n  role: "lead architect",\n  active: true\n};');
  const [diffLines, setDiffLines] = useState<{ type: 'added' | 'removed' | 'same'; text: string }[]>([]);

  // UUID generator state
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);

  // Copied indicator
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run JSON Format
  const handleJsonFormat = (indent = 2) => {
    setJsonError(null);
    const res = DevEngine.formatJson(jsonInput, indent);
    if (res.valid) {
      setJsonOutput(res.formatted);
    } else {
      setJsonError(res.error || 'Invalid JSON syntax');
    }
  };

  // Run Base64
  const handleBase64 = () => {
    if (b64Mode === 'encode') {
      setB64Output(DevEngine.base64Encode(b64Input));
    } else {
      const res = DevEngine.base64Decode(b64Input);
      if (res.valid) {
        setB64Output(res.text);
      } else {
        setB64Output('Error: ' + res.error);
      }
    }
  };

  // Run JWT Decode
  const handleJwtDecode = () => {
    const res = DevEngine.decodeJwt(jwtInput);
    setJwtResult(res);
  };

  // Run Hash
  const handleHash = async () => {
    const res = await DevEngine.generateHash(hashInput, hashAlgorithm);
    setHashOutput(res);
  };

  // Run Regex
  const handleRegex = () => {
    const res = DevEngine.testRegex(regexPattern, regexFlags, regexText);
    if (res.valid) {
      setRegexMatches(res.matches.map((m) => m.match));
    } else {
      setRegexMatches([]);
    }
  };

  // Run Diff
  const handleDiff = () => {
    const diff = DevEngine.computeDiff(diffOriginal, diffModified);
    const formatted = diff.map((part) => ({
      type: (part.added ? 'added' : part.removed ? 'removed' : 'same') as 'added' | 'removed' | 'same',
      text: part.value,
    }));
    setDiffLines(formatted);
  };

  // Run UUID Generator
  const handleGenerateUuids = (count = 5) => {
    const list = DevEngine.generateUuid(count);
    setGeneratedUuids(list);
  };

  return (
    <div id="dev-studio-workspace" className="flex flex-col h-[calc(100vh-8rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-sm">
      {/* Top Header */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-500" />
            Developer Studio
          </h1>
          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
            Offline & Client-Side Secure
          </span>
        </div>

        {/* Global Copy Indicator */}
        {copied && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
            <Check className="w-3.5 h-3.5" /> Copied to Clipboard!
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Navigation Tabs (w-56) */}
        <div className="w-56 bg-slate-900 border-r border-slate-800 p-3 space-y-1 shrink-0 overflow-y-auto">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1.5">Utilities</div>
          <button
            onClick={() => setActiveTab('json')}
            className={`w-full py-2 px-3 rounded-md text-xs font-medium flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
              activeTab === 'json' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Braces className="w-4 h-4 text-amber-400" /> JSON Formatter
          </button>

          <button
            onClick={() => setActiveTab('base64')}
            className={`w-full py-2 px-3 rounded-md text-xs font-medium flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
              activeTab === 'base64' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Binary className="w-4 h-4 text-emerald-400" /> Base64 Encoder
          </button>

          <button
            onClick={() => {
              setActiveTab('jwt');
              handleJwtDecode();
            }}
            className={`w-full py-2 px-3 rounded-md text-xs font-medium flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
              activeTab === 'jwt' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4 text-purple-400" /> JWT Inspector
          </button>

          <button
            onClick={() => {
              setActiveTab('hash');
              handleHash();
            }}
            className={`w-full py-2 px-3 rounded-md text-xs font-medium flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
              activeTab === 'hash' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Hash className="w-4 h-4 text-pink-400" /> Hash (SHA/MD5)
          </button>

          <button
            onClick={() => {
              setActiveTab('regex');
              handleRegex();
            }}
            className={`w-full py-2 px-3 rounded-md text-xs font-medium flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
              activeTab === 'regex' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Regex className="w-4 h-4 text-cyan-400" /> Regex Tester
          </button>

          <button
            onClick={() => {
              setActiveTab('diff');
              handleDiff();
            }}
            className={`w-full py-2 px-3 rounded-md text-xs font-medium flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
              activeTab === 'diff' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <GitCompare className="w-4 h-4 text-orange-400" /> Diff Checker
          </button>

          <button
            onClick={() => {
              setActiveTab('uuid');
              handleGenerateUuids();
            }}
            className={`w-full py-2 px-3 rounded-md text-xs font-medium flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
              activeTab === 'uuid' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" /> UUID Generator
          </button>
        </div>

        {/* Center / Right Content Panel */}
        <div className="flex-1 p-6 bg-slate-950 overflow-y-auto">
          {/* TAB 1: JSON Formatter */}
          {activeTab === 'json' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Braces className="w-5 h-5 text-amber-400" /> JSON Formatter, Validator & Minifier
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleJsonFormat(2)}
                    className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-medium text-white transition-colors cursor-pointer"
                  >
                    Format (2 Spaces)
                  </button>
                  <button
                    onClick={() => handleJsonFormat(0)}
                    className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                  >
                    Minify
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Input JSON</span>
                    <button onClick={() => setJsonInput('')} className="hover:text-red-400 cursor-pointer">
                      Clear
                    </button>
                  </div>
                  <textarea
                    rows={16}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Formatted Output</span>
                    <button
                      onClick={() => copyToClipboard(jsonOutput || jsonInput)}
                      className="text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      Copy Output
                    </button>
                  </div>
                  <textarea
                    rows={16}
                    readOnly
                    value={jsonOutput || jsonInput}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              {jsonError && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-mono">
                  {jsonError}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Base64 */}
          {activeTab === 'base64' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Binary className="w-5 h-5 text-emerald-400" /> Base64 Encoder / Decoder
                </h2>
                <div className="flex items-center bg-slate-900 p-1 rounded-md border border-slate-800 text-xs">
                  <button
                    onClick={() => setB64Mode('encode')}
                    className={`px-3 py-1 rounded-sm transition-colors cursor-pointer ${
                      b64Mode === 'encode' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'
                    }`}
                  >
                    Encode
                  </button>
                  <button
                    onClick={() => setB64Mode('decode')}
                    className={`px-3 py-1 rounded-sm transition-colors cursor-pointer ${
                      b64Mode === 'decode' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'
                    }`}
                  >
                    Decode
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Input Content</label>
                  <textarea
                    rows={6}
                    value={b64Input}
                    onChange={(e) => setB64Input(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleBase64}
                  className="w-full py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  {b64Mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
                </button>

                {b64Output && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Result</span>
                      <button onClick={() => copyToClipboard(b64Output)} className="text-blue-400 hover:text-blue-300 cursor-pointer">
                        Copy
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      readOnly
                      value={b64Output}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: JWT Inspector */}
          {activeTab === 'jwt' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" /> JSON Web Token (JWT) Inspector
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Encoded JWT String</label>
                <textarea
                  rows={3}
                  value={jwtInput}
                  onChange={(e) => setJwtInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 outline-none"
                />
              </div>

              <button
                onClick={handleJwtDecode}
                className="py-1.5 px-4 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs cursor-pointer transition-colors"
              >
                Inspect Token
              </button>

              {jwtResult && jwtResult.valid && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                      Header (Algorithm & Type)
                    </div>
                    <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto">
                      {JSON.stringify(jwtResult.header, null, 2)}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                      Payload (Claims & Expiration)
                    </div>
                    <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto">
                      {JSON.stringify(jwtResult.payload, null, 2)}
                    </pre>
                    {jwtResult.expiresAt && (
                      <div className="text-xs text-slate-400">
                        Expires: <span className="font-mono text-slate-200">{jwtResult.expiresAt.toString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Hash */}
          {activeTab === 'hash' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Hash className="w-5 h-5 text-pink-400" /> Hash & Digest Generator
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Input String</label>
                <input
                  type="text"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={hashAlgorithm}
                  onChange={(e: any) => setHashAlgorithm(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-md p-2 text-xs text-slate-200 outline-none"
                >
                  <option value="SHA-256">SHA-256</option>
                  <option value="SHA-512">SHA-512</option>
                  <option value="SHA-1">SHA-1</option>
                  <option value="MD5">MD5</option>
                </select>

                <button
                  onClick={handleHash}
                  className="py-2 px-4 rounded-md bg-pink-600 hover:bg-pink-700 text-white font-medium text-xs cursor-pointer transition-colors"
                >
                  Compute Hash
                </button>
              </div>

              {hashOutput && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{hashAlgorithm} Digest</span>
                    <button onClick={() => copyToClipboard(hashOutput)} className="text-blue-400 hover:text-blue-300 cursor-pointer">
                      Copy
                    </button>
                  </div>
                  <div className="font-mono text-xs text-pink-300 break-all">{hashOutput}</div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Regex */}
          {activeTab === 'regex' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Regex className="w-5 h-5 text-cyan-400" /> Regular Expression (RegEx) Tester
              </h2>

              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-3 space-y-1">
                  <label className="text-xs text-slate-400">Pattern</label>
                  <input
                    type="text"
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-md p-2.5 font-mono text-xs text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Flags</label>
                  <input
                    type="text"
                    value={regexFlags}
                    onChange={(e) => setRegexFlags(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-md p-2.5 font-mono text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Test String</label>
                <textarea
                  rows={4}
                  value={regexText}
                  onChange={(e) => setRegexText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 outline-none"
                />
              </div>

              <button
                onClick={handleRegex}
                className="py-1.5 px-4 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-xs cursor-pointer transition-colors"
              >
                Match Pattern
              </button>

              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-semibold">Matches Found ({regexMatches.length})</div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1 max-h-40 overflow-y-auto">
                  {regexMatches.length === 0 ? (
                    <span className="text-xs text-slate-500">No matches found</span>
                  ) : (
                    regexMatches.map((m, i) => (
                      <div key={i} className="text-xs font-mono text-emerald-400 bg-slate-950 p-1.5 rounded-sm">
                        #{i + 1}: {m}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Diff Checker */}
          {activeTab === 'diff' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-orange-400" /> Code & Text Diff Inspector
                </h2>
                <button
                  onClick={handleDiff}
                  className="py-1.5 px-4 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs cursor-pointer transition-colors"
                >
                  Compare Text
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Original Text</label>
                  <textarea
                    rows={6}
                    value={diffOriginal}
                    onChange={(e) => setDiffOriginal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Modified Text</label>
                  <textarea
                    rows={6}
                    value={diffModified}
                    onChange={(e) => setDiffModified(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              {diffLines.length > 0 && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs space-y-1 max-h-60 overflow-y-auto">
                  {diffLines.map((line, i) => (
                    <div
                      key={i}
                      className={`p-1 rounded-sm ${
                        line.type === 'added'
                          ? 'bg-emerald-950/60 text-emerald-300 border-l-2 border-emerald-500'
                          : line.type === 'removed'
                          ? 'bg-red-950/60 text-red-300 border-l-2 border-red-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  '}
                      {line.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: UUID */}
          {activeTab === 'uuid' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" /> UUID v4 Generator
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerateUuids(5)}
                    className="py-1.5 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs cursor-pointer transition-colors"
                  >
                    Generate 5 UUIDs
                  </button>
                  <button
                    onClick={() => handleGenerateUuids(20)}
                    className="py-1.5 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer transition-colors"
                  >
                    Generate 20
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {generatedUuids.map((uid, i) => (
                  <div
                    key={i}
                    onClick={() => copyToClipboard(uid)}
                    className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg font-mono text-xs text-slate-200 flex justify-between items-center cursor-pointer transition-colors"
                  >
                    <span>{uid}</span>
                    <Copy className="w-3.5 h-3.5 text-slate-500 hover:text-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
