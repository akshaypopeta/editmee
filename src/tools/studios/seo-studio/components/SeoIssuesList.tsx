import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle,
  Wrench,
  Search,
  ChevronDown,
  ChevronRight,
  Code,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { SeoIssue, SeoIssueSeverity } from '../types';

interface SeoIssuesListProps {
  issues: SeoIssue[];
  onSelectFixIssue?: (issueId: string) => void;
}

export const SeoIssuesList: React.FC<SeoIssuesListProps> = ({ issues, onSelectFixIssue }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('actionable');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIssues, setExpandedIssues] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIssues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Severity Filter
      if (filterSeverity === 'actionable') {
        if (!['critical', 'high', 'medium', 'low'].includes(issue.severity)) return false;
      } else if (filterSeverity === 'autofix') {
        if (!issue.canAutoFix) return false;
      } else if (filterSeverity !== 'all') {
        if (issue.severity !== filterSeverity) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(q);
        const matchesWhat = issue.whatHappened.toLowerCase().includes(q);
        const matchesWhy = issue.whyItMatters.toLowerCase().includes(q);
        const matchesFix = issue.howToFix.toLowerCase().includes(q);
        if (!matchesTitle && !matchesWhat && !matchesWhy && !matchesFix) return false;
      }

      return true;
    });
  }, [issues, filterSeverity, searchQuery]);

  const severityBadge = (sev: SeoIssueSeverity) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800">
            <AlertCircle className="w-3 h-3" /> Critical
          </span>
        );
      case 'high':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-950 text-orange-400 border border-orange-800">
            <AlertTriangle className="w-3 h-3" /> High
          </span>
        );
      case 'medium':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-800">
            <Info className="w-3 h-3" /> Medium
          </span>
        );
      case 'low':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-400 border border-blue-800">
            <Info className="w-3 h-3" /> Low
          </span>
        );
      case 'passed':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Passed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
            <HelpCircle className="w-3 h-3" /> Unable to Verify
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterSeverity('actionable')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              filterSeverity === 'actionable'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Action Required ({issues.filter((i) => ['critical', 'high', 'medium', 'low'].includes(i.severity)).length})
          </button>

          <button
            type="button"
            onClick={() => setFilterSeverity('autofix')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              filterSeverity === 'autofix'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Fixable ({issues.filter((i) => i.canAutoFix).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterSeverity('critical')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              filterSeverity === 'critical'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-800 text-red-300 hover:bg-slate-700'
            }`}
          >
            Critical ({issues.filter((i) => i.severity === 'critical').length})
          </button>

          <button
            type="button"
            onClick={() => setFilterSeverity('high')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              filterSeverity === 'high'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-800 text-orange-300 hover:bg-slate-700'
            }`}
          >
            High ({issues.filter((i) => i.severity === 'high').length})
          </button>

          <button
            type="button"
            onClick={() => setFilterSeverity('passed')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              filterSeverity === 'passed'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
            }`}
          >
            Passed ({issues.filter((i) => i.severity === 'passed').length})
          </button>

          <button
            type="button"
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              filterSeverity === 'all'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All ({issues.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Issues Cards */}
      {filteredIssues.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Issues Match Current Filter</h3>
          <p className="text-xs">Try selecting a different filter above or clearing your search term.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map((issue) => {
            const isExpanded = Boolean(expandedIssues[issue.id]);

            return (
              <div
                key={issue.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-md space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(issue.id)}
                      className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{issue.title}</h3>
                      <div className="text-[11px] text-slate-400 capitalize">Category: {issue.category.replace('_', ' ')}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {severityBadge(issue.severity)}

                    {issue.canAutoFix && onSelectFixIssue && (
                      <button
                        type="button"
                        onClick={() => onSelectFixIssue(issue.id)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Fix Code</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Beginner-Friendly 4-Question Explanations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs leading-relaxed">
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                    <span className="font-bold text-slate-200 block mb-1">What happened?</span>
                    <p className="text-slate-400 text-[11px]">{issue.whatHappened}</p>
                  </div>

                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                    <span className="font-bold text-slate-200 block mb-1">Why does it matter?</span>
                    <p className="text-slate-400 text-[11px]">{issue.whyItMatters}</p>
                  </div>

                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                    <span className="font-bold text-slate-200 block mb-1">How do I fix it?</span>
                    <p className="text-slate-400 text-[11px]">{issue.howToFix}</p>
                  </div>
                </div>

                {/* Can EditMee Fix Automatically banner */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-slate-400">Can EditMee fix it automatically?</span>
                    {issue.canAutoFix ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Yes — Safe code patch available in Code Fixer
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">
                        Manual resolution recommended (requires server/DNS or custom content change)
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(issue.id)}
                    className="text-slate-400 hover:text-white text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    {isExpanded ? 'Hide Technical Details' : 'Show Technical Details'}
                  </button>
                </div>

                {/* Expandable Technical Details */}
                {isExpanded && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800/80 pb-1">
                      <span>Technical Inspection Data</span>
                      <span>Stable ID: {issue.id}</span>
                    </div>

                    <pre className="whitespace-pre-wrap word-break-all text-sky-300">
                      {issue.technicalDetails || 'No additional low-level signals recorded.'}
                    </pre>

                    {issue.recommendedValue && (
                      <div className="pt-2 border-t border-slate-800/60">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">
                          Recommended Code Snippet:
                        </span>
                        <pre className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-emerald-300 text-[11px] overflow-x-auto">
                          {issue.recommendedValue}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
