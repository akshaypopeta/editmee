import React, { useState, useMemo } from 'react';
import { DataEngine, DataStats } from '../../core/data-engine/DataEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { aiGateway } from '../../core/ai-gateway/AiGateway';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Upload,
  Download,
  Search,
  Filter,
  Trash2,
  Sparkles,
  BarChart2,
  FileSpreadsheet,
  ArrowUpDown,
  CheckCircle,
  Copy,
  Table as TableIcon,
} from 'lucide-react';

export const CsvStudioTool: React.FC = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [stats, setStats] = useState<Record<string, DataStats>>({});

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 15;

  // AI Insights
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load CSV File
  const handleFileUpload = async (file: File) => {
    try {
      setCsvFile(file);
      const text = await FileEngine.readAsText(file);
      const { headers: parsedHeaders, rows: parsedRows } = DataEngine.parseCsv(text);
      setHeaders(parsedHeaders);
      setRows(parsedRows);
      setStats(DataEngine.computeColumnStats(parsedHeaders, parsedRows));
      setPage(1);
    } catch (err) {
      console.error('Failed to parse CSV file:', err);
    }
  };

  // Sample CSV generator for instant test
  const handleLoadSampleData = () => {
    const sample = `Order_ID,Product,Category,Price,Quantity,Customer_Country,Status
1001,MacBook Pro 16",Electronics,2499.00,2,United States,Delivered
1002,Ergonomic Chair,Furniture,349.50,4,Germany,Shipped
1003,Wireless Mouse,Electronics,49.99,10,United Kingdom,Delivered
1004,Standing Desk,Furniture,699.00,1,Canada,Processing
1005,4K USB-C Monitor,Electronics,549.00,3,Japan,Delivered
1006,Mechanical Keyboard,Electronics,129.99,5,Australia,Delivered
1007,Desk Pad Felt,Accessories,29.95,12,United States,Delivered
1008,Noise Cancelling Headphones,Electronics,299.00,2,Germany,Shipped`;

    const { headers: parsedHeaders, rows: parsedRows } = DataEngine.parseCsv(sample);
    setHeaders(parsedHeaders);
    setRows(parsedRows);
    setStats(DataEngine.computeColumnStats(parsedHeaders, parsedRows));
    setCsvFile(new File([sample], 'sample_ecommerce.csv', { type: 'text/csv' }));
    setPage(1);
  };

  // Filter & Sort Rows
  const filteredRows = useMemo(() => {
    let result = [...rows];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) => Object.values(row).some((val) => String(val).toLowerCase().includes(q)));
    }

    if (sortCol) {
      result.sort((a, b) => {
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

    return result;
  }, [rows, searchQuery, sortCol, sortAsc]);

  // Clean Operations
  const handleDeduplicate = () => {
    const cleaned = DataEngine.deduplicateRows(rows);
    setRows(cleaned);
    setStats(DataEngine.computeColumnStats(headers, cleaned));
  };

  const handleCleanEmpty = () => {
    const cleaned = DataEngine.cleanEmptyRows(rows);
    setRows(cleaned);
    setStats(DataEngine.computeColumnStats(headers, cleaned));
  };

  // Export handlers
  const handleExportCsv = () => {
    const csvContent = DataEngine.exportToCsv(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    FileEngine.downloadBlob(blob, csvFile ? `cleaned_${csvFile.name}` : 'data_export.csv');
  };

  const handleExportJson = () => {
    const jsonStr = DataEngine.exportToJson(rows);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    FileEngine.downloadBlob(blob, 'data_export.json');
  };

  // AI Query Analysis
  const handleAiAnalyze = async () => {
    if (!aiQuestion.trim() || rows.length === 0) return;
    setIsAnalyzing(true);
    setAiAnswer(null);

    try {
      const sampleDataStr = JSON.stringify(rows.slice(0, 50), null, 2);
      const prompt = `You are an expert Data Analyst. Here is a dataset (${rows.length} total rows, showing sample):
${sampleDataStr}

Question: "${aiQuestion}"
Provide a clear, quantitative, and actionable answer directly addressing the question.`;

      const response = await aiGateway.generate({ prompt });
      setAiAnswer(response);
    } catch (err: any) {
      setAiAnswer('Analysis error: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="csv-studio-workspace" className="flex flex-col h-[calc(100vh-8rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-sm">
      {/* Top Header */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Data & CSV Studio
          </h1>
          {rows.length > 0 && (
            <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
              {rows.length} rows • {headers.length} columns
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!csvFile && (
            <button
              onClick={handleLoadSampleData}
              className="px-3 py-1.5 rounded-md border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              Load Sample Dataset
            </button>
          )}

          <label
            htmlFor="csv-upload-top"
            className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-medium text-white flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            {csvFile ? 'Change CSV' : 'Open CSV File'}
          </label>
          <input
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
            id="csv-upload-top"
          />

          {rows.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-medium text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Stats & Clean Actions (w-80) */}
        {rows.length > 0 && (
          <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto p-4 space-y-5">
            {/* Quick Data Clean Tools */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Data Cleaners</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={handleDeduplicate}
                  className="p-2 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-200 text-left border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-amber-400" /> Deduplicate
                </button>
                <button
                  onClick={handleCleanEmpty}
                  className="p-2 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-200 text-left border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Filter className="w-3.5 h-3.5 text-blue-400" /> Remove Empty
                </button>
              </div>
            </div>

            {/* AI Data Query Box */}
            <div className="space-y-2.5 p-3 rounded-lg bg-blue-950/20 border border-blue-800/30">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                <Sparkles className="w-3.5 h-3.5" /> AI Data Analyst
              </div>
              <input
                type="text"
                value={aiQuestion}
                placeholder="Ask about this dataset..."
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiAnalyze()}
                className="w-full bg-slate-900 border border-slate-800 rounded-md p-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAiAnalyze}
                disabled={isAnalyzing || !aiQuestion.trim()}
                className="w-full py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {isAnalyzing ? 'Analyzing...' : 'Ask AI'}
              </button>

              {aiAnswer && (
                <div className="p-2.5 rounded-md bg-slate-900/90 border border-blue-500/30 text-xs text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto font-sans">
                  {aiAnswer}
                </div>
              )}
            </div>

            {/* Column Statistics */}
            <div className="space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-blue-400" /> Column Metrics
              </div>
              <div className="space-y-2">
                {headers.map((h) => {
                  const colStat = stats[h];
                  if (!colStat) return null;
                  return (
                    <div key={h} className="p-2.5 bg-slate-950 rounded-md border border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-200">
                        <span className="truncate">{h}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {colStat.isNumeric ? 'NUMERIC' : 'TEXT'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 text-[11px] text-slate-400">
                        <span>Unique: {colStat.uniqueValues}</span>
                        <span>Nulls: {colStat.nullCount}</span>
                        {colStat.isNumeric && colStat.mean !== undefined && (
                          <>
                            <span>Avg: {colStat.mean.toFixed(2)}</span>
                            <span>Sum: {colStat.sum?.toFixed(2)}</span>
                            <span>Min: {colStat.min}</span>
                            <span>Max: {colStat.max}</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Center / Right: Interactive Data Table */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {rows.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-md w-full border-2 border-dashed border-slate-800 hover:border-blue-500/60 rounded-xl p-12 text-center bg-slate-900/50 transition-colors space-y-4">
                <div className="w-16 h-16 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                  <TableIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Open a CSV or TSV Dataset</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Explore data tables, sort, filter, compute summary statistics, deduplicate rows, and run AI natural language queries.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleLoadSampleData}
                    className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer transition-colors border border-slate-700"
                  >
                    Try Sample Dataset
                  </button>
                  <label
                    htmlFor="csv-upload-center"
                    className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-medium text-white cursor-pointer shadow-sm transition-colors"
                  >
                    Select CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                    id="csv-upload-center"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Table Toolbar */}
              <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-xs text-slate-300 w-72">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search across all cells..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="bg-transparent outline-none w-full text-xs"
                  />
                </div>

                {/* Pagination */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>
                    Showing {(page - 1) * rowsPerPage + 1} -{' '}
                    {Math.min(page * rowsPerPage, filteredRows.length)} of {filteredRows.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800 disabled:opacity-30 cursor-pointer transition-colors"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => (p * rowsPerPage < filteredRows.length ? p + 1 : p))
                      }
                      disabled={page * rowsPerPage >= filteredRows.length}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800 disabled:opacity-30 cursor-pointer transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 sticky top-0 z-10 border-b border-slate-800">
                    <tr>
                      <th className="p-3 text-slate-500 font-mono w-12 text-center">#</th>
                      {headers.map((h) => (
                        <th
                          key={h}
                          onClick={() => {
                            if (sortCol === h) {
                              setSortAsc(!sortAsc);
                            } else {
                              setSortCol(h);
                              setSortAsc(true);
                            }
                          }}
                          className="p-3 text-slate-300 font-semibold cursor-pointer hover:bg-slate-850 select-none whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{h}</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500" />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3 text-center text-slate-600 text-[11px]">
                          {(page - 1) * rowsPerPage + rIdx + 1}
                        </td>
                        {headers.map((h) => (
                          <td key={h} className="p-3 text-slate-200 whitespace-nowrap">
                            {row[h] || <span className="text-slate-600 italic">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
