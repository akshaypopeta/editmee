import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ToolDefinition, ToolResult } from '../../types';
import { PdfEngine } from '../../core/pdf-engine/PdfEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { aiGateway } from '../../core/ai-gateway/AiGateway';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Download,
  Plus,
  Trash2,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Eye,
  Sliders,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Layers,
  Palette,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface ResumeData {
  personal: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    id: string;
    school: string;
    degree: string;
    gradYear: string;
  }[];
  skills: string[];
  projects: {
    id: string;
    name: string;
    tech: string;
    description: string;
  }[];
}

const INITIAL_RESUME: ResumeData = {
  personal: {
    fullName: 'Alex Vance',
    jobTitle: 'Senior Software Engineer & Architect',
    email: 'alex.vance@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexvance',
    website: 'alexvance.dev',
  },
  summary:
    'Innovative and results-driven Software Engineer with 7+ years of expertise in building scalable cloud-native architectures, high-performance web systems, and client-first productivity applications. Proven track record leading distributed engineering teams.',
  experience: [
    {
      id: '1',
      company: 'TechFlow Systems',
      position: 'Lead Full-Stack Engineer',
      startDate: '2022',
      endDate: 'Present',
      description:
        'Architected high-throughput microservices reducing API latency by 45%. Led a cross-functional team of 8 engineers delivering browser-based tooling to 250k+ active users.',
    },
    {
      id: '2',
      company: 'DataScale Corp',
      position: 'Senior Frontend Developer',
      startDate: '2019',
      endDate: '2022',
      description:
        'Engineered responsive React/TypeScript applications with custom Canvas render engines and Web Workers. Improved application performance benchmarks by 60%.',
    },
  ],
  education: [
    {
      id: '1',
      school: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science',
      gradYear: '2019',
    },
  ],
  skills: [
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'Cloud Architecture',
    'PostgreSQL',
    'Docker',
    'System Design',
  ],
  projects: [
    {
      id: '1',
      name: 'EditMee Studio',
      tech: 'React, TypeScript, WebAssembly',
      description: 'Built client-first multi-tool digital productivity platform with zero-latency browser engines.',
    },
  ],
};

