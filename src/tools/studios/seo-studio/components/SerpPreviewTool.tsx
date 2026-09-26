import React, { useState, useMemo } from 'react';
import {
  Globe,
  Share2,
  Code,
  Copy,
  Laptop,
  Smartphone,
  Check,
  FileCode,
  Link2,
} from 'lucide-react';

interface SerpPreviewToolProps {
  initialUrl?: string;
  initialTitle?: string;
  initialDesc?: string;
}

export const SerpPreviewTool: React.FC<SerpPreviewToolProps> = ({
  initialUrl = 'https://editmee.app',
  initialTitle = 'EditMee — All-in-One Client-Side Digital Tools Suite',
  initialDesc = 'Edit PDF files, convert images, format developer code, design logos, analyze CSV datasets, and draft resumes locally in your browser.',
}) => {
  const [pageTitle, setPageTitle] = useState(initialTitle);
  const [metaDesc, setMetaDesc] = useState(initialDesc);
  const [siteUrl, setSiteUrl] = useState(initialUrl);
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
      {/* Sub-Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs font-bold w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('serp')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'serp' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>SERP Preview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('meta')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'meta' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Meta Tags Generator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'schema' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>JSON-LD Schema</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('utm')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'utm' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>UTM Link Builder</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Inputs */}
        <div className="lg:col-span-5 space-y-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Metadata Parameters</h3>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <label>Page Title</label>
              <span className={`text-[10px] ${pageTitle.length > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {pageTitle.length}/60 chars
              </span>
            </div>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <label>Meta Description</label>
              <span className={`text-[10px] ${metaDesc.length > 160 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {metaDesc.length}/160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Target Canonical URL</label>
            <input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Social Share Image (OG)</label>
            <input
              type="text"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono"
            />
          </div>
        </div>

        {/* Preview Output */}
        <div className="lg:col-span-7 space-y-4">
          {activeTab === 'serp' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Google SERP Simulator
                </span>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewMode('desktop')}
                    className={`p-1.5 rounded cursor-pointer ${
                      viewMode === 'desktop' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('mobile')}
                    className={`p-1.5 rounded cursor-pointer ${
                      viewMode === 'mobile' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SERP Card */}
              <div className={`p-4 bg-white rounded-xl shadow-md ${viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[9px] text-slate-700 font-bold border border-slate-200">
                    G
                  </div>
                  <div className="text-[12px] text-slate-800 truncate font-sans">
                    {siteUrl.replace(/^https?:\/\//, '')}
                  </div>
                </div>
                <h4 className="text-[18px] text-[#1a0dab] hover:underline cursor-pointer font-sans leading-snug line-clamp-1">
                  {pageTitle || 'No Title Defined'}
                </h4>
                <p className="text-[13px] text-[#4d5156] font-sans leading-normal mt-1 line-clamp-2">
                  {metaDesc || 'No meta description configured for this page.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'meta' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Generated Meta HTML</span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedMetaHtml)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold text-white cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[360px]">
                {generatedMetaHtml}
              </pre>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">JSON-LD Schema Markup</span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedJsonLd)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold text-white cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Schema'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto max-h-[360px]">
                {generatedJsonLd}
              </pre>
            </div>
          )}

          {activeTab === 'utm' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Campaign Source</label>
                  <input
                    type="text"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Campaign Medium</label>
                  <input
                    type="text"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Campaign Name</label>
                  <input
                    type="text"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950 text-white rounded-xl space-y-2 border border-slate-800">
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
