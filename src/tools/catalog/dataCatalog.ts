import { ToolDefinition, ToolResult } from '../../types';
import {
  csvStudioToolDef,
  csvToJsonToolDef,
  jsonToCsvToolDef,
} from '../data/DataTools';
import { DataEngine } from '../../core/data-engine/DataEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';

export const dataCatalog: ToolDefinition[] = [
  // 1-3: Flagships
  csvStudioToolDef,
  csvToJsonToolDef,
  jsonToCsvToolDef,

  // 4. TSV to CSV Converter
  {
    id: 'tsv-to-csv',
    name: 'TSV to CSV Tab-Delimited Converter',
    category: 'data',
    subcategory: 'conversion',
    description: 'Convert Tab-Separated Values (TSV) into comma-separated CSV with automatic escaping.',
    iconName: 'FileSpreadsheet',
    version: '1.0.0',
    tags: ['tsv', 'csv', 'converter', 'data', 'spreadsheet'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'tsv', label: 'TSV Data / Text', type: 'textarea', required: true, defaultValue: 'ID\tName\tScore\n1\tAlice\t98\n2\tBob\t85' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/csv' },
    execute: async (inputs): Promise<ToolResult> => {
      const tsv = inputs.tsv || '';
      const lines = tsv.split('\n').filter((l: string) => l.trim());
      const csvLines = lines.map((l: string) =>
        l.split('\t').map((cell: string) => `"${cell.replace(/"/g, '""')}"`).join(',')
      );
      return { success: true, text: csvLines.join('\n'), filename: 'converted.csv' };
    },
  },

  // 5. XML to JSON Converter
  {
    id: 'xml-to-json',
    name: 'XML to JSON Converter',
    category: 'data',
    subcategory: 'conversion',
    description: 'Parse XML tags and attributes into structured JSON objects and arrays.',
    iconName: 'FileCode',
    version: '1.0.0',
    tags: ['xml', 'json', 'converter', 'parser', 'api'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'xml', label: 'XML Content', type: 'textarea', required: true, defaultValue: '<catalog>\n  <book id="bk101">\n    <author>Gambardella, Matthew</author>\n    <title>XML Developer\'s Guide</title>\n    <price>44.95</price>\n  </book>\n</catalog>' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.xml) return { success: false, error: 'Provide XML' };
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(inputs.xml, 'text/xml');
        
        function xmlToObj(node: Node): any {
          const obj: any = {};
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            if (el.attributes.length > 0) {
              obj['@attributes'] = {};
              for (let j = 0; j < el.attributes.length; j++) {
                const attr = el.attributes.item(j);
                if (attr) obj['@attributes'][attr.nodeName] = attr.nodeValue;
              }
            }
          }
          if (node.hasChildNodes()) {
            for (let i = 0; i < node.childNodes.length; i++) {
              const item = node.childNodes.item(i);
              const nodeName = item.nodeName;
              if (item.nodeType === Node.TEXT_NODE) {
                const val = item.nodeValue?.trim();
                if (val) return val;
              } else if (item.nodeType === Node.ELEMENT_NODE) {
                if (typeof obj[nodeName] === 'undefined') {
                  obj[nodeName] = xmlToObj(item);
                } else {
                  if (!Array.isArray(obj[nodeName])) {
                    obj[nodeName] = [obj[nodeName]];
                  }
                  obj[nodeName].push(xmlToObj(item));
                }
              }
            }
          }
          return obj;
        }

        const json = xmlToObj(xmlDoc.documentElement);
        return { success: true, data: json, text: JSON.stringify(json, null, 2) };
      } catch (err: any) {
        return { success: false, error: 'XML Parse Error: ' + err.message };
      }
    },
  },

  // 6. JSON to XML Converter
  {
    id: 'json-to-xml',
    name: 'JSON to XML Converter',
    category: 'data',
    subcategory: 'conversion',
    description: 'Transform hierarchical JSON data models into valid structured XML documents.',
    iconName: 'FileCode',
    version: '1.0.0',
    tags: ['json', 'xml', 'converter', 'export', 'data'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'json', label: 'JSON Content', type: 'textarea', required: true, defaultValue: '{\n  "company": "EditMee",\n  "version": "1.0",\n  "active": true\n}' },
        { name: 'rootTag', label: 'Root XML Tag', type: 'text', defaultValue: 'root' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'application/xml' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.json) return { success: false, error: 'Provide JSON' };
      try {
        const obj = JSON.parse(inputs.json);
        function toXml(o: any, tag: string): string {
          if (typeof o !== 'object' || o === null) return `<${tag}>${o}</${tag}>`;
          let inner = '';
          for (const [k, v] of Object.entries(o)) {
            inner += Array.isArray(v) ? v.map((item) => toXml(item, k)).join('') : toXml(v, k);
          }
          return `<${tag}>\n  ${inner}\n</${tag}>`;
        }
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(obj, inputs.rootTag || 'root')}`;
        return { success: true, text: xml, filename: 'data.xml' };
      } catch (err: any) {
        return { success: false, error: 'Invalid JSON: ' + err.message };
      }
    },
  },

  // 7. Markdown Table to JSON Converter
  {
    id: 'md-table-to-json',
    name: 'Markdown Table to JSON Converter',
    category: 'data',
    subcategory: 'conversion',
    description: 'Convert GitHub Markdown tables into arrays of structured JSON objects.',
    iconName: 'Table',
    version: '1.0.0',
    tags: ['markdown', 'table', 'json', 'data', 'converter'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'mdTable', label: 'Markdown Table', type: 'textarea', required: true, defaultValue: '| ID | Name | Role |\n|---|---|---|\n| 1 | Sarah | Tech Lead |\n| 2 | Alex | Designer |' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const raw = inputs.mdTable || '';
      const lines = raw.split('\n').filter((l: string) => l.trim().startsWith('|'));
      if (lines.length < 2) return { success: false, error: 'Markdown table must have at least header and row' };

      const headers = lines[0].split('|').map((c: string) => c.trim()).filter(Boolean);
      const dataRows = lines.slice(2); // Skip separator

      const json = dataRows.map((r: string) => {
        const cells = r.split('|').map((c: string) => c.trim()).filter(Boolean);
        const rowObj: Record<string, string> = {};
        headers.forEach((h: string, idx: number) => {
          rowObj[h] = cells[idx] || '';
        });
        return rowObj;
      });

      return { success: true, data: json, text: JSON.stringify(json, null, 2) };
    },
  },

  // 8. CSV / Data Deduplicator
  {
    id: 'csv-deduplicator',
    name: 'CSV Row Deduplicator',
    category: 'data',
    subcategory: 'cleaning',
    description: 'Find and purge duplicate records from CSV or tabular text while preserving header integrity.',
    iconName: 'Copy',
    version: '1.0.0',
    tags: ['csv', 'deduplicate', 'unique', 'clean', 'data'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'csv', label: 'CSV Content', type: 'textarea', required: true, defaultValue: 'ID,Name,Email\n1,Alice,alice@example.com\n2,Bob,bob@example.com\n1,Alice,alice@example.com' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/csv' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines = (inputs.csv || '').split('\n').filter((l: string) => l.trim());
      if (lines.length === 0) return { success: false, error: 'Provide CSV data' };
      const header = lines[0];
      const uniqueRows = Array.from(new Set(lines.slice(1)));
      const result = [header, ...uniqueRows].join('\n');
      return { success: true, text: result, filename: 'deduplicated.csv' };
    },
  },

  // 9. CSV Column Sorter & Filter
  {
    id: 'csv-column-filter',
    name: 'CSV Column Extractor & Sorter',
    category: 'data',
    subcategory: 'cleaning',
    description: 'Keep only specified column headers and order rows alphabetically or numerically.',
    iconName: 'Filter',
    version: '1.0.0',
    tags: ['csv', 'filter', 'columns', 'sort', 'data'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'csv', label: 'CSV Content', type: 'textarea', required: true, defaultValue: 'Name,Age,Country,Score\nAlice,29,USA,95\nBob,34,UK,82\nCharlie,23,Canada,91' },
        { name: 'keepColumns', label: 'Columns to Keep (comma separated)', type: 'text', defaultValue: 'Name,Score' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/csv' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines = (inputs.csv || '').split('\n').filter((l: string) => l.trim());
      if (lines.length < 2) return { success: false, error: 'Provide valid CSV' };
      const headers = lines[0].split(',').map((h: string) => h.trim());
      const targets = (inputs.keepColumns || 'Name,Score').split(',').map((t: string) => t.trim());
      const indices = targets.map((t: string) => headers.indexOf(t)).filter((idx: number) => idx >= 0);

      const filtered = lines.map((line: string) => {
        const cells = line.split(',');
        return indices.map((idx: number) => cells[idx] || '').join(',');
      });

      return { success: true, text: filtered.join('\n'), filename: 'filtered.csv' };
    },
  },

  // 10. Random Mock Data Generator
  {
    id: 'mock-data-generator',
    name: 'Mock Synthetic Data Generator (JSON/CSV)',
    category: 'data',
    subcategory: 'generators',
    description: 'Generate realistic synthetic datasets with names, emails, addresses, numbers, and UUIDs.',
    iconName: 'Sparkles',
    version: '1.0.0',
    tags: ['mock', 'data', 'synthetic', 'generator', 'testing', 'faker'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'rows', label: 'Number of Rows', type: 'number', defaultValue: 10 },
        { name: 'format', label: 'Output Format', type: 'select', defaultValue: 'json', options: [{ label: 'JSON Array', value: 'json' }, { label: 'CSV File', value: 'csv' }] },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const count = Math.min(100, Math.max(1, Number(inputs.rows || 10)));
      const firstNames = ['James', 'Emma', 'Oliver', 'Sophia', 'Liam', 'Ava', 'Noah', 'Isabella'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis'];
      const cities = ['New York', 'London', 'Tokyo', 'San Francisco', 'Berlin', 'Toronto'];

      const records = [];
      for (let i = 1; i <= count; i++) {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        records.push({
          id: i,
          uuid: crypto.randomUUID(),
          name: `${fn} ${ln}`,
          email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
          city: cities[Math.floor(Math.random() * cities.length)],
          score: Math.floor(Math.random() * 100) + 1,
          active: Math.random() > 0.3,
        });
      }

      if (inputs.format === 'csv') {
        const header = 'id,uuid,name,email,city,score,active';
        const csvLines = records.map((r) => `${r.id},${r.uuid},"${r.name}",${r.email},${r.city},${r.score},${r.active}`);
        const csvText = [header, ...csvLines].join('\n');
        return { success: true, text: csvText, filename: 'mock_data.csv' };
      }

      return { success: true, data: records, text: JSON.stringify(records, null, 2), filename: 'mock_data.json' };
    },
  },

  // 11. JSON Schema Validator
  {
    id: 'json-schema-validator',
    name: 'JSON Schema Structure Validator',
    category: 'data',
    subcategory: 'validation',
    description: 'Verify JSON objects against expected required keys and primitive data types.',
    iconName: 'CheckCircle2',
    version: '1.0.0',
    tags: ['json', 'schema', 'validation', 'api', 'types'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'json', label: 'JSON Data', type: 'textarea', required: true, defaultValue: '{\n  "name": "Alex",\n  "age": 28,\n  "email": "alex@test.com"\n}' },
        { name: 'requiredKeys', label: 'Required Keys (comma separated)', type: 'text', defaultValue: 'name,email' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      try {
        const obj = JSON.parse(inputs.json || '{}');
        const required = (inputs.requiredKeys || '').split(',').map((k: string) => k.trim()).filter(Boolean);
        const missing = required.filter((k: string) => !(k in obj));
        const result = {
          valid: missing.length === 0,
          missingKeys: missing,
          detectedKeys: Object.keys(obj),
        };
        return { success: true, data: result, text: JSON.stringify(result, null, 2) };
      } catch (err: any) {
        return { success: false, error: 'Invalid JSON: ' + err.message };
      }
    },
  },

  // 12. CSV Descriptive Statistics Calculator
  {
    id: 'csv-statistics',
    name: 'CSV Numerical Statistics Calculator',
    category: 'data',
    subcategory: 'analytics',
    description: 'Calculate mean, median, min, max, sum, variance, and standard deviation for numeric CSV columns.',
    iconName: 'BarChart',
    version: '1.0.0',
    tags: ['csv', 'statistics', 'math', 'mean', 'median', 'stdev'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'csv', label: 'CSV Content', type: 'textarea', required: true, defaultValue: 'Revenue,Cost\n1200,800\n1500,900\n2100,1100\n1800,950\n2500,1300' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines = (inputs.csv || '').split('\n').filter((l: string) => l.trim());
      if (lines.length < 2) return { success: false, error: 'Provide at least 2 rows of CSV' };
      const headers = lines[0].split(',').map((h: string) => h.trim());
      const dataRows = lines.slice(1).map((r: string) => r.split(',').map((c: string) => Number(c.trim())));

      const stats: Record<string, any> = {};
      headers.forEach((h: string, colIdx: number) => {
        const vals = dataRows.map((r: number[]) => r[colIdx]).filter((v: number) => !isNaN(v));
        if (vals.length > 0) {
          const sum = vals.reduce((a: number, b: number) => a + b, 0);
          const mean = sum / vals.length;
          const sorted = [...vals].sort((a: number, b: number) => a - b);
          const min = sorted[0];
          const max = sorted[sorted.length - 1];
          const median = sorted[Math.floor(sorted.length / 2)];
          stats[h] = { count: vals.length, sum, mean: Number(mean.toFixed(2)), median, min, max };
        }
      });

      return { success: true, data: stats, text: JSON.stringify(stats, null, 2) };
    },
  },

  // 13. JSON Flattener & Unflattener
  {
    id: 'json-flattener',
    name: 'JSON Deep Flattener & Key Dot-Notator',
    category: 'data',
    subcategory: 'format',
    description: 'Flatten deeply nested JSON structures into dot-notated single-level key-value pairs.',
    iconName: 'Minimize2',
    version: '1.0.0',
    tags: ['json', 'flatten', 'dot-notation', 'unflatten', 'data'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'json', label: 'Nested JSON', type: 'textarea', required: true, defaultValue: '{\n  "user": {\n    "name": "Sarah",\n    "address": {\n      "city": "Austin",\n      "zip": "78701"\n    }\n  }\n}' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      try {
        const obj = JSON.parse(inputs.json || '{}');
        function flatten(o: any, prefix = ''): Record<string, any> {
          return Object.keys(o).reduce((acc: any, k) => {
            const pre = prefix.length ? prefix + '.' : '';
            if (typeof o[k] === 'object' && o[k] !== null && !Array.isArray(o[k])) {
              Object.assign(acc, flatten(o[k], pre + k));
            } else {
              acc[pre + k] = o[k];
            }
            return acc;
          }, {});
        }
        const flat = flatten(obj);
        return { success: true, data: flat, text: JSON.stringify(flat, null, 2) };
      } catch (err: any) {
        return { success: false, error: 'JSON error: ' + err.message };
      }
    },
  },

  // 14. Data Array Chunker
  {
    id: 'array-chunker',
    name: 'JSON Data Array Batch Chunker',
    category: 'data',
    subcategory: 'automation',
    description: 'Split large JSON data arrays into smaller sub-arrays for batched API processing.',
    iconName: 'Layers',
    version: '1.0.0',
    tags: ['array', 'chunk', 'batch', 'json', 'data'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'jsonArray', label: 'JSON Array', type: 'textarea', required: true, defaultValue: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]' },
        { name: 'chunkSize', label: 'Chunk Size', type: 'number', defaultValue: 3 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      try {
        const arr = JSON.parse(inputs.jsonArray || '[]');
        if (!Array.isArray(arr)) return { success: false, error: 'Input must be a JSON array' };
        const size = Math.max(1, Number(inputs.chunkSize || 3));
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
          chunks.push(arr.slice(i, i + size));
        }
        return { success: true, data: chunks, text: JSON.stringify(chunks, null, 2) };
      } catch (err: any) {
        return { success: false, error: 'Invalid JSON array: ' + err.message };
      }
    },
  },

  // 15. CSV to Markdown Table Converter
  {
    id: 'csv-to-md-table',
    name: 'CSV to GitHub Markdown Table',
    category: 'data',
    subcategory: 'conversion',
    description: 'Format raw CSV spreadsheets into clean, monospace-aligned GitHub Markdown tables.',
    iconName: 'Table',
    version: '1.0.0',
    tags: ['csv', 'markdown', 'table', 'documentation', 'gfm'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'csv', label: 'CSV Content', type: 'textarea', required: true, defaultValue: 'ID,Task,Status\n101,Fix Bug,Completed\n102,Deploy Node,In Progress' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines = (inputs.csv || '').split('\n').filter((l: string) => l.trim());
      if (lines.length === 0) return { success: false, error: 'Provide CSV' };
      const headers = lines[0].split(',').map((h: string) => h.trim());
      const headerRow = `| ${headers.join(' | ')} |`;
      const sepRow = `| ${headers.map(() => '---').join(' | ')} |`;
      const dataRows = lines.slice(1).map((r: string) => `| ${r.split(',').map((c: string) => c.trim()).join(' | ')} |`);
      const md = [headerRow, sepRow, ...dataRows].join('\n');
      return { success: true, text: md, filename: 'table.md' };
    },
  },

  // 16. SQL CREATE TABLE DDL Generator
  {
    id: 'sql-ddl-generator',
    name: 'SQL Table DDL Schema Generator from JSON/CSV',
    category: 'data',
    subcategory: 'database',
    description: 'Infer PostgreSQL / MySQL CREATE TABLE schema statements automatically from sample data.',
    iconName: 'Database',
    version: '1.0.0',
    tags: ['sql', 'ddl', 'schema', 'postgres', 'mysql', 'database'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'tableName', label: 'Table Name', type: 'text', defaultValue: 'customers' },
        { name: 'sampleJson', label: 'Sample JSON Object', type: 'textarea', required: true, defaultValue: '{\n  "id": 1,\n  "name": "Sarah Connor",\n  "email": "sarah@example.com",\n  "balance": 149.50,\n  "active": true\n}' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      try {
        const obj = JSON.parse(inputs.sampleJson || '{}');
        const tbl = inputs.tableName || 'my_table';
        const cols: string[] = [];
        for (const [k, v] of Object.entries(obj)) {
          let type = 'VARCHAR(255)';
          if (typeof v === 'number') type = Number.isInteger(v) ? 'INTEGER' : 'NUMERIC(10,2)';
          else if (typeof v === 'boolean') type = 'BOOLEAN';
          else if (k.toLowerCase() === 'id') type = 'SERIAL PRIMARY KEY';
          cols.push(`  "${k}" ${type}`);
        }
        const ddl = `CREATE TABLE IF NOT EXISTS "${tbl}" (\n${cols.join(',\n')}\n);`;
        return { success: true, text: ddl, filename: `${tbl}_schema.sql` };
      } catch (err: any) {
        return { success: false, error: 'Invalid sample JSON: ' + err.message };
      }
    },
  },

  // 17. Delimited Text Splitter & Custom Delimiter Engine
  {
    id: 'delimited-text-splitter',
    name: 'Custom Delimiter Text Transformer',
    category: 'data',
    subcategory: 'format',
    description: 'Transform data between pipe (|), semicolon (;), comma (,), and whitespace delimiters.',
    iconName: 'Repeat',
    version: '1.0.0',
    tags: ['delimiter', 'pipe', 'csv', 'split', 'transform'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Input Text', type: 'textarea', required: true, defaultValue: 'apple|banana|cherry|date' },
        { name: 'inputDelim', label: 'Input Delimiter', type: 'text', defaultValue: '|' },
        { name: 'outputDelim', label: 'Output Delimiter', type: 'text', defaultValue: ', ' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const raw = inputs.text || '';
      const inDelim = inputs.inputDelim || '|';
      const outDelim = inputs.outputDelim || ', ';
      const items = raw.split(inDelim);
      return { success: true, text: items.join(outDelim) };
    },
  },

  // 18. JSON Minifier
  {
    id: 'json-minifier',
    name: 'JSON Minifier & Whitespace Stripper',
    category: 'data',
    subcategory: 'format',
    description: 'Strip all spaces, indents, and newlines to produce the smallest valid JSON payload.',
    iconName: 'Minimize2',
    version: '1.0.0',
    tags: ['json', 'minify', 'compress', 'payload'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'json', label: 'Formatted JSON', type: 'textarea', required: true, defaultValue: '{\n  "status": "success",\n  "code": 200\n}' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      try {
        const min = JSON.stringify(JSON.parse(inputs.json || '{}'));
        return { success: true, text: min, filename: 'data.min.json' };
      } catch (err: any) {
        return { success: false, error: 'Invalid JSON: ' + err.message };
      }
    },
  },

  // 19. TSV to JSON Converter
  {
    id: 'tsv-to-json',
    name: 'TSV to JSON Converter',
    category: 'data',
    subcategory: 'conversion',
    description: 'Convert tab-separated tables into clean JSON objects.',
    iconName: 'FileSpreadsheet',
    version: '1.0.0',
    tags: ['tsv', 'json', 'converter', 'data'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'tsv', label: 'TSV Content', type: 'textarea', required: true, defaultValue: 'City\tCountry\tPop\nParis\tFrance\t2148000\nRome\tItaly\t2873000' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines = (inputs.tsv || '').split('\n').filter((l: string) => l.trim());
      if (lines.length < 2) return { success: false, error: 'Provide valid TSV' };
      const headers = lines[0].split('\t').map((h: string) => h.trim());
      const json = lines.slice(1).map((l: string) => {
        const cells = l.split('\t');
        const obj: Record<string, string> = {};
        headers.forEach((h: string, idx: number) => {
          obj[h] = cells[idx]?.trim() || '';
        });
        return obj;
      });
      return { success: true, data: json, text: JSON.stringify(json, null, 2) };
    },
  },

  // 20. String Array Deduplicator
  {
    id: 'string-array-deduplicator',
    name: 'String Array & List Deduplicator',
    category: 'data',
    subcategory: 'cleaning',
    description: 'Deduplicate lists of emails, IDs, keywords, or tags with sort options.',
    iconName: 'ListOrdered',
    version: '1.0.0',
    tags: ['deduplicate', 'list', 'unique', 'strings', 'clean'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'list', label: 'Line-by-Line Items', type: 'textarea', required: true, defaultValue: 'apple\norange\napple\nbanana\norange\ngrape' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const items = (inputs.list || '').split('\n').map((i: string) => i.trim()).filter(Boolean);
      const unique = Array.from(new Set(items)).sort();
      return { success: true, text: unique.join('\n') };
    },
  },

  // 21. Key-Value String to JSON Object Parser
  {
    id: 'kv-to-json',
    name: 'Key-Value Configuration to JSON Parser',
    category: 'data',
    subcategory: 'format',
    description: 'Parse .env, properties, or INI style KEY=VALUE strings into JSON.',
    iconName: 'FileCode',
    version: '1.0.0',
    tags: ['key-value', 'env', 'ini', 'json', 'config'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'kvText', label: 'Key-Value Lines (KEY=VAL)', type: 'textarea', required: true, defaultValue: 'PORT=3000\nNODE_ENV=production\nDB_HOST=localhost' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines = (inputs.kvText || '').split('\n');
      const obj: Record<string, string> = {};
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [k, ...v] = trimmed.split('=');
          obj[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
      return { success: true, data: obj, text: JSON.stringify(obj, null, 2) };
    },
  },

  // 22. CSV Row Merger & File Combiner
  {
    id: 'csv-row-merger',
    name: 'CSV Row Merger & Combiner',
    category: 'data',
    subcategory: 'cleaning',
    description: 'Concatenate multiple CSV files or text blocks with consistent header matching.',
    iconName: 'Layers',
    version: '1.0.0',
    tags: ['csv', 'merge', 'combine', 'concatenate', 'data'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'csvA', label: 'CSV File A', type: 'textarea', required: true, defaultValue: 'ID,Name\n1,Alice\n2,Bob' },
        { name: 'csvB', label: 'CSV File B', type: 'textarea', required: true, defaultValue: 'ID,Name\n3,Charlie\n4,Diana' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/csv' },
    execute: async (inputs): Promise<ToolResult> => {
      const a = (inputs.csvA || '').split('\n').filter((l: string) => l.trim());
      const b = (inputs.csvB || '').split('\n').filter((l: string) => l.trim());
      if (a.length === 0) return { success: true, text: inputs.csvB || '' };
      const merged = [a[0], ...a.slice(1), ...b.slice(1)].join('\n');
      return { success: true, text: merged, filename: 'combined.csv' };
    },
  },

  // 23. Number Sequence Generator
  {
    id: 'number-sequence-generator',
    name: 'Number Range & Arithmetic Sequence Generator',
    category: 'data',
    subcategory: 'generators',
    description: 'Generate customizable numeric sequences with step offsets, zero padding, and prefixes.',
    iconName: 'Hash',
    version: '1.0.0',
    tags: ['number', 'sequence', 'range', 'generator', 'math'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'start', label: 'Start Number', type: 'number', defaultValue: 1 },
        { name: 'end', label: 'End Number', type: 'number', defaultValue: 20 },
        { name: 'step', label: 'Step Increment', type: 'number', defaultValue: 1 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const start = Number(inputs.start || 1);
      const end = Number(inputs.end || 20);
      const step = Math.max(1, Number(inputs.step || 1));
      const nums: number[] = [];
      for (let i = start; i <= end; i += step) {
        nums.push(i);
      }
      return { success: true, text: nums.join('\n'), data: nums };
    },
  },

  // 24. Base64 to Hex / Binary Dump
  {
    id: 'base64-to-hex',
    name: 'Base64 to Hex & Binary Inspector',
    category: 'data',
    subcategory: 'format',
    description: 'Inspect raw byte values in Hexadecimal (0x00-0xFF) and Binary (00000000) formats.',
    iconName: 'Binary',
    version: '1.0.0',
    tags: ['base64', 'hex', 'binary', 'bytes', 'debug'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'base64', label: 'Base64 String', type: 'text', required: true, defaultValue: 'SGVsbG8gV29ybGQ=' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      try {
        const decoded = atob(inputs.base64 || '');
        const hex = Array.from(decoded).map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
        const bin = Array.from(decoded).map((c) => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        const res = { ascii: decoded, hex, binary: bin, byteLength: decoded.length };
        return { success: true, data: res, text: JSON.stringify(res, null, 2) };
      } catch (err: any) {
        return { success: false, error: 'Base64 error: ' + err.message };
      }
    },
  },

  // 25. JSONPath Query Evaluator
  {
    id: 'jsonpath-evaluator',
    name: 'JSON Property Extractor & Query Engine',
    category: 'data',
    subcategory: 'data',
    description: 'Query specific fields and nested sub-arrays from complex JSON payloads.',
    iconName: 'Search',
    version: '1.0.0',
    tags: ['json', 'jsonpath', 'query', 'extractor', 'data'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'json', label: 'JSON Payload', type: 'textarea', required: true, defaultValue: '{\n  "store": {\n    "books": [\n      {"title": "Book A", "price": 10},\n      {"title": "Book B", "price": 20}\n    ]\n  }\n}' },
        { name: 'path', label: 'Property Path (e.g. store.books)', type: 'text', required: true, defaultValue: 'store.books' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      try {
        const obj = JSON.parse(inputs.json || '{}');
        const path = (inputs.path || '').trim();
        const parts = path.split('.');
        let curr: any = obj;
        for (const p of parts) {
          if (curr && typeof curr === 'object') {
            curr = curr[p];
          } else {
            curr = undefined;
            break;
          }
        }
        return { success: true, data: curr, text: JSON.stringify(curr, null, 2) };
      } catch (err: any) {
        return { success: false, error: 'JSON error: ' + err.message };
      }
    },
  },
];
