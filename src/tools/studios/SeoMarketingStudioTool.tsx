import React, { useState, useMemo } from 'react';
import { ToolDefinition } from '../../types';
import {
  Megaphone,
  Search,
  Globe,
  Share2,
  Code,
  Copy,
  Download,
  Check,
  Smartphone,
  Laptop,
  Sparkles,
  Link2,
  FileCode,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

export const SeoMarketingStudioWorkspace: React.FC = () => {
  const [pageTitle, setPageTitle] = useState('EditMee — All-in-One Client-Side Digital Tools Suite');
  const [metaDesc, setMetaDesc] = useState(
    'Edit PDF files, convert images, format developer code, design logos, analyze CSV datasets, and draft resumes locally in your browser.'
  );
  const [siteUrl, setSiteUrl] = useState('https://editmee.app');
  const [author, setAuthor] = useState('EditMee Team');
  const [ogImage, setOgImage] = useState('https://editmee.app/og-preview.png');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'serp' | 'meta' | 'schema' | 'utm'>('serp');
  const [copied, setCopied] = useState(false);

  // UTM state
  const [utmSource, setUtmSource] = useState('google');
  const [utmMedium, setUtmMedium] = useState('cpc');
  const [utmCampaign, setUtmCampaign] = useState('spring_launch_2026');

  const generatedUtmUrl = useMemo(() => {
    try {
      const u = new URL(siteUrl);
      if (utmSource) u.searchParams.set('utm_source', utmSource);
      if (utmMedium) u.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) u.searchParams.set('utm_campaign', utmCampaign);
      return u.toString();
    } catch {
      return `${siteUrl}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;
    }
  }, [siteUrl, utmSource, utmMedium, utmCampaign]);

  const generatedMetaHtml = useMemo(() => {
    return `<!-- Standard SEO Meta Tags -->
<title>${pageTitle}</title>
<meta name="description" content="${metaDesc}">
<meta name="author" content="${author}">
<link rel="canonical" href="${siteUrl}">
<meta name="robots" content="index, follow">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${siteUrl}">
<meta property="og:title" content="${pageTitle}">
<meta property="og:description" content="${metaDesc}">
<meta property="og:image" content="${ogImage}">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="${siteUrl}">
<meta name="twitter:title" content="${pageTitle}">
<meta name="twitter:description" content="${metaDesc}">
<meta name="twitter:image" content="${ogImage}">`;
  }, [pageTitle, metaDesc, siteUrl, author, ogImage]);

  const generatedJsonLd = useMemo(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: pageTitle,
      url: siteUrl,
      description: metaDesc,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      author: {
        '@type': 'Organization',
        name: author,
      },
    };
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  }, [pageTitle, siteUrl, metaDesc, author]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              SEO & Marketing Studio Pro
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                SERP & Metadata
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Interactive Google SERP simulator, meta tags generator, JSON-LD schema builder, and UTM link campaign creator.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('serp')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'serp' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            SERP Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('meta')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'meta' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Meta Tags HTML
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'schema' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            JSON-LD Schema
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('utm')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'utm' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            UTM Builder
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-slate-900">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Page Metadata Parameters
            </h3>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Page Title ({pageTitle.length} chars)</span>
                <span className={pageTitle.length > 60 ? 'text-amber-600' : 'text-emerald-600'}>
                  {pageTitle.length <= 60 ? 'Optimal' : 'Too Long'}
                </span>
              </div>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Meta Description ({metaDesc.length} chars)</span>
                <span className={metaDesc.length > 160 ? 'text-amber-600' : 'text-emerald-600'}>
                  {metaDesc.length <= 160 ? 'Optimal' : 'Too Long'}
                </span>
              </div>
              <textarea
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Canonical URL</label>
              <input
                type="text"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Author / Org</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">OG Image URL</label>
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Zone (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {activeTab === 'serp' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-blue-600" />
                  Google SERP Live Simulator
                </h3>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setViewMode('desktop')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'desktop' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    <Laptop className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('mobile')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'mobile' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SERP Snippet Box */}
              <div
                className={`p-4 bg-white border border-slate-100 rounded-xl shadow-xs font-sans ${
                  viewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700">
                    E
                  </div>
                  <div className="text-xs text-slate-700 truncate">{siteUrl}</div>
                </div>
                <div className="text-lg text-blue-800 hover:underline font-medium cursor-pointer leading-snug line-clamp-1">
                  {pageTitle}
                </div>
                <div className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                  {metaDesc}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'meta' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-slate-400">HTML Meta Header Code</span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedMetaHtml)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy HTML'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                {generatedMetaHtml}
              </pre>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-slate-400">JSON-LD Schema Markup</span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedJsonLd)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON-LD'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 rounded-xl text-xs font-mono text-cyan-400 overflow-x-auto leading-relaxed">
                {generatedJsonLd}
              </pre>
            </div>
          )}

          {activeTab === 'utm' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-slate-900">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                UTM Campaign Link Builder
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">UTM Source</label>
                  <input
                    type="text"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">UTM Medium</label>
                  <input
                    type="text"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Campaign Name</label>
                  <input
                    type="text"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Generated Tracking Link:</span>
                <p className="text-xs font-mono text-emerald-400 break-all">{generatedUtmUrl}</p>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedUtmUrl)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const seoMarketingStudioToolDef: ToolDefinition = {
  id: 'seo-studio',
  name: 'SEO & Marketing Studio Pro',
  category: 'seo',
  subcategory: 'marketing',
  description: 'Interactive SEO suite with Google SERP simulator, meta tags generator, JSON-LD schema builder, and UTM link creator.',
  iconName: 'Megaphone',
  version: '2.0.0',
  tags: ['seo', 'marketing', 'serp', 'meta', 'schema', 'json-ld', 'utm', 'campaign', 'studio'],
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
  customWorkspace: SeoMarketingStudioWorkspace,
  execute: async () => {
    return { success: true, text: 'SEO Studio Ready' };
  },
};
