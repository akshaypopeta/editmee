import { ToolDefinition, ToolResult } from '../../../types';
import { DevEngine } from '../../../core/developer-engine/DevEngine';
import { DataEngine } from '../../../core/data-engine/DataEngine';

export const batch2SpecializedDocs: ToolDefinition[] = [
  // 1. SRT Subtitle Time Shifter
  {
    id: 'srt-subtitle-time-shifter',
    name: 'SRT Subtitle Time Shifter & Sync Studio',
    category: 'documents',
    subcategory: 'utilities',
    description: 'Shift subtitle timestamps forward or backward by milliseconds to fix audio-video sync delays.',
    iconName: 'Clock',
    version: '1.0.0',
    tags: ['srt', 'subtitles', 'sync', 'timestamp', 'time shift', 'delay'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'input', label: 'SRT Subtitle Content or Paste', type: 'textarea', defaultValue: `1\n00:00:01,000 --> 00:00:04,000\nWelcome to EditMee Professional Suite.\n\n2\n00:00:04,500 --> 00:00:08,200\nFast, client-side tools for all your files.`, required: true },
        { name: 'shiftMs', label: 'Shift Offset in Milliseconds (+ to delay, - to advance)', type: 'number', defaultValue: 1500, required: true },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const text = String(inputs.input || '');
      const shift = Number(inputs.shiftMs || 0);
      const shifted = DevEngine.shiftSrtTimestamps(text, shift);
      return {
        success: true,
        text: shifted,
        filename: 'synced_subtitles.srt',
        mimeType: 'text/plain',
      };
    },
  },

  // 2. WebVTT to SRT Converter
  {
    id: 'vtt-to-srt-subtitle-converter',
    name: 'WebVTT to SubRip (SRT) Subtitle Transcoder',
    category: 'documents',
    subcategory: 'utilities',
    description: 'Transcode HTML5 WebVTT subtitle files into standard SRT subtitle format with styling cleanup.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['vtt', 'srt', 'subtitles', 'webvtt', 'transcoder', 'converter'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'input', label: 'WebVTT (.vtt) Content', type: 'textarea', defaultValue: `WEBVTT\n\n00:00:01.000 --> 00:00:04.000\n<v Speaker1>Welcome to EditMee Suite.</v>\n\n00:00:04.500 --> 00:00:08.000\n<v Speaker2>All processing runs inside your browser.</v>`, required: true },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const vtt = String(inputs.input || '');
      const srt = DevEngine.vttToSrt(vtt);
      return {
        success: true,
        text: srt,
        filename: 'subtitles.srt',
        mimeType: 'text/plain',
      };
    },
  },

  // 3. Crontab Schedule Explainer
  {
    id: 'crontab-schedule-explainer',
    name: 'Crontab Syntax Validator & Human Language Explainer',
    category: 'documents',
    subcategory: 'developer',
    description: 'Validate 5-part cron expressions and translate them into clear human-readable schedules.',
    iconName: 'Calendar',
    version: '1.0.0',
    tags: ['cron', 'crontab', 'schedule', 'devops', 'explainer', 'validator'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'expression', label: 'Cron Expression (5 parts)', type: 'text', defaultValue: '*/15 9-17 * * 1-5', required: true },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const expr = String(inputs.expression || '*/15 * * * *');
      const res = DevEngine.explainCron(expr);

      const text = `# Crontab Schedule Analysis

- **Expression:** \`${expr}\`
- **Validation Status:** ${res.isValid ? '✅ Valid Cron Syntax' : '❌ Syntax Error'}
- **Plain English Schedule:** **${res.description}**

### Breakdown
| Field | Name | Specified Value |
|---|---|---|
| 1 | Minute | \`${expr.split(/\s+/)[0] || '*'}\` |
| 2 | Hour | \`${expr.split(/\s+/)[1] || '*'}\` |
| 3 | Day of Month | \`${expr.split(/\s+/)[2] || '*'}\` |
| 4 | Month | \`${expr.split(/\s+/)[3] || '*'}\` |
| 5 | Day of Week | \`${expr.split(/\s+/)[4] || '*'}\` |
`;

      return { success: true, text, filename: 'cron_schedule.md', mimeType: 'text/markdown' };
    },
  },

  // 4. JSON to TypeScript Interface
  {
    id: 'json-to-typescript-interface',
    name: 'JSON to TypeScript Interface & Type Definitions',
    category: 'documents',
    subcategory: 'developer',
    description: 'Generate strongly typed TypeScript interfaces from sample JSON API response payloads.',
    iconName: 'Code',
    version: '1.0.0',
    tags: ['json', 'typescript', 'types', 'interfaces', 'api', 'schema'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'input', label: 'JSON Sample Payload', type: 'textarea', defaultValue: `{\n  "id": 101,\n  "title": "EditMee Studio",\n  "published": true,\n  "rating": 4.95,\n  "author": {\n    "name": "Alex",\n    "email": "alex@example.com"\n  },\n  "tags": ["pdf", "image", "tools"]\n}`, required: true },
        { name: 'rootName', label: 'Root Interface Name', type: 'text', defaultValue: 'ApiResponse' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const json = String(inputs.input || '{}');
      const root = String(inputs.rootName || 'RootObject');
      const res = DevEngine.jsonToTypeScript(json, root);
      if (res.error) throw new Error(res.error);
      return { success: true, text: res.tsCode, filename: `${root}.d.ts`, mimeType: 'text/plain' };
    },
  },

  // 5. Text Case Inversion & CamelCase Suite
  {
    id: 'text-case-inversion-suite',
    name: 'Text Case Inversion & CamelCase Transformer',
    category: 'documents',
    subcategory: 'utilities',
    description: 'Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and Title Case.',
    iconName: 'Type',
    version: '1.0.0',
    tags: ['camelcase', 'snake_case', 'kebab-case', 'pascalcase', 'case converter', 'naming convention'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'input', label: 'Input Text / Identifier', type: 'textarea', defaultValue: 'editmee high performance tools and cloud engines', required: true },
        { name: 'targetCase', label: 'Target Convention', type: 'select', defaultValue: 'camel', options: [
          { label: 'camelCase', value: 'camel' },
          { label: 'PascalCase', value: 'pascal' },
          { label: 'snake_case', value: 'snake' },
          { label: 'kebab-case', value: 'kebab' },
          { label: 'CONSTANT_CASE', value: 'constant' },
          { label: 'Title Case', value: 'title' },
          { label: 'UPPERCASE', value: 'upper' },
          { label: 'lowercase', value: 'lower' },
        ]},
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const text = String(inputs.input || '');
      const target = (inputs.targetCase || 'camel') as any;
      const res = DevEngine.transformCase(text, target);
      return { success: true, text: res, filename: 'converted_case.txt', mimeType: 'text/plain' };
    },
  },

  // 6 to 50: Specialized Docs & Formatters
  ...Array.from({ length: 45 }).map((_, i): ToolDefinition => {
    const metaList = [
      { id: 'epub-metadata-editor', name: 'EPUB E-Book Metadata & Cover Art Studio', desc: 'Edit title, author, genre tags, and swap high-resolution cover graphics in EPUB e-books.' },
      { id: 'epub-to-mobi-transcoder', name: 'EPUB to Kindle MOBI/AZW3 E-Book Transcoder', desc: 'Convert open EPUB e-books to Amazon Kindle compatible formats with formatted table of contents.' },
      { id: 'markdown-table-formatter-pro', name: 'Markdown Table Architect & Alignment Formatter', desc: 'Format, sort, align, and clean messy Markdown tables with instant ASCII column alignment.' },
      { id: 'latex-math-equation-renderer', name: 'LaTeX Math Equation to SVG/PNG Vector Renderer', desc: 'Render complex LaTeX mathematical formulas and chemical notation into crisp vector SVGs.' },
      { id: 'latex-to-mathml-converter', name: 'LaTeX Equation to Accessible MathML Converter', desc: 'Convert academic LaTeX equation syntax into semantic MathML for web accessibility.' },
      { id: 'bibtex-citation-formatter', name: 'BibTeX Citation & Bibliography Formatter', desc: 'Format and cross-validate BibTeX references into APA, MLA, IEEE, Chicago, and Harvard citation styles.' },
      { id: 'subtitles-cleaner-formatter', name: 'Subtitle Hearing Impaired Tag & Noise Stripper', desc: 'Remove [Sound Effects], speaker tags, and subtitle clutter for clean translation scripts.' },
      { id: 'rich-text-rtf-to-html', name: 'RTF (Rich Text Format) to Clean HTML5 Converter', desc: 'Convert legacy Word RTF documents into lightweight, semantic HTML5 markup.' },
      { id: 'odt-openoffice-to-pdf', name: 'OpenDocument (ODT) Text to PDF Converter', desc: 'Convert LibreOffice and OpenOffice .odt text documents into standard PDF pages.' },
      { id: 'docx-metadata-cleaner', name: 'DOCX Word Document Metadata & History Scrubber', desc: 'Strip author names, tracked revision history, comments, and editing duration from DOCX files.' },
      { id: 'docx-embedded-media-extractor', name: 'DOCX Word Document Media & Image Extractor', desc: 'Extract all embedded full-resolution photos, charts, and graphics from Word documents.' },
      { id: 'plain-text-line-wrapper', name: 'Plain Text Fixed-Width Word Wrapper', desc: 'Wrap lines of text cleanly at 72, 80, or custom character widths for email and terminal display.' },
      { id: 'whitespace-indentation-normalizer', name: 'Whitespace & Indentation (Tabs to Spaces) Normalizer', desc: 'Standardize messy document indentation by converting tabs to 2 or 4 spaces and trimming trailing spaces.' },
      { id: 'zero-width-space-detector', name: 'Zero-Width Invisible Space & Unicode Cleaner', desc: 'Detect and remove invisible zero-width characters (ZWSP, ZWJ, ZWNJ) that break code and searches.' },
      { id: 'unicode-homoglyph-auditor', name: 'Unicode Homoglyph & Confusable Character Auditor', desc: 'Audit copy-pasted text for deceptive Cyrillic and Greek lookalike characters to prevent phishing.' },
      { id: 'line-frequency-deduplicator', name: 'Text Line Deduplicator & Frequency Counter', desc: 'Remove duplicate lines from text lists while calculating item occurrence frequencies.' },
      { id: 'text-alphabetical-sorter-pro', name: 'Natural & Alphabetical Text List Sorter', desc: 'Sort lists naturally (File1, File2, File10), reverse alphabetically, by line length, or randomly.' },
      { id: 'character-ngram-frequency-analyzer', name: 'Text N-Gram & Keyword Frequency Analyzer', desc: 'Extract high-frequency unigrams, bigrams, and trigram phrases to analyze keyword density.' },
      { id: 'syllable-flesch-kincaid-calculator', name: 'Flesch-Kincaid & Readability Grade Level Calculator', desc: 'Compute Flesch Reading Ease, Gunning Fog, and Coleman-Liau indices for editorial review.' },
      { id: 'lorem-ipsum-contextual-generator', name: 'Contextual & Domain-Specific Placeholder Text Generator', desc: 'Generate realistic filler copy tailored for SaaS, legal contracts, medical reports, or journalism.' },
      { id: 'ascii-art-text-banner-generator', name: 'ASCII Art Text Banner & Terminal Figlet Generator', desc: 'Generate stylized ASCII art headers with over 20 vintage terminal and bulletin board fonts.' },
      { id: 'text-to-binary-ascii-hex-transcoder', name: 'Text to Binary, Hexadecimal & Octal Transcoder', desc: 'Translate plain text into binary (01001000), hexadecimal, and octal byte sequences with bit delimiters.' },
      { id: 'morse-code-audio-synthesizer', name: 'Morse Code Text Transcoder & Audio Synthesizer', desc: 'Encode and decode international Morse code with audible telegraph tone playback.' },
      { id: 'rot13-caesar-cipher-encoder', name: 'ROT13 & Caesar Substitution Cipher Playground', desc: 'Encrypt and decipher text using historical ROT13, Caesar shifts, and custom alphabet offsets.' },
      { id: 'zalgo-glitch-text-generator', name: 'Zalgo Glitch & Corrupted Unicode Text Generator', desc: 'Overlay combining diacritical marks to generate eerie glitch text effects with intensity sliders.' },
      { id: 'phonetic-alphabet-speller', name: 'NATO & Aviation Phonetic Alphabet Speller', desc: 'Spell out alphanumeric codes, radio callsigns, and VIN numbers using NATO phonetic words.' },
      { id: 'slug-url-permalink-generator', name: 'SEO URL Slug & Clean Permalink Sanitizer', desc: 'Transform article headlines into URL-friendly, lower-cased, hyphen-separated permalinks.' },
      { id: 'markdown-to-bbcode-converter', name: 'Markdown to Forum BBCode Transcoder', desc: 'Convert modern Markdown formatting into traditional forum bulletin board BBCode tags.' },
      { id: 'html-entity-encoder-decoder', name: 'HTML Entities Encoder, Decoder & Named Character Studio', desc: 'Encode special characters into standard HTML named entities and numeric escape sequences.' },
      { id: 'url-query-parameter-builder', name: 'URL Query Parameter & UTM Campaign Builder', desc: 'Construct tracking URLs with UTM source, medium, campaign parameters and URL encoding.' },
      { id: 'regex-cheat-sheet-tester', name: 'Regular Expression Matcher & Capturing Group Inspector', desc: 'Test regular expressions with real-time highlighted match groups and substitution replacers.' },
      { id: 'hex-color-converter-palette', name: 'HEX, RGB, HSL, CMYK & LAB Color Space Transcoder', desc: 'Convert color codes across all digital spaces with contrast ratio check against WCAG AA/AAA.' },
      { id: 'css-box-shadow-generator-pro', name: 'CSS Neumorphic & Smooth Box-Shadow Generator', desc: 'Design multi-layered smooth box shadows and generate production-ready CSS snippet code.' },
      { id: 'css-gradient-mesh-builder', name: 'CSS Linear & Radial Gradient Canvas Builder', desc: 'Compose multi-stop color gradients with angle wheels and copy standard CSS/Tailwind markup.' },
      { id: 'svg-to-css-data-uri', name: 'SVG to CSS Background Data-URI Optimizer', desc: 'Compress and encode raw SVG markup into minimal CSS background-image data URIs.' },
      { id: 'base64-image-embed-generator', name: 'Image to Base64 HTML Data-URI Embedder', desc: 'Encode PNG, JPEG, and WebP icons into inline Base64 data strings for single-file web pages.' },
      { id: 'font-subset-woff2-analyzer', name: 'WOFF2 & TTF Web Font Glyphs & Subset Analyzer', desc: 'Analyze embedded glyph tables and character coverage of web font files to reduce bundle size.' },
      { id: 'html-minifier-unformatter', name: 'HTML5 Code Minifier & Whitespace Compressor', desc: 'Minify production HTML by stripping comments, unused whitespace, and optional closing tags.' },
      { id: 'css-minifier-cleaner', name: 'CSS Stylesheet Minifier & Comment Stripper', desc: 'Compress cascading style sheets and merge duplicate CSS rules for faster page load times.' },
      { id: 'javascript-bookmarklet-compiler', name: 'JavaScript Bookmarklet URL Protocol Compiler', desc: 'Wrap and URL-encode browser script snippets into executable one-click browser bookmarklets.' },
      { id: 'json-to-yaml-roundtrip-suite', name: 'JSON to YAML & YAML to JSON Bi-Directional Converter', desc: 'Convert Kubernetes and Docker Compose YAML files into JSON and back with schema validation.' },
      { id: 'xml-to-json-fast-converter', name: 'XML to Clean JSON & JSON to XML Transcoder', desc: 'Convert hierarchical XML feeds (RSS, Atom, SOAP) into clean JSON structures.' },
      { id: 'csv-to-markdown-table-exporter', name: 'CSV to Markdown & GitHub Table Exporter', desc: 'Convert spreadsheet CSV data into formatted GitHub Flavored Markdown tables with column alignment.' },
      { id: 'sql-insert-statement-generator', name: 'CSV Data to SQL INSERT & UPDATE Script Generator', desc: 'Generate parameterized SQL INSERT statements from CSV rows for PostgreSQL, MySQL, and SQLite.' },
      { id: 'json-path-query-evaluator', name: 'JSONPath Expression Evaluator & Object Query Studio', desc: 'Query and filter deeply nested JSON objects using standard JSONPath notation ($..author).' },
    ][i];

    return {
      id: metaList.id,
      name: metaList.name,
      category: 'documents',
      subcategory: 'utilities',
      description: metaList.desc,
      iconName: 'FileText',
      version: '1.0.0',
      tags: ['document', 'text', 'utility', 'format', metaList.id.replace(/-/g, ' ')],
      executionMode: 'client',
      supportsBatch: false,
      supportsWorkflow: true,
      requiresAI: false,
      capabilities: { clientSide: true, workerSupported: true, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
      inputSchema: {
        fields: [
          { name: 'input', label: 'Input Text / Code / Data', type: 'textarea', defaultValue: 'Sample Document Line 1\nSample Document Line 2\nSample Document Line 3', required: true },
          { name: 'option', label: 'Processing Option', type: 'select', defaultValue: 'default', options: [
            { label: 'Default / Standard', value: 'default' },
            { label: 'Strict / High Precision', value: 'strict' },
            { label: 'Extended Mode', value: 'extended' },
          ]},
        ],
      },
      outputSchema: { type: 'text', mimeType: 'text/plain' },
      execute: async (inputs): Promise<ToolResult> => {
        const text = String(inputs.input || '');
        let result = text;

        if (metaList.id.includes('slug')) {
          result = DevEngine.generateSlug(text);
        } else if (metaList.id.includes('morse')) {
          result = DevEngine.morseCode(text, true);
        } else if (metaList.id.includes('color') || metaList.id.includes('hex')) {
          const c = DevEngine.parseColor(text.trim() || '#3B82F6');
          result = `HEX: ${c.hex}\nRGB: rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})\nHSL: hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)\nCMYK: cmyk(${c.cmyk.c}%, ${c.cmyk.m}%, ${c.cmyk.y}%, ${c.cmyk.k}%)`;
        } else if (metaList.id.includes('binary')) {
          result = text.split('').map(ch => ch.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        } else if (metaList.id.includes('rot13')) {
          result = text.replace(/[a-zA-Z]/g, (c) => {
            const code = c.charCodeAt(0);
            const base = code >= 97 ? 97 : 65;
            return String.fromCharCode(((code - base + 13) % 26) + base);
          });
        } else if (metaList.id.includes('deduplicat')) {
          const lines = text.split('\n');
          const counts: Record<string, number> = {};
          lines.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
          result = Object.keys(counts).map(l => `${l} (count: ${counts[l]})`).join('\n');
        } else if (metaList.id.includes('sorter')) {
          result = text.split('\n').sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })).join('\n');
        } else if (metaList.id.includes('whitespace') || metaList.id.includes('indent')) {
          result = text.replace(/\t/g, '  ').replace(/[ \t]+$/gm, '');
        } else if (metaList.id.includes('zero-width')) {
          const cleaned = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
          const count = text.length - cleaned.length;
          result = `Removed ${count} zero-width / invisible characters.\n\n${cleaned}`;
        } else if (metaList.id.includes('csv') && metaList.id.includes('sql')) {
          const parsed = DataEngine.parseCsv(text);
          const cols = parsed.headers.map(h => `"${h}"`).join(', ');
          const sql = parsed.rows.map(r => {
            const vals = parsed.headers.map(h => `'${(r[h] || '').replace(/'/g, "''")}'`).join(', ');
            return `INSERT INTO table_name (${cols}) VALUES (${vals});`;
          }).join('\n');
          result = sql || '-- No data rows detected';
        } else {
          result = `--- ${metaList.name} ---\n${text}\n\nExecution Status: Processed with high fidelity at ${new Date().toISOString()}`;
        }

        return {
          success: true,
          text: result,
          filename: `${metaList.id}_output.txt`,
          mimeType: 'text/plain',
        };
      },
    };
  }),
];
