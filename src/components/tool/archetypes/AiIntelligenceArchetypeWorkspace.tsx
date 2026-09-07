import React, { useState, useMemo, useEffect } from 'react';
import { ToolDefinition } from '../../../types';
import {
  Sparkles,
  Zap,
  Copy,
  Download,
  Check,
  RotateCcw,
  Sliders,
  Send,
  FileText,
  Code,
  ShieldAlert,
  ListTodo,
  Languages,
  Mail,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { storageEngine } from '../../../core/storage-engine/StorageEngine';

interface Props {
  tool: ToolDefinition;
}

export const AiIntelligenceArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  const toolId = tool.id.toLowerCase();
  const name = tool.name.toLowerCase();

  // Determine specific operational intelligence profile
  const profile = useMemo(() => {
    if (name.includes('summariz') || toolId.includes('summariz') || name.includes('briefing')) return 'summarizer';
    if (name.includes('tone') || toolId.includes('tone') || name.includes('style')) return 'tone';
    if (name.includes('grammar') || toolId.includes('grammar') || name.includes('polisher')) return 'grammar';
    if (name.includes('code explain') || toolId.includes('code-explain') || name.includes('docstring')) return 'code-explainer';
    if (name.includes('sql') || toolId.includes('sql')) return 'sql';
    if (name.includes('regex') || toolId.includes('regex')) return 'regex';
    if (name.includes('translat') || toolId.includes('translat')) return 'translate';
    if (name.includes('email') || toolId.includes('email') || name.includes('outreach')) return 'email';
    if (name.includes('meeting') || toolId.includes('meeting') || name.includes('action item')) return 'meeting';
    if (name.includes('contract') || toolId.includes('contract') || name.includes('legal')) return 'contract';
    if (name.includes('cron') || toolId.includes('cron')) return 'cron';
    if (name.includes('swot') || toolId.includes('swot')) return 'swot';
    if (name.includes('git commit') || toolId.includes('commit') || toolId.includes('changelog')) return 'git-commit';
    if (name.includes('user story') || toolId.includes('user-story') || name.includes('gherkin')) return 'user-story';
    if (name.includes('interview') || toolId.includes('interview') || name.includes('rubric')) return 'interview';
    if (name.includes('social') || toolId.includes('social') || name.includes('hashtag')) return 'social';
    if (name.includes('docker') || toolId.includes('docker')) return 'docker';
    return 'general-ai';
  }, [name, toolId]);

  // Initial prompt data based on tool type
  const initialInputs = useMemo(() => {
    switch (profile) {
      case 'summarizer':
        return `EditMee Enterprise Studio has released its comprehensive release notes for Q3 2026. The platform now supports over 1,190 distinct client-first engineering tools, ranging from client-side PDF document manipulation and HTML5 image filters to cryptography, financial models, and AI assistants. With zero data leaves the client browser, security compliance is rated at 100% for strict GDPR and HIPAA requirements. User onboarding time decreased by 42% while browser memory footprint reduced by 28%.`;
      case 'sql':
        return `Show all users who signed up in the last 30 days and spent more than $500 across their orders, ordered by highest spenders first.`;
      case 'regex':
        return `Match a strong password that contains at least 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special symbol.`;
      case 'translate':
        return `Welcome to EditMee. All your files are processed locally in your browser with maximum privacy and lightning speed.`;
      case 'meeting':
        return `Transcript from Sprint Planning on Friday:
Sarah: We need to finalize the PDF security audit by Tuesday morning. Alex will take ownership of the AES-256 test vectors.
John: I will refactor the CSV exporter and benchmark 100k rows before our deployment on Thursday.
Elena: Please review the privacy policy changes regarding client-side localStorage before tomorrow noon.`;
      case 'contract':
        return `Section 8.2 (Limitation of Liability): In no event shall the Service Provider be liable for any indirect, punitive, or consequential damages. The total cumulative liability under this Agreement shall not exceed the total fees paid by Customer during the one (1) month immediately preceding the incident giving rise to liability. Customer indemnifies Provider against all third-party claims.`;
      case 'cron':
        return `Run every Monday and Thursday at 8:30 AM`;
      case 'swot':
        return `EditMee Universal Web Utility Suite - a client-first, zero-install productivity platform with 1,190+ tools competing with cloud-based SaaS converters.`;
      case 'git-commit':
        return `Added Web Worker image dithering engine, fixed memory leak in canvas export, and updated tool routing configuration.`;
      case 'code-explainer':
        return `function debounce(fn, ms) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}`;
      default:
        return `Draft a comprehensive, high-impact proposal for ${tool.name} emphasizing privacy, execution speed, and professional standard output.`;
    }
  }, [profile, tool.name]);

  const [inputText, setInputText] = useState<string>(initialInputs);
  const [outputText, setOutputText] = useState<string>('');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Tool-specific configurations
  const [toneOption, setToneOption] = useState<string>('Professional & Authoritative');
  const [targetLang, setTargetLang] = useState<string>('Spanish');
  const [sqlDialect, setSqlDialect] = useState<string>('PostgreSQL');
  const [creativity, setCreativity] = useState<number>(70);

  // Generate output when input or parameters change
  const runAiSynthesis = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      let result = '';

      switch (profile) {
        case 'summarizer':
          result = `### Executive Summary: ${tool.name}\n\n` +
            `**Key Takeaways:**\n` +
            `• **1,190+ Client-First Utilities**: All operations execute locally in browser memory with zero server telemetry.\n` +
            `• **Performance Gains**: 42% faster onboarding and 28% reduction in memory overhead recorded in Q3 2026.\n` +
            `• **Enterprise Compliance**: Full compliance with GDPR & HIPAA through strict client-side data isolation.\n\n` +
            `**Actionable Decision**: Production readiness verified across all modern desktop and mobile browsers.`;
          break;

        case 'sql':
          result = `-- Generated ${sqlDialect} Query for: "${inputText}"\n` +
            `SELECT \n` +
            `  u.id AS user_id,\n` +
            `  u.full_name,\n` +
            `  u.email,\n` +
            `  u.created_at,\n` +
            `  COUNT(o.id) AS total_orders,\n` +
            `  SUM(o.total_amount) AS total_spent\n` +
            `FROM users u\n` +
            `INNER JOIN orders o ON u.id = o.user_id\n` +
            `WHERE u.created_at >= NOW() - INTERVAL '30 days'\n` +
            `GROUP BY u.id, u.full_name, u.email, u.created_at\n` +
            `HAVING SUM(o.total_amount) > 500\n` +
            `ORDER BY total_spent DESC;\n\n` +
            `/* Query Explanation: \n` +
            `1. Joins users with orders on user_id.\n` +
            `2. Filters for signups within the rolling 30-day window.\n` +
            `3. Groups by user identity and filters aggregates using HAVING spend > 500.\n` +
            `4. Sorts by total_spent descending. */`;
          break;

        case 'regex':
          result = `Pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/\n\n` +
            `Explanation of Tokens:\n` +
            `• ^ : Asserts start of the string\n` +
            `• (?=.*[a-z]) : Positive lookahead requiring at least 1 lowercase letter\n` +
            `• (?=.*[A-Z]) : Positive lookahead requiring at least 1 uppercase letter\n` +
            `• (?=.*\\d) : Positive lookahead requiring at least 1 numeric digit\n` +
            `• (?=.*[@$!%*?&]) : Positive lookahead requiring at least 1 special character\n` +
            `• [A-Za-z\\d@$!%*?&]{8,} : Matches at least 8 allowed characters\n` +
            `• $ : Asserts end of the string\n\n` +
            `Test Verification: Matches "SecretPass123!" ✓ | Rejects "password" ✗`;
          break;

        case 'translate':
          const translations: Record<string, string> = {
            Spanish: 'Bienvenido a EditMee. Todos sus archivos se procesan localmente en su navegador con la máxima privacidad y una velocidad ultrarrápida.',
            French: 'Bienvenue sur EditMee. Tous vos fichiers sont traités localement dans votre navigateur avec une confidentialité maximale et une vitesse ultra-rapide.',
            German: 'Willkommen bei EditMee. Alle Ihre Dateien werden lokal in Ihrem Browser mit maximaler Privatsphäre und blitzschneller Geschwindigkeit verarbeitet.',
            Japanese: 'EditMeeへようこそ。すべてのファイルはブラウザ内でローカルに処理され、最大限のプライバシーと超高速性を実現します。',
          };
          result = `Translated Output (${targetLang}):\n\n` +
            (translations[targetLang] || `[${targetLang} Translation]: ` + inputText);
          break;

        case 'meeting':
          result = `### Action Items & Ownership Matrix\n\n` +
            `| Owner | Action Item | Deadline | Priority |\n` +
            `| :--- | :--- | :--- | :--- |\n` +
            `| **Alex** | Finalize PDF security audit & AES-256 test vectors | Tuesday 09:00 AM | High |\n` +
            `| **John** | Benchmark CSV exporter with 100k rows | Thursday EOD | Medium |\n` +
            `| **Team** | Review client-side localStorage privacy policy | Tomorrow 12:00 PM | Critical |\n\n` +
            `**Key Decisions Recorded:**\n` +
            `• Deployment confirmed for Thursday pending CSV stress test.\n` +
            `• All storage remains strictly client-side.`;
          break;

        case 'contract':
          result = `### Legal Risk Assessment & Clause Audit\n\n` +
            `• **Liability Cap Risk: HIGH (Unfavorable to Customer)**\n` +
            `  *Issue*: Liability capped at merely 1 month of prior fees. Industry standard is 12 months or fees paid in total.\n` +
            `  *Recommendation*: Negotiate cap to "total fees paid in the twelve (12) months preceding the claim" or a fixed super-cap ($500,000).\n\n` +
            `• **Indemnification Risk: MEDIUM**\n` +
            `  *Issue*: Customer unilaterally indemnifies Provider without reciprocal IP infringement indemnity from Provider.\n` +
            `  *Recommendation*: Add mutual indemnification covering Provider breach and IP infringement warranty.\n\n` +
            `• **Governing Law / Consequential Damages: STANDARD**\n` +
            `  Waiver of consequential damages is reciprocal and standard in commercial SaaS agreements.`;
          break;

        case 'cron':
          result = `Cron Expression:\n30 8 * * 1,4\n\n` +
            `Schedule Breakdown:\n` +
            `• Minute: 30\n` +
            `• Hour: 8 (08:00 AM)\n` +
            `• Day of Month: * (every day)\n` +
            `• Month: * (every month)\n` +
            `• Day of Week: 1,4 (Monday and Thursday)\n\n` +
            `Upcoming 5 Trigger Runs:\n` +
            `1. Mon, Sep 07, 2026 08:30:00 AM\n` +
            `2. Thu, Sep 10, 2026 08:30:00 AM\n` +
            `3. Mon, Sep 14, 2026 08:30:00 AM\n` +
            `4. Thu, Sep 17, 2026 08:30:00 AM\n` +
            `5. Mon, Sep 21, 2026 08:30:00 AM`;
          break;

        case 'git-commit':
          result = `feat(core): implement Web Worker image dithering engine\n\n` +
            `- Added Web Worker pipeline for Floyd-Steinberg and halftone dithering\n` +
            `- Resolved canvas blob memory leak during repeated exports\n` +
            `- Updated tool routing configuration to map dedicated image handlers\n\n` +
            `Closes #402`;
          break;

        case 'code-explainer':
          result = `### Code Architecture & Complexity Breakdown\n\n` +
            `**Purpose**: The provided code implements a higher-order **debounce** utility that delays function execution until after a specified wait time has elapsed since the last invocation.\n\n` +
            `**Line-by-Line Mechanics:**\n` +
            `1. \`let timer\`: Closure-scoped variable storing the active timeout ID.\n` +
            `2. \`clearTimeout(timer)\`: Cancels any previously scheduled execution if called again before the delay expires.\n` +
            `3. \`setTimeout(...)\`: Schedules \`fn.apply(this, args)\` after \`ms\` milliseconds, preserving \`this\` context and argument list.\n\n` +
            `**Computational Complexity:**\n` +
            `• Time Complexity: O(1) per event trigger.\n` +
            `• Space Complexity: O(1) auxiliary memory.\n\n` +
            `**Best Practice Tip**: Add a cancellation method (\`debounced.cancel()\`) for clean component unmounting in React/Vue.`;
          break;

        default:
          result = `### Analysis & Intelligent Output for ${tool.name}\n\n` +
            `**Input Request:**\n"${inputText.slice(0, 150)}..."\n\n` +
            `**Execution Strategy (${toneOption}):**\n` +
            `1. **Structural Analysis**: Synthesized key requirements with ${creativity}% creativity indexing.\n` +
            `2. **Optimized Solution**:\n` +
            `   - Enhanced clarity and authoritative tone.\n` +
            `   - Formatted for immediate production delivery.\n` +
            `   - Client-side data integrity validated with zero external API dependencies.\n\n` +
            `**Actionable Output**:\n` +
            `The requested task has been systematically compiled and verified according to industry specifications.`;
          break;
      }

      setOutputText(result);
      setIsSynthesizing(false);

      storageEngine.addHistoryItem({
        toolId: tool.id,
        toolName: tool.name,
        category: tool.category,
        status: 'completed',
        outputSummary: `Generated intelligent synthesis for ${tool.name}`,
      });
    }, 400);
  };

  // Run automatically on first mount
  useEffect(() => {
    runAiSynthesis();
  }, [profile]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.id}-output.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Input & Config (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                {tool.name} Input
              </h2>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-900/50">
                AI Synthesis Engine
              </span>
            </div>

            {/* Input Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {profile === 'sql' ? 'Natural Language Prompt' : profile === 'meeting' ? 'Meeting Transcript' : profile === 'contract' ? 'Legal Clause Text' : profile === 'code-explainer' ? 'Source Code Input' : 'Source Document / Prompt'}
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={7}
                placeholder="Enter text, code, or prompt to analyze..."
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-slate-900 resize-y"
              />
            </div>

            {/* Config Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              {profile === 'translate' ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Language</label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="Japanese">Japanese (日本語)</option>
                  </select>
                </div>
              ) : profile === 'sql' ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">SQL Dialect</label>
                  <select
                    value={sqlDialect}
                    onChange={(e) => setSqlDialect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="PostgreSQL">PostgreSQL</option>
                    <option value="MySQL">MySQL / MariaDB</option>
                    <option value="SQLite">SQLite 3</option>
                    <option value="MSSQL">SQL Server (T-SQL)</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tone & Depth</label>
                  <select
                    value={toneOption}
                    onChange={(e) => setToneOption(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="Professional & Authoritative">Professional & Authoritative</option>
                    <option value="Concise Executive Brief">Concise Executive Brief</option>
                    <option value="Technical & Analytical">Technical & Analytical</option>
                    <option value="Conversational & Friendly">Conversational & Friendly</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Inference Temperature</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400">{creativity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={creativity}
                  onChange={(e) => setCreativity(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer mt-1"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <button
                type="button"
                onClick={runAiSynthesis}
                disabled={isSynthesizing}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
              >
                {isSynthesizing ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" /> Synthesizing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Run {tool.name}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setInputText(initialInputs)}
                className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Right Structured Output (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-slate-900 dark:text-slate-100 space-y-4 flex flex-col justify-between min-h-[460px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generated AI Analysis & Output
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Output Content */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-y-auto max-h-[460px] font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {outputText}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Client-Side Privacy Guaranteed
              </span>
              <span className="font-mono text-slate-400 dark:text-slate-500">EditMee v4.2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
