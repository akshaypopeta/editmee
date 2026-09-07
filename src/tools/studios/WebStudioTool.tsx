import React, { useState, useMemo } from 'react';
import { ToolDefinition } from '../../types';
import {
  Globe,
  Link,
  Code,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  ExternalLink,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

export const WebStudioWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'url-parser' | 'encode-decode' | 'responsive'>('url-parser');
  const [inputUrl, setInputUrl] = useState('https://editmee.app/tools/pdf-editor?utm_source=google&page=1&theme=dark');
  const [copied, setCopied] = useState(false);

  // Encode / Decode State
  const [encodeInput, setEncodeInput] = useState('Hello World! <script>alert("EditMee")</script>');
  const [encodeMode, setEncodeMode] = useState<'url' | 'html' | 'base64'>('url');

  // Responsive Tester State
  const [testUrl, setTestUrl] = useState('https://wikipedia.org');
  const [viewportSize, setViewportSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // URL Breakdown
  const parsedUrl = useMemo(() => {
    try {
      const u = new URL(inputUrl);
      const params: Array<{ key: string; value: string }> = [];
      u.searchParams.forEach((val, key) => {
        params.push({ key, value: val });
      });
      return {
        protocol: u.protocol,
        host: u.host,
        pathname: u.pathname,
        params,
        hash: u.hash,
        valid: true,
      };
    } catch {
      return { protocol: '', host: '', pathname: '', params: [], hash: '', valid: false };
    }
  }, [inputUrl]);

  // Encode/Decode computations
  const encodedResults = useMemo(() => {
    try {
      if (encodeMode === 'url') {
        return {
          encoded: encodeURIComponent(encodeInput),
          decoded: decodeURIComponent(encodeInput),
        };
      }
      if (encodeMode === 'html') {
        const encoded = encodeInput
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        return { encoded, decoded: encodeInput };
      }
      if (encodeMode === 'base64') {
        return {
          encoded: btoa(unescape(encodeURIComponent(encodeInput))),
          decoded: (() => {
            try {
              return decodeURIComponent(escape(atob(encodeInput)));
            } catch {
              return 'Invalid Base64 string';
            }
          })(),
        };
      }
    } catch {
      return { encoded: 'Error processing input', decoded: 'Error processing input' };
    }
    return { encoded: '', decoded: '' };
  }, [encodeInput, encodeMode]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              Web & URL Studio Pro
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                Network Lab
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Interactive URL inspector & parameter editor, encoding studio, and responsive viewport tester.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('url-parser')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'url-parser' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            URL Parser
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('encode-decode')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'encode-decode' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Encoder / Decoder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('responsive')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'responsive' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Viewport Tester
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'url-parser' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Input Web Address / URL</label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
            />
          </div>

          {parsedUrl.valid ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Protocol</span>
                  <p className="text-xs font-mono font-bold text-red-600">{parsedUrl.protocol}</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Host Domain</span>
                  <p className="text-xs font-mono font-bold text-slate-900">{parsedUrl.host}</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Pathname</span>
                  <p className="text-xs font-mono font-bold text-blue-600">{parsedUrl.pathname}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                  Query Parameters ({parsedUrl.params.length})
                </h4>
                {parsedUrl.params.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Key Parameter</th>
                          <th className="p-3">Decoded Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {parsedUrl.params.map((p, i) => (
                          <tr key={i} className="hover:bg-slate-50/80">
                            <td className="p-3 font-bold text-red-600">{p.key}</td>
                            <td className="p-3 text-slate-800">{p.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No query parameters found in this URL.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-600 font-bold">Please enter a valid URL (e.g. https://example.com/path?key=val)</p>
          )}
        </div>
      )}

      {activeTab === 'encode-decode' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
          <div className="flex gap-2 border-b border-slate-100 pb-3">
            {(['url', 'html', 'base64'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setEncodeMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                  encodeMode === mode ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Input Text</label>
            <textarea
              value={encodeInput}
              onChange={(e) => setEncodeInput(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
            />
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-slate-700">Encoded Output</span>
                <button
                  type="button"
                  onClick={() => handleCopy(encodedResults.encoded)}
                  className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="text-xs font-mono font-bold text-red-600 break-all">
                {encodedResults.encoded}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-slate-700">Decoded Output</span>
                <button
                  type="button"
                  onClick={() => handleCopy(encodedResults.decoded)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="text-xs font-mono font-bold text-blue-600 break-all">
                {encodedResults.decoded}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'responsive' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="flex-1 min-w-[240px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewportSize('desktop')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewportSize === 'desktop' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewportSize('tablet')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewportSize === 'tablet' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewportSize('mobile')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewportSize === 'mobile' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-slate-100 p-4 rounded-2xl flex justify-center overflow-x-auto">
            <div
              className={`bg-white rounded-xl shadow-lg border border-slate-300 transition-all duration-300 h-[450px] flex items-center justify-center text-center p-6 ${
                viewportSize === 'desktop' ? 'w-full' : viewportSize === 'tablet' ? 'w-[768px]' : 'w-[375px]'
              }`}
            >
              <div className="space-y-2">
                <Globe className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  Viewport: {viewportSize === 'desktop' ? '1280px Desktop' : viewportSize === 'tablet' ? '768px Tablet' : '375px Mobile'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono break-all">{testUrl}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const webStudioToolDef: ToolDefinition = {
  id: 'web-studio',
  name: 'Web & URL Studio Pro',
  category: 'web',
  subcategory: 'network',
  description: 'Interactive URL parameter inspector, URI/HTML encoder-decoder, and responsive viewport simulator.',
  iconName: 'Globe',
  version: '2.0.0',
  tags: ['web', 'url', 'encode', 'decode', 'uri', 'html', 'responsive', 'viewport', 'studio'],
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
  customWorkspace: WebStudioWorkspace,
  execute: async () => {
    return { success: true, text: 'Web Studio Ready' };
  },
};
