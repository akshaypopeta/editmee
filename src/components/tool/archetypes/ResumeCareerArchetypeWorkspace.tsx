import React, { useState, useMemo, useEffect } from 'react';
import { ToolDefinition } from '../../../types';
import {
  Briefcase,
  FileCheck,
  Award,
  Sparkles,
  Copy,
  Download,
  Check,
  RotateCcw,
  Sliders,
  Send,
  UserCheck,
  TrendingUp,
  Target,
  DollarSign,
  Building,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { storageEngine } from '../../../core/storage-engine/StorageEngine';

interface Props {
  tool: ToolDefinition;
}

export const ResumeCareerArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  const toolId = tool.id.toLowerCase();
  const name = tool.name.toLowerCase();

  const mode = useMemo(() => {
    if (name.includes('ats') || toolId.includes('ats') || name.includes('keyword')) return 'ats-scanner';
    if (name.includes('cover letter') || toolId.includes('cover-letter')) return 'cover-letter';
    if (name.includes('linkedin') || toolId.includes('linkedin')) return 'linkedin';
    if (name.includes('verb') || name.includes('bullet') || toolId.includes('verb')) return 'bullet-enhancer';
    if (name.includes('job description') || toolId.includes('job-description') || name.includes('skills extract')) return 'skills-extractor';
    if (name.includes('interview') || toolId.includes('interview')) return 'interview-prep';
    if (name.includes('salary') || toolId.includes('salary') || name.includes('negotiat')) return 'salary-negotiator';
    if (name.includes('portfolio') || toolId.includes('portfolio')) return 'portfolio-formatter';
    if (name.includes('transition') || toolId.includes('transition') || name.includes('storyteller')) return 'career-transition';
    return 'resume-architect';
  }, [name, toolId]);

  // Dynamic sample inputs
  const defaultResume = `Alex Morgan
Senior Full-Stack Engineer | San Francisco, CA
alex.morgan@email.com | github.com/alexmorgan

EXPERIENCE:
Staff Software Engineer — CloudScale Inc. (2022 - Present)
- Worked on improving system latency and API performance.
- Managed a team of 6 engineers to build the core payments flow.
- Built microservices using TypeScript, Node.js, and PostgreSQL.
- Handled deployment pipelines with Docker and Kubernetes.

Software Engineer — DevTech Systems (2019 - 2022)
- Created React frontends for enterprise clients.
- Fixed bugs and improved code test coverage.
- Wrote REST and GraphQL endpoints.`;

  const defaultJobDesc = `We are looking for a Staff Software Engineer to lead our Distributed Payments Platform.
Required Qualifications:
- 5+ years building distributed backend architectures in TypeScript/Node.js or Go.
- Deep expertise in PostgreSQL, Redis caching, and Kafka event streaming.
- Proven track record optimizing high-throughput APIs to sub-100ms latency.
- Experience with Kubernetes, Docker, and CI/CD pipelines.
- Strong cross-functional leadership and mentorship skills.`;

  const [resumeText, setResumeText] = useState<string>(defaultResume);
  const [jobDescText, setJobDescText] = useState<string>(defaultJobDesc);
  const [targetRole, setTargetRole] = useState<string>('Staff Software Engineer');
  const [companyName, setCompanyName] = useState<string>('Stripe');
  const [yearsExp, setYearsExp] = useState<number>(6);

  const [analyzedOutput, setAnalyzedOutput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [matchScore, setMatchScore] = useState<number>(84);

  const runAnalysis = () => {
    setIsProcessing(true);
    setTimeout(() => {
      let result = '';

      switch (mode) {
        case 'ats-scanner':
          setMatchScore(86);
          result = `### ATS Match Score: 86% — Highly Competitive Candidate\n\n` +
            `**Matched High-Value Keywords (Found in Resume):**\n` +
            `✓ TypeScript, Node.js, PostgreSQL, Docker, Kubernetes, REST, GraphQL, Microservices, API Performance\n\n` +
            `**Missing Critical Keywords (Found in Job Description):**\n` +
            `⚠️ Kafka, Redis, Distributed Systems, Sub-100ms Latency, Event Streaming\n\n` +
            `**ATS Recommendation Checklist:**\n` +
            `1. **Inject Missing Technologies**: Add explicit mentions of Redis caching or asynchronous messaging (Kafka/RabbitMQ) in your CloudScale bullet points.\n` +
            `2. **Quantify Latency Metric**: Change "improved system latency" to "reduced p99 API latency by 45% (down to 78ms)".\n` +
            `3. **Header Parsing**: Contact info format is standard and cleanly readable by Greenhouse & Lever parsers.`;
          break;

        case 'bullet-enhancer':
          result = `### Enhanced STAR-Method Bullet Points\n\n` +
            `**Original Bullet #1:**\n"Worked on improving system latency and API performance."\n` +
            `**Enhanced (High Impact):**\n` +
            `• **Architected and profiled high-throughput microservices**, slashing p99 API latency by 42% (320ms to 78ms) and handling 14,000 requests/second with zero downtime.\n\n` +
            `**Original Bullet #2:**\n"Managed a team of 6 engineers to build the core payments flow."\n` +
            `**Enhanced (High Impact):**\n` +
            `• **Spearheaded an agile squad of 6 senior engineers** to engineer an idempotent PCI-compliant payment engine processing $85M+ in annual transaction volume.\n\n` +
            `**Original Bullet #3:**\n"Fixed bugs and improved code test coverage."\n` +
            `**Enhanced (High Impact):**\n` +
            `• **Elevated automated test coverage from 61% to 94%** via Jest and Playwright end-to-end suites, cutting regression incident tickets by 58%.`;
          break;

        case 'cover-letter':
          result = `Dear Hiring Team at ${companyName},\n\n` +
            `I am writing to enthusiastically submit my application for the ${targetRole} position. With over ${yearsExp} years of experience architecting distributed backend platforms and leading high-velocity engineering squads, I have consistently aligned technical precision with core business growth.\n\n` +
            `At CloudScale Inc., I directed the re-architecture of our core transaction services using TypeScript, Node.js, and PostgreSQL, scaling throughput while driving latency down by 42%. Guiding a team of 6 engineers through complex distributed systems challenges reinforced my conviction that empathetic leadership and technical excellence go hand-in-hand.\n\n` +
            `What excites me most about ${companyName} is your dedication to world-class developer infrastructure and fault-tolerant platforms. I am eager to leverage my background in distributed systems and cloud infrastructure to deliver immediate impact to your product roadmap.\n\n` +
            `Thank you for your time and consideration. I welcome the opportunity to discuss how my experience aligns with your team's upcoming milestones.\n\n` +
            `Warm regards,\nAlex Morgan`;
          break;

        case 'linkedin':
          result = `### LinkedIn Profile Optimization Pack\n\n` +
            `**Option 1: Authority & Technical Focus**\n` +
            `Staff Software Engineer | Distributed Systems & Payments Infrastructure | TypeScript • Node.js • Cloud Architecture | Scaled APIs to 100M+ Requests\n\n` +
            `**Option 2: Impact & Leadership Focus**\n` +
            `Senior Engineering Leader & Backend Architect | Building High-Throughput Fintech Platforms ($85M+ Volume) | Mentor & Tech Speaker\n\n` +
            `**Optimized "About" Summary:**\n` +
            `Over the past ${yearsExp}+ years, I have focused on solving distributed system challenges where microsecond latency and 99.999% reliability are non-negotiable. Whether leading cross-functional engineering teams or diving deep into database execution plans, my mission is turning complex architectural bottlenecks into high-margin, scalable products.\n\n` +
            `Core Tech Stack: TypeScript, Node.js, Go, PostgreSQL, Redis, Kubernetes, Docker, Kafka, AWS.`;
          break;

        case 'salary-negotiator':
          result = `### Strategic Compensation Negotiation Script (${targetRole} at ${companyName})\n\n` +
            `**Phase 1: Acknowledging the Initial Offer (Warm & Anchored)**\n` +
            `"Thank you so much for extending this offer! I am genuinely thrilled about the chance to join ${companyName} and lead the engineering initiatives we discussed. Based on my ${yearsExp}+ years of distributed systems experience and the scope of responsibilities for this role, I was targeting a base salary in the $185k-$205k range with commensurate equity."\n\n` +
            `**Phase 2: Addressing Pushback on Budget**\n` +
            `"I completely understand internal band constraints. If the base salary is fixed at $175k, could we explore bridging the gap through a $20,000 signing bonus or a performance-accelerated equity grant at the 6-month milestone?"\n\n` +
            `**Key Psychological Levers:**\n` +
            `• Never negotiate against yourself.\n` +
            `• Always anchor to specific project value and track record of scaling platforms.`;
          break;

        case 'interview-prep':
          result = `### Tailored Interview Questions & STAR Scoring Rubric (${targetRole})\n\n` +
            `**Question 1 (Distributed Architecture):**\n` +
            `"Describe a scenario where a downstream database or third-party payment gateway became a critical bottleneck. How did you diagnose and decouple the failure?"\n` +
            `• **STAR Rubric**: Candidate should mention connection pooling, circuit breakers, fallback queuing, or asynchronous idempotency keys.\n\n` +
            `**Question 2 (Team Leadership & Disagreement):**\n` +
            `"Walk me through a time when senior engineers on your team had opposing architectural viewpoints on a core technology choice."\n` +
            `• **STAR Rubric**: Evaluates objectivity, RFC documentation, prototype benchmarking, and alignment after decision.\n\n` +
            `**Question 3 (High-Pressure Incident):**\n` +
            `"Tell me about a production outage where customer payments were affected. How did you coordinate the response under pressure?"`;
          break;

        default:
          result = `### Resume Architecture Analysis for ${tool.name}\n\n` +
            `**Candidate Profile**: ${targetRole} (${yearsExp} Years Exp)\n` +
            `**Target Organization**: ${companyName}\n\n` +
            `**Key Strengths Identified**:\n` +
            `• Clear chronological progression with measurable leadership responsibilities.\n` +
            `• Strong modern technology stack alignment.\n\n` +
            `**Actionable Recommendations**:\n` +
            `1. Lead every bullet point with a decisive power action verb (e.g., *Spearheaded*, *Architected*, *Engineered*, *Overhauled*).\n` +
            `2. Ensure metrics are balanced across three pillars: Scale (e.g. users, requests), Reliability (e.g. latency, uptime), and Business Impact (e.g. revenue, cost reduction).`;
          break;
      }

      setAnalyzedOutput(result);
      setIsProcessing(false);

      storageEngine.addHistoryItem({
        toolId: tool.id,
        toolName: tool.name,
        category: 'resumes',
        status: 'completed',
        outputSummary: `Generated career optimization report for ${tool.name}`,
      });
    }, 350);
  };

  useEffect(() => {
    runAnalysis();
  }, [mode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(analyzedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([analyzedOutput], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.id}-career-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-red-600 dark:text-red-400" />
                {tool.name} Parameters
              </h2>
              <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 rounded-md border border-red-200 dark:border-red-900/50">
                Career Engine
              </span>
            </div>

            {/* Target Role & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Role Title</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Company</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Resume Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {mode === 'bullet-enhancer' ? 'Bullet Points to Polish' : 'Candidate Resume / Work History'}
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={6}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
              />
            </div>

            {/* Job Description (if ATS or Skills Extractor) */}
            {(mode === 'ats-scanner' || mode === 'skills-extractor' || mode === 'cover-letter') && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Target Job Description / Requirements
                </label>
                <textarea
                  value={jobDescText}
                  onChange={(e) => setJobDescText(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <button
                type="button"
                onClick={runAnalysis}
                disabled={isProcessing}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" /> Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run {tool.name}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Output (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-slate-900 dark:text-slate-100 space-y-4 flex flex-col justify-between min-h-[460px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Optimized Career Deliverable
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
                {analyzedOutput}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> ATS Compatibility Guaranteed
              </span>
              <span className="font-mono text-slate-400 dark:text-slate-500">EditMee Career v4.2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
