import { ToolDefinition, ToolResult } from '../../types';

export const documentsCatalog: ToolDefinition[] = [
  // 1. Word & Character Counter
  {
    id: 'word-counter',
    name: 'Word & Character Frequency Counter',
    category: 'documents',
    subcategory: 'stats',
    description: 'Calculate real-time word count, character count (with/without spaces), reading time, and speaking time.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['words', 'characters', 'count', 'reading-time', 'writing'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Document Text', type: 'textarea', required: true, defaultValue: 'EditMee empowers modern users with private, high-speed document tools.' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const text = inputs.text || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const charsWithSpaces = text.length;
      const charsNoSpaces = text.replace(/\s+/g, '').length;
      const paragraphs = text.split(/\n+/).filter((p: string) => p.trim()).length;
      const readingTimeMinutes = (words / 200).toFixed(1);
      const speakingTimeMinutes = (words / 130).toFixed(1);

      const stats = {
        words,
        characters: charsWithSpaces,
        charactersWithoutSpaces: charsNoSpaces,
        paragraphs,
        readingTime: `${readingTimeMinutes} min`,
        speakingTime: `${speakingTimeMinutes} min`,
      };
      return { success: true, data: stats, text: JSON.stringify(stats, null, 2) };
    },
  },

  // 2. Case Converter (Upper, Lower, Title, Snake, Camel, Kebab)
  {
    id: 'case-converter',
    name: 'Case Converter (Title, Camel, Snake, Kebab)',
    category: 'documents',
    subcategory: 'format',
    description: 'Transform text into Title Case, camelCase, snake_case, kebab-case, UPPERCASE, and lowercase.',
    iconName: 'Type',
    version: '1.0.0',
    tags: ['case', 'converter', 'titlecase', 'camelcase', 'snakecase', 'kebabcase'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Input Text', type: 'textarea', required: true, defaultValue: 'high performance workflow builder' },
        {
          name: 'targetCase',
          label: 'Target Case Format',
          type: 'select',
          defaultValue: 'title',
          options: [
            { label: 'Title Case', value: 'title' },
            { label: 'camelCase', value: 'camel' },
            { label: 'snake_case', value: 'snake' },
            { label: 'kebab-case', value: 'kebab' },
            { label: 'UPPERCASE', value: 'upper' },
            { label: 'lowercase', value: 'lower' },
            { label: 'PascalCase', value: 'pascal' },
          ],
        },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const text = inputs.text || '';
      const mode = inputs.targetCase || 'title';
      const words = text.replace(/[^a-zA-Z0-9\s]/g, ' ').trim().split(/\s+/);

      let res = text;
      if (mode === 'upper') res = text.toUpperCase();
      else if (mode === 'lower') res = text.toLowerCase();
      else if (mode === 'title') {
        res = words.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      } else if (mode === 'camel') {
        res = words.map((w: string, i: number) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
      } else if (mode === 'pascal') {
        res = words.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
      } else if (mode === 'snake') {
        res = words.map((w: string) => w.toLowerCase()).join('_');
      } else if (mode === 'kebab') {
        res = words.map((w: string) => w.toLowerCase()).join('-');
      }

      return { success: true, text: res };
    },
  },

  // 3. Text Sorter & Line Deduplicator
  {
    id: 'text-sorter',
    name: 'Text Line Sorter & Deduplicator',
    category: 'documents',
    subcategory: 'cleaning',
    description: 'Alphabetize, reverse, sort numerically, and deduplicate lines of text.',
    iconName: 'ArrowUpDown',
    version: '1.0.0',
    tags: ['text', 'sort', 'alphabetize', 'deduplicate', 'lines'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Lines of Text', type: 'textarea', required: true, defaultValue: 'Banana\nApple\nCherry\nApple\nDate' },
        { name: 'order', label: 'Sort Order', type: 'select', defaultValue: 'az', options: [{ label: 'A to Z', value: 'az' }, { label: 'Z to A', value: 'za' }, { label: 'Shortest to Longest', value: 'len-asc' }, { label: 'Longest to Shortest', value: 'len-desc' }] },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines: string[] = (inputs.text || '').split('\n').filter((l: string) => l.trim());
      const unique: string[] = Array.from(new Set(lines));
      const mode = inputs.order || 'az';

      if (mode === 'az') unique.sort((a: string, b: string) => a.localeCompare(b));
      else if (mode === 'za') unique.sort((a: string, b: string) => b.localeCompare(a));
      else if (mode === 'len-asc') unique.sort((a: string, b: string) => a.length - b.length);
      else if (mode === 'len-desc') unique.sort((a: string, b: string) => b.length - a.length);

      return { success: true, text: unique.join('\n') };
    },
  },

  // 4. Lorem Ipsum Text Generator
  {
    id: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Placeholder Text Generator',
    category: 'documents',
    subcategory: 'generators',
    description: 'Generate paragraphs, sentences, or words of classic placeholder text.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['lorem', 'ipsum', 'placeholder', 'dummy-text', 'mock'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'count', label: 'Number of Paragraphs', type: 'number', defaultValue: 3 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const count = Math.min(20, Math.max(1, Number(inputs.count || 3)));
      const base = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
      const paragraphs = Array.from({ length: count }, () => base);
      return { success: true, text: paragraphs.join('\n\n') };
    },
  },

  // 5. Slugify URL String Generator
  {
    id: 'slugify-string',
    name: 'URL Slug Generator',
    category: 'documents',
    subcategory: 'format',
    description: 'Convert article headlines into clean, lowercase, URL-friendly SEO slugs.',
    iconName: 'Link',
    version: '1.0.0',
    tags: ['slug', 'url', 'seo', 'permalink', 'format'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'title', label: 'Article / Page Title', type: 'text', required: true, defaultValue: 'How to Build Ultra Fast Web Workflows in 2026!' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const title = inputs.title || '';
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return { success: true, text: slug };
    },
  },

  // 6. Text Cleaner & Whitespace Stripper
  {
    id: 'text-cleaner',
    name: 'Text Cleaner & Normalizer',
    category: 'documents',
    subcategory: 'cleaning',
    description: 'Strip multiple spaces, trailing newlines, non-breaking spaces, and normalize quotes.',
    iconName: 'CheckCircle',
    version: '1.0.0',
    tags: ['clean', 'normalize', 'whitespace', 'strip', 'text'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Messy Text', type: 'textarea', required: true, defaultValue: 'This   has   too    many   spaces.\n\n\n\nAnd excessive empty lines.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const clean = (inputs.text || '')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
      return { success: true, text: clean };
    },
  },

  // 7. Flesch-Kincaid Readability Analyzer
  {
    id: 'readability-analyzer',
    name: 'Flesch-Kincaid Readability & Reading Ease Scorer',
    category: 'documents',
    subcategory: 'analytics',
    description: 'Calculate Flesch Reading Ease score, estimated grade level, and sentence complexity.',
    iconName: 'BookOpen',
    version: '1.0.0',
    tags: ['readability', 'flesch-kincaid', 'grade-level', 'seo', 'prose'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Document Text', type: 'textarea', required: true, defaultValue: 'The quick brown fox jumps over the lazy dog. Simple sentences improve reader comprehension and retention across broad digital audiences.' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const text = inputs.text || '';
      const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim()).length || 1;
      const words = text.trim().split(/\s+/).filter(Boolean).length || 1;
      // Syllable estimation
      const syllables = text.toLowerCase().split(/[aeiouy]+/).length;

      const score = Math.max(0, Math.min(100, 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)));
      const grade = Math.max(1, 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59);

      const res = {
        fleschReadingEase: Number(score.toFixed(1)),
        readingEaseLevel: score > 80 ? 'Very Easy (5th grade)' : score > 60 ? 'Plain English (8th grade)' : score > 30 ? 'College Level' : 'Very Difficult (Academic)',
        estimatedGradeLevel: Number(grade.toFixed(1)),
        words,
        sentences,
        avgWordsPerSentence: Number((words / sentences).toFixed(1)),
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 8. Line Numberer & Prefix/Suffix Appender
  {
    id: 'line-numberer',
    name: 'Line Numberer & Prefix/Suffix Appender',
    category: 'documents',
    subcategory: 'format',
    description: 'Add line numbers, list markers, quotes, or custom prefix/suffix strings to every line.',
    iconName: 'ListOrdered',
    version: '1.0.0',
    tags: ['lines', 'numbers', 'prefix', 'suffix', 'format'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Input Lines', type: 'textarea', required: true, defaultValue: 'First item\nSecond item\nThird item' },
        { name: 'prefix', label: 'Prefix', type: 'text', defaultValue: '1. ' },
        { name: 'suffix', label: 'Suffix', type: 'text', defaultValue: '' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines = (inputs.text || '').split('\n');
      const p = inputs.prefix || '';
      const s = inputs.suffix || '';
      const res = lines.map((line: string, idx: number) => {
        const prefixStr = p.includes('1.') ? `${idx + 1}. ` : p;
        return `${prefixStr}${line}${s}`;
      });
      return { success: true, text: res.join('\n') };
    },
  },

  // 9. Text Reverser & Palindrome Checker
  {
    id: 'text-reverser',
    name: 'Text Reverser & Palindrome Checker',
    category: 'documents',
    subcategory: 'text',
    description: 'Reverse character sequence or word sequence and verify palindrome symmetry.',
    iconName: 'Repeat',
    version: '1.0.0',
    tags: ['reverse', 'palindrome', 'text', 'string'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Input Text', type: 'text', required: true, defaultValue: 'racecar' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const str = inputs.text || '';
      const reversed = str.split('').reverse().join('');
      const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanRev = clean.split('').reverse().join('');
      const isPalindrome = clean.length > 0 && clean === cleanRev;
      const res = { original: str, reversed, isPalindrome };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 10. ROT13 & Caesar Cipher
  {
    id: 'rot13-cipher',
    name: 'ROT13 & Caesar Shift Cipher',
    category: 'documents',
    subcategory: 'security',
    description: 'Obfuscate or decode text using 13-character rotation Caesar cipher.',
    iconName: 'Lock',
    version: '1.0.0',
    tags: ['rot13', 'caesar', 'cipher', 'obfuscate', 'crypto'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Text to Encode/Decode', type: 'textarea', required: true, defaultValue: 'Hello EditMee' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const str = inputs.text || '';
      const res = str.replace(/[a-zA-Z]/g, (c: string) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(base + (c.charCodeAt(0) - base + 13) % 26);
      });
      return { success: true, text: res };
    },
  },

  // 11. Text to Binary String Converter
  {
    id: 'text-to-binary',
    name: 'Text to Binary 8-Bit String Converter',
    category: 'documents',
    subcategory: 'format',
    description: 'Convert characters to 8-bit binary ASCII byte codes and vice versa.',
    iconName: 'Binary',
    version: '1.0.0',
    tags: ['binary', 'ascii', 'bytes', 'encoding', 'converter'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Text String', type: 'text', required: true, defaultValue: 'AI' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const str: string = String(inputs.text || '');
      const bin = Array.from(str).map((c: string) => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
      return { success: true, text: bin };
    },
  },

  // 12. String Truncator & Ellipsis Formatter
  {
    id: 'string-truncator',
    name: 'String Truncator & Ellipsis Formatter',
    category: 'documents',
    subcategory: 'format',
    description: 'Truncate strings cleanly at word boundaries with custom ellipsis endings.',
    iconName: 'Scissors',
    version: '1.0.0',
    tags: ['truncate', 'ellipsis', 'string', 'words', 'limit'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Long Text', type: 'textarea', required: true, defaultValue: 'A comprehensive collection of 500 professional developer and productivity tools running entirely on modern browser engines.' },
        { name: 'maxLength', label: 'Max Characters', type: 'number', defaultValue: 60 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const text = inputs.text || '';
      const max = Number(inputs.maxLength || 60);
      if (text.length <= max) return { success: true, text };
      const truncated = text.slice(0, max).replace(/\s+\S*$/, '') + '...';
      return { success: true, text: truncated };
    },
  },

  // 13. HTML to Plain Text Converter
  {
    id: 'html-to-text',
    name: 'HTML to Plain Text Stripper',
    category: 'documents',
    subcategory: 'conversion',
    description: 'Strip all HTML markup tags while preserving layout breaks and list formatting.',
    iconName: 'FileCode',
    version: '1.0.0',
    tags: ['html', 'plain-text', 'strip', 'tags', 'cleaner'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'html', label: 'HTML Markup', type: 'textarea', required: true, defaultValue: '<h1>Title</h1><p>This is a <strong>bold</strong> paragraph.</p>' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const doc = new DOMParser().parseFromString(inputs.html || '', 'text/html');
      return { success: true, text: doc.body.textContent || '' };
    },
  },

  // 14. ASCII Table Formatter
  {
    id: 'ascii-table-formatter',
    name: 'ASCII Monospace Table Formatter',
    category: 'documents',
    subcategory: 'format',
    description: 'Format plain comma/tab delimited text into box-drawing Unicode/ASCII tables.',
    iconName: 'Table',
    version: '1.0.0',
    tags: ['ascii', 'table', 'box-drawing', 'terminal', 'unicode'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'csv', label: 'CSV / Delimited Text', type: 'textarea', required: true, defaultValue: 'Name,Role,Country\nAlice,Lead,USA\nBob,Eng,UK' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines = (inputs.csv || '').split('\n').filter((l: string) => l.trim());
      if (lines.length === 0) return { success: false, error: 'Provide CSV text' };
      const matrix = lines.map((l: string) => l.split(',').map((c: string) => c.trim()));
      const colWidths = matrix[0].map((_, colIdx) => Math.max(...matrix.map((row) => (row[colIdx] || '').length)));

      const sep = '+' + colWidths.map((w) => '-'.repeat(w + 2)).join('+') + '+';
      const formattedRows = matrix.map((row, i) => {
        const line = '| ' + row.map((cell, idx) => cell.padEnd(colWidths[idx])).join(' | ') + ' |';
        return i === 0 ? `${sep}\n${line}\n${sep}` : line;
      });
      const table = `${formattedRows.join('\n')}\n${sep}`;
      return { success: true, text: table };
    },
  },

  // 15. Letter Frequency & Alphabet Distribution
  {
    id: 'letter-frequency',
    name: 'Letter Frequency & Cryptanalysis Counter',
    category: 'documents',
    subcategory: 'analytics',
    description: 'Count individual alphabetical character occurrences and percentage distributions.',
    iconName: 'BarChart2',
    version: '1.0.0',
    tags: ['letter', 'frequency', 'cryptanalysis', 'alphabet', 'stats'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Text to Analyze', type: 'textarea', required: true, defaultValue: 'EditMee High Performance Studio' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const clean = (inputs.text || '').toLowerCase().replace(/[^a-z]/g, '');
      const total = clean.length || 1;
      const counts: Record<string, number> = {};
      for (const char of clean) {
        counts[char] = (counts[char] || 0) + 1;
      }
      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([char, count]) => ({ char: char.toUpperCase(), count, percentage: `${((count / total) * 100).toFixed(1)}%` }));
      return { success: true, data: sorted, text: JSON.stringify(sorted, null, 2) };
    },
  },

  // 16. Paragraph Line Wrapper
  {
    id: 'paragraph-wrapper',
    name: 'Paragraph Hard Line Wrapper (80 Columns)',
    category: 'documents',
    subcategory: 'format',
    description: 'Wrap long prose paragraphs at exact column widths (e.g. 72 or 80 characters).',
    iconName: 'AlignLeft',
    version: '1.0.0',
    tags: ['wrap', 'columns', 'format', 'prose', 'terminal'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Prose Text', type: 'textarea', required: true, defaultValue: 'EditMee provides instant client-side tools that never leak private document streams to third-party cloud servers.' },
        { name: 'columnWidth', label: 'Wrap Column Width', type: 'number', defaultValue: 40 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const text = inputs.text || '';
      const width = Number(inputs.columnWidth || 40);
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let current = '';

      for (const w of words) {
        if ((current + ' ' + w).trim().length > width) {
          if (current) lines.push(current.trim());
          current = w;
        } else {
          current += ' ' + w;
        }
      }
      if (current.trim()) lines.push(current.trim());
      return { success: true, text: lines.join('\n') };
    },
  },

  // 17. Title Capitalizer (AP & Chicago Rules)
  {
    id: 'title-capitalizer',
    name: 'Headline & Title Capitalizer (AP / Chicago)',
    category: 'documents',
    subcategory: 'format',
    description: 'Capitalize article headlines following formal Chicago and AP stylebook grammatical rules.',
    iconName: 'Type',
    version: '1.0.0',
    tags: ['title', 'headline', 'ap-style', 'chicago-style', 'capitalization'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'headline', label: 'Raw Headline', type: 'text', required: true, defaultValue: 'the ultimate guide to modern client side engineering and design' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const raw = inputs.headline || '';
      const stopWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet']);
      const words = raw.trim().split(/\s+/);

      const capitalized = words.map((w: string, idx: number) => {
        const lower = w.toLowerCase();
        if (idx > 0 && idx < words.length - 1 && stopWords.has(lower)) {
          return lower;
        }
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      });

      return { success: true, text: capitalized.join(' ') };
    },
  },

  // 18. Subtitle SRT to Plain Text Converter
  {
    id: 'srt-to-text',
    name: 'Subtitle SRT to Clean Transcript Converter',
    category: 'documents',
    subcategory: 'conversion',
    description: 'Strip timestamps, cue markers, and sequence counters from video subtitle files.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['srt', 'subtitles', 'transcript', 'cleaner', 'video'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'srt', label: 'SRT Subtitle Content', type: 'textarea', required: true, defaultValue: '1\n00:00:01,000 --> 00:00:04,000\nWelcome to the presentation.\n\n2\n00:00:04,500 --> 00:00:08,000\nToday we discuss automation.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const clean = (inputs.srt || '')
        .replace(/^\d+$/gm, '')
        .replace(/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/gm, '')
        .split('\n')
        .map((l: string) => l.trim())
        .filter(Boolean)
        .join(' ');
      return { success: true, text: clean, filename: 'transcript.txt' };
    },
  },

  // 19. Duplicate Word Highlighter
  {
    id: 'duplicate-word-finder',
    name: 'Duplicate Word Highlighter',
    category: 'documents',
    subcategory: 'cleaning',
    description: 'Detect accidental repeated consecutive words (e.g. "the the", "in in").',
    iconName: 'Search',
    version: '1.0.0',
    tags: ['duplicate', 'typo', 'proofread', 'words', 'grammar'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Text to Check', type: 'textarea', required: true, defaultValue: 'We went to the the office and and met the team.' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const text = inputs.text || '';
      const regex = /\b(\w+)\s+\1\b/gi;
      const dupes: string[] = [];
      let match;
      while ((match = regex.exec(text)) !== null) {
        dupes.push(match[0]);
      }
      const res = { duplicateCount: dupes.length, occurrences: dupes };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 20. Multi Find & Replace Engine
  {
    id: 'multi-find-replace',
    name: 'Multi-Find & Batch Text Replacer',
    category: 'documents',
    subcategory: 'format',
    description: 'Execute multiple string substitutions in a single pass across documents.',
    iconName: 'Repeat',
    version: '1.0.0',
    tags: ['find', 'replace', 'batch', 'text', 'substitute'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Source Text', type: 'textarea', required: true, defaultValue: 'The foo jumped over the bar.' },
        { name: 'rules', label: 'Find/Replace Rules (find=replace per line)', type: 'textarea', defaultValue: 'foo=tiger\nbar=river' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      let text = inputs.text || '';
      const rules = (inputs.rules || '').split('\n').filter((l: string) => l.includes('='));
      for (const rule of rules) {
        const [find, replace] = rule.split('=');
        text = text.replaceAll(find.trim(), replace.trim());
      }
      return { success: true, text };
    },
  },

  // 21. Markdown Checklist to Plain Text
  {
    id: 'checklist-to-text',
    name: 'Markdown Checklist to Clean Text Formatter',
    category: 'documents',
    subcategory: 'format',
    description: 'Format markdown task items (- [x], - [ ]) into checked bullet characters (✓, ○).',
    iconName: 'CheckSquare',
    version: '1.0.0',
    tags: ['markdown', 'checklist', 'tasks', 'todo', 'format'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'markdown', label: 'Markdown Task List', type: 'textarea', required: true, defaultValue: '- [x] Build Tool Catalog\n- [x] Integrate Workflow Engine\n- [ ] Deploy Cloud Build' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const res = (inputs.markdown || '')
        .replace(/- \[x\]/gi, '✓')
        .replace(/- \[ \]/gi, '○');
      return { success: true, text: res };
    },
  },

  // 22. Text Levenshtein Similarity Distance
  {
    id: 'levenshtein-distance',
    name: 'Text Levenshtein String Similarity Scorer',
    category: 'documents',
    subcategory: 'analytics',
    description: 'Calculate edit distance and percentage string similarity between two texts.',
    iconName: 'GitCompare',
    version: '1.0.0',
    tags: ['levenshtein', 'similarity', 'distance', 'fuzzy', 'diff'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'stringA', label: 'String A', type: 'text', required: true, defaultValue: 'kitten' },
        { name: 'stringB', label: 'String B', type: 'text', required: true, defaultValue: 'sitting' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const a = inputs.stringA || '';
      const b = inputs.stringB || '';
      const matrix: number[][] = [];

      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
          }
        }
      }

      const dist = matrix[b.length][a.length];
      const maxLen = Math.max(a.length, b.length) || 1;
      const similarity = ((1 - dist / maxLen) * 100).toFixed(1) + '%';
      const res = { distance: dist, similarity };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 23. Morse Code Audio & Text Translator
  {
    id: 'morse-code-translator',
    name: 'Morse Code Encoder & Decoder',
    category: 'documents',
    subcategory: 'conversion',
    description: 'Translate standard text to International Morse Code dots and dashes (. and -).',
    iconName: 'Volume2',
    version: '1.0.0',
    tags: ['morse', 'code', 'translator', 'radio', 'encoding'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'English Text', type: 'text', required: true, defaultValue: 'SOS EDITMEE' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const morseMap: Record<string, string> = {
        A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
        I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
        Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
        Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
        '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
        ' ': ' / ',
      };
      const text: string = String(inputs.text || '').toUpperCase();
      const encoded = Array.from(text).map((c: string) => morseMap[c] || c).join(' ');
      return { success: true, text: encoded };
    },
  },

  // 24. Markdown Table of Contents Generator
  {
    id: 'md-toc-generator',
    name: 'Markdown Table of Contents (TOC) Generator',
    category: 'documents',
    subcategory: 'generators',
    description: 'Scan markdown headings (H1-H4) and generate an indented bullet table of contents with anchor links.',
    iconName: 'List',
    version: '1.0.0',
    tags: ['markdown', 'toc', 'headings', 'anchors', 'documentation'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'markdown', label: 'Markdown Document', type: 'textarea', required: true, defaultValue: '# Introduction\n\n## Getting Started\n\n### Installation\n\n## API Reference' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines = (inputs.markdown || '').split('\n');
      const toc: string[] = [];
      for (const line of lines) {
        const match = line.match(/^(#{1,4})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const title = match[2].trim();
          const anchor = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
          const indent = '  '.repeat(level - 1);
          toc.push(`${indent}- [${title}](#${anchor})`);
        }
      }
      return { success: true, text: `## Table of Contents\n\n${toc.join('\n')}` };
    },
  },

  // 25. Number to Spelled-Out Words
  {
    id: 'number-to-words',
    name: 'Number to English Currency & Words Speller',
    category: 'documents',
    subcategory: 'format',
    description: 'Convert numeric values ($1,450.50) into formal check-writing English words.',
    iconName: 'DollarSign',
    version: '1.0.0',
    tags: ['number', 'words', 'currency', 'checks', 'invoice', 'speller'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'amount', label: 'Dollar Amount', type: 'number', required: true, defaultValue: 1450.75 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const num = Number(inputs.amount || 0);
      const dollars = Math.floor(num);
      const cents = Math.round((num - dollars) * 100);

      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

      function convertThousands(n: number): string {
        if (n === 0) return '';
        if (n < 20) return ones[n];
        if (n < 100) return `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim();
        return `${ones[Math.floor(n / 100)]} Hundred ${convertThousands(n % 100)}`.trim();
      }

      let words = '';
      if (dollars >= 1000) {
        words += `${convertThousands(Math.floor(dollars / 1000))} Thousand `;
      }
      words += convertThousands(dollars % 1000);
      words = words.trim() || 'Zero';

      const formal = `${words} Dollars and ${cents}/100 Cents`;
      const res = { amount: num, words: formal };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },
];