export const ResumeBuilderTool: React.FC = () => {
  const [resume, setResume] = useState<ResumeData>(INITIAL_RESUME);
  const [template, setTemplate] = useState<'modern' | 'minimal' | 'executive'>('modern');
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [isEnhancingSummary, setIsEnhancingSummary] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [scale, setScale] = useState(0.9);
  const [isRendering, setIsRendering] = useState(false);

  // Live Canvas Ref for PDF.js preview
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate ATS Score
  const getAtsScore = () => {
    let score = 35;
    if (resume.personal.fullName && resume.personal.email && resume.personal.phone) score += 20;
    if (resume.summary.length > 80) score += 15;
    if (resume.experience.length >= 2) score += 15;
    if (resume.skills.length >= 5) score += 10;
    if (resume.education.length >= 1) score += 5;
    return Math.min(100, score);
  };

  const atsScore = getAtsScore();

  // Render live PDF to canvas via PdfEngine
  const refreshPdfPreview = async () => {
    if (!canvasRef.current) return;
    setIsRendering(true);
    try {
      const pdfBytes = await PdfEngine.generateResumePdf(resume, template, accentColor);
      const doc = await PdfEngine.loadPdfJsDoc(pdfBytes);
      await PdfEngine.renderPageToCanvas(doc, 1, scale, canvasRef.current);
    } catch (err) {
      console.error('Failed to render live resume PDF preview:', err);
    } finally {
      setIsRendering(false);
    }
  };

  // Re-render preview whenever resume data, template, accent color, or zoom changes
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshPdfPreview();
    }, 150);
    return () => clearTimeout(timer);
  }, [resume, template, accentColor, scale]);

  // AI Summary Enhancement
  const handleAiEnhanceSummary = async () => {
    setIsEnhancingSummary(true);
    try {
      const prompt = `Rewrite and elevate this professional resume summary to make it highly impactful, action-driven, and ATS-optimized for a ${resume.personal.jobTitle}:\n"${resume.summary}"`;
      const enhanced = await aiGateway.generate({ prompt });
      setResume((prev) => ({ ...prev, summary: enhanced.trim() }));
    } catch (e) {
      console.warn('AI summary enhancement issue', e);
    } finally {
      setIsEnhancingSummary(false);
    }
  };

  // Add Experience
  const handleAddExperience = () => {
    setResume((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: String(Date.now()),
          company: 'New Corporation',
          position: 'Senior Engineer',
          startDate: '2023',
          endDate: 'Present',
          description: 'Spearheaded mission-critical software initiatives resulting in increased velocity.',
        },
      ],
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  // Add Skill
  const handleAddSkill = () => {
    if (skillInput.trim() && !resume.skills.includes(skillInput.trim())) {
      setResume((prev) => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setResume((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  // Download PDF using PdfEngine
  const handleExportPdf = async () => {
    try {
      const pdfBytes = await PdfEngine.generateResumePdf(resume, template, accentColor);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const filename = `${(resume.personal.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`;
      FileEngine.downloadBlob(blob, filename);

      storageEngine.addHistoryItem({
        toolId: 'resume-builder',
        toolName: 'Resume Architect',
        category: 'resumes',
        status: 'completed',
        outputFilename: filename,
        outputSummary: `Generated ATS-optimized resume (${template} style, ${atsScore}% ATS score)`,
      });
    } catch (err) {
      console.error('Failed to export resume PDF:', err);
    }
  };

  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  return (
    <div id="resume-builder-workspace" className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-md">
      {/* Top Header Bar */}
      <div className="min-h-14 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 sm:p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              Resume Architect
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
                ATS: {atsScore}%
              </span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
              Live PDF compilation powered by EditMee PDF Engine
            </p>
          </div>
        </div>

        {/* Center Template Picker */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 sm:p-1">
            {(['modern', 'minimal', 'executive'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTemplate(t)}
                className={`px-2 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  template === t ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <span className="text-slate-400 text-[10px] sm:text-[11px]">Color:</span>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-slate-700 bg-transparent cursor-pointer ml-1"
            />
          </div>
        </div>

        {/* Right Actions & Mobile View Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile view toggle */}
          <div className="flex lg:hidden bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setMobileTab('editor')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                mobileTab === 'editor' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                mobileTab === 'preview' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              Preview
            </button>
          </div>

          <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-slate-400">
            <button
              onClick={() => setScale((s) => Math.max(0.5, Number((s - 0.1).toFixed(1))))}
              className="p-1 hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs px-1.5 font-mono text-slate-200">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale((s) => Math.min(1.6, Number((s + 0.1).toFixed(1))))}
              className="p-1 hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleExportPdf}
            className="px-3 sm:px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Download</span> PDF
          </button>
        </div>
      </div>

      {/* Main Split Layout: Editor & Live PDF Engine Stage */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Form Editor */}
        <div className={`w-full lg:w-1/2 bg-slate-900 border-r border-slate-800 p-3 sm:p-4 overflow-y-auto space-y-4 ${
          mobileTab === 'editor' ? 'block' : 'hidden lg:block'
        }`}>
          {/* Personal Information */}
          <div className="bg-slate-950/60 p-3 sm:p-4 rounded-xl border border-slate-800 space-y-3">
            <h2 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <User className="w-4 h-4 text-red-400" /> Contact & Header Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={resume.personal.fullName}
                  onChange={(e) =>
                    setResume((prev) => ({
                      ...prev,
                      personal: { ...prev.personal, fullName: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Professional Title</label>
                <input
                  type="text"
                  value={resume.personal.jobTitle}
                  onChange={(e) =>
                    setResume((prev) => ({
                      ...prev,
                      personal: { ...prev.personal, jobTitle: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={resume.personal.email}
                  onChange={(e) =>
                    setResume((prev) => ({
                      ...prev,
                      personal: { ...prev.personal, email: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Phone</label>
                <input
                  type="text"
                  value={resume.personal.phone}
                  onChange={(e) =>
                    setResume((prev) => ({
                      ...prev,
                      personal: { ...prev.personal, phone: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1">Location & Links</label>
                <input
                  type="text"
                  value={resume.personal.location}
                  placeholder="e.g. San Francisco, CA | linkedin.com/in/alexvance"
                  onChange={(e) =>
                    setResume((prev) => ({
                      ...prev,
                      personal: { ...prev.personal, location: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Summary
              </h2>
              <button
                onClick={handleAiEnhanceSummary}
                disabled={isEnhancingSummary}
                className="px-2.5 py-1 text-xs rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {isEnhancingSummary ? 'Optimizing...' : 'AI Enhance'}
              </button>
            </div>
            <textarea
              rows={3}
              value={resume.summary}
              onChange={(e) => setResume((prev) => ({ ...prev, summary: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-blue-500 outline-none leading-relaxed"
            />
          </div>

          {/* Work Experience */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" /> Experience ({resume.experience.length})
              </h2>
              <button
                onClick={handleAddExperience}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer transition-colors border border-slate-700 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add Job
              </button>
            </div>
            <div className="space-y-3">
              {resume.experience.map((exp, idx) => (
                <div key={exp.id} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={exp.company}
                      placeholder="Company"
                      onChange={(e) => {
                        const copy = [...resume.experience];
                        copy[idx].company = e.target.value;
                        setResume((prev) => ({ ...prev, experience: copy }));
                      }}
                      className="font-semibold bg-transparent text-slate-200 outline-none w-1/2"
                    />
                    <button
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp.position}
                      placeholder="Role Title"
                      onChange={(e) => {
                        const copy = [...resume.experience];
                        copy[idx].position = e.target.value;
                        setResume((prev) => ({ ...prev, experience: copy }));
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-md p-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
                    />
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={exp.startDate}
                        placeholder="Start"
                        onChange={(e) => {
                          const copy = [...resume.experience];
                          copy[idx].startDate = e.target.value;
                          setResume((prev) => ({ ...prev, experience: copy }));
                        }}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-md p-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
                      />
                      <input
                        type="text"
                        value={exp.endDate}
                        placeholder="End"
                        onChange={(e) => {
                          const copy = [...resume.experience];
                          copy[idx].endDate = e.target.value;
                          setResume((prev) => ({ ...prev, experience: copy }));
                        }}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-md p-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={exp.description}
                    placeholder="Key achievements and leadership accomplishments..."
                    onChange={(e) => {
                      const copy = [...resume.experience];
                      copy[idx].description = e.target.value;
                      setResume((prev) => ({ ...prev, experience: copy }));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 text-xs focus:border-blue-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h2 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" /> Skills ({resume.skills.length})
            </h2>
            <div className="flex gap-2 text-xs">
              <input
                type="text"
                value={skillInput}
                placeholder="Add skill (e.g. Next.js, Kubernetes)..."
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:border-blue-500 outline-none"
              />
              <button
                onClick={handleAddSkill}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-xs flex items-center gap-1.5"
                >
                  {s}
                  <button onClick={() => handleRemoveSkill(s)} className="text-slate-500 hover:text-red-400 cursor-pointer">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Stage: Real Live PDF Engine Canvas */}
        <div className={`w-full lg:w-1/2 bg-slate-950 p-4 sm:p-6 overflow-auto flex items-center justify-center relative ${
          mobileTab === 'preview' ? 'block' : 'hidden lg:flex'
        }`}>
          <div className="relative shadow-2xl rounded-lg bg-white overflow-hidden max-w-full">
            <canvas ref={canvasRef} className="block shadow-xl max-w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const resumeBuilderToolDef: ToolDefinition = {
  id: 'resume-builder',
  name: 'Resume Architect & ATS Optimizer',
  description: 'Design professional, ATS-optimized resumes with real-time PDF generation and AI summaries.',
  category: 'resumes',
  subcategory: 'editor',
  iconName: 'FileText',
  version: '2.0.0',
  tags: ['resume', 'cv', 'career', 'ats', 'job', 'pdf', 'flagship'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: true,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: true,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'fullName', label: 'Full Name', type: 'text', defaultValue: 'Alex Vance' },
      { name: 'jobTitle', label: 'Job Title', type: 'text', defaultValue: 'Senior Software Engineer' },
    ],
  },
  outputSchema: {
    type: 'pdf',
    mimeType: 'application/pdf',
    filename: 'resume.pdf',
  },
  customWorkspace: ResumeBuilderTool,
  execute: async (input: any): Promise<ToolResult> => {
    return {
      success: true,
      filename: `${input.fullName || 'Resume'}.pdf`,
    };
  },
};
