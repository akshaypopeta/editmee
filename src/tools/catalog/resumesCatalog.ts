import { ToolDefinition, ToolResult } from '../../types';
import { resumeBuilderToolDef } from '../resumes/ResumeBuilderTool';
import { aiGateway } from '../../core/ai-gateway/AiGateway';

export const resumesCatalog: ToolDefinition[] = [
  // 1. Flagship Resume Builder
  resumeBuilderToolDef,

  // 2. ATS Resume Keyword Scorer
  {
    id: 'ats-resume-scorer',
    name: 'ATS Resume Scorer & Keyword Matcher',
    category: 'resumes',
    subcategory: 'ats',
    description: 'Score resume text against job descriptions to calculate keyword overlap, missing skills, and ATS parsing readiness.',
    iconName: 'Award',
    version: '1.0.0',
    tags: ['resume', 'ats', 'job', 'scorer', 'keywords', 'career'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'resumeText', label: 'Resume Plain Text', type: 'textarea', required: true, defaultValue: 'Experienced Full Stack Engineer proficient in React, TypeScript, Node.js, SQL databases, and cloud infrastructure.' },
        { name: 'jobDescription', label: 'Target Job Description', type: 'textarea', required: true, defaultValue: 'Looking for a Senior TypeScript and React Developer with strong knowledge of Node.js, GraphQL, Docker, and CI/CD pipelines.' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const resume = (inputs.resumeText || '').toLowerCase();
      const jd = (inputs.jobDescription || '').toLowerCase();

      const commonTech = ['react', 'typescript', 'javascript', 'node.js', 'sql', 'python', 'docker', 'kubernetes', 'aws', 'ci/cd', 'graphql', 'rest', 'git', 'tailwind'];
      const jdSkills = commonTech.filter((skill) => jd.includes(skill));
      const matched = jdSkills.filter((skill) => resume.includes(skill));
      const missing = jdSkills.filter((skill) => !resume.includes(skill));

      const score = jdSkills.length > 0 ? Math.round((matched.length / jdSkills.length) * 100) : 85;

      const report = {
        atsMatchScore: `${score}%`,
        grade: score >= 80 ? 'A (Excellent Match)' : score >= 60 ? 'B (Good Match)' : 'C (Needs Keyword Optimization)',
        matchedKeywords: matched,
        missingKeywords: missing,
        recommendations: missing.length > 0 ? `Add bullets showcasing experience with: ${missing.join(', ')}` : 'Strong keyword coverage for ATS scanners.',
      };

      return { success: true, data: report, text: JSON.stringify(report, null, 2) };
    },
  },

  // 3. Cover Letter Generator
  {
    id: 'cover-letter-builder',
    name: 'Tailored Cover Letter Drafter',
    category: 'resumes',
    subcategory: 'writing',
    description: 'Draft customized, compelling cover letters tailored to specific hiring managers and job descriptions.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['cover-letter', 'job', 'application', 'career', 'writing'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'role', label: 'Target Role', type: 'text', defaultValue: 'Senior Frontend Architect' },
        { name: 'company', label: 'Target Company', type: 'text', defaultValue: 'Stripe' },
        { name: 'skills', label: 'Top 3 Highlights / Experience', type: 'textarea', defaultValue: '10 years building high-throughput web apps, expertise in web performance optimization, led team of 8 engineers.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Write a high-impact, modern 3-paragraph cover letter for a "${inputs.role}" position at "${inputs.company}". Candidate highlights: ${inputs.skills}. Tone: Confident, professional, enthusiastic.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response, filename: 'Cover_Letter.md' };
    },
  },

  // 4. LinkedIn Profile Bio & Headline Optimizer
  {
    id: 'linkedin-bio-optimizer',
    name: 'LinkedIn Headline & About Bio Optimizer',
    category: 'resumes',
    subcategory: 'social',
    description: 'Craft high-converting LinkedIn headlines (with search keywords) and engaging first-person About summaries.',
    iconName: 'User',
    version: '1.0.0',
    tags: ['linkedin', 'bio', 'headline', 'career', 'branding'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'currentRole', label: 'Current Title & Specialty', type: 'text', defaultValue: 'Full Stack Engineer | React & Node' },
        { name: 'careerAchievements', label: 'Key Career Milestones', type: 'textarea', defaultValue: 'Scaled platform to 2M monthly active users, reduced server costs by 45%, passionate about open source.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Generate 3 high-impact LinkedIn Headlines (under 220 chars with power keywords) and 1 engaging storytelling "About" section for: ${inputs.currentRole}. Key wins: ${inputs.careerAchievements}.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 5. Resume Action Verb Finder
  {
    id: 'resume-action-verbs',
    name: 'Resume Action Verb & Power Words Finder',
    category: 'resumes',
    subcategory: 'writing',
    description: 'Replace passive phrases (e.g. "responsible for") with active leadership and engineering impact verbs.',
    iconName: 'Zap',
    version: '1.0.0',
    tags: ['action-verbs', 'resume', 'power-words', 'impact', 'bullets'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        {
          name: 'category',
          label: 'Skill / Competency Category',
          type: 'select',
          defaultValue: 'leadership',
          options: [
            { label: 'Leadership & Management', value: 'leadership' },
            { label: 'Engineering & Innovation', value: 'engineering' },
            { label: 'Optimization & Performance', value: 'optimization' },
            { label: 'Research & Problem Solving', value: 'research' },
          ],
        },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const cat = inputs.category || 'leadership';
      const dict: Record<string, string[]> = {
        leadership: ['Spearheaded', 'Orchestrated', 'Championed', 'Mobilized', 'Directed', 'Mentored', 'Pioneered', 'Steered'],
        engineering: ['Architected', 'Engineered', 'Deployed', 'Constructed', 'Refactored', 'Automated', 'Integrated', 'Synthesized'],
        optimization: ['Streamlined', 'Accelerated', 'Consolidated', 'Maximized', 'Augmented', 'Enhanced', 'Revitalized', 'Overhauled'],
        research: ['Diagnosed', 'Formulated', 'Analyzed', 'Uncovered', 'Validated', 'Quantified', 'Benchmarked', 'Audited'],
      };
      const verbs = dict[cat] || dict.leadership;
      return { success: true, data: { category: cat, verbs }, text: JSON.stringify({ category: cat, verbs }, null, 2) };
    },
  },

  // 6. Resume Bullet Point XYZ Impact Polisher
  {
    id: 'resume-bullet-polisher',
    name: 'Resume Bullet Point (Google XYZ) Polisher',
    category: 'resumes',
    subcategory: 'writing',
    description: 'Transform boring bullet points into Google XYZ format: "Accomplished [X] as measured by [Y], by doing [Z]".',
    iconName: 'CheckCircle2',
    version: '1.0.0',
    tags: ['bullets', 'xyz-formula', 'resume', 'google-resume', 'impact'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'bullet', label: 'Draft Bullet Point', type: 'textarea', required: true, defaultValue: 'I worked on the search engine and made queries faster.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Rewrite this draft resume bullet into 3 strong variations following Google's XYZ Formula (Accomplished [X], as measured by [Y], by doing [Z]):\n\n"${inputs.bullet}"`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 7. Tech Stack Badges Generator (Shields.io Markdown)
  {
    id: 'tech-stack-badges',
    name: 'GitHub Tech Stack Badge Generator',
    category: 'resumes',
    subcategory: 'portfolio',
    description: 'Generate colored SVG shields.io Markdown badges for languages, frameworks, and tools.',
    iconName: 'Code',
    version: '1.0.0',
    tags: ['badges', 'shields.io', 'github', 'tech-stack', 'portfolio'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'skills', label: 'Technologies (comma separated)', type: 'text', defaultValue: 'React, TypeScript, Node.js, TailwindCSS, PostgreSQL, Docker' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const skills = (inputs.skills || 'React, TypeScript').split(',').map((s: string) => s.trim()).filter(Boolean);
      const colorMap: Record<string, string> = {
        react: '20232A?logo=react&logoColor=61DAFB',
        typescript: '3178C6?logo=typescript&logoColor=white',
        'node.js': '339933?logo=node.js&logoColor=white',
        tailwindcss: '06B6D4?logo=tailwindcss&logoColor=white',
        postgresql: '4169E1?logo=postgresql&logoColor=white',
        docker: '2496ED?logo=docker&logoColor=white',
      };

      const badges = skills.map((s) => {
        const key = s.toLowerCase();
        const config = colorMap[key] || '000000?logoColor=white';
        return `![${s}](https://img.shields.io/badge/${encodeURIComponent(s)}-${config}&style=for-the-badge)`;
      });

      return { success: true, text: badges.join('\n') };
    },
  },

  // 8. Markdown Developer Portfolio Generator
  {
    id: 'markdown-portfolio-generator',
    name: 'GitHub Profile README & Portfolio Builder',
    category: 'resumes',
    subcategory: 'portfolio',
    description: 'Generate a structured markdown portfolio with about me, projects table, contact links, and stats.',
    iconName: 'FolderGit2',
    version: '1.0.0',
    tags: ['portfolio', 'github', 'readme', 'markdown', 'career'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'name', label: 'Your Name', type: 'text', defaultValue: 'Sarah Jenkins' },
        { name: 'title', label: 'Professional Title', type: 'text', defaultValue: 'Senior Systems & Frontend Architect' },
        { name: 'projects', label: 'Key Projects (Name | Description | Link)', type: 'textarea', defaultValue: 'EditMee | Client-side WASM document tools | https://editmee.app\nFastDiff | Real-time AST syntax diff engine | https://github.com/example/fastdiff' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const projLines = (inputs.projects || '').split('\n').filter(Boolean);
      const projRows = projLines.map((p) => {
        const [n, d, l] = p.split('|').map((c) => c.trim());
        return `| **${n || 'Project'}** | ${d || 'Description'} | [View](${l || '#'}) |`;
      }).join('\n');

      const md = `# Hi there, I'm ${inputs.name || 'Developer'} 👋\n\n### 🚀 ${inputs.title || 'Software Engineer'}\n\n## 🛠️ Featured Projects\n\n| Project | Description | Link |\n|---|---|---|\n${projRows}\n\n---\n*Built with EditMee Portfolio Suite*`;
      return { success: true, text: md, filename: 'README.md' };
    },
  },

  // 9. Career Gap Explainer Drafter
  {
    id: 'career-gap-explainer',
    name: 'Career Gap Explainer Drafter',
    category: 'resumes',
    subcategory: 'career',
    description: 'Frame employment gaps (upskilling, caregiving, sabbatical, freelance) positively and professionally.',
    iconName: 'HelpCircle',
    version: '1.0.0',
    tags: ['career-gap', 'interview', 'resume', 'storytelling'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'reason', label: 'Reason for Gap', type: 'text', defaultValue: '1 year dedicated to intensive cloud architecture certification and building open source tools.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Provide 2 concise, highly confident responses for an interview question: "Can you tell me about this gap on your resume?" Context: ${inputs.reason}.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 10. Interview Thank You Email Drafter
  {
    id: 'interview-thank-you',
    name: 'Post-Interview Thank You Email Drafter',
    category: 'resumes',
    subcategory: 'career',
    description: 'Draft memorable follow-up thank you notes referencing specific discussion points within 24 hours of an interview.',
    iconName: 'Mail',
    version: '1.0.0',
    tags: ['thank-you', 'email', 'interview', 'follow-up'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'interviewer', label: 'Interviewer Name', type: 'text', defaultValue: 'Mark' },
        { name: 'topic', label: 'Key Topic Discussed', type: 'textarea', defaultValue: 'Migrating legacy rendering pipelines to WebAssembly workers and improving first contentful paint.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Write a polished, thoughtful post-interview thank you email to ${inputs.interviewer}. Mention our engaging conversation about: "${inputs.topic}". Keep it under 150 words.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 11. Salary Negotiation Script Builder
  {
    id: 'salary-negotiation-script',
    name: 'Salary & Compensation Negotiation Script',
    category: 'resumes',
    subcategory: 'career',
    description: 'Generate confident negotiation scripts, counter-offers, and equity/bonus questions for job offers.',
    iconName: 'DollarSign',
    version: '1.0.0',
    tags: ['salary', 'negotiation', 'compensation', 'offer', 'career'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'initialOffer', label: 'Initial Offer ($)', type: 'number', defaultValue: 140000 },
        { name: 'targetSalary', label: 'Target Salary ($)', type: 'number', defaultValue: 160000 },
        { name: 'leverage', label: 'Key Leverage / Market Data', type: 'text', defaultValue: 'Extensive expertise in WASM engines, competing second-round interview.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Write a professional salary negotiation email script countering an offer of $${inputs.initialOffer} to request $${inputs.targetSalary}. Leverage: ${inputs.leverage}. Include polite phrasing on signing bonus and equity flexibility.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 12. 30-60-90 Day Plan Generator
  {
    id: '30-60-90-plan',
    name: '30-60-90 Day Onboarding Plan Generator',
    category: 'resumes',
    subcategory: 'career',
    description: 'Create strategic 30-60-90 day milestone roadmaps for executive and engineering job interviews.',
    iconName: 'Calendar',
    version: '1.0.0',
    tags: ['30-60-90', 'plan', 'onboarding', 'leadership', 'interview'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'role', label: 'Job Role', type: 'text', defaultValue: 'Engineering Manager' },
        { name: 'objectives', label: 'Key Team Objectives', type: 'textarea', defaultValue: 'Improve release cadence, audit test coverage, mentor junior engineers.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Generate a structured 30-60-90 Day Plan for a "${inputs.role}". Focus areas: 30 Days (Listen & Learn), 60 Days (Align & Execute), 90 Days (Optimize & Lead). Objectives: ${inputs.objectives}.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response, filename: '30_60_90_Plan.md' };
    },
  },

  // 13. Executive Bio Formatter
  {
    id: 'executive-bio-formatter',
    name: 'Executive & Speaker Short Bio Formatter',
    category: 'resumes',
    subcategory: 'career',
    description: 'Generate 50-word, 100-word, and 250-word third-person biographies for conferences and press.',
    iconName: 'Award',
    version: '1.0.0',
    tags: ['bio', 'executive', 'speaker', 'conference', 'press'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'name', label: 'Full Name', type: 'text', defaultValue: 'David Miller' },
        { name: 'background', label: 'Career Background & Achievements', type: 'textarea', defaultValue: 'CTO with 15 years experience in distributed systems, author of Web Performance Handbook, Angel Investor.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Write 3 third-person executive bios for "${inputs.name}": 1) One-sentence intro, 2) 50-word conference bio, 3) 150-word formal press bio. Info: ${inputs.background}.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 14. Reference Request Email Drafter
  {
    id: 'reference-request-drafter',
    name: 'Professional Reference Request Drafter',
    category: 'resumes',
    subcategory: 'career',
    description: 'Draft polite, respectful reference request messages to former managers and colleagues.',
    iconName: 'MessageCircle',
    version: '1.0.0',
    tags: ['reference', 'colleague', 'manager', 'job-search'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'colleagueName', label: 'Former Colleague / Manager Name', type: 'text', defaultValue: 'Elena' },
        { name: 'targetRole', label: 'Role You Are Applying For', type: 'text', defaultValue: 'Principal Architect at Vercel' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Write a warm, professional email asking ${inputs.colleagueName} if they would be willing to serve as a positive reference for a "${inputs.targetRole}" position. Mention catching up soon.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 15. Freelance Hourly Rate to Annual Salary Calculator
  {
    id: 'freelance-rate-calculator',
    name: 'Freelance Hourly Rate & Billable Hours Calculator',
    category: 'resumes',
    subcategory: 'career',
    description: 'Calculate equivalent hourly billable rates accounting for taxes, health insurance, and 75% billable utilization.',
    iconName: 'Calculator',
    version: '1.0.0',
    tags: ['freelance', 'rate', 'hourly', 'salary', 'contractor'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'targetAnnualIncome', label: 'Desired Net Annual Income ($)', type: 'number', defaultValue: 120000 },
        { name: 'billableHoursPerWeek', label: 'Realistic Billable Hours / Week', type: 'number', defaultValue: 28 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const income = Number(inputs.targetAnnualIncome || 120000);
      const hoursPerWeek = Number(inputs.billableHoursPerWeek || 28);
      const overheadFactor = 1.35; // 35% overhead for self-employment tax, healthcare, unpaid PTO
      const grossTarget = income * overheadFactor;
      const annualBillableHours = hoursPerWeek * 48; // 4 weeks PTO
      const hourlyRate = Math.round(grossTarget / annualBillableHours);

      const res = {
        targetNetIncome: `$${income.toLocaleString()}`,
        estimatedGrossTarget: `$${Math.round(grossTarget).toLocaleString()}`,
        recommendedHourlyRate: `$${hourlyRate}/hour`,
        recommendedDayRate: `$${hourlyRate * 8}/day`,
        annualBillableHours,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 16. Elevator Pitch Generator
  {
    id: 'elevator-pitch-generator',
    name: '30-Second Professional Elevator Pitch Generator',
    category: 'resumes',
    subcategory: 'career',
    description: 'Craft crisp 30-second networking intros that communicate what you build, for whom, and your unique advantage.',
    iconName: 'Mic',
    version: '1.0.0',
    tags: ['elevator-pitch', 'networking', 'intro', 'career'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'profession', label: 'What You Do', type: 'text', defaultValue: 'I build privacy-first client-side web applications' },
        { name: 'impact', label: 'Primary Benefit / Result', type: 'text', defaultValue: 'eliminating cloud infrastructure costs for enterprise document workloads' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Write a punchy, natural 30-second spoken elevator pitch for networking events. Profession: ${inputs.profession}. Result: ${inputs.impact}.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 17. Recruiter InMail Message Drafter
  {
    id: 'recruiter-inmail-drafter',
    name: 'Direct Recruiter Outreach InMail Drafter',
    category: 'resumes',
    subcategory: 'career',
    description: 'Draft polite, high-converting direct messages to hiring managers and talent recruiters on LinkedIn.',
    iconName: 'Send',
    version: '1.0.0',
    tags: ['recruiter', 'inmail', 'outreach', 'hiring', 'linkedin'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'recruiterName', label: 'Recruiter Name', type: 'text', defaultValue: 'Rachel' },
        { name: 'company', label: 'Company', type: 'text', defaultValue: 'Figma' },
        { name: 'role', label: 'Open Job Posting', type: 'text', defaultValue: 'Staff Canvas Performance Engineer' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Write a high-converting 75-word LinkedIn message to recruiter ${inputs.recruiterName} at ${inputs.company} regarding the ${inputs.role} opening. Direct, humble, demonstrating immediate value.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 18. Career Accomplishments Brag Document Tracker
  {
    id: 'brag-document-generator',
    name: 'Quarterly Career "Brag Document" Formatter',
    category: 'resumes',
    subcategory: 'career',
    description: 'Structure quarterly achievements, launches, mentoring, and praise for performance reviews.',
    iconName: 'Trophy',
    version: '1.0.0',
    tags: ['brag-document', 'performance-review', 'promotion', 'achievements'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'quarter', label: 'Review Period', type: 'text', defaultValue: 'Q3 2026' },
        { name: 'launches', label: 'Key Feature Launches', type: 'textarea', defaultValue: '1. Launched Universal Workflow Engine\n2. Reduced image compression worker time by 40%' },
        { name: 'mentorship', label: 'Mentorship & Culture Wins', type: 'textarea', defaultValue: 'Onboarded 2 engineers, ran weekly TypeScript architecture deep dive.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `# Career Impact & Brag Document — ${inputs.quarter}\n\n## 🚀 Shipped Projects & Major Milestones\n${inputs.launches}\n\n## 👥 Leadership, Mentorship & Collaboration\n${inputs.mentorship}\n\n## 📈 Key Metrics & Quantitative Business Results\n- Performance gains validated via client benchmarks\n\n---\n*Created with EditMee Career Engine*`;
      return { success: true, text: md, filename: 'Brag_Document.md' };
    },
  },

  // 19. Case Study Problem-Action-Result (PAR) Builder
  {
    id: 'par-case-study',
    name: 'Portfolio Project Problem-Action-Result (PAR) Builder',
    category: 'resumes',
    subcategory: 'portfolio',
    description: 'Format portfolio projects into structured Problem-Action-Result engineering case studies.',
    iconName: 'FileCheck',
    version: '1.0.0',
    tags: ['par', 'case-study', 'portfolio', 'interview', 'problem-action-result'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'projectName', label: 'Project Name', type: 'text', defaultValue: 'EditMee Local Batch Pipeline' },
        { name: 'problem', label: 'Problem & Bottleneck', type: 'textarea', defaultValue: 'Users needed to convert 500 images simultaneously without uploading gigs of data to a slow server.' },
        { name: 'solution', label: 'Technical Solution & Action', type: 'textarea', defaultValue: 'Engineered multi-threaded Web Workers with OffscreenCanvas and parallel stream chunking.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Format this project into a compelling Problem-Action-Result (PAR) portfolio case study for: "${inputs.projectName}". Problem: ${inputs.problem}. Solution: ${inputs.solution}. Include technical architecture bullets and estimated outcomes.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response, filename: 'Case_Study.md' };
    },
  },

  // 20. Skill Matrix Visualizer & Table
  {
    id: 'skill-matrix-builder',
    name: 'Engineering Skill Matrix & Competency Table',
    category: 'resumes',
    subcategory: 'career',
    description: 'Generate categorized skill tables with proficiency levels (Expert, Proficient, Familiar).',
    iconName: 'Grid',
    version: '1.0.0',
    tags: ['skills', 'matrix', 'competency', 'resume', 'engineering'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'languages', label: 'Programming Languages', type: 'text', defaultValue: 'TypeScript, JavaScript, Rust, Python, Go' },
        { name: 'frameworks', label: 'Frameworks & Libraries', type: 'text', defaultValue: 'React, Node.js, TailwindCSS, Express, Vite' },
        { name: 'infrastructure', label: 'Infra & Databases', type: 'text', defaultValue: 'PostgreSQL, Redis, Docker, GitHub Actions, Cloudflare Workers' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const md = `| Domain | Technologies & Tools |\n|---|---|\n| **Languages** | ${inputs.languages} |\n| **Frameworks** | ${inputs.frameworks} |\n| **Infrastructure & Data** | ${inputs.infrastructure} |`;
      return { success: true, text: md };
    },
  },

  // 21. Promotion Case Builder
  {
    id: 'promotion-case-builder',
    name: 'Engineering Promotion Case Builder',
    category: 'resumes',
    subcategory: 'career',
    description: 'Draft promotion memos demonstrating scope expansion, technical leadership, and business ROI.',
    iconName: 'TrendingUp',
    version: '1.0.0',
    tags: ['promotion', 'memo', 'leadership', 'career-growth'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'currentLevel', label: 'Current Level', type: 'text', defaultValue: 'Senior Software Engineer' },
        { name: 'targetLevel', label: 'Target Level', type: 'text', defaultValue: 'Staff Software Engineer' },
        { name: 'impact', label: 'Major Cross-Team Impact', type: 'textarea', defaultValue: 'Led system architecture overhaul for 3 product squads, established company-wide performance SLAs.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Write a formal promotion case memo for moving from "${inputs.currentLevel}" to "${inputs.targetLevel}". Impact points: ${inputs.impact}. Include sections: Scope of Responsibility, Technical Leadership, Mentorship, and Forward-Looking Goals.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 22. Certification Formatter
  {
    id: 'certification-formatter',
    name: 'Professional Certification Badge Formatter',
    category: 'resumes',
    subcategory: 'career',
    description: 'Format AWS, GCP, CKA, and security credentials with issue dates, credential IDs, and verification URLs.',
    iconName: 'Award',
    version: '1.0.0',
    tags: ['certifications', 'aws', 'gcp', 'resume', 'credentials'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'certName', label: 'Certification Title', type: 'text', defaultValue: 'AWS Certified Solutions Architect – Professional' },
        { name: 'issuer', label: 'Issuing Organization', type: 'text', defaultValue: 'Amazon Web Services' },
        { name: 'date', label: 'Issue Date', type: 'text', defaultValue: 'Aug 2025' },
        { name: 'credId', label: 'Credential ID', type: 'text', defaultValue: 'AWS-PSA-982341' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const text = `**${inputs.certName}** — ${inputs.issuer}\n*Issued ${inputs.date} · Credential ID: \`${inputs.credId}\`*`;
      return { success: true, text };
    },
  },

  // 23. Job Fit Score & Gap Analysis
  {
    id: 'job-fit-analyzer',
    name: 'Job Description Match & Gap Analysis',
    category: 'resumes',
    subcategory: 'ats',
    description: 'Evaluate fit percentage and identify gaps between candidate background and job requirements.',
    iconName: 'UserCheck',
    version: '1.0.0',
    tags: ['job-fit', 'gap-analysis', 'career', 'matching'],
    executionMode: 'hybrid',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: true,
    capabilities: { clientSide: false, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: true, offlineReady: false, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'background', label: 'Candidate Experience', type: 'textarea', required: true, defaultValue: '8 years building React SPAs, Node APIs, PostgreSQL databases.' },
        { name: 'requirements', label: 'Job Requirements', type: 'textarea', required: true, defaultValue: 'Looking for 7+ years fullstack web, deep WebAssembly knowledge, distributed systems.' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const prompt = `Perform a comprehensive Job Fit and Gap Analysis comparing Candidate: "${inputs.background}" against Job: "${inputs.requirements}". Include Match Score (0-100%), Strongest Strengths, Core Gaps, and Suggested Bridge Talking Points.`;
      const response = await aiGateway.generate({ prompt });
      return { success: true, text: response };
    },
  },

  // 24. Resume Plain-Text ASCII Cleaner
  {
    id: 'resume-ascii-cleaner',
    name: 'Resume Plain-Text ASCII Sanitizer',
    category: 'resumes',
    subcategory: 'ats',
    description: 'Strip smart quotes, non-standard bullets, em-dashes, and unicode symbols that break legacy ATS parsers.',
    iconName: 'CheckCircle',
    version: '1.0.0',
    tags: ['ats', 'cleaner', 'ascii', 'sanitize', 'resume'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Raw Resume Text', type: 'textarea', required: true, defaultValue: '• Engineered “next-gen” pipelines — boosting speed by 50%…' },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      const clean = (inputs.text || '')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-')
        .replace(/\u2026/g, '...')
        .trim();
      return { success: true, text: clean };
    },
  },

  // 25. Resume Keyword Density Checker
  {
    id: 'resume-keyword-density',
    name: 'Resume Keyword Density & Term Frequency Checker',
    category: 'resumes',
    subcategory: 'ats',
    description: 'Inspect word repetition counts to avoid keyword stuffing penalties on modern ATS algorithms.',
    iconName: 'Search',
    version: '1.0.0',
    tags: ['keyword-density', 'ats', 'repetition', 'seo', 'resume'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Resume Text', type: 'textarea', required: true, defaultValue: 'Led team in React development. Built React architecture. Scaled React components across teams.' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const text = (inputs.text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
      const words = text.split(/\s+/).filter((w) => w.length > 3);
      const counts: Record<string, number> = {};
      words.forEach((w) => {
        counts[w] = (counts[w] || 0) + 1;
      });
      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({ word, count, density: `${((count / (words.length || 1)) * 100).toFixed(1)}%` }));
      return { success: true, data: sorted, text: JSON.stringify(sorted, null, 2) };
    },
  },
];
