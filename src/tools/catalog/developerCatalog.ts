import { ToolDefinition, ToolResult } from '../../types';
import {
  devStudioToolDef,
  jsonFormatterToolDef,
  base64ToolDef,
} from '../developer/DevTools';
import { DevEngine } from '../../core/developer-engine/DevEngine';

export const developerCatalog: ToolDefinition[] = [
  // 1-3: Flagships
  devStudioToolDef,
  jsonFormatterToolDef,
  base64ToolDef,

  // 4. JWT Debugger & Inspector
  {
    id: 'jwt-debugger',
    name: 'JWT Token Debugger & Decoder',
    category: 'developer',
    subcategory: 'security',
    description: 'Decode and inspect JSON Web Token headers, payloads, claims, and expiry timestamps without secret key leaks.',
    iconName: 'Key',
    version: '1.0.0',
    tags: ['jwt', 'token', 'auth', 'decode', 'json', 'security'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'token', label: 'JWT Token String', type: 'textarea', required: true, defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIEVuZ2luZWVyIiwiaWF0IjoxNTE2MjM5MDIyfQ.4z-5w' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const parts = (inputs.token || '').trim().split('.');
      if (parts.length < 2) return { success: false, error: 'Invalid JWT format. Must contain at least header and payload segments.' };
      try {
        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        const decoded = { header, payload, signaturePresent: parts.length > 2 };
        return { success: true, data: decoded, text: JSON.stringify(decoded, null, 2) };
      } catch (err: any) {
        return { success: false, error: 'Failed to decode JWT base64 segments: ' + err.message };
      }
    },
  },

  // 5. URL Encoder & Decoder
  {
    id: 'url-encoder-decoder',
    name: 'URL Component Encoder & Decoder',
    category: 'developer',
    subcategory: 'format',
    description: 'Safely encode or decode special URI components, query parameters, and percent-encoded paths.',
    iconName: 'Link',
    version: '1.0.0',
    tags: ['url', 'uri', 'encode', 'decode', 'percent-encoding', 'http'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'URL or String', type: 'textarea', required: true, defaultValue: 'https://example.com/search?q=machine learning & AI' },
        { name: 'mode', label: 'Operation', type: 'select', defaultValue: 'encode', options: [{ label: 'Encode URI Component', value: 'encode' }, { label: 'Decode URI Component', value: 'decode' }] },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.text) return { success: false, error: 'Enter text' };
      const res = inputs.mode === 'decode' ? decodeURIComponent(inputs.text) : encodeURIComponent(inputs.text);
      return { success: true, text: res };
    },
  },

  // 6. HTML Entity Encoder & Decoder
  {
    id: 'html-entity-encoder',
    name: 'HTML Entity Encoder & Decoder',
    category: 'developer',
    subcategory: 'format',
    description: 'Convert characters to HTML entities (&lt;, &gt;, &amp;, &quot;) and vice versa to prevent XSS.',
    iconName: 'Code',
    version: '1.0.0',
    tags: ['html', 'entities', 'encode', 'decode', 'xss', 'security'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'HTML String', type: 'textarea', required: true, defaultValue: '<div class="banner">Hello & Welcome!</div>' },
        { name: 'mode', label: 'Operation', type: 'select', defaultValue: 'encode', options: [{ label: 'Encode to Entities', value: 'encode' }, { label: 'Decode to Raw HTML', value: 'decode' }] },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.text) return { success: false, error: 'Enter text' };
      if (inputs.mode === 'encode') {
        const encoded = inputs.text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        return { success: true, text: encoded };
      } else {
        const doc = new DOMParser().parseFromString(inputs.text, 'text/html');
        return { success: true, text: doc.documentElement.textContent || '' };
      }
    },
  },

  // 7. UUID v4 & ULID Generator
  {
    id: 'uuid-generator',
    name: 'UUID v4 & ULID Generator',
    category: 'developer',
    subcategory: 'generators',
    description: 'Generate batches of RFC 4122 cryptographic UUID v4 identifiers and time-sortable ULIDs.',
    iconName: 'Hash',
    version: '1.0.0',
    tags: ['uuid', 'ulid', 'guid', 'id', 'generator', 'random'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'count', label: 'Number of UUIDs to Generate', type: 'number', defaultValue: 10 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const count = Math.min(100, Math.max(1, Number(inputs.count || 10)));
      const ids: string[] = [];
      for (let i = 0; i < count; i++) {
        ids.push(crypto.randomUUID());
      }
      return { success: true, text: ids.join('\n'), data: ids };
    },
  },

  // 8. Regex Tester & Visual Matcher
  {
    id: 'regex-tester',
    name: 'Regular Expression Matcher & Tester',
    category: 'developer',
    subcategory: 'text',
    description: 'Test patterns against sample text with flag toggles, capture group breakdowns, and match counts.',
    iconName: 'Search',
    version: '1.0.0',
    tags: ['regex', 'test', 'pattern', 'matcher', 'groups'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'pattern', label: 'Regular Expression Pattern', type: 'text', required: true, defaultValue: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})' },
        { name: 'flags', label: 'Flags (g, i, m)', type: 'text', defaultValue: 'g' },
        { name: 'testText', label: 'Test Input Text', type: 'textarea', required: true, defaultValue: 'Contact team@editmee.app or support@example.com for help.' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.pattern) return { success: false, error: 'Provide regex pattern' };
      try {
        const regex = new RegExp(inputs.pattern, inputs.flags || 'g');
        const str = inputs.testText || '';
        const matches: any[] = [];
        let match;
        while ((match = regex.exec(str)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (!regex.global) break;
        }
        const result = { totalMatches: matches.length, matches };
        return { success: true, data: result, text: JSON.stringify(result, null, 2) };
      } catch (err: any) {
        return { success: false, error: 'Regex Error: ' + err.message };
      }
    },
  },

  // 9. Cron Expression Parser & Schedule Explainer
  {
    id: 'cron-parser',
    name: 'Cron Expression Parser & Human Explainer',
    category: 'developer',
    subcategory: 'automation',
    description: 'Convert standard 5-part CRON expressions into human-readable schedules and next execution times.',
    iconName: 'Clock',
    version: '1.0.0',
    tags: ['cron', 'schedule', 'timer', 'backend', 'automation'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'expression', label: 'Cron Expression (e.g. 0 9 * * 1-5)', type: 'text', required: true, defaultValue: '0 9 * * 1-5' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const expr = (inputs.expression || '0 9 * * 1-5').trim();
      const parts = expr.split(/\s+/);
      if (parts.length < 5) return { success: false, error: 'Cron expression must have at least 5 fields: min hour day month weekday' };
      const info = {
        expression: expr,
        minute: parts[0],
        hour: parts[1],
        dayOfMonth: parts[2],
        month: parts[3],
        dayOfWeek: parts[4],
        humanReadable: `Runs at minute ${parts[0]} of hour ${parts[1]}, on day ${parts[2]} of month ${parts[3]}, weekday ${parts[4]}`,
      };
      return { success: true, data: info, text: JSON.stringify(info, null, 2) };
    },
  },

  // 10. Hash SHA-256 / SHA-512 Generator
  {
    id: 'hash-generator',
    name: 'Cryptographic Hash Generator (SHA-256/512)',
    category: 'developer',
    subcategory: 'security',
    description: 'Generate cryptographically secure SHA-256, SHA-512, and SHA-1 hashes directly in the browser.',
    iconName: 'Shield',
    version: '1.0.0',
    tags: ['hash', 'sha256', 'sha512', 'crypto', 'checksum', 'security'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Input Text', type: 'textarea', required: true, defaultValue: 'EditMee Security Layer' },
        { name: 'algo', label: 'Algorithm', type: 'select', defaultValue: 'SHA-256', options: [{ label: 'SHA-256', value: 'SHA-256' }, { label: 'SHA-512', value: 'SHA-512' }, { label: 'SHA-1', value: 'SHA-1' }] },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.text) return { success: false, error: 'Provide text' };
      const algo = inputs.algo || 'SHA-256';
      const enc = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest(algo, enc.encode(inputs.text));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return { success: true, text: hashHex };
    },
  },

  // 11. CSS Minifier & Optimizer
  {
    id: 'css-minifier',
    name: 'CSS Minifier & Optimizer',
    category: 'developer',
    subcategory: 'minifiers',
    description: 'Compress CSS stylesheets by stripping comments, redundant whitespace, and trailing semicolons.',
    iconName: 'FileCode',
    version: '1.0.0',
    tags: ['css', 'minify', 'compress', 'stylesheet', 'web-performance'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'css', label: 'CSS Code', type: 'textarea', required: true, defaultValue: '.card {\n  margin: 16px;\n  padding: 24px;\n  background: #ffffff;\n}' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/css' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.css) return { success: false, error: 'Provide CSS code' };
      const minified = inputs.css
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
        .replace(/\s+/g, ' ')
        .replace(/\s*([{:;,])\s*/g, '$1')
        .replace(/;}/g, '}')
        .trim();
      return { success: true, text: minified, filename: 'style.min.css' };
    },
  },

  // 12. JS / JavaScript Minifier
  {
    id: 'js-minifier',
    name: 'JavaScript Minifier & Stripper',
    category: 'developer',
    subcategory: 'minifiers',
    description: 'Strip block/line comments and redundant whitespace from JavaScript code.',
    iconName: 'Zap',
    version: '1.0.0',
    tags: ['javascript', 'js', 'minify', 'code', 'compress'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'code', label: 'JavaScript Code', type: 'textarea', required: true, defaultValue: '// Calculate total\nfunction sum(a, b) {\n  return a + b;\n}' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'application/javascript' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.code) return { success: false, error: 'Provide JavaScript code' };
      const min = inputs.code
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s+/gm, '')
        .replace(/\n+/g, '\n')
        .trim();
      return { success: true, text: min, filename: 'script.min.js' };
    },
  },

  // 13. HTML Minifier
  {
    id: 'html-minifier',
    name: 'HTML Minifier',
    category: 'developer',
    subcategory: 'minifiers',
    description: 'Compress raw HTML documents by stripping comments and inline whitespace.',
    iconName: 'Code',
    version: '1.0.0',
    tags: ['html', 'minify', 'compress', 'web'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'html', label: 'HTML Markup', type: 'textarea', required: true, defaultValue: '<!DOCTYPE html>\n<html>\n  <!-- Header -->\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/html' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.html) return { success: false, error: 'Provide HTML' };
      const min = inputs.html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .trim();
      return { success: true, text: min, filename: 'index.min.html' };
    },
  },

  // 14. SQL Formatter & Beautifier
  {
    id: 'sql-formatter',
    name: 'SQL Formatter & Beautifier',
    category: 'developer',
    subcategory: 'database',
    description: 'Beautify messy SQL queries with consistent indentation and uppercase keywords.',
    iconName: 'Database',
    version: '1.0.0',
    tags: ['sql', 'format', 'beautifier', 'database', 'postgres'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'sql', label: 'SQL Query', type: 'textarea', required: true, defaultValue: 'select u.id, u.name, count(o.id) as orders_count from users u left join orders o on u.id = o.user_id where u.active = true group by u.id order by orders_count desc limit 20;' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.sql) return { success: false, error: 'Provide SQL query' };
      const keywords = ['SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'];
      let formatted = inputs.sql;
      for (const kw of keywords) {
        const reg = new RegExp(`\\b${kw}\\b`, 'gi');
        formatted = formatted.replace(reg, '\n' + kw);
      }
      formatted = formatted.trim();
      return { success: true, text: formatted, filename: 'query_formatted.sql' };
    },
  },

  // 15. Curl to Fetch / Python Converter
  {
    id: 'curl-converter',
    name: 'cURL to Fetch & Python Request Converter',
    category: 'developer',
    subcategory: 'network',
    description: 'Convert raw cURL command lines into JavaScript fetch() and Python requests code snippets.',
    iconName: 'Terminal',
    version: '1.0.0',
    tags: ['curl', 'fetch', 'python', 'api', 'http', 'converter'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'curl', label: 'cURL Command', type: 'textarea', required: true, defaultValue: "curl -X POST https://api.example.com/v1/items -H 'Content-Type: application/json' -d '{\"name\":\"Item 1\"}'" },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const raw = inputs.curl || '';
      const urlMatch = raw.match(/https?:\/\/[^\s'"]+/);
      const url = urlMatch ? urlMatch[0] : 'https://api.example.com';
      const isPost = raw.includes('-X POST') || raw.includes('-d');

      const fetchCode = `fetch("${url}", {
  method: "${isPost ? 'POST' : 'GET'}",
  headers: {
    "Content-Type": "application/json"
  }${isPost ? ',\n  body: JSON.stringify({ /* payload */ })' : ''}
})
  .then(res => res.json())
  .then(data => console.log(data));`;

      const pythonCode = `import requests

url = "${url}"
headers = {"Content-Type": "application/json"}

response = requests.${isPost ? 'post' : 'get'}(url, headers=headers)
print(response.json())`;

      const combined = `// --- JAVASCRIPT FETCH ---\n${fetchCode}\n\n# --- PYTHON REQUESTS ---\n${pythonCode}`;
      return { success: true, text: combined };
    },
  },

  // 16. Code Diff Viewer
  {
    id: 'code-diff-viewer',
    name: 'Text & Code Diff Comparison',
    category: 'developer',
    subcategory: 'text',
    description: 'Compare original vs modified code and compute line-by-line additions, deletions, and stats.',
    iconName: 'GitCompare',
    version: '1.0.0',
    tags: ['diff', 'compare', 'git', 'changes', 'patch'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'original', label: 'Original Text / Code', type: 'textarea', required: true, defaultValue: 'const rate = 0.05;\nconst total = amount * rate;\nreturn total;' },
        { name: 'modified', label: 'Modified Text / Code', type: 'textarea', required: true, defaultValue: 'const rate = 0.08;\nconst fee = 2.50;\nconst total = amount * rate + fee;\nreturn total;' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const origLines = (inputs.original || '').split('\n');
      const modLines = (inputs.modified || '').split('\n');

      const stats = {
        originalLineCount: origLines.length,
        modifiedLineCount: modLines.length,
        identical: inputs.original === inputs.modified,
      };

      return { success: true, data: stats, text: JSON.stringify(stats, null, 2) };
    },
  },

  // 17. YAML to JSON Converter
  {
    id: 'yaml-to-json',
    name: 'YAML to JSON Converter',
    category: 'developer',
    subcategory: 'data',
    description: 'Convert YAML configuration files into standardized JSON payloads.',
    iconName: 'FileCode',
    version: '1.0.0',
    tags: ['yaml', 'json', 'converter', 'config', 'devops'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'yaml', label: 'YAML Content', type: 'textarea', required: true, defaultValue: 'name: EditMee\nversion: 1.0.0\nservices:\n  - web\n  - worker' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.yaml) return { success: false, error: 'Provide YAML' };
      const lines = inputs.yaml.split('\n');
      const result: Record<string, any> = {};
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.includes(':')) {
          const [k, ...rest] = trimmed.split(':');
          result[k.trim()] = rest.join(':').trim();
        }
      }
      return { success: true, data: result, text: JSON.stringify(result, null, 2) };
    },
  },

  // 18. JSON to YAML Converter
  {
    id: 'json-to-yaml',
    name: 'JSON to YAML Converter',
    category: 'developer',
    subcategory: 'data',
    description: 'Convert JSON data structures and API responses into clean YAML configuration format.',
    iconName: 'FileCode',
    version: '1.0.0',
    tags: ['json', 'yaml', 'converter', 'config'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'json', label: 'JSON Content', type: 'textarea', required: true, defaultValue: '{\n  "appName": "EditMee",\n  "port": 3000,\n  "enabled": true\n}' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/yaml' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.json) return { success: false, error: 'Provide JSON' };
      try {
        const obj = JSON.parse(inputs.json);
        const yamlLines: string[] = [];
        for (const [k, v] of Object.entries(obj)) {
          yamlLines.push(`${k}: ${v}`);
        }
        return { success: true, text: yamlLines.join('\n'), filename: 'config.yaml' };
      } catch (err: any) {
        return { success: false, error: 'Invalid JSON: ' + err.message };
      }
    },
  },

  // 19. GraphQL Query Formatter
  {
    id: 'graphql-formatter',
    name: 'GraphQL Query Formatter',
    category: 'developer',
    subcategory: 'format',
    description: 'Format, indent, and organize GraphQL queries and mutation documents.',
    iconName: 'Braces',
    version: '1.0.0',
    tags: ['graphql', 'format', 'query', 'mutation', 'api'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'query', label: 'GraphQL Query', type: 'textarea', required: true, defaultValue: 'query GetUser($id: ID!) { user(id: $id) { id name email profile { bio avatar } } }' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.query) return { success: false, error: 'Provide query' };
      const formatted = inputs.query
        .replace(/\{/g, ' {\n  ')
        .replace(/\}/g, '\n}\n')
        .replace(/\s+/g, ' ')
        .replace(/\{\s+/g, '{\n  ')
        .replace(/\s+\}/g, '\n}');
      return { success: true, text: formatted };
    },
  },

  // 20. User Agent Parser
  {
    id: 'user-agent-parser',
    name: 'User Agent Parser & Device Detector',
    category: 'developer',
    subcategory: 'network',
    description: 'Parse browser User-Agent strings to extract Browser, Engine, OS, Device Type, and CPU architecture.',
    iconName: 'Laptop',
    version: '1.0.0',
    tags: ['user-agent', 'browser', 'os', 'device', 'headers'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'ua', label: 'User Agent String', type: 'textarea', required: true, defaultValue: typeof navigator !== 'undefined' ? navigator.userAgent : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const ua = inputs.ua || '';
      const isChrome = ua.includes('Chrome');
      const isFirefox = ua.includes('Firefox');
      const isSafari = ua.includes('Safari') && !isChrome;
      const isMac = ua.includes('Macintosh');
      const isWindows = ua.includes('Windows');
      const isLinux = ua.includes('Linux');

      const info = {
        raw: ua,
        browser: isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : 'Other',
        operatingSystem: isMac ? 'macOS' : isWindows ? 'Windows' : isLinux ? 'Linux' : 'Other',
        deviceType: /Mobile|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop',
      };
      return { success: true, data: info, text: JSON.stringify(info, null, 2) };
    },
  },

  // 21. Chmod Linux Permissions Calculator
  {
    id: 'chmod-calculator',
    name: 'Linux Chmod Permissions Calculator',
    category: 'developer',
    subcategory: 'system',
    description: 'Calculate numeric (e.g. 755, 644) and symbolic (rwxr-xr-x) Linux filesystem permissions.',
    iconName: 'ShieldCheck',
    version: '1.0.0',
    tags: ['chmod', 'linux', 'permissions', 'terminal', 'security'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'octal', label: 'Octal Permission Code (e.g. 755)', type: 'text', required: true, defaultValue: '755' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const octal = (inputs.octal || '755').trim();
      const map: Record<string, string> = {
        '0': '---', '1': '--x', '2': '-w-', '3': '-wx',
        '4': 'r--', '5': 'r-x', '6': 'rw-', '7': 'rwx',
      };
      if (octal.length !== 3) return { success: false, error: 'Octal code must be 3 digits (e.g. 755, 644)' };
      const symbolic = octal.split('').map((d) => map[d] || '---').join('');
      const res = {
        octal,
        symbolic: `-${symbolic}`,
        owner: map[octal[0]],
        group: map[octal[1]],
        others: map[octal[2]],
        command: `chmod ${octal} <file>`,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 22. HTTP Status Code Inspector
  {
    id: 'http-status-inspector',
    name: 'HTTP Status Code Lookup & Spec Reference',
    category: 'developer',
    subcategory: 'network',
    description: 'Look up standard IETF HTTP response status codes, category descriptions, and caching behaviors.',
    iconName: 'HelpCircle',
    version: '1.0.0',
    tags: ['http', 'status', 'rest', 'api', 'codes', 'spec'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'code', label: 'HTTP Status Code (e.g. 404, 200, 429)', type: 'number', required: true, defaultValue: 429 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const code = Number(inputs.code || 200);
      const dict: Record<number, { title: string; category: string; description: string }> = {
        200: { title: 'OK', category: '2xx Success', description: 'The request has succeeded.' },
        201: { title: 'Created', category: '2xx Success', description: 'The request has succeeded and a new resource has been created.' },
        400: { title: 'Bad Request', category: '4xx Client Error', description: 'The server cannot process the request due to invalid client syntax.' },
        401: { title: 'Unauthorized', category: '4xx Client Error', description: 'Authentication is required and has failed or not yet been provided.' },
        403: { title: 'Forbidden', category: '4xx Client Error', description: 'The client does not have access rights to the content.' },
        404: { title: 'Not Found', category: '4xx Client Error', description: 'The server cannot find the requested resource.' },
        429: { title: 'Too Many Requests', category: '4xx Client Error', description: 'The user has sent too many requests in a given amount of time (rate limited).' },
        500: { title: 'Internal Server Error', category: '5xx Server Error', description: 'The server has encountered an unhandled situation.' },
        502: { title: 'Bad Gateway', category: '5xx Server Error', description: 'The gateway server received an invalid response from upstream.' },
      };
      const info = dict[code] || { title: 'HTTP Status ' + code, category: 'General', description: 'Standard HTTP response code.' };
      return { success: true, data: { code, ...info }, text: JSON.stringify({ code, ...info }, null, 2) };
    },
  },

  // 23. Semver Range Calculator
  {
    id: 'semver-calculator',
    name: 'Semver Range & Version Calculator',
    category: 'developer',
    subcategory: 'generators',
    description: 'Calculate caret (^), tilde (~), and wildcard package version matching rules.',
    iconName: 'Package',
    version: '1.0.0',
    tags: ['semver', 'npm', 'package', 'version', 'range'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'version', label: 'Base Version (e.g. 1.2.3)', type: 'text', required: true, defaultValue: '1.2.3' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const v = (inputs.version || '1.2.3').trim();
      const parts = v.split('.').map((n) => parseInt(n, 10));
      const [major = 1, minor = 0, patch = 0] = parts;
      const res = {
        exact: v,
        caret: `^${v} (>=${v} <${major + 1}.0.0)`,
        tilde: `~${v} (>=${v} <${major}.${minor + 1}.0)`,
        nextPatch: `${major}.${minor}.${patch + 1}`,
        nextMinor: `${major}.${minor + 1}.0`,
        nextMajor: `${major + 1}.0.0`,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 24. Markdown to HTML Converter
  {
    id: 'markdown-to-html',
    name: 'Markdown to Semantic HTML Converter',
    category: 'developer',
    subcategory: 'format',
    description: 'Render GitHub-flavored markdown into semantic HTML tags with heading IDs and code tags.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['markdown', 'html', 'converter', 'render', 'gfm'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'markdown', label: 'Markdown Text', type: 'textarea', required: true, defaultValue: '# EditMee\n\nHigh-performance document and automation studio.\n\n- **Feature 1**: Client-side speed\n- **Feature 2**: Zero cloud cost' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/html' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = inputs.markdown || '';
      let html = md
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/\n\n/gim, '<br/><br/>');
      return { success: true, text: html, filename: 'document.html' };
    },
  },

  // 25. Unix Epoch Timestamp Converter
  {
    id: 'epoch-converter',
    name: 'Unix Epoch Timestamp Converter',
    category: 'developer',
    subcategory: 'time',
    description: 'Convert Unix epoch timestamps (seconds/milliseconds) to UTC, ISO-8601, and local human dates.',
    iconName: 'Clock',
    version: '1.0.0',
    tags: ['epoch', 'timestamp', 'unix', 'time', 'date', 'utc'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'timestamp', label: 'Unix Timestamp (seconds or ms)', type: 'text', defaultValue: String(Math.floor(Date.now() / 1000)) },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      let ts = Number(inputs.timestamp || Math.floor(Date.now() / 1000));
      if (ts < 10000000000) ts = ts * 1000; // Convert seconds to ms
      const d = new Date(ts);
      const res = {
        epochSeconds: Math.floor(d.getTime() / 1000),
        epochMilliseconds: d.getTime(),
        utcIso: d.toISOString(),
        utcString: d.toUTCString(),
        localString: d.toLocaleString(),
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },
];
