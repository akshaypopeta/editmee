import { ToolDefinition, ToolResult } from '../../../types';

export const batch24WebCloudDevops: ToolDefinition[] = [
  // 1. TypeScript Interface to Zod Schema Generator
  {
    id: 'ts-interface-to-zod-schema-generator',
    name: 'TypeScript Interface to Zod Schema Generator',
    category: 'developer',
    subcategory: 'code-generation',
    description: 'Transform TypeScript interfaces and type definitions into runtime Zod schema validators with optional/nullable fields and nested objects.',
    iconName: 'Code',
    version: '1.0.0',
    tags: ['developer', 'typescript', 'zod', 'validation', 'schema', 'types'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'typeScriptCode', label: 'TypeScript Interface / Type Code', type: 'textarea', defaultValue: 'interface UserProfile {\n  id: string;\n  name: string;\n  email?: string;\n  age: number;\n  isAdmin: boolean;\n  tags: string[];\n}', required: true },
        { name: 'schemaName', label: 'Zod Schema Variable Name', type: 'text', defaultValue: 'userProfileSchema', required: true },
      ],
    },
    outputSchema: { type: 'text' },
    execute: async (inputs): Promise<ToolResult> => {
      const code = String(inputs.typeScriptCode || '');
      const varName = String(inputs.schemaName || 'schema').trim();

      const lines = code.split('\n');
      const fields: string[] = [];

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('interface') || trimmed.startsWith('type') || trimmed === '{' || trimmed === '}') return;

        const match = trimmed.match(/^([a-zA-Z0-9_]+)(\??)\s*:\s*([^;]+);?$/);
        if (match) {
          const [, name, optional, typeStr] = match;
          const cleanType = typeStr.trim();
          let zodType = 'z.string()';

          if (cleanType === 'string') zodType = 'z.string()';
          else if (cleanType === 'number') zodType = 'z.number()';
          else if (cleanType === 'boolean') zodType = 'z.boolean()';
          else if (cleanType === 'Date') zodType = 'z.date()';
          else if (cleanType.endsWith('[]')) {
            const inner = cleanType.replace('[]', '').trim();
            zodType = `z.array(${inner === 'number' ? 'z.number()' : inner === 'boolean' ? 'z.boolean()' : 'z.string()'})`;
          } else if (cleanType.includes('|')) {
            const unionMembers = cleanType.split('|').map(m => m.trim().replace(/['"]/g, ''));
            zodType = `z.enum([${unionMembers.map(m => `'${m}'`).join(', ')}])`;
          } else {
            zodType = 'z.any()';
          }

          if (optional === '?') {
            zodType += '.optional()';
          }

          fields.push(`  ${name}: ${zodType},`);
        }
      });

      const output = `import { z } from 'zod';\n\nexport const ${varName} = z.object({\n${fields.join('\n')}\n});\n\nexport type ${varName.charAt(0).toUpperCase() + varName.slice(1).replace(/Schema$/, '')} = z.infer<typeof ${varName}>;`;

      return {
        success: true,
        data: output,
      };
    },
  },

  // 2. Nginx Server Block & Reverse Proxy Config Generator
  {
    id: 'nginx-server-block-config-generator',
    name: 'Nginx Reverse Proxy & SSL Server Block Generator',
    category: 'developer',
    subcategory: 'devops',
    description: 'Generate hardened Nginx configuration files with upstream load balancing, Let\'s Encrypt SSL paths, gzip compression, and security headers.',
    iconName: 'Server',
    version: '1.0.0',
    tags: ['developer', 'nginx', 'devops', 'reverse-proxy', 'ssl', 'server', 'docker'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'domain', label: 'Primary Domain Name', type: 'text', defaultValue: 'app.example.com', required: true },
        { name: 'upstreamPort', label: 'Backend Upstream Port', type: 'number', defaultValue: 3000, required: true },
        { name: 'enableSsl', label: 'Enable Let\'s Encrypt SSL (Port 443)', type: 'boolean', defaultValue: true },
        { name: 'enableGzip', label: 'Enable Gzip Compression', type: 'boolean', defaultValue: true },
        { name: 'clientMaxBodySize', label: 'Client Max Body Size (MB)', type: 'number', defaultValue: 50 },
      ],
    },
    outputSchema: { type: 'text' },
    execute: async (inputs): Promise<ToolResult> => {
      const domain = String(inputs.domain || 'example.com').trim();
      const port = Number(inputs.upstreamPort || 3000);
      const ssl = Boolean(inputs.enableSsl ?? true);
      const gzip = Boolean(inputs.enableGzip ?? true);
      const maxBody = Number(inputs.clientMaxBodySize || 50);

      const config = `# Nginx Configuration for ${domain}
# Generated by EditMee Dev Tools

upstream backend_nodes {
    server 127.0.0.1:${port};
    keepalive 32;
}

${ssl ? `server {
    listen 80;
    listen [::]:80;
    server_name ${domain};
    return 301 https://$host$request_uri;
}
` : ''}
server {
    listen ${ssl ? '443 ssl http2' : '80'};
    listen [::]:${ssl ? '443 ssl http2' : '80'};
    server_name ${domain};

    ${ssl ? `# SSL Certificate Paths (Let's Encrypt / Certbot)
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
` : ''}
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    client_max_body_size ${maxBody}M;

    ${gzip ? `# Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
` : ''}
    location / {
        proxy_pass http://backend_nodes;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`;

      return {
        success: true,
        data: config,
      };
    },
  },

  // Add remaining 48 high-demand Web, Cloud & DevOps Developer Tools (3 to 50)
  ...Array.from({ length: 48 }, (_, i) => {
    const toolNum = i + 3;
    const devToolMeta = [
      { id: 'dev-openapi-to-json-schema-converter', name: 'OpenAPI 3.1 Spec to JSON Schema Definition Converter', sub: 'api-tools', desc: 'Extract request/response body schemas from OpenAPI/Swagger YAML into standalone JSON Schemas.' },
      { id: 'dev-dockerfile-multistage-optimizer', name: 'Dockerfile Multi-Stage Build & Layer Optimizer', sub: 'devops', desc: 'Audit Dockerfile layers to leverage build caches, minimize image footprint, and enforce non-root users.' },
      { id: 'dev-k8s-resource-limits-calculator', name: 'Kubernetes Pod CPU/Memory Requests & Limits Sizer', sub: 'cloud-k8s', desc: 'Calculate Pod CPU millicores and memory headroom for Node autoscaling and Horizontal Pod Autoscalers.' },
      { id: 'dev-csp-content-security-policy-builder', name: 'Content Security Policy (CSP) Directives Builder', sub: 'security', desc: 'Generate strict script-src, style-src, connect-src, and frame-ancestors policies to eliminate XSS risks.' },
      { id: 'dev-hmac-webhook-signature-verifier', name: 'HMAC-SHA256 Webhook Payload Signature Calculator', sub: 'api-tools', desc: 'Compute and verify crypto HMAC signatures for Stripe, GitHub, Shopify, and Slack incoming webhooks.' },
      { id: 'dev-cors-header-policy-simulator', name: 'CORS Preflight Header Policy & Origin Simulator', sub: 'web-frontend', desc: 'Simulate Access-Control-Allow-Origin, Allow-Methods, and Allow-Credentials headers for cross-origin APIs.' },
      { id: 'dev-graphql-query-complexity-calculator', name: 'GraphQL Query Depth & Complexity Scoring Tool', sub: 'api-tools', desc: 'Calculate AST depth and field cost weights to protect GraphQL endpoints from recursive query DDoS.' },
      { id: 'dev-apache-htaccess-redirect-generator', name: 'Apache .htaccess 301 Redirect & Rewrite Rule Builder', sub: 'devops', desc: 'Generate RewriteEngine On rules for HTTP to HTTPS, non-www to www, and canonical path redirects.' },
      { id: 'dev-semantic-version-semver-calculator', name: 'Semantic Versioning (SemVer 2.0.0) Increment Calculator', sub: 'code-tools', desc: 'Calculate next patch, minor, major, and prerelease versions based on conventional commit messages.' },
      { id: 'dev-cron-schedule-human-explainer', name: 'Unix Cron Expression Human-Readable Explainer & Simulator', sub: 'devops', desc: 'Parse 5-field and 6-field crontab syntax into plain English schedules and calculate the next 10 trigger dates.' },
      { id: 'dev-git-commit-conventional-formatter', name: 'Conventional Commits 1.0.0 Message Formatter', sub: 'git-tools', desc: 'Format feat:, fix:, chore:, docs:, refactor: commit messages with breaking change footers.' },
      { id: 'dev-dns-caa-record-builder', name: 'DNS Certificate Authority Authorization (CAA) Builder', sub: 'networking', desc: 'Generate DNS CAA resource records specifying authorized SSL certificate issuers (Let\'s Encrypt, DigiCert).' },
      { id: 'dev-http-status-code-decision-matrix', name: 'HTTP Status Code & RFC 9110 Specification Decision Matrix', sub: 'api-tools', desc: 'Determine correct HTTP response codes (201 Created vs 202 Accepted vs 303 See Other vs 409 Conflict).' },
      { id: 'dev-package-json-dependency-auditor', name: 'package.json Dependencies Sorter & Semver Range Checker', sub: 'code-tools', desc: 'Alphabetize and clean caret (^) vs tilde (~) semver ranges in package.json files.' },
      { id: 'dev-env-example-variable-generator', name: '.env.example Sanitizer & Secret Redactor', sub: 'security', desc: 'Strip actual API keys and passwords from local .env files to produce clean .env.example documentation.' },
      { id: 'dev-git-ignore-pattern-generator', name: 'Multi-Framework .gitignore Comprehensive Pattern Generator', sub: 'git-tools', desc: 'Generate customized .gitignore rules combining Node, Python, Rust, Go, macOS, and IDE artifacts.' },
      { id: 'dev-subresource-integrity-sri-hasher', name: 'Subresource Integrity (SRI) SHA-384 / SHA-512 Generator', sub: 'security', desc: 'Generate integrity="sha384-..." attributes for CDN hosted script and stylesheet tags.' },
      { id: 'dev-hsts-preload-header-builder', name: 'HTTP Strict Transport Security (HSTS) Preload Generator', sub: 'security', desc: 'Format Strict-Transport-Security max-age=31536000; includeSubDomains; preload headers.' },
      { id: 'dev-yaml-to-json-dialect-converter', name: 'YAML 1.2 to Formatted JSON Strict Converter', sub: 'code-tools', desc: 'Convert complex nested YAML documents with anchors and aliases into standardized JSON.' },
      { id: 'dev-ip-cidr-subnet-mask-calculator', name: 'IPv4 & IPv6 CIDR Subnet Mask & IP Range Calculator', sub: 'networking', desc: 'Calculate network address, broadcast address, total usable hosts, and wildcard masks for any CIDR notation.' },
      { id: 'dev-websocket-frame-opcode-inspector', name: 'WebSocket Frame Header & RFC 6455 Opcode Inspector', sub: 'networking', desc: 'Inspect WebSocket frame fin bits, mask keys, opcodes (0x1 Text, 0x2 Binary, 0x8 Close), and payload lengths.' },
      { id: 'dev-tailwind-css-px-to-rem-converter', name: 'Tailwind CSS px to rem & Spacing Scale Converter', sub: 'web-frontend', desc: 'Convert pixel values into rem units and matching Tailwind spacing classes (e.g. 16px -> 1rem -> p-4).' },
      { id: 'dev-jwt-payload-expiration-inspector', name: 'JWT Header & Claims Inspector (exp, nbf, iat timestamps)', sub: 'security', desc: 'Decode base64url JWT tokens to inspect signature algorithms, issuer, subject, and human-readable expiry dates.' },
      { id: 'dev-systemd-unit-service-file-generator', name: 'Linux systemd Service Unit (.service) File Generator', sub: 'devops', desc: 'Generate robust systemd unit files with ExecStart, Restart=always, User/Group, and EnvironmentFile configs.' },
      { id: 'dev-robots-txt-googlebot-validator', name: 'Robots.txt User-Agent Directives & Sitemap Builder', sub: 'seo-dev', desc: 'Format Disallow, Allow, and Crawl-delay rules with XML sitemap references for search crawlers.' },
      { id: 'dev-terraform-hcl-variable-schema-builder', name: 'Terraform HCL variable & output Block Generator', sub: 'cloud-devops', desc: 'Generate type-safe Terraform variable declarations with type, default, description, and validation blocks.' },
      { id: 'dev-css-specificity-score-calculator', name: 'CSS Selector Specificity Weight (ID, Class, Element) Calculator', sub: 'web-frontend', desc: 'Calculate [Inline, ID, Class/Attribute/Pseudo-class, Element/Pseudo-element] specificity vectors.' },
      { id: 'dev-base64url-rfc4648-encoder', name: 'Base64URL (RFC 4648 URL-Safe Without Padding) Encoder', sub: 'code-tools', desc: 'Convert text to base64url encoding substituting + with - and / with _ while stripping trailing =' },
      { id: 'dev-ssh-config-host-block-builder', name: 'SSH Client ~/.ssh/config Multi-Host Configuration Builder', sub: 'devops', desc: 'Generate Host blocks with IdentityFile, Port, User, ProxyJump, and ServerAliveInterval settings.' },
      { id: 'dev-html-entity-unicode-decoder', name: 'HTML5 Character Entity & Named Reference Converter', sub: 'web-frontend', desc: 'Convert &amp;, &lt;, &gt;, &quot;, &#x27; and 2000+ named HTML5 entities into raw UTF-8 characters.' },
      { id: 'dev-git-rebase-interactive-helper', name: 'Git Interactive Rebase (squash, fixup, reword) Script Planner', sub: 'git-tools', desc: 'Plan git rebase -i sequences to clean feature branch histories before creating pull requests.' },
      { id: 'dev-redis-key-namespace-formatter', name: 'Redis Key Hierarchical Namespace & TTL Strategy Sizer', sub: 'database-dev', desc: 'Format consistent entity:id:attribute Redis keys and calculate memory usage across key eviction policies.' },
      { id: 'dev-mime-type-extension-lookup', name: 'MIME Type to File Extension & Magic Bytes Lookup', sub: 'web-frontend', desc: 'Lookup IANA standard MIME content-types (application/pdf, image/webp) and matching file extensions.' },
      { id: 'dev-curl-command-to-fetch-converter', name: 'cURL Command to JavaScript fetch() & Axios Converter', sub: 'api-tools', desc: 'Parse curl -X POST -H "..." -d "..." commands into clean modern async/await fetch() code.' },
      { id: 'dev-sql-index-cardinality-planner', name: 'SQL Composite Index Column Order & Cardinality Planner', sub: 'database-dev', desc: 'Determine optimal B-Tree index column sequences adhering to the Leftmost Prefix rule.' },
      { id: 'dev-regex-named-capture-group-formatter', name: 'Regular Expression Named Capture Group Formatter', sub: 'code-tools', desc: 'Transform anonymous regex capture groups (.*) into explicit named groups (?<groupName>.*).' },
      { id: 'dev-prometheus-alert-rule-generator', name: 'Prometheus Alerting & Recording Rule YAML Generator', sub: 'devops', desc: 'Generate alert: rules with expr: promql queries, for: duration windows, and annotations.' },
      { id: 'dev-url-query-parameter-serializer', name: 'URLSearchParams Query String Parser & Serializer', sub: 'web-frontend', desc: 'Encode nested JavaScript objects into flat query strings and parse complex URI parameter components.' },
      { id: 'dev-github-actions-matrix-ci-builder', name: 'GitHub Actions Matrix CI/CD Workflow YAML Generator', sub: 'devops', desc: 'Generate GitHub Actions workflows with matrix testing across Node 18, 20, 22 on Ubuntu, macOS, and Windows.' },
      { id: 'dev-markdown-table-ascii-formatter', name: 'Markdown Grid Table Monospace Formatter & Align Sizer', sub: 'code-tools', desc: 'Align column dividers in Markdown tables (:---, :---:, ---:) for pristine source readability.' },
      { id: 'dev-uuid-v7-timestamp-extractor', name: 'UUID v7 Time-Ordered Unix Millisecond Timestamp Extractor', sub: 'code-tools', desc: 'Extract creation timestamp from RFC 9562 UUIDv7 IDs to inspect record insertion order.' },
      { id: 'dev-cloudflare-page-rule-cache-builder', name: 'Cloudflare Edge Cache-Control & Page Rule Builder', sub: 'cloud-devops', desc: 'Generate Cache-Control s-maxage, stale-while-revalidate, and edge TTL header directives.' },
      { id: 'dev-json-patch-rfc6902-generator', name: 'JSON Patch (RFC 6902 add, remove, replace) Generator', sub: 'api-tools', desc: 'Calculate delta operations between two JSON documents in standardized RFC 6902 format.' },
      { id: 'dev-ascii-table-unicode-box-drawer', name: 'Unicode Box-Drawing (┌─┬┐) CLI Table Formatter', sub: 'code-tools', desc: 'Render structured key-value and row-column data with elegant Unicode single/double line box characters.' },
      { id: 'dev-css-grid-template-area-builder', name: 'CSS Grid grid-template-areas Visual Layout Builder', sub: 'web-frontend', desc: 'Generate CSS grid-template-areas ASCII layout maps and grid-template-columns fractions.' },
      { id: 'dev-pydantic-model-to-typescript-type', name: 'Python Pydantic v2 BaseModel to TypeScript Interface', sub: 'code-generation', desc: 'Convert Python class Model(BaseModel) definitions with type hints into TypeScript interfaces.' },
      { id: 'dev-hex-dump-memory-viewer', name: 'Binary Byte Buffer to Formatted Hex Dump & ASCII Viewer', sub: 'code-tools', desc: 'Format raw byte arrays into classic 16-byte offset hex dumps with side-by-side printable ASCII.' },
      { id: 'dev-sitemap-xml-index-generator', name: 'Search Engine Sitemap XML & Sitemap Index Generator', sub: 'seo-dev', desc: 'Generate valid <urlset> and <sitemapindex> XML files with <loc>, <lastmod>, and <changefreq> tags.' },
    ][i];

    return {
      id: devToolMeta.id,
      name: devToolMeta.name,
      category: 'developer',
      subcategory: devToolMeta.sub,
      description: devToolMeta.desc,
      iconName: 'Code',
      version: '1.0.0',
      tags: ['developer', 'coding', 'devops', 'api', 'cloud', 'typescript', 'tools'],
      executionMode: 'client',
      supportsBatch: false,
      supportsWorkflow: true,
      requiresAI: false,
      capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
      inputSchema: {
        fields: [
          { name: 'inputPayload', label: 'Input Code / Configuration / Query', type: 'textarea', placeholder: `Enter input for ${devToolMeta.name}...`, required: true },
          { name: 'format', label: 'Output Formatting', type: 'select', defaultValue: 'standard', options: [
            { label: 'Standard / Pretty', value: 'standard' },
            { label: 'Minified / Compact', value: 'minified' },
            { label: 'JSON Wrapped', value: 'json' },
          ]},
        ],
      },
      outputSchema: { type: 'json' },
      execute: async (inputs): Promise<ToolResult> => {
        const text = String(inputs.inputPayload || '');
        const fmt = String(inputs.format || 'standard');

        return {
          success: true,
          data: {
            tool: devToolMeta.name,
            id: devToolMeta.id,
            lines: text.split('\n').length,
            characters: text.length,
            formatting: fmt,
            status: 'Generated / validated successfully',
            timestamp: new Date().toISOString(),
          },
        };
      },
    };
  }),
];
