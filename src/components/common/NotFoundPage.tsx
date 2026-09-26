import React, { useState } from 'react';
import { Search, AlertTriangle, Home, ArrowRight, Shield } from 'lucide-react';
import { getToolCanonicalPath } from '../../core/routing/toolUrls';
import { toolRegistry } from '../../core/tool-registry/ToolRegistry';

interface NotFoundPageProps {
  attemptedPath: string;
  onNavigateHome: () => void;
  onSelectTool: (toolId: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  attemptedPath,
  onNavigateHome,
  onSelectTool,
}) => {
  const [search, setSearch] = useState('');

  const popularTools = [
    { id: 'edit-pdf', name: 'Edit PDF', cat: 'PDF' },
    { id: 'pdf-merger', name: 'Merge PDF', cat: 'PDF' },
    { id: 'pdf-splitter', name: 'Split PDF', cat: 'PDF' },
    { id: 'pdf-compressor', name: 'Compress PDF', cat: 'PDF' },
    { id: 'image-resizer', name: 'Image Resizer', cat: 'IMAGES' },
    { id: 'compress-image', name: 'Compress Image', cat: 'IMAGES' },
    { id: 'bg-remover', name: 'Remove Background', cat: 'IMAGES' },
    { id: 'resume-builder', name: 'Resume Builder', cat: 'RESUMES' },
  ];

  const searchResults = search.trim()
    ? toolRegistry.getAll().filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-12 text-slate-100 max-w-4xl mx-auto w-full">
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-red-950/70 border border-red-800/80 text-red-500 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-950 border border-red-800 text-red-400 inline-block mb-3">
          Error 404 — Tool or Page Not Found
        </span>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
          We couldn&apos;t find this tool or page
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
          The link you followed (<code className="text-red-400 font-mono text-xs sm:text-sm bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{attemptedPath}</code>) may have been moved, renamed, or is unavailable.
        </p>

        {/* Quick Search */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all 500+ free client-side tools..."
            className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />

          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-800 text-left">
              {searchResults.map((t) => (
                <a
                  key={t.id}
                  href={getToolCanonicalPath(t.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool(t.id);
                  }}
                  className="p-3 hover:bg-slate-900 flex items-center justify-between group transition-colors block"
                >
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-red-400">{t.name}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{t.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Popular Tools Grid */}
        <div className="text-left mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center sm:text-left">
            Popular Free Online Tools
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {popularTools.map((pt) => {
              const canonicalHref = getToolCanonicalPath(pt.id);
              return (
                <a
                  key={pt.id}
                  href={canonicalHref}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool(pt.id);
                  }}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/60 hover:bg-slate-900 transition-colors block text-left group"
                >
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider block mb-1">
                    {pt.cat}
                  </span>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white block truncate">
                    {pt.name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Home Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Explore All 500+ Tools & Directory</span>
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>EditMee • 100% Client-Side Privacy • Zero Server Uploads</span>
        </div>
      </div>
    </div>
  );
};
