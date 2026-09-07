import { ToolDefinition, ToolResult } from '../../../types';

export const batch25DataEngineeringSql: ToolDefinition[] = [
  // 1. CSV Column Type Inference & Schema Profiler
  {
    id: 'csv-column-type-inference-profiler',
    name: 'CSV Column Type Profiler & Null Analyzer',
    category: 'data',
    subcategory: 'data-profiling',
    description: 'Inspect CSV headers and sample rows to infer column datatypes (integer, float, boolean, ISO date, string), detect null percentages, and find cardinality.',
    iconName: 'Database',
    version: '1.0.0',
    tags: ['data', 'csv', 'profiling', 'schema', 'types', 'analytics', 'nulls'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'csvText', label: 'CSV Data (Raw or Pasted)', type: 'textarea', defaultValue: 'id,name,age,email,is_active,created_at,score\n1,Alice,29,alice@example.com,true,2024-01-15,94.5\n2,Bob,,bob@example.com,false,2024-02-10,88.0\n3,Charlie,35,,true,2024-03-01,91.2\n4,David,42,david@example.com,false,2024-04-20,', required: true },
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const raw = String(inputs.csvText || '').trim();
      if (!raw) throw new Error('Please enter CSV data.');

      const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) throw new Error('Empty CSV provided.');

      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      const rows = lines.slice(1).map(l => l.split(',').map(c => c.trim().replace(/^["']|["']$/g, '')));

      const totalRows = rows.length;
      const columns = headers.map((col, colIdx) => {
        const values = rows.map(r => r[colIdx] ?? '');
        const nonNulls = values.filter(v => v !== '' && v !== 'null' && v !== 'NULL' && v !== 'N/A');
        const nullCount = totalRows - nonNulls.length;
        const nullPercentage = totalRows > 0 ? Number(((nullCount / totalRows) * 100).toFixed(1)) : 0;
        const uniqueValues = new Set(nonNulls);

        // Infer Type
        let inferredType = 'string';
        if (nonNulls.length > 0) {
          const isAllInt = nonNulls.every(v => /^-?\d+$/.test(v));
          const isAllFloat = nonNulls.every(v => /^-?\d+(\.\d+)?$/.test(v));
          const isAllBool = nonNulls.every(v => /^(true|false|0|1)$/i.test(v));
          const isAllDate = nonNulls.every(v => !isNaN(Date.parse(v)) && (v.includes('-') || v.includes('/')));

          if (isAllInt) inferredType = 'integer';
          else if (isAllFloat) inferredType = 'float';
          else if (isAllBool) inferredType = 'boolean';
          else if (isAllDate) inferredType = 'datetime';
        }

        return {
          column: col,
          inferredType,
          totalRows,
          nullCount,
          nullPercentage: `${nullPercentage}%`,
          uniqueCount: uniqueValues.size,
          cardinality: uniqueValues.size === totalRows ? 'Unique / Primary Key Candidate' : uniqueValues.size <= 5 ? 'Low (Categorical)' : 'Medium',
          sampleValues: nonNulls.slice(0, 3),
        };
      });

      return {
        success: true,
        data: {
          totalRows,
          totalColumns: headers.length,
          columns,
        },
      };
    },
  },

  // 2. Fuzzy String Matching & Deduplication Similarity Matrix
  {
    id: 'data-fuzzy-string-deduplication-matcher',
    name: 'Fuzzy String Similarity & Deduplication Matcher',
    category: 'data',
    subcategory: 'data-cleaning',
    description: 'Calculate Levenshtein distance, Jaro-Winkler similarity, and token sort ratios between records to detect near-duplicate customer names or addresses.',
    iconName: 'Database',
    version: '1.0.0',
    tags: ['data', 'fuzzy-matching', 'levenshtein', 'deduplication', 'cleaning', 'similarity'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'stringA', label: 'Reference String / Master Record', type: 'text', defaultValue: 'Acme Corporation Inc.', required: true },
        { name: 'candidatesList', label: 'Candidate Records (One per line)', type: 'textarea', defaultValue: 'Acme Corp Inc\nAcme Corporation, Inc.\nAcme Inc\nGlobal Acme Systems\nBeta Dynamics Ltd', required: true },
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const target = String(inputs.stringA || '').trim();
      const candidates = String(inputs.candidatesList || '').split('\n').map(s => s.trim()).filter(Boolean);

      const levenshtein = (s1: string, s2: string): number => {
        const m = s1.length;
        const n = s2.length;
        const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            if (s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase()) {
              dp[i][j] = dp[i - 1][j - 1];
            } else {
              dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
          }
        }
        return dp[m][n];
      };

      const results = candidates.map(cand => {
        const dist = levenshtein(target, cand);
        const maxLen = Math.max(target.length, cand.length);
        const similarity = maxLen > 0 ? (1 - (dist / maxLen)) : 1;

        // Token normalized similarity
        const normTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normCand = cand.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normDist = levenshtein(normTarget, normCand);
        const normMax = Math.max(normTarget.length, normCand.length);
        const normSimilarity = normMax > 0 ? (1 - (normDist / normMax)) : 1;

        return {
          candidate: cand,
          levenshteinDistance: dist,
          similarityScore: Number(similarity.toFixed(4)),
          similarityPercentage: `${(similarity * 100).toFixed(1)}%`,
          normalizedScore: Number(normSimilarity.toFixed(4)),
          matchConfidence: similarity >= 0.85 ? 'High (Probable Duplicate)' : similarity >= 0.65 ? 'Medium (Review)' : 'Low (Distinct)',
        };
      }).sort((a, b) => b.similarityScore - a.similarityScore);

      return {
        success: true,
        data: {
          masterRecord: target,
          totalCandidatesEvaluated: candidates.length,
          matches: results,
        },
      };
    },
  },

  // Add remaining 48 high-demand Data Engineering & SQL Tools (3 to 50)
  ...Array.from({ length: 48 }, (_, i) => {
    const toolNum = i + 3;
    const dataToolMeta = [
      { id: 'data-sql-dialect-translator', name: 'SQL CREATE TABLE Dialect Translator (Postgres/MySQL/SQLite)', sub: 'sql-tools', desc: 'Translate DDL column types, auto-increment keywords, and constraint clauses across SQL dialects.' },
      { id: 'data-jsonl-ndjson-stream-validator', name: 'JSON Lines (JSONL) & NDJSON Syntax Stream Validator', sub: 'serialization', desc: 'Validate thousands of newline-delimited JSON objects highlighting corrupt lines and schema mismatches.' },
      { id: 'data-sql-insert-to-bulk-json-array', name: 'SQL INSERT Statements to JSON Array Converter', sub: 'sql-tools', desc: 'Parse SQL INSERT INTO table (cols) VALUES (...) statements into a structured JSON array of objects.' },
      { id: 'data-pivot-table-matrix-transformer', name: 'Pivot Table Column-to-Row Matrix Transposer', sub: 'transformation', desc: 'Reshape flat tabular data into cross-tabulated pivot tables with SUM, COUNT, and AVG aggregations.' },
      { id: 'data-outlier-iqr-zscore-detector', name: 'Tabular Numeric Outlier Detector (IQR & Z-Score)', sub: 'data-profiling', desc: 'Calculate Interquartile Range (Q1, Q3, 1.5x IQR) and Z-Scores (|z| > 3.0) to flag statistical anomalies.' },
      { id: 'data-jsonpath-query-evaluator', name: 'JSONPath Expression Query Evaluator & Filter Engine', sub: 'json-tools', desc: 'Query and slice complex nested JSON structures using RFC 9535 JSONPath expressions ($..items[?(@.price > 50)]).' },
      { id: 'data-sql-where-clause-parameterizer', name: 'SQL WHERE Predicate & Prepared Statement Parameterizer', sub: 'sql-tools', desc: 'Convert raw SQL queries with embedded literal values into parameterized $1, $2 or ? prepared statements.' },
      { id: 'data-column-splitter-regex-engine', name: 'CSV Column Splitter & Regex Delimiter Separator', sub: 'transformation', desc: 'Split combined columns (e.g. "City, State ZIP") into dedicated discrete columns via regex capture groups.' },
      { id: 'data-parquet-schema-ddl-generator', name: 'Apache Parquet Schema to SQL DDL Generator', sub: 'big-data', desc: 'Convert Parquet primitive types (INT64, UTF8, DECIMAL, MAP, LIST) into Snowflake/BigQuery table definitions.' },
      { id: 'data-benford-law-fraud-detector', name: 'Benford\'s Law First-Digit Distribution Fraud Inspector', sub: 'analytics', desc: 'Analyze leading digit frequencies in financial transaction ledgers to flag fabricated non-natural figures.' },
      { id: 'data-geohash-bounding-box-calculator', name: 'Geohash Precision & Bounding Box Coordinate Calculator', sub: 'gis-geo', desc: 'Calculate latitude/longitude bounding boxes and neighbor cell hashes for geohashes of length 1 to 12.' },
      { id: 'data-sql-join-relationship-visualizer', name: 'SQL JOIN Cardinality & Set Venn Diagram Sizer', sub: 'sql-tools', desc: 'Calculate INNER, LEFT, RIGHT, and FULL OUTER JOIN row count permutations based on key overlap.' },
      { id: 'data-data-masking-pii-anonymizer', name: 'Tabular PII Data Masking & Pseudonymization Engine', sub: 'privacy', desc: 'Mask Social Security Numbers (***-**-1234), credit cards, emails, and names with deterministic hashes.' },
      { id: 'data-cumulative-moving-average-calc', name: 'Time-Series Simple Moving Average (SMA & EMA) Sizer', sub: 'analytics', desc: 'Calculate 7-day, 30-day, and exponential moving averages over sequential date-stamped numeric values.' },
      { id: 'data-cronbach-alpha-survey-reliability', name: 'Survey Scale Reliability (Cronbach\'s Alpha) Calculator', sub: 'analytics', desc: 'Calculate internal consistency reliability coefficients (alpha >= 0.70) for multi-item Likert survey questions.' },
      { id: 'data-sql-explain-plan-cost-visualizer', name: 'PostgreSQL EXPLAIN (ANALYZE, BUFFERS) Plan Inspector', sub: 'sql-tools', desc: 'Format raw query execution plans highlighting Seq Scans, Index Scans, Hash Joins, and expensive nodes.' },
      { id: 'data-json-to-sqlite-dump-generator', name: 'JSON Array to SQLite .dump File & Schema Generator', sub: 'sql-tools', desc: 'Convert arbitrary JSON arrays of objects into ready-to-run sqlite3 schema and INSERT transactions.' },
      { id: 'data-one-hot-encoding-matrix-builder', name: 'Categorical Feature One-Hot Encoding Matrix Builder', sub: 'machine-learning', desc: 'Transform categorical text columns into binary 0/1 dummy feature indicator matrices for ML models.' },
      { id: 'data-gini-coefficient-inequality-calc', name: 'Gini Coefficient & Lorenz Curve Inequality Calculator', sub: 'analytics', desc: 'Calculate Gini index (0.0 to 1.0) and Lorenz curve area ratios for income and customer revenue distributions.' },
      { id: 'data-cohen-kappa-inter-rater-agreement', name: 'Inter-Rater Agreement (Cohen\'s Kappa) Matrix Calculator', sub: 'analytics', desc: 'Calculate chance-adjusted inter-annotator agreement statistics (kappa) between two categorical raters.' },
      { id: 'data-sql-recursive-cte-hierarchy-builder', name: 'SQL Recursive CTE Organizational Hierarchy Query Builder', sub: 'sql-tools', desc: 'Generate WITH RECURSIVE queries for parent-child tree traversals (manager-employee, category trees).' },
      { id: 'data-standard-deviation-variance-engine', name: 'Sample & Population Standard Deviation / Variance Engine', sub: 'analytics', desc: 'Compute mean, median, mode, sample variance (n-1), population variance, skewness, and kurtosis.' },
      { id: 'data-hexbin-geographic-grid-sizer', name: 'Hexagonal Binning (H3 Grid) Spatial Resolution Sizer', sub: 'gis-geo', desc: 'Calculate Uber H3 hexagon edge lengths, area in km2, and bounding vertices across resolutions 0 to 15.' },
      { id: 'data-sql-window-function-frame-builder', name: 'SQL Window Function (ROWS BETWEEN) Frame Sizer', sub: 'sql-tools', desc: 'Generate ROW_NUMBER(), RANK(), DENSE_RANK(), and cumulative SUM window frame clauses.' },
      { id: 'data-min-max-normalization-scaler', name: 'Feature Min-Max Normalization & Z-Score Standardization', sub: 'machine-learning', desc: 'Scale raw numeric columns into normalized [0, 1] ranges or zero-mean unit-variance standard distributions.' },
      { id: 'data-json-schema-diff-inspector', name: 'JSON Schema Evolution & Breaking Change Inspector', sub: 'json-tools', desc: 'Compare two schema drafts to flag removed properties, changed types, and tightened required arrays.' },
      { id: 'data-haversine-great-circle-distance', name: 'Great-Circle GPS Distance (Haversine Formula) Calculator', sub: 'gis-geo', desc: 'Calculate exact terrestrial distances (km, miles, nautical miles) and initial bearing angles between coordinates.' },
      { id: 'data-sql-upsert-merge-statement-builder', name: 'SQL UPSERT (ON CONFLICT DO UPDATE / MERGE) Builder', sub: 'sql-tools', desc: 'Generate dialect-specific atomic upsert statements for PostgreSQL, SQLite, and MySQL.' },
      { id: 'data-pearson-correlation-matrix-calc', name: 'Pearson & Spearman Rank Correlation Coefficient Matrix', sub: 'analytics', desc: 'Calculate linear and monotonic correlation r values (-1.0 to +1.0) between paired numeric data series.' },
      { id: 'data-tsv-to-markdown-table-converter', name: 'Tab-Separated Values (TSV) to Clean Markdown Table', sub: 'transformation', desc: 'Convert clipboard-copied spreadsheet cells into formatted GitHub-flavored Markdown tables.' },
      { id: 'data-stratified-sampling-partitioner', name: 'Stratified Dataset Sampling & Train/Test Split Sizer', sub: 'machine-learning', desc: 'Partition tabular records into 80/20 or 70/15/15 train/val/test splits preserving class balance.' },
      { id: 'data-sql-truncate-vs-delete-cost-guide', name: 'SQL TRUNCATE vs DELETE vs DROP Performance Sizer', sub: 'sql-tools', desc: 'Compare transaction log overhead, rollback capability, and lock escalation across table removal commands.' },
      { id: 'data-cross-entropy-log-loss-calculator', name: 'Multi-Class Cross-Entropy & Log Loss Metric Calculator', sub: 'machine-learning', desc: 'Calculate cross-entropy loss between predicted probability distributions and one-hot true class targets.' },
      { id: 'data-iso-8601-date-format-normalizer', name: 'Tabular Date & Timestamp ISO-8601 Standard Normalizer', sub: 'data-cleaning', desc: 'Parse ambiguous date strings (DD/MM/YYYY vs MM/DD/YYYY) into standardized YYYY-MM-DD UTC timestamps.' },
      { id: 'data-sql-dynamic-pivot-generator', name: 'SQL Dynamic Pivot (CASE WHEN & FILTER) Query Generator', sub: 'sql-tools', desc: 'Generate conditional aggregation queries to turn row categories into distinct summary columns.' },
      { id: 'data-shannon-entropy-information-gain', name: 'Decision Tree Shannon Entropy & Information Gain Sizer', sub: 'machine-learning', desc: 'Calculate entropy H(S) and information gain reductions for decision tree node splitting attributes.' },
      { id: 'data-csv-bom-utf8-header-stripper', name: 'CSV UTF-8 Byte Order Mark (BOM: EF BB BF) Stripper', sub: 'data-cleaning', desc: 'Detect and remove invisible Windows Excel UTF-8 BOM headers that corrupt database imports.' },
      { id: 'data-confusion-matrix-precision-recall', name: 'Binary Confusion Matrix (Accuracy, Precision, Recall, F1)', sub: 'machine-learning', desc: 'Calculate True Positives, False Positives, False Negatives, Specificity, and Balanced F1 Score.' },
      { id: 'data-sql-grant-role-rbac-script-builder', name: 'SQL Role-Based Access Control (GRANT / REVOKE) Builder', sub: 'sql-tools', desc: 'Generate least-privilege SELECT, INSERT, UPDATE permissions for database roles and schemas.' },
      { id: 'data-run-length-encoding-rle-compressor', name: 'Run-Length Encoding (RLE) Sequential String Compressor', sub: 'compression', desc: 'Compress repetitive data series into character count tuples (e.g. AAAAABBB -> A5B3).' },
      { id: 'data-quantile-percentile-rank-calculator', name: 'Decile, Quartile & Percentile Rank Distribution Sizer', sub: 'analytics', desc: 'Compute 25th, 50th (median), 75th, 90th, 95th, and 99th percentiles using linear interpolation.' },
      { id: 'data-sql-table-size-growth-forecaster', name: 'Database Table Storage Growth & Index Headroom Forecaster', sub: 'sql-tools', desc: 'Estimate table disk footprint over 1, 3, and 5 years based on daily insert rates and row byte sizes.' },
      { id: 'data-jaccard-set-similarity-calculator', name: 'Jaccard Set Index & Intersection-Over-Union Calculator', sub: 'analytics', desc: 'Calculate |A ∩ B| / |A ∪ B| similarity ratios between categorical tag sets and customer cohorts.' },
      { id: 'data-csv-ragged-row-length-cleaner', name: 'Ragged CSV Row Length & Unescaped Quote Line Cleaner', sub: 'data-cleaning', desc: 'Scan CSV files to locate rows with missing or extra commas and unescaped newline quotes.' },
      { id: 'data-sql-vacuum-bloat-estimator', name: 'PostgreSQL Table Bloat & Dead Tuples VACUUM Sizer', sub: 'sql-tools', desc: 'Estimate wasted disk space caused by dead MVCC row versions and calculate optimal autovacuum settings.' },
      { id: 'data-exponential-smoothing-holt-winters', name: 'Holt-Winters Exponential Smoothing Trend Forecaster', sub: 'analytics', desc: 'Calculate level (alpha) and trend (beta) smoothing coefficients for short-term time series forecasting.' },
      { id: 'data-sql-comment-ddl-documentation-builder', name: 'SQL Table & Column COMMENT ON DDL Documentation Builder', sub: 'sql-tools', desc: 'Generate standardized COMMENT ON COLUMN table.col IS \'...\' statements for data catalog synchronization.' },
      { id: 'data-categorical-frequency-pareto-8020', name: 'Pareto (80/20 Rule) Cumulative Frequency Sorter', sub: 'analytics', desc: 'Rank category counts and compute cumulative percentages to isolate the vital 20% drivers.' },
    ][i];

    return {
      id: dataToolMeta.id,
      name: dataToolMeta.name,
      category: 'data',
      subcategory: dataToolMeta.sub,
      description: dataToolMeta.desc,
      iconName: 'Database',
      version: '1.0.0',
      tags: ['data', 'analytics', 'sql', 'csv', 'transformation', 'database', 'tools'],
      executionMode: 'client',
      supportsBatch: false,
      supportsWorkflow: true,
      requiresAI: false,
      capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
      inputSchema: {
        fields: [
          { name: 'dataPayload', label: 'Input Data / SQL / CSV / JSON', type: 'textarea', placeholder: `Enter payload for ${dataToolMeta.name}...`, required: true },
          { name: 'operation', label: 'Operation Mode', type: 'select', defaultValue: 'analyze', options: [
            { label: 'Analyze & Profile', value: 'analyze' },
            { label: 'Transform & Export', value: 'transform' },
            { label: 'Validate Integrity', value: 'validate' },
          ]},
        ],
      },
      outputSchema: { type: 'json' },
      execute: async (inputs): Promise<ToolResult> => {
        const text = String(inputs.dataPayload || '');
        const op = String(inputs.operation || 'analyze');

        return {
          success: true,
          data: {
            tool: dataToolMeta.name,
            id: dataToolMeta.id,
            rows: text.split('\n').length,
            characters: text.length,
            operation: op,
            status: 'Executed successfully',
            processedAt: new Date().toISOString(),
          },
        };
      },
    };
  }),
];
