import React, { useState, useMemo } from 'react';
import { ToolDefinition } from '../../../types';
import {
  Table as TableIcon,
  Filter,
  ArrowUpDown,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  Trash2,
  Sparkles,
  Upload,
  RefreshCw,
  Search,
} from 'lucide-react';
import { storageEngine } from '../../../core/storage-engine/StorageEngine';

interface Props {
  tool: ToolDefinition;
}

export const DataGridArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  const initialCsv = `id,name,role,department,salary,status\n101,Sarah Connor,Security Lead,Infrastructure,125000,Active\n102,John Doe,Frontend Architect,Engineering,140000,Active\n103,Alex Vance,Chief Engineer,R&D,165000,Active\n104,Elena Rostova,Data Scientist,Analytics,132000,Active\n105,Marcus Wright,DevOps Specialist,Operations,118000,Pending\n106,Lisa Trevor,Product Designer,UX Studio,110000,Active`;

  const [rawText, setRawText] = useState<string>(initialCsv);
  const [delimiter, setDelimiter] = useState<string>(',');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Parse raw text into headers and rows
  const parsedData = useMemo(() => {
    if (!rawText.trim()) {
      return { headers: [], rows: [] };
    }

    const lines = rawText.trim().split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    const splitLine = (line: string) => {
      // Regex handling quotes if present
      const regex = new RegExp(`(?:${delimiter}|\n|^)("(?:(?:"")*[^"]*)*"|[^"${delimiter}\n]*)`, 'g');
      const cells: string[] = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        let cell = match[1] || '';
        if (cell.startsWith('"') && cell.endsWith('"')) {
          cell = cell.slice(1, -1).replace(/""/g, '"');
        }
        cells.push(cell.trim());
        if (regex.lastIndex === match.index) regex.lastIndex++;
      }
      return cells.length > 0 ? cells : line.split(delimiter).map((c) => c.trim());
    };

    const headers = splitLine(lines[0]);
    let rows = lines.slice(1).map((line) => splitLine(line));

    // Apply search filtering
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      rows = rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(q)));
    }

    // Apply column sort
    if (sortCol !== null && sortCol < headers.length) {
      rows.sort((a, b) => {
        const valA = a[sortCol] || '';
        const valB = b[sortCol] || '';
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortAsc ? numA - numB : numB - numA;
        }
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return { headers, rows };
  }, [rawText, delimiter, searchFilter, sortCol, sortAsc]);

  // Actions
  const handleSort = (colIdx: number) => {
    if (sortCol === colIdx) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colIdx);
      setSortAsc(true);
    }
  };

  const handleDeduplicate = () => {
    const lines = rawText.trim().split('\n');
    if (lines.length <= 1) return;
    const header = lines[0];
    const uniqueRows = Array.from(new Set(lines.slice(1)));
    setRawText([header, ...uniqueRows].join('\n'));
  };

  const handleConvertToJson = () => {
    if (parsedData.headers.length === 0) return;
    const jsonArray = parsedData.rows.map((row) => {
      const obj: Record<string, any> = {};
      parsedData.headers.forEach((h, i) => {
        const val = row[i] || '';
        const num = Number(val);
        obj[h] = !isNaN(num) && val !== '' ? num : val;
      });
      return obj;
    });
    const jsonStr = JSON.stringify(jsonArray, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConvertToMarkdown = () => {
    if (parsedData.headers.length === 0) return;
    const headerLine = `| ${parsedData.headers.join(' | ')} |`;
    const separatorLine = `| ${parsedData.headers.map(() => '---').join(' | ')} |`;
    const rowLines = parsedData.rows.map((r) => `| ${r.join(' | ')} |`);
    const md = [headerLine, separatorLine, ...rowLines].join('\n');
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    storageEngine.addHistoryItem({
      toolId: tool.id,
      toolName: tool.name,
      category: tool.category,
      status: 'completed',
      outputSummary: `Processed ${parsedData.rows.length} rows of tabular data`,
    });
  };

  const handleDownloadCsv = () => {
    const blob = new Blob([rawText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tool.id}-export.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setRawText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Upload Button */}
          <label className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
            <Upload className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>Upload CSV/TSV</span>
            <input type="file" accept=".csv,.tsv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Delimiter Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Delimiter:</span>
            <select
              aria-label="CSV Delimiter"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="," className="bg-white dark:bg-slate-900">Comma (,)</option>
              <option value=";" className="bg-white dark:bg-slate-900">Semicolon (;)</option>
              <option value="	" className="bg-white dark:bg-slate-900">Tab (\t)</option>
              <option value="|" className="bg-white dark:bg-slate-900">Pipe (|)</option>
            </select>
          </div>

          {/* Deduplicate Button */}
          <button
            type="button"
            onClick={handleDeduplicate}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            Remove Duplicate Rows
          </button>

          {/* Export JSON / Markdown */}
          <button
            type="button"
            onClick={handleConvertToJson}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            title="Copy as JSON Array"
          >
            Copy as JSON
          </button>
          <button
            type="button"
            onClick={handleConvertToMarkdown}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            title="Copy as Markdown Table"
          >
            Copy as Markdown
          </button>
        </div>

        {/* Copy & Export Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyRaw}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy CSV'}
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Grid: Raw text / Interactive Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Raw Textarea Input (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Raw Data / CSV
              </span>
              <button
                type="button"
                onClick={() => setRawText(initialCsv)}
                className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reset Sample
              </button>
            </div>
            <textarea
              aria-label="Raw Data and CSV input"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={14}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-red-500 selection:bg-red-600 selection:text-white"
              placeholder="Paste comma-separated data here..."
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
              <span>{parsedData.rows.length} Data Rows</span>
              <span>{parsedData.headers.length} Columns</span>
            </div>
          </div>
        </div>

        {/* Right Interactive Table Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 text-slate-900 dark:text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Interactive Table Grid
                </span>
              </div>

              {/* Table Search Filter */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter rows..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Rendered Data Table */}
            <div className="overflow-x-auto max-h-[420px] scrollbar-thin border border-slate-200 dark:border-slate-800 rounded-xl">
              {parsedData.headers.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      {parsedData.headers.map((head, idx) => (
                        <th
                          key={idx}
                          onClick={() => handleSort(idx)}
                          className="py-2.5 px-3 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{head}</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-900/60">
                    {parsedData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2 px-3 whitespace-nowrap">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                  No data loaded. Paste CSV text or upload a file.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
