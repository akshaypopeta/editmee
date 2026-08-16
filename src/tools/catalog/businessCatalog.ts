import { ToolDefinition, ToolResult } from '../../types';
import { aiGateway } from '../../core/ai-gateway/AiGateway';

export const businessCatalog: ToolDefinition[] = [
  // 1. Invoice Generator
  {
    id: 'invoice-generator',
    name: 'Professional Invoice Generator',
    category: 'business',
    subcategory: 'finance',
    description: 'Generate clean, itemized business invoices with tax calculations, due dates, and payment instructions.',
    iconName: 'Receipt',
    version: '1.0.0',
    tags: ['invoice', 'billing', 'finance', 'business', 'payment'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'invoiceNum', label: 'Invoice #', type: 'text', defaultValue: 'INV-2026-001' },
        { name: 'clientName', label: 'Client / Company Name', type: 'text', defaultValue: 'Acme Corporation' },
        { name: 'items', label: 'Line Items (Description, Qty, Rate per line)', type: 'textarea', defaultValue: 'Frontend Architecture Consulting, 40, 150\nWASM Pipeline Optimization, 20, 175' },
        { name: 'taxPercent', label: 'Tax Rate (%)', type: 'number', defaultValue: 8.5 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines = (inputs.items || '').split('\n').filter(Boolean);
      let subtotal = 0;
      const rows = lines.map((l: string) => {
        const [desc, qtyStr, rateStr] = l.split(',').map((c) => c.trim());
        const qty = Number(qtyStr || 1);
        const rate = Number(rateStr || 0);
        const total = qty * rate;
        subtotal += total;
        return `| ${desc} | ${qty} | $${rate.toFixed(2)} | $${total.toFixed(2)} |`;
      }).join('\n');

      const taxRate = Number(inputs.taxPercent || 0);
      const tax = (subtotal * taxRate) / 100;
      const totalDue = subtotal + tax;

      const md = `# INVOICE\n**Invoice Number:** ${inputs.invoiceNum}\n**Billed To:** ${inputs.clientName}\n**Date:** ${new Date().toLocaleDateString()}\n\n| Description | Qty | Rate | Amount |\n|---|---|---|---|\n${rows}\n\n**Subtotal:** $${subtotal.toFixed(2)}\n**Tax (${taxRate}%):** $${tax.toFixed(2)}\n### **Total Due:** $${totalDue.toFixed(2)}\n\n*Payment Terms: Net 30 days. Thank you for your business!*`;
      return { success: true, text: md, filename: `${inputs.invoiceNum}.md` };
    },
  },

  // 2. SaaS CAC / LTV Unit Economics Calculator
  {
    id: 'saas-unit-economics',
    name: 'SaaS CAC & LTV Unit Economics Calculator',
    category: 'business',
    subcategory: 'finance',
    description: 'Calculate Customer Acquisition Cost (CAC), Lifetime Value (LTV), LTV:CAC Ratio, and Payback Period.',
    iconName: 'TrendingUp',
    version: '1.0.0',
    tags: ['saas', 'cac', 'ltv', 'finance', 'startup', 'metrics'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'salesMarketingSpend', label: 'Monthly Sales & Marketing Spend ($)', type: 'number', defaultValue: 50000 },
        { name: 'newCustomers', label: 'New Customers Acquired', type: 'number', defaultValue: 100 },
        { name: 'arpu', label: 'Average Revenue Per User / Month ($)', type: 'number', defaultValue: 150 },
        { name: 'churnRate', label: 'Monthly Churn Rate (%)', type: 'number', defaultValue: 2.5 },
        { name: 'grossMargin', label: 'Gross Margin (%)', type: 'number', defaultValue: 80 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const spend = Number(inputs.salesMarketingSpend || 50000);
      const newCust = Math.max(1, Number(inputs.newCustomers || 100));
      const arpu = Number(inputs.arpu || 150);
      const churn = Math.max(0.1, Number(inputs.churnRate || 2.5)) / 100;
      const margin = Number(inputs.grossMargin || 80) / 100;

      const cac = Math.round(spend / newCust);
      const customerLifespanMonths = 1 / churn;
      const ltv = Math.round((arpu * margin) / churn);
      const ltvToCacRatio = Number((ltv / (cac || 1)).toFixed(2));
      const paybackMonths = Number((cac / (arpu * margin)).toFixed(1));

      const report = {
        cac: `$${cac}`,
        ltv: `$${ltv}`,
        ltvToCacRatio: `${ltvToCacRatio}x`,
        healthBenchmark: ltvToCacRatio >= 3 ? 'Excellent (Strong Unit Economics)' : 'Warning (CAC too high relative to LTV)',
        cacPaybackPeriod: `${paybackMonths} months`,
        avgCustomerLifespan: `${customerLifespanMonths.toFixed(0)} months`,
      };

      return { success: true, data: report, text: JSON.stringify(report, null, 2) };
    },
  },

  // 3. Startup Runway & Burn Rate Forecaster
  {
    id: 'startup-runway-calculator',
    name: 'Startup Runway & Cash Burn Forecaster',
    category: 'business',
    subcategory: 'finance',
    description: 'Calculate net monthly burn rate, zero-cash date, and extended runway scenarios.',
    iconName: 'Flame',
    version: '1.0.0',
    tags: ['runway', 'burn-rate', 'startup', 'cash', 'finance'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'cashBalance', label: 'Current Cash Balance ($)', type: 'number', defaultValue: 750000 },
        { name: 'monthlyRevenue', label: 'Monthly Revenue ($)', type: 'number', defaultValue: 30000 },
        { name: 'monthlyExpenses', label: 'Monthly Expenses ($)', type: 'number', defaultValue: 65000 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const cash = Number(inputs.cashBalance || 750000);
      const rev = Number(inputs.monthlyRevenue || 30000);
      const exp = Number(inputs.monthlyExpenses || 65000);

      const netBurn = exp - rev;
      const runwayMonths = netBurn > 0 ? Number((cash / netBurn).toFixed(1)) : 999;
      const res = {
        currentCash: `$${cash.toLocaleString()}`,
        monthlyNetBurn: `$${netBurn.toLocaleString()}`,
        runwayMonths: netBurn > 0 ? `${runwayMonths} months` : 'Profitable (Infinite Runway)',
        status: runwayMonths < 6 ? 'CRITICAL: Initiate fundraising or cost reduction immediately' : runwayMonths < 12 ? 'Moderate runway' : 'Healthy runway buffer',
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 4. Non-Disclosure Agreement (NDA) Generator
  {
    id: 'nda-generator',
    name: 'Mutual / Unilateral NDA Generator',
    category: 'business',
    subcategory: 'legal',
    description: 'Generate standard standard legal Non-Disclosure Agreements for partnerships and vendor evaluations.',
    iconName: 'Shield',
    version: '1.0.0',
    tags: ['nda', 'legal', 'contract', 'confidentiality', 'business'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'partyA', label: 'Disclosing Party Name', type: 'text', defaultValue: 'EditMee Technologies Inc.' },
        { name: 'partyB', label: 'Receiving Party / Contractor', type: 'text', defaultValue: 'Acme Solutions LLC' },
        { name: 'durationYears', label: 'Confidentiality Term (Years)', type: 'number', defaultValue: 2 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `# MUTUAL NON-DISCLOSURE AGREEMENT (NDA)\n\nThis Agreement is entered into on **${new Date().toLocaleDateString()}** between:\n- **Disclosing Party:** ${inputs.partyA}\n- **Receiving Party:** ${inputs.partyB}\n\n### 1. Confidential Information\nBoth parties agree to hold proprietary technologies, architectures, business models, and trade secrets in strict confidence.\n\n### 2. Term & Survival\nThe obligations under this Agreement shall survive for a period of **${inputs.durationYears || 2} years** from the effective date.\n\n### 3. Governing Law\nThis agreement shall be governed in accordance with the laws of the State of Delaware.\n\n---\n**Signed:**\n\nFor ${inputs.partyA}: _____________________\nFor ${inputs.partyB}: _____________________`;
      return { success: true, text: md, filename: 'NDA_Agreement.md' };
    },
  },

  // 5. Contractor Master Services Agreement (MSA) Drafter
  {
    id: 'contractor-agreement',
    name: 'Independent Contractor Service Agreement',
    category: 'business',
    subcategory: 'legal',
    description: 'Draft independent contractor statements of work with IP assignment and payment milestones.',
    iconName: 'FileCheck',
    version: '1.0.0',
    tags: ['contract', 'freelance', 'msa', 'legal', 'contractor'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'client', label: 'Client Company', type: 'text', defaultValue: 'EditMee Inc.' },
        { name: 'contractor', label: 'Contractor Name', type: 'text', defaultValue: 'Jane Doe' },
        { name: 'rate', label: 'Compensation / Rate', type: 'text', defaultValue: '$150/hr' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `# INDEPENDENT CONTRACTOR SERVICES AGREEMENT\n\n**Client:** ${inputs.client}\n**Contractor:** ${inputs.contractor}\n**Effective Date:** ${new Date().toLocaleDateString()}\n\n### 1. Scope of Work\nContractor agrees to perform software development and consulting services as requested.\n\n### 2. Compensation\nClient shall compensate Contractor at the rate of **${inputs.rate}**, billed bi-weekly.\n\n### 3. Work Product & IP Assignment\nAll inventions, code, designs, and deliverables created under this agreement shall be the exclusive property of the Client (Work for Hire).\n\n---\n**Signatures:**\n\nClient: __________________\nContractor: _______________`;
      return { success: true, text: md, filename: 'Contractor_Agreement.md' };
    },
  },

  // 6. Meeting Minutes & Action Item Formatter
  {
    id: 'meeting-minutes-formatter',
    name: 'Meeting Minutes & Action Item Formatter',
    category: 'business',
    subcategory: 'productivity',
    description: 'Format meeting notes into executive summaries, key decisions made, and assigned action items.',
    iconName: 'Calendar',
    version: '1.0.0',
    tags: ['meeting-minutes', 'notes', 'action-items', 'executive-summary'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'meetingTitle', label: 'Meeting Title', type: 'text', defaultValue: 'Q3 Product & Architecture Sync' },
        { name: 'attendees', label: 'Attendees', type: 'text', defaultValue: 'Sarah, Alex, Marcus, David' },
        { name: 'decisions', label: 'Decisions Made', type: 'textarea', defaultValue: '- Approved client-side WASM engine rollout\n- Set Phase 8 release date for Friday' },
        { name: 'actionItems', label: 'Action Items (Owner: Task)', type: 'textarea', defaultValue: 'Alex: Complete PDF catalog registration\nSarah: Run production benchmark suite' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `# Meeting Minutes: ${inputs.meetingTitle}\n**Date:** ${new Date().toLocaleDateString()} | **Attendees:** ${inputs.attendees}\n\n## 🎯 Key Decisions\n${inputs.decisions}\n\n## 📋 Action Items & Owners\n${inputs.actionItems}\n\n---\n*Recorded via EditMee Executive Suite*`;
      return { success: true, text: md, filename: 'Meeting_Minutes.md' };
    },
  },

  // 7. Product Requirements Document (PRD) Template
  {
    id: 'prd-template-generator',
    name: 'Product Requirements Document (PRD) Builder',
    category: 'business',
    subcategory: 'product',
    description: 'Generate standard engineering PRDs with problem statements, user stories, and acceptance criteria.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['prd', 'product', 'spec', 'engineering', 'user-stories'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'featureName', label: 'Feature / Product Name', type: 'text', defaultValue: 'Universal Workflow Engine' },
        { name: 'problemStatement', label: 'Problem Statement', type: 'textarea', defaultValue: 'Users have 500 isolated tools and lack an automated pipeline builder to chain them together seamlessly.' },
        { name: 'targetUser', label: 'Target Persona', type: 'text', defaultValue: 'Software Engineers, Marketers, Content Teams' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `# PRD: ${inputs.featureName}\n**Author:** Product Lead | **Status:** In Development\n\n## 1. Problem Statement\n${inputs.problemStatement}\n\n## 2. Target User & Persona\n${inputs.targetUser}\n\n## 3. Core Functional Requirements\n- Real-time drag-and-drop workflow canvas\n- Zero cloud latency execution via Web Workers\n- JSON export and shareable pipelines\n\n## 4. Success Metrics & KPIs\n- >99.5% pipeline execution reliability\n- <50ms per-node latency on local operations`;
      return { success: true, text: md, filename: 'PRD.md' };
    },
  },

  // 8. SWOT Analysis Matrix Generator
  {
    id: 'swot-analysis-generator',
    name: 'SWOT Strategic Matrix Builder',
    category: 'business',
    subcategory: 'strategy',
    description: 'Format Strengths, Weaknesses, Opportunities, and Threats into a clean strategic table.',
    iconName: 'Grid',
    version: '1.0.0',
    tags: ['swot', 'strategy', 'business', 'matrix', 'analysis'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'strengths', label: 'Strengths', type: 'textarea', defaultValue: '100% client-side privacy, zero server cost' },
        { name: 'weaknesses', label: 'Weaknesses', type: 'textarea', defaultValue: 'Browser memory ceiling for huge multi-gigabyte files' },
        { name: 'opportunities', label: 'Opportunities', type: 'textarea', defaultValue: 'Enterprise enterprise offline air-gapped security sector' },
        { name: 'threats', label: 'Threats', type: 'textarea', defaultValue: 'Commoditization from generic AI wrappers' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `# SWOT Strategic Analysis\n\n| **Strengths (Internal)** | **Weaknesses (Internal)** |\n|---|---|\n| ${inputs.strengths} | ${inputs.weaknesses} |\n\n| **Opportunities (External)** | **Threats (External)** |\n|---|---|\n| ${inputs.opportunities} | ${inputs.threats} |`;
      return { success: true, text: md };
    },
  },

  // 9. Profit Margin & Markup Calculator
  {
    id: 'profit-margin-calculator',
    name: 'Profit Margin & Markup Pricing Calculator',
    category: 'business',
    subcategory: 'finance',
    description: 'Calculate gross profit margin, markup percentage, and net revenue across product price points.',
    iconName: 'DollarSign',
    version: '1.0.0',
    tags: ['margin', 'markup', 'profit', 'pricing', 'finance'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'cost', label: 'Cost of Goods / Service ($)', type: 'number', defaultValue: 45 },
        { name: 'price', label: 'Selling Price ($)', type: 'number', defaultValue: 120 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const cost = Number(inputs.cost || 45);
      const price = Number(inputs.price || 120);
      const profit = price - cost;
      const margin = (profit / (price || 1)) * 100;
      const markup = (profit / (cost || 1)) * 100;

      const res = {
        cost: `$${cost.toFixed(2)}`,
        sellingPrice: `$${price.toFixed(2)}`,
        grossProfit: `$${profit.toFixed(2)}`,
        grossMargin: `${margin.toFixed(1)}%`,
        markup: `${markup.toFixed(1)}%`,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 10. Break-Even Analysis Calculator
  {
    id: 'break-even-calculator',
    name: 'Break-Even Volume & Revenue Calculator',
    category: 'business',
    subcategory: 'finance',
    description: 'Determine units required to sell before covering all fixed operating costs.',
    iconName: 'Target',
    version: '1.0.0',
    tags: ['break-even', 'finance', 'units', 'fixed-cost', 'pricing'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'fixedCosts', label: 'Total Fixed Costs ($)', type: 'number', defaultValue: 25000 },
        { name: 'unitPrice', label: 'Unit Selling Price ($)', type: 'number', defaultValue: 50 },
        { name: 'unitVariableCost', label: 'Variable Cost per Unit ($)', type: 'number', defaultValue: 15 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const fixed = Number(inputs.fixedCosts || 25000);
      const price = Number(inputs.unitPrice || 50);
      const varCost = Number(inputs.unitVariableCost || 15);

      const contributionMargin = price - varCost;
      const breakEvenUnits = Math.ceil(fixed / (contributionMargin || 1));
      const breakEvenRevenue = breakEvenUnits * price;

      const res = {
        fixedCosts: `$${fixed.toLocaleString()}`,
        contributionMarginPerUnit: `$${contributionMargin.toFixed(2)}`,
        breakEvenUnitsNeeded: breakEvenUnits.toLocaleString(),
        breakEvenRevenue: `$${breakEvenRevenue.toLocaleString()}`,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 11. Privacy Policy Generator
  {
    id: 'privacy-policy-generator',
    name: 'Website Privacy Policy Generator (GDPR / CCPA)',
    category: 'business',
    subcategory: 'legal',
    description: 'Generate standard website privacy policies covering cookies, data storage, and user rights.',
    iconName: 'Shield',
    version: '1.0.0',
    tags: ['privacy-policy', 'gdpr', 'ccpa', 'legal', 'compliance'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'appName', label: 'App / Company Name', type: 'text', defaultValue: 'EditMee' },
        { name: 'contactEmail', label: 'Contact / DPO Email', type: 'text', defaultValue: 'privacy@editmee.app' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `# PRIVACY POLICY\n\n**Last Updated:** ${new Date().toLocaleDateString()}\n\nWelcome to **${inputs.appName}**. We respect your privacy.\n\n### 1. Zero Cloud Data Retention\nAll document operations, conversions, and computations are performed client-side on your local device.\n\n### 2. Cookies & Analytics\nWe only use essential local storage keys to preserve your custom application settings.\n\n### 3. Contact Us\nFor any inquiries regarding data protection, contact: **${inputs.contactEmail}**.`;
      return { success: true, text: md, filename: 'PRIVACY_POLICY.md' };
    },
  },

  // 12. Terms of Service (ToS) Generator
  {
    id: 'terms-of-service-generator',
    name: 'Website Terms of Service (ToS) Generator',
    category: 'business',
    subcategory: 'legal',
    description: 'Generate standard web terms of service with limitation of liability and acceptable use clauses.',
    iconName: 'FileCheck',
    version: '1.0.0',
    tags: ['tos', 'terms', 'legal', 'website', 'disclaimer'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'serviceName', label: 'Service / App Name', type: 'text', defaultValue: 'EditMee Studio' },
        { name: 'governingJurisdiction', label: 'Governing Jurisdiction', type: 'text', defaultValue: 'State of California, USA' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `# TERMS OF SERVICE\n\n**Effective Date:** ${new Date().toLocaleDateString()}\n\nBy accessing **${inputs.serviceName}**, you agree to these Terms.\n\n### 1. License & Permitted Use\nYou are granted a non-exclusive license to use the tools for personal or commercial projects.\n\n### 2. Limitation of Liability\nThe tools are provided "as is" without warranty of any kind.\n\n### 3. Governing Law\nThese terms are governed by the laws of **${inputs.governingJurisdiction}**.`;
      return { success: true, text: md, filename: 'TERMS_OF_SERVICE.md' };
    },
  },

  // 13. Project RACI Matrix Generator
  {
    id: 'raci-matrix-generator',
    name: 'Project Governance RACI Matrix Builder',
    category: 'business',
    subcategory: 'management',
    description: 'Map Responsible, Accountable, Consulted, and Informed stakeholders for project milestones.',
    iconName: 'Users',
    version: '1.0.0',
    tags: ['raci', 'project-management', 'matrix', 'governance', 'roles'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'tasks', label: 'Tasks (Task | R | A | C | I)', type: 'textarea', defaultValue: 'Architecture Design | Lead Architect | VP Eng | Security Lead | Dev Team\nWorkflow Release | Dev Team | Lead Architect | QA Lead | Executive Staff' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines = (inputs.tasks || '').split('\n').filter(Boolean);
      const rows = lines.map((l: string) => {
        const parts = l.split('|').map((c) => c.trim());
        return `| ${parts[0] || ''} | ${parts[1] || ''} | ${parts[2] || ''} | ${parts[3] || ''} | ${parts[4] || ''} |`;
      }).join('\n');

      const md = `| Project Milestone | Responsible (R) | Accountable (A) | Consulted (C) | Informed (I) |\n|---|---|---|---|---|\n${rows}`;
      return { success: true, text: md };
    },
  },

  // 14. Purchase Order (PO) Formatter
  {
    id: 'purchase-order-formatter',
    name: 'Purchase Order (PO) Formatter',
    category: 'business',
    subcategory: 'finance',
    description: 'Format official purchase orders with vendor contacts, shipping methods, and PO line items.',
    iconName: 'ShoppingBag',
    version: '1.0.0',
    tags: ['purchase-order', 'po', 'procurement', 'finance', 'vendor'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'poNumber', label: 'PO Number', type: 'text', defaultValue: 'PO-2026-8910' },
        { name: 'vendorName', label: 'Vendor Name', type: 'text', defaultValue: 'Global Server Components Inc.' },
        { name: 'items', label: 'Items (Item, Qty, Unit Cost)', type: 'textarea', defaultValue: 'Server Rack Mounts, 4, 350\nCat6A 1000ft Spool, 2, 220' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines = (inputs.items || '').split('\n').filter(Boolean);
      let total = 0;
      const rows = lines.map((l: string) => {
        const [name, qtyStr, costStr] = l.split(',').map((c) => c.trim());
        const qty = Number(qtyStr || 1);
        const cost = Number(costStr || 0);
        const lineTotal = qty * cost;
        total += lineTotal;
        return `| ${name} | ${qty} | $${cost.toFixed(2)} | $${lineTotal.toFixed(2)} |`;
      }).join('\n');

      const md = `# PURCHASE ORDER: ${inputs.poNumber}\n**Vendor:** ${inputs.vendorName}\n**Order Date:** ${new Date().toLocaleDateString()}\n\n| Item | Qty | Unit Cost | Total |\n|---|---|---|---|\n${rows}\n\n### **Total Order Value:** $${total.toFixed(2)}`;
      return { success: true, text: md, filename: `${inputs.poNumber}.md` };
    },
  },

  // 15. OKR & KPI Goal Planner
  {
    id: 'okr-goal-planner',
    name: 'OKR (Objectives & Key Results) Formatter',
    category: 'business',
    subcategory: 'management',
    description: 'Format team Objectives and Key Results with measurable quantitative metrics and progress checkpoints.',
    iconName: 'Target',
    version: '1.0.0',
    tags: ['okr', 'kpi', 'goals', 'objectives', 'strategy'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'objective', label: 'Quarterly Objective', type: 'text', defaultValue: 'Establish EditMee as the fastest client-side automation engine.' },
        { name: 'keyResults', label: 'Key Results (one per line)', type: 'textarea', defaultValue: 'KR1: Reach 500 working registered tools\nKR2: Achieve <20ms median execution latency\nKR3: Attain 10,000 active monthly workflow runs' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `# Quarterly OKR\n\n### 🎯 Objective:\n**${inputs.objective}**\n\n### 📊 Key Results:\n${(inputs.keyResults || '').split('\n').map((kr: string) => `- [ ] ${kr}`).join('\n')}`;
      return { success: true, text: md };
    },
  },

  // 16. Business Pitch Deck Slide Outliner
  {
    id: 'pitch-deck-outliner',
    name: '10-Slide Investor Pitch Deck Outliner',
    category: 'business',
    subcategory: 'startup',
    description: 'Generate standard Guy Kawasaki / Sequoia 10-slide venture capital pitch deck outlines.',
    iconName: 'Tv',
    version: '1.0.0',
    tags: ['pitch-deck', 'investor', 'sequoia', 'slides', 'startup'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'companyName', label: 'Startup Name', type: 'text', defaultValue: 'EditMee' },
        { name: 'oneLiner', label: 'One-Sentence Vision', type: 'text', defaultValue: 'The privacy-first client-side operating system for enterprise documents and workflows.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `# ${inputs.companyName} — Pitch Deck Outline\n*${inputs.oneLiner}*\n\n1. **Title & Mission:** ${inputs.oneLiner}\n2. **The Problem:** Cloud document tools are slow, expensive, and leak confidential enterprise data.\n3. **The Solution:** 100% client-side WASM execution with zero server overhead.\n4. **Market Opportunity (TAM):** $35B document processing & workflow market.\n5. **Product & Tech Moat:** 500 specialized tools running on parallel Web Workers.\n6. **Business Model:** Pro seat licenses & Enterprise air-gapped security packages.\n7. **Go-To-Market:** Developer community, bottom-up open source adoption.\n8. **Competitive Advantage:** Zero cloud infra compute cost.\n9. **Leadership Team:** Experienced systems & frontend architects.\n10. **The Ask:** Raising $3.5M Seed to expand enterprise integrations.`;
      return { success: true, text: md, filename: 'Pitch_Deck_Outline.md' };
    },
  },

  // 17. Price Quote / Formal Estimate Formatter
  {
    id: 'price-quote-formatter',
    name: 'Formal Price Quote & Estimate Builder',
    category: 'business',
    subcategory: 'finance',
    description: 'Draft binding project quotations with 30-day expiration windows and scope deliverables.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['quote', 'estimate', 'pricing', 'proposal', 'sales'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'quoteNum', label: 'Quote #', type: 'text', defaultValue: 'QUO-2026-55' },
        { name: 'client', label: 'Prospective Client', type: 'text', defaultValue: 'Apex Media Group' },
        { name: 'deliverables', label: 'Deliverables & Price (Item: Price)', type: 'textarea', defaultValue: 'Core Engine Integration: 8500\nCustom Workflow Nodes (10): 4500\nDeployment Training: 2000' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines = (inputs.deliverables || '').split('\n').filter(Boolean);
      let total = 0;
      const rows = lines.map((l: string) => {
        const [item, priceStr] = l.split(':').map((c) => c.trim());
        const price = Number(priceStr || 0);
        total += price;
        return `| ${item} | $${price.toLocaleString()} |`;
      }).join('\n');

      const md = `# PRICE QUOTATION: ${inputs.quoteNum}\n**Client:** ${inputs.client}\n**Valid Until:** 30 Days from ${new Date().toLocaleDateString()}\n\n| Deliverable | Estimated Cost |\n|---|---|\n${rows}\n\n### **Total Quotation:** $${total.toLocaleString()}`;
      return { success: true, text: md, filename: `${inputs.quoteNum}.md` };
    },
  },

  // 18. Sales Commission Calculator
  {
    id: 'sales-commission-calculator',
    name: 'Tiered Sales Commission Calculator',
    category: 'business',
    subcategory: 'finance',
    description: 'Calculate quota attainment and accelerator commissions across sales rep revenue tiers.',
    iconName: 'Percent',
    version: '1.0.0',
    tags: ['commission', 'sales', 'quota', 'finance', 'accelerator'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'closedRevenue', label: 'Closed Revenue ($)', type: 'number', defaultValue: 140000 },
        { name: 'quota', label: 'Quarterly Quota ($)', type: 'number', defaultValue: 100000 },
        { name: 'baseRate', label: 'Base Commission Rate (%)', type: 'number', defaultValue: 10 },
        { name: 'acceleratorRate', label: 'Over-Quota Accelerator Rate (%)', type: 'number', defaultValue: 18 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const closed = Number(inputs.closedRevenue || 140000);
      const quota = Number(inputs.quota || 100000);
      const baseRate = Number(inputs.baseRate || 10) / 100;
      const accelRate = Number(inputs.acceleratorRate || 18) / 100;

      const attainment = Math.round((closed / (quota || 1)) * 100);
      let commission = 0;
      if (closed <= quota) {
        commission = closed * baseRate;
      } else {
        commission = quota * baseRate + (closed - quota) * accelRate;
      }

      const res = {
        quotaAttainment: `${attainment}%`,
        baseCommission: `$${Math.min(closed, quota) * baseRate}`,
        acceleratedCommission: closed > quota ? `$${(closed - quota) * accelRate}` : '$0',
        totalCommissionPayout: `$${commission.toLocaleString()}`,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 19. Consulting Proposal Builder
  {
    id: 'consulting-proposal-builder',
    name: 'Executive Consulting Proposal Builder',
    category: 'business',
    subcategory: 'sales',
    description: 'Generate client proposals outlining project scope, timeline, milestones, and investment.',
    iconName: 'Award',
    version: '1.0.0',
    tags: ['proposal', 'consulting', 'sales', 'business', 'client'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'client', label: 'Client Organization', type: 'text', defaultValue: 'Global Logistics Corp' },
        { name: 'objective', label: 'Engagement Objective', type: 'textarea', defaultValue: 'Audit existing image compression pipelines and integrate offline WASM workers to save $120K/yr in AWS Lambda fees.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Draft a high-impact, professional consulting proposal for "${inputs.client}". Engagement Objective: ${inputs.objective}. Include Executive Summary, Phases & Timeline, Key Deliverables, and Investment Structure.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response, filename: 'Consulting_Proposal.md' };
    },
  },

  // 20. Return on Investment (ROI) Calculator
  {
    id: 'roi-calculator',
    name: 'Enterprise ROI (Return on Investment) Calculator',
    category: 'business',
    subcategory: 'finance',
    description: 'Calculate net ROI percentage and annualized returns based on initial investment cost and expected gain.',
    iconName: 'TrendingUp',
    version: '1.0.0',
    tags: ['roi', 'investment', 'finance', 'returns', 'business-case'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'investment', label: 'Initial Investment ($)', type: 'number', defaultValue: 50000 },
        { name: 'annualSavings', label: 'Annual Cost Savings / Revenue ($)', type: 'number', defaultValue: 140000 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const inv = Number(inputs.investment || 50000);
      const gain = Number(inputs.annualSavings || 140000);
      const net = gain - inv;
      const roiPercent = ((net / (inv || 1)) * 100).toFixed(1);

      const res = {
        initialInvestment: `$${inv.toLocaleString()}`,
        netFinancialGain: `$${net.toLocaleString()}`,
        roiPercentage: `${roiPercent}%`,
        paybackTimeMonths: ((inv / (gain || 1)) * 12).toFixed(1) + ' months',
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 21. Refund Policy Formatter
  {
    id: 'refund-policy-generator',
    name: 'SaaS & Digital Product Refund Policy Generator',
    category: 'business',
    subcategory: 'legal',
    description: 'Generate 14-day / 30-day money-back guarantee terms for software products.',
    iconName: 'RefreshCw',
    version: '1.0.0',
    tags: ['refund', 'policy', 'saas', 'ecommerce', 'legal'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'productName', label: 'Product Name', type: 'text', defaultValue: 'EditMee Pro' },
        { name: 'days', label: 'Refund Window (Days)', type: 'number', defaultValue: 30 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `# REFUND POLICY — ${inputs.productName}\n\nWe stand behind our software with a **${inputs.days || 30}-day money-back guarantee**.\n\n### How to Request a Refund\nIf you are not 100% satisfied, contact support within ${inputs.days || 30} days of your purchase for a full refund with no questions asked.`;
      return { success: true, text: md, filename: 'REFUND_POLICY.md' };
    },
  },

  // 22. Business Expense Report Formatter
  {
    id: 'expense-report-formatter',
    name: 'Itemized Business Expense Report Formatter',
    category: 'business',
    subcategory: 'finance',
    description: 'Calculate reimbursable travel, meal, and software subscription expense totals.',
    iconName: 'CreditCard',
    version: '1.0.0',
    tags: ['expense', 'report', 'finance', 'receipts', 'accounting'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'employee', label: 'Employee Name', type: 'text', defaultValue: 'Alex Vance' },
        { name: 'expenses', label: 'Expenses (Date, Category, Description, Amount)', type: 'textarea', defaultValue: '2026-08-10, Travel, Flight to Tech Conference, 420.00\n2026-08-11, Meals, Client Dinner, 85.50\n2026-08-12, Software, Annual Cloud IDE License, 120.00' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const lines = (inputs.expenses || '').split('\n').filter(Boolean);
      let total = 0;
      const rows = lines.map((l: string) => {
        const [date, cat, desc, amtStr] = l.split(',').map((c) => c.trim());
        const amt = Number(amtStr || 0);
        total += amt;
        return `| ${date} | ${cat} | ${desc} | $${amt.toFixed(2)} |`;
      }).join('\n');

      const md = `# Expense Report\n**Employee:** ${inputs.employee} | **Date:** ${new Date().toLocaleDateString()}\n\n| Date | Category | Description | Amount |\n|---|---|---|---|\n${rows}\n\n### **Total Reimbursable:** $${total.toFixed(2)}`;
      return { success: true, text: md, filename: 'Expense_Report.md' };
    },
  },

  // 23. Bill of Lading (BOL) Shipping Manifest
  {
    id: 'bill-of-lading-formatter',
    name: 'Bill of Lading (BOL) Logistics Manifest',
    category: 'business',
    subcategory: 'logistics',
    description: 'Format freight carrier bills of lading with consignee addresses and freight classifications.',
    iconName: 'Truck',
    version: '1.0.0',
    tags: ['bol', 'shipping', 'freight', 'logistics', 'manifest'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'bolNum', label: 'BOL Number', type: 'text', defaultValue: 'BOL-98124' },
        { name: 'shipper', label: 'Shipper / Origin', type: 'text', defaultValue: 'EditMee Warehouse #4, Austin, TX' },
        { name: 'consignee', label: 'Consignee / Destination', type: 'text', defaultValue: 'Apex Distribution Center, Chicago, IL' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `# STRAIGHT BILL OF LADING: ${inputs.bolNum}\n**Date:** ${new Date().toLocaleDateString()}\n\n- **Shipper (From):** ${inputs.shipper}\n- **Consignee (To):** ${inputs.consignee}\n\n### Special Instructions\nDeliver during standard dock hours (8:00 AM - 4:00 PM CST). Liftgate required.`;
      return { success: true, text: md, filename: `${inputs.bolNum}.md` };
    },
  },

  // 24. Receipt Generator
  {
    id: 'receipt-generator',
    name: 'Digital Sales Receipt Generator',
    category: 'business',
    subcategory: 'finance',
    description: 'Generate minimal proof-of-payment digital receipts with transaction IDs.',
    iconName: 'Receipt',
    version: '1.0.0',
    tags: ['receipt', 'proof-of-payment', 'transaction', 'sales'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'txnId', label: 'Transaction ID', type: 'text', defaultValue: 'TXN-902184' },
        { name: 'customer', label: 'Customer Name', type: 'text', defaultValue: 'John Appleseed' },
        { name: 'amount', label: 'Amount Paid ($)', type: 'number', defaultValue: 299.00 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `# PAYMENT RECEIPT\n**Transaction ID:** \`${inputs.txnId}\`\n**Date:** ${new Date().toLocaleString()}\n**Customer:** ${inputs.customer}\n\n### **Amount Paid:** $${Number(inputs.amount || 0).toFixed(2)} (PAID IN FULL)\n*Thank you for your business!*`;
      return { success: true, text: md, filename: `${inputs.txnId}.md` };
    },
  },

  // 25. Employee 1-on-1 Agenda Formatter
  {
    id: 'one-on-one-agenda',
    name: 'Manager 1-on-1 Meeting Agenda Formatter',
    category: 'business',
    subcategory: 'management',
    description: 'Format collaborative recurring 1-on-1 agendas covering blockers, career goals, and feedback.',
    iconName: 'Users',
    version: '1.0.0',
    tags: ['one-on-one', 'agenda', 'management', 'mentoring'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'reportName', label: 'Direct Report Name', type: 'text', defaultValue: 'Marcus Chen' },
        { name: 'topics', label: 'Discussion Topics', type: 'textarea', defaultValue: '1. Progress on Phase 8 engine\n2. Career growth toward Staff Engineer\n3. Feedback on recent sprint' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `# 1-on-1 Sync: Manager & ${inputs.reportName}\n**Date:** ${new Date().toLocaleDateString()}\n\n## 📝 Topics for Discussion\n${inputs.topics}\n\n## 🚀 Next Steps & Commitments\n- [ ] Manager follow-ups\n- [ ] Report follow-ups`;
      return { success: true, text: md };
    },
  },
];
