import { ToolDefinition, ToolResult } from '../../types';
import {
  workAssistantTool,
  aiWritingTool,
  aiDocIntelTool,
  aiImageGeneratorTool,
} from '../ai/AiTools';
import { aiGateway } from '../../core/ai-gateway/AiGateway';

export const aiCatalog: ToolDefinition[] = [
  // 1-4: Flagships
  workAssistantTool,
  aiWritingTool,
  aiDocIntelTool,
  aiImageGeneratorTool,

  // 5. AI Text Summarizer
  {
    id: 'ai-summarizer',
    name: 'AI Document Summarizer',
    category: 'ai',
    subcategory: 'nlp',
    description: 'Summarize lengthy articles, research papers, or transcripts into bullet points and executive briefs.',
    iconName: 'Sparkles',
    version: '1.0.0',
    tags: ['ai', 'summarizer', 'bullet-points', 'brief', 'reading', 'llm'],
    executionMode: 'hybrid',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Source Text to Summarize', type: 'textarea', required: true },
        { name: 'style', label: 'Summary Format', type: 'select', defaultValue: 'executive', options: [{ label: 'Executive Brief (3 Key Takeaways)', value: 'executive' }, { label: 'Detailed Bullet Points', value: 'bullets' }, { label: 'Single TL;DR Paragraph', value: 'tldr' }] },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.text) return { success: false, error: 'Please provide text to summarize' };
      const prompt = `Summarize the following text in ${inputs.style || 'executive brief'} format with crystal-clear insights:\n\n${inputs.text}`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response, filename: 'summary.md' };
    },
  },

  // 6. AI Code Explainer & Docstring Generator
  {
    id: 'ai-code-explainer',
    name: 'AI Code Explainer & Documenter',
    category: 'ai',
    subcategory: 'coding',
    description: 'Analyze complex code snippets, explain algorithms step-by-step, and generate typed docstrings.',
    iconName: 'Code',
    version: '1.0.0',
    tags: ['ai', 'code', 'developer', 'explain', 'docstrings', 'refactor'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'code', label: 'Source Code Snippet', type: 'textarea', required: true },
        { name: 'language', label: 'Programming Language', type: 'text', defaultValue: 'TypeScript' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.code) return { success: false, error: 'Please provide code' };
      const prompt = `Explain the logic, time complexity, and edge cases of this ${inputs.language || 'code'} snippet, then provide clean JSDoc/docstrings:\n\n\`\`\`${inputs.language || ''}\n${inputs.code}\n\`\`\``;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 7. AI SQL Query Generator
  {
    id: 'ai-sql-generator',
    name: 'AI Natural Language to SQL Builder',
    category: 'ai',
    subcategory: 'data',
    description: 'Convert plain English business questions into performant PostgreSQL/MySQL queries.',
    iconName: 'Database',
    version: '1.0.0',
    tags: ['ai', 'sql', 'query', 'postgres', 'mysql', 'database'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'question', label: 'Business Question / Requirement', type: 'textarea', required: true, defaultValue: 'Find the top 10 users who spent more than $500 last month, ordered by total spent.' },
        { name: 'schema', label: 'Optional Table Schema / Column Hints', type: 'text', defaultValue: 'users (id, name, email), orders (id, user_id, amount, created_at)' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.question) return { success: false, error: 'Enter a question' };
      const prompt = `Generate a clean, production-ready SQL query based on this prompt:\nRequirement: ${inputs.question}\nSchema info: ${inputs.schema || 'Standard relational'}\nOutput ONLY the SQL code and a brief explanation.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response, filename: 'query.sql' };
    },
  },

  // 8. AI Regex Generator & Explainer
  {
    id: 'ai-regex-generator',
    name: 'AI Regex Generator & Explainer',
    category: 'ai',
    subcategory: 'developer',
    description: 'Generate reliable regular expressions from plain descriptions with test cases and step explanations.',
    iconName: 'FileCode',
    version: '1.0.0',
    tags: ['ai', 'regex', 'pattern', 'matcher', 'validation'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'description', label: 'Pattern Description', type: 'textarea', required: true, defaultValue: 'Match international phone numbers with optional country code and hyphens' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.description) return { success: false, error: 'Provide a description' };
      const prompt = `Create a robust Regular Expression for: "${inputs.description}". Provide the regex pattern, flags, explanation of every capture group, and 3 valid & 3 invalid test examples.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 9. AI Prompt Optimizer & Refiner
  {
    id: 'ai-prompt-optimizer',
    name: 'AI Prompt Engineering Optimizer',
    category: 'ai',
    subcategory: 'prompting',
    description: 'Transform naive user prompts into high-performance system instructions with few-shot constraints.',
    iconName: 'Wand2',
    version: '1.0.0',
    tags: ['ai', 'prompt', 'optimizer', 'engineering', 'llm', 'system-prompt'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'rawPrompt', label: 'Draft / Basic Prompt', type: 'textarea', required: true, defaultValue: 'Write a landing page for my productivity app' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.rawPrompt) return { success: false, error: 'Enter a draft prompt' };
      const prompt = `You are a world-class Prompt Engineer. Rewrite and optimize this prompt using persona definition, clear delimiters, explicit output structure, and edge-case guardrails:\n\n"${inputs.rawPrompt}"`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 10. AI Multi-Language Translator
  {
    id: 'ai-translator',
    name: 'AI Professional Multi-Language Translator',
    category: 'ai',
    subcategory: 'nlp',
    description: 'Context-aware neural translation preserving tone, technical terminology, and colloquial nuances.',
    iconName: 'Globe',
    version: '1.0.0',
    tags: ['ai', 'translate', 'languages', 'localization', 'multilingual'],
    executionMode: 'hybrid',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Text to Translate', type: 'textarea', required: true },
        { name: 'targetLang', label: 'Target Language', type: 'text', required: true, defaultValue: 'Spanish' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.text) return { success: false, error: 'Provide text to translate' };
      const prompt = `Translate the following text accurately to ${inputs.targetLang || 'Spanish'} while preserving technical terms and natural tone:\n\n${inputs.text}`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 11. AI Sentiment & Tone Analyzer
  {
    id: 'ai-sentiment-analyzer',
    name: 'AI Sentiment & Emotional Tone Analyzer',
    category: 'ai',
    subcategory: 'analytics',
    description: 'Score customer feedback, reviews, and emails for sentiment polarity, urgency, and underlying emotions.',
    iconName: 'BarChart3',
    version: '1.0.0',
    tags: ['ai', 'sentiment', 'tone', 'customer-feedback', 'nps', 'reviews'],
    executionMode: 'hybrid',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Review / Message Content', type: 'textarea', required: true },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.text) return { success: false, error: 'Provide text' };
      const prompt = `Analyze the sentiment and tone of this text. Return JSON with keys: "sentiment" (Positive/Neutral/Negative), "score" (0-100), "primaryEmotions" (array), "urgency" (Low/Medium/High), "summary":\n\n"${inputs.text}"`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response, data: response };
    },
  },

  // 12. AI Interview Coach & Mock Questions
  {
    id: 'ai-interview-coach',
    name: 'AI Technical Interview Coach',
    category: 'ai',
    subcategory: 'career',
    description: 'Generate realistic behavioral and technical interview questions with STAR method evaluation rubrics.',
    iconName: 'UserCheck',
    version: '1.0.0',
    tags: ['ai', 'interview', 'career', 'job', 'star-method', 'questions'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'role', label: 'Target Job Title & Seniority', type: 'text', defaultValue: 'Senior Full Stack Engineer' },
        { name: 'topic', label: 'Domain / Focus Area', type: 'text', defaultValue: 'System Design & React Architecture' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Generate 5 top-tier interview questions for a "${inputs.role || 'Software Engineer'}" focusing on "${inputs.topic || 'General'}". Include what top interviewers look for and model STAR answers.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 13. AI Git Conventional Commit Generator
  {
    id: 'ai-git-commit',
    name: 'AI Git Conventional Commit Generator',
    category: 'ai',
    subcategory: 'developer',
    description: 'Generate standardized semantic Conventional Commit messages (feat, fix, refactor) from git diffs.',
    iconName: 'GitCommit',
    version: '1.0.0',
    tags: ['ai', 'git', 'commit', 'conventional-commits', 'developer', 'changelog'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'diff', label: 'Git Diff or Change Description', type: 'textarea', required: true },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.diff) return { success: false, error: 'Provide a diff or change summary' };
      const prompt = `Generate 3 semantic Conventional Commit messages (e.g. feat(auth): ..., fix(pdf): ...) with concise body explanations for this diff:\n\n${inputs.diff}`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 14. AI Grammar & Style Polish
  {
    id: 'ai-grammar-checker',
    name: 'AI Professional Grammar & Style Polisher',
    category: 'ai',
    subcategory: 'writing',
    description: 'Fix grammatical errors, enhance sentence variety, and elevate prose to executive clarity.',
    iconName: 'CheckCircle',
    version: '1.0.0',
    tags: ['ai', 'grammar', 'proofreading', 'style', 'writing', 'editor'],
    executionMode: 'hybrid',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Draft Text', type: 'textarea', required: true },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.text) return { success: false, error: 'Enter text to polish' };
      const prompt = `Review and polish this text. Provide: 1) Polished Version, 2) List of specific grammatical & stylistic fixes made:\n\n${inputs.text}`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 15. AI Structured JSON Extractor
  {
    id: 'ai-json-extractor',
    name: 'AI Structured JSON Entity Extractor',
    category: 'ai',
    subcategory: 'data',
    description: 'Extract typed JSON entities, names, dates, amounts, and metadata from messy unstructured text.',
    iconName: 'Braces',
    version: '1.0.0',
    tags: ['ai', 'json', 'extractor', 'ner', 'parsing', 'structured-data'],
    executionMode: 'hybrid',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Unstructured Text', type: 'textarea', required: true },
        { name: 'schemaHint', label: 'Desired JSON Fields', type: 'text', defaultValue: 'names, dates, amounts, organizations, keyDecisions' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.text) return { success: false, error: 'Provide text' };
      const prompt = `Extract structured JSON matching fields (${inputs.schemaHint || 'all key entities'}) from this text. Output strict JSON only:\n\n${inputs.text}`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response, data: response };
    },
  },

  // 16. AI User Persona Generator
  {
    id: 'ai-persona-generator',
    name: 'AI Customer Persona Generator',
    category: 'ai',
    subcategory: 'marketing',
    description: 'Generate rich target customer personas with demographics, pain points, motivations, and tech stack.',
    iconName: 'Users',
    version: '1.0.0',
    tags: ['ai', 'persona', 'ux', 'product', 'marketing', 'demographics'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'product', label: 'Product / SaaS Concept', type: 'text', defaultValue: 'AI-powered local browser document workstation' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Create 2 detailed user personas for this product: "${inputs.product || 'Product'}". Include Name, Role, Frustrations, Daily Workflow, Buying Triggers, and Key Objections.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 17. AI Cold Outreach Email Drafter
  {
    id: 'ai-cold-email',
    name: 'AI High-Converting Cold Email Drafter',
    category: 'ai',
    subcategory: 'marketing',
    description: 'Craft personalized B2B cold emails tailored for high reply rates and zero spam triggers.',
    iconName: 'Mail',
    version: '1.0.0',
    tags: ['ai', 'email', 'b2b', 'sales', 'outreach', 'copywriting'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'target', label: 'Target Prospect / Title', type: 'text', defaultValue: 'VP of Engineering' },
        { name: 'valueProp', label: 'Core Value Proposition', type: 'textarea', defaultValue: 'Reduce cloud document processing costs by 70% using offline client-side WASM pipelines.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Write a high-converting, concise 4-sentence B2B cold email to a "${inputs.target || 'Executive'}" pitch: "${inputs.valueProp || 'Value proposition'}". Include 3 subject lines.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 18. AI Meeting Action Item Extractor
  {
    id: 'ai-meeting-actions',
    name: 'AI Meeting Action Item Extractor',
    category: 'ai',
    subcategory: 'productivity',
    description: 'Extract assignees, deadlines, and deliverables from rough meeting transcripts or notes.',
    iconName: 'CheckSquare',
    version: '1.0.0',
    tags: ['ai', 'meeting', 'action-items', 'transcripts', 'tasks', 'ownership'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'transcript', label: 'Meeting Transcript / Notes', type: 'textarea', required: true },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.transcript) return { success: false, error: 'Provide meeting notes' };
      const prompt = `Analyze this meeting transcript and extract: 1) Executive Summary, 2) Table of Action Items with [Task, Owner, Deadline, Priority], 3) Key Open Questions:\n\n${inputs.transcript}`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 19. AI Product Description Writer
  {
    id: 'ai-product-desc',
    name: 'AI E-Commerce Product Description Generator',
    category: 'ai',
    subcategory: 'marketing',
    description: 'Generate persuasive, SEO-optimized e-commerce product titles, bullet features, and storytelling copy.',
    iconName: 'ShoppingBag',
    version: '1.0.0',
    tags: ['ai', 'ecommerce', 'product', 'amazon', 'shopify', 'copywriting'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'item', label: 'Product Name / Keywords', type: 'text', defaultValue: 'Ergonomic Mechanical Keyboard' },
        { name: 'features', label: 'Key Features', type: 'textarea', defaultValue: 'Hot-swappable switches, wireless 2.4GHz, RGB backlight, 4000mAh battery' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Write an SEO-optimized product listing for "${inputs.item || 'Product'}". Features: ${inputs.features || 'Standard'}. Include Catchy Title, 5 Amazon-style bullet points, and Emotional Story Description.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 20. AI Technical Spec & PRD Writer
  {
    id: 'ai-prd-builder',
    name: 'AI Product Requirements Document (PRD) Builder',
    category: 'ai',
    subcategory: 'product',
    description: 'Generate full Engineering Product Requirements Documents with user stories, acceptance criteria, and non-functionals.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['ai', 'prd', 'spec', 'product-manager', 'user-stories', 'engineering'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'feature', label: 'Feature Name & Goal', type: 'text', defaultValue: 'Real-time multi-tool automation pipeline builder' },
        { name: 'audience', label: 'Target Users', type: 'text', defaultValue: 'Software Engineers and Data Operations Teams' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Create a formal Product Requirements Document (PRD) for "${inputs.feature || 'Feature'}" targeting "${inputs.audience || 'Users'}". Include: Problem Statement, User Stories with Gherkin Acceptance Criteria, Architecture Diagram Plan, Non-Functional Requirements, and Success Metrics.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response, filename: 'PRD.md' };
    },
  },

  // 21. AI SEO Meta & Title Tag Optimizer
  {
    id: 'ai-seo-meta',
    name: 'AI SEO Meta Title & Description Generator',
    category: 'ai',
    subcategory: 'seo',
    description: 'Generate high-CTR title tags and meta descriptions formatted to Google pixel character boundaries.',
    iconName: 'Search',
    version: '1.0.0',
    tags: ['ai', 'seo', 'meta-tags', 'title-tag', 'ctr', 'google'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'topic', label: 'Page Topic / Main Keyword', type: 'text', defaultValue: 'Fast Local PDF Splitter and Merger' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Generate 5 SEO title options (<60 chars) and 5 meta descriptions (140-155 chars) optimized for high click-through rate for: "${inputs.topic || 'Keyword'}".`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 22. AI Blog Outline & Section Writer
  {
    id: 'ai-blog-outline',
    name: 'AI Long-Form Article & Blog Generator',
    category: 'ai',
    subcategory: 'writing',
    description: 'Generate structured H2/H3 article outlines with authoritative intros and key discussion points.',
    iconName: 'BookOpen',
    version: '1.0.0',
    tags: ['ai', 'blog', 'article', 'outline', 'content', 'writing'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'topic', label: 'Article Topic', type: 'text', defaultValue: 'Why Client-Side WASM is Replacing Heavy Cloud Backends' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Write a comprehensive, engaging article outline and intro for: "${inputs.topic || 'Topic'}". Include H2 headers, bullet arguments, and actionable takeaways.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 23. AI Customer Support Response Drafter
  {
    id: 'ai-support-responder',
    name: 'AI Customer Support Ticket Resolver',
    category: 'ai',
    subcategory: 'business',
    description: 'Draft empathetic, clear, step-by-step customer support replies for troubleshooting and inquiries.',
    iconName: 'MessageSquare',
    version: '1.0.0',
    tags: ['ai', 'support', 'helpdesk', 'tickets', 'customer-service'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'ticket', label: 'Customer Ticket / Complaint', type: 'textarea', required: true, defaultValue: 'I uploaded a 100MB PDF and the compression timed out on my mobile device.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.ticket) return { success: false, error: 'Provide ticket' };
      const prompt = `Draft a polite, highly empathetic customer support resolution for this customer issue:\n\n"${inputs.ticket}"\nInclude clear diagnostic steps and a reassuring tone.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 24. AI Code Refactor & Modernizer
  {
    id: 'ai-code-refactor',
    name: 'AI Code Refactoring & Modernization Engine',
    category: 'ai',
    subcategory: 'coding',
    description: 'Refactor legacy code into modern idioms (clean async/await, strict typing, functional purity).',
    iconName: 'Cpu',
    version: '1.0.0',
    tags: ['ai', 'refactor', 'clean-code', 'modernize', 'typescript', 'performance'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'code', label: 'Code to Refactor', type: 'textarea', required: true },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.code) return { success: false, error: 'Provide code' };
      const prompt = `Refactor and modernize this code. Ensure strict TypeScript types, early returns, clean error handling, and explain the exact architectural improvements:\n\n${inputs.code}`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 25. AI Semantic Diff & Change Summarizer
  {
    id: 'ai-semantic-diff',
    name: 'AI Semantic Release Notes & Diff Summarizer',
    category: 'ai',
    subcategory: 'developer',
    description: 'Generate polished customer-facing changelogs and release notes from technical git change logs.',
    iconName: 'GitPullRequest',
    version: '1.0.0',
    tags: ['ai', 'changelog', 'release-notes', 'diff', 'summarizer'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'commits', label: 'Commit History / Raw Diffs', type: 'textarea', required: true, defaultValue: 'feat: add client-side pdf rotation\nfix: memory leak in batch image worker\nperf: optimize canvas rendering speed' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.commits) return { success: false, error: 'Provide commits' };
      const prompt = `Turn these raw commits into a beautifully formatted release notes changelog with sections [🚀 New Features, 🐛 Bug Fixes, ⚡ Performance Improvements]:\n\n${inputs.commits}`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response, filename: 'CHANGELOG.md' };
    },
  },
];
