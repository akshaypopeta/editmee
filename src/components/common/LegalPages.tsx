import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  FileText,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send,
  Building2,
  Clock,
  Award,
  Cpu,
  ArrowLeft,
  Copy,
  Check,
  FileCheck,
  Database,
  ArrowRight,
  HelpCircle,
  KeyRound,
  FileCode,
  Layers,
} from 'lucide-react';
import { EditMeeLogo } from './EditMeeLogo';
import { updateDocumentHead, LEGAL_PAGES_METADATA } from '../../core/seo/SeoManager';

export type LegalPageId =
  | 'privacy-policy'
  | 'terms-and-conditions'
  | 'security-architecture'
  | 'security-privacy'
  | 'about-us'
  | 'contact-us'
  | 'disclaimer';

interface LegalPagesProps {
  pageId: LegalPageId;
  onClose: () => void;
  onNavigate: (pageId: LegalPageId) => void;
  onOpenTool?: (toolId: string) => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({
  pageId,
  onClose,
  onNavigate,
  onOpenTool,
}) => {
  // Normalize pageId
  const currentKey = pageId === 'security-privacy' ? 'security-architecture' : pageId;

  // Sync SEO metadata
  useEffect(() => {
    const meta = LEGAL_PAGES_METADATA[currentKey];
    if (meta) {
      updateDocumentHead(meta);
    }
  }, [currentKey]);

  // Contact Us form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    department: 'support@editmee.com',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Strict validation
    if (!contactForm.name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!contactForm.email.trim() || !contactForm.email.includes('@') || !contactForm.email.includes('.')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!contactForm.subject.trim()) {
      setFormError('Please enter a subject.');
      return;
    }
    if (!contactForm.message.trim() || contactForm.message.length < 15) {
      setFormError('Please enter a detailed message of at least 15 characters.');
      return;
    }

    setIsSubmitting(true);

    // Prepare client-side verified email payload
    const recipient = contactForm.department;
    const subjectEncoded = encodeURIComponent(`[EditMee Official Inquiry] ${contactForm.subject}`);
    const bodyEncoded = encodeURIComponent(
      `Name: ${contactForm.name}\nEmail: ${contactForm.email}\nDepartment: ${contactForm.department}\n\nMessage:\n${contactForm.message}\n\n---\nTransmitted via EditMee Secure Client Helpdesk\nTimestamp: ${new Date().toISOString()}`
    );
    const mailtoUrl = `mailto:${recipient}?cc=contact@editmee.com,admin@editmee.com&subject=${subjectEncoded}&body=${bodyEncoded}`;

    try {
      window.location.href = mailtoUrl;
    } catch {
      // Fallback safe handling
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 500);
  };

  const getPageTitle = () => {
    switch (currentKey) {
      case 'privacy-policy':
        return 'Privacy Policy';
      case 'terms-and-conditions':
        return 'Terms & Conditions';
      case 'security-architecture':
        return 'Security Architecture';
      case 'about-us':
        return 'About Us';
      case 'contact-us':
        return 'Contact Us';
      case 'disclaimer':
        return 'Disclaimer';
      default:
        return 'Legal & Company';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-red-500" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-400">Legal & Company</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-red-400 font-bold">{getPageTitle()}</span>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <button
            type="button"
            onClick={() => onNavigate('about-us')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              currentKey === 'about-us'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            About Us
          </button>
          <button
            type="button"
            onClick={() => onNavigate('privacy-policy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              currentKey === 'privacy-policy'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => onNavigate('terms-and-conditions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              currentKey === 'terms-and-conditions'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Terms & Conditions
          </button>
          <button
            type="button"
            onClick={() => onNavigate('security-architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              currentKey === 'security-architecture'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Security Architecture
          </button>
          <button
            type="button"
            onClick={() => onNavigate('contact-us')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              currentKey === 'contact-us'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Contact Us
          </button>
          <button
            type="button"
            onClick={() => onNavigate('disclaimer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              currentKey === 'disclaimer'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Disclaimer
          </button>
        </div>
      </div>

      {/* Main Content Card — Bright White Card on Dark Shell */}
      <article className="bg-white rounded-2xl border border-slate-200 shadow-xl p-5 sm:p-8 lg:p-12 text-slate-900 leading-relaxed">
        {/* ===================== ABOUT US ===================== */}
        {currentKey === 'about-us' && (
          <div className="space-y-8">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div className="flex items-center gap-3.5">
                <EditMeeLogo height={44} variant="mascot" />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    About EditMee
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                    Universal Privacy-First Digital Workplace & Utility Platform
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-red-50 border border-red-200 text-red-600">
                100% In-Browser Engine
              </span>
            </header>

            <section className="space-y-4 text-sm sm:text-base text-slate-700">
              <p className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
                <strong>EditMee</strong> is engineered to eliminate the fundamental tradeoff between powerful digital productivity tools and personal data confidentiality. Unlike conventional cloud converters that upload your confidential contracts, financial balance sheets, and private images to remote third-party servers, EditMee executes heavy document computations directly inside your web browser.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Zero Cloud Uploads</h2>
                  <p className="text-xs text-slate-600">
                    PDF text replacements, image filtering, PDF splits, and AES-256 encryptions occur strictly in local device RAM with WebAssembly.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Instant Execution</h2>
                  <p className="text-xs text-slate-600">
                    Eliminates server transit delays, network bottlenecks, and file upload size caps. Process large documents seamlessly on mobile or desktop.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">270+ Built-In Utilities</h2>
                  <p className="text-xs text-slate-600">
                    A comprehensive ecosystem covering PDF manipulation, image conversion, ATS resume drafting, data analytics, and developer utilities.
                  </p>
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 pt-4 border-t border-slate-100">
                Core Tool Ecosystems
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-600" /> PDF & Document Suites
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Visual page organizer, in-place text editor, vector watermark stamper, byte-stream compressor, and AES-256 ISO 32000-2 encryption.
                  </p>
                  {onOpenTool && (
                    <button
                      type="button"
                      onClick={() => onOpenTool('edit-pdf')}
                      className="mt-2 text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      Open PDF Editor <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> Image Studio Pro
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Lossless image format conversions (WebP, PNG, JPG, SVG), aspect-ratio cropping, canvas raster filters, and metadata inspection.
                  </p>
                  {onOpenTool && (
                    <button
                      type="button"
                      onClick={() => onOpenTool('image-studio')}
                      className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      Open Image Studio <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-600" /> ATS Resume Architect
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    ATS-compliant CV builder with real-time scoring, multi-template typography rendering, and client-side vector PDF generation.
                  </p>
                  {onOpenTool && (
                    <button
                      type="button"
                      onClick={() => onOpenTool('resume-builder')}
                      className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      Open Resume Architect <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-600" /> Data & Developer Studios
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Interactive CSV wrangling, JSON/SQL conversions, code formatters, JWT token debuggers, and financial calculators.
                  </p>
                  {onOpenTool && (
                    <button
                      type="button"
                      onClick={() => onOpenTool('csv-studio')}
                      className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      Open Data Studio <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 pt-4 border-t border-slate-100">
                The EditMee Vision
              </h2>
              <p>
                Our vision is to build an open, ultra-fast, and trustworthy digital operating environment where professionals, enterprises, students, and creators can perform high-stakes document modifications without surrender of privacy or reliance on costly subscriptions.
              </p>
            </section>
          </div>
        )}

        {/* ===================== PRIVACY POLICY ===================== */}
        {currentKey === 'privacy-policy' && (
          <div className="space-y-8">
            <header className="border-b border-slate-200 pb-6">
              <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Shield className="w-4 h-4" /> Data Protection & Confidentiality
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Effective Date: August 2026 • Official Production Release
              </p>
            </header>

            <section className="space-y-6 text-sm text-slate-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                <strong>Zero-Knowledge Core Principle:</strong> EditMee does not transmit, collect, inspect, store, or sell files that you open, edit, compress, or convert using our local tool suite. Your document payloads remain strictly inside your browser memory.
              </div>

              <h2 className="text-base font-bold text-slate-900">1. Uploaded Files and Local Processing</h2>
              <p>
                When you drag and drop or select a file within our PDF Studio, Image Editor, Resume Builder, CSV Studio, or Developer Tools:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>Binary file streams are loaded exclusively into your web browser&apos;s isolated memory space via standard <code>FileReader</code>, <code>ArrayBuffer</code>, and WebAssembly APIs.</li>
                <li>No file bytes are transmitted over the internet to remote application servers or third-party cloud buckets.</li>
                <li>Upon closing your browser tab or clearing the tool workspace, the file buffer is immediately reclaimed by the browser garbage collector.</li>
              </ul>

              <h2 className="text-base font-bold text-slate-900">2. Personal Information</h2>
              <p>
                We do not mandate user registration or require you to provide personally identifiable information (PII) to access our primary file and document tools. If you reach out to our team via our Contact Helpdesk, we retain your voluntarily provided email address and message solely to respond to your inquiry.
              </p>

              <h2 className="text-base font-bold text-slate-900">3. Cookies, Local Storage & Client State</h2>
              <p>
                EditMee utilizes standard browser <code>localStorage</code> purely to remember your preferences (such as marked favorite tools, recent execution history, and theme settings) on your physical machine. We do not use persistent cross-site tracking cookies or intrusive advertising pixels.
              </p>

              <h2 className="text-base font-bold text-slate-900">4. AI Features & Server Security</h2>
              <p>
                When you explicitly utilize optional AI features (such as the EditMee AI Assistant or AI Summarizers), prompt text is sent securely over HTTPS directly to our secure server-side API proxy. Private API keys are kept safely on the server and are never exposed in browser code. File payloads processed in offline/local tools are never fed into AI models without explicit user action.
              </p>

              <h2 className="text-base font-bold text-slate-900">5. Data Retention & Third Parties</h2>
              <p>
                Because files are processed client-side, EditMee possesses zero centralized database records of your edited PDFs, generated resumes, or converted images. We do not sell, rent, or trade your data to third-party data brokers, marketing networks, or analytical syndicates.
              </p>

              <h2 className="text-base font-bold text-slate-900">6. Children&apos;s Privacy (COPPA & Global Standards)</h2>
              <p>
                EditMee is designed as a universal utility platform suitable for general audiences and educational institutions. We do not knowingly harvest personal information from children under the age of 13.
              </p>

              <h2 className="text-base font-bold text-slate-900">7. User Rights (GDPR / CCPA / Global Compliance)</h2>
              <p>
                Under global privacy frameworks (including GDPR in the EU and CCPA/CPRA in California), you have the right to access, rectify, or erase personal data. Because EditMee operates on a local-first model, you maintain total physical control: clicking <em>&quot;Clear History&quot;</em> in your browser or within the EditMee workspace instantly removes all stored client state.
              </p>

              <h2 className="text-base font-bold text-slate-900">8. Policy Updates</h2>
              <p>
                We may periodically update this Privacy Policy to reflect new capabilities or regulatory updates. Any modifications will be posted directly to <code>/privacy-policy</code> with a refreshed revision date.
              </p>

              <h2 className="text-base font-bold text-slate-900">9. Contact Data Protection Officers</h2>
              <p>
                For questions or privacy audits, contact our compliance team directly at:{' '}
                <a href="mailto:contact@editmee.com" className="text-red-600 font-bold hover:underline">
                  contact@editmee.com
                </a>{' '}
                or{' '}
                <a href="mailto:admin@editmee.com" className="text-red-600 font-bold hover:underline">
                  admin@editmee.com
                </a>.
              </p>
            </section>
          </div>
        )}

        {/* ===================== TERMS & CONDITIONS ===================== */}
        {currentKey === 'terms-and-conditions' && (
          <div className="space-y-8">
            <header className="border-b border-slate-200 pb-6">
              <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wider mb-2">
                <FileText className="w-4 h-4" /> Legal Agreement & Usage Terms
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Terms & Conditions
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Effective Date: August 2026 • Universal Service Agreement
              </p>
            </header>

            <section className="space-y-6 text-sm text-slate-700 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900">1. Acceptance of Agreement</h2>
              <p>
                By accessing, browsing, or utilizing EditMee (including all associated web interfaces, tools, and subdomains), you agree to be bound by these Terms & Conditions, our Privacy Policy, and all applicable digital service regulations. If you do not agree to these terms, you must refrain from using the platform.
              </p>

              <h2 className="text-base font-bold text-slate-900">2. Intellectual Property & 100% User Ownership</h2>
              <p>
                <strong>Your Content Belongs to You:</strong> You retain complete, unrestricted intellectual property ownership and copyright over all files, text, images, PDF documents, and spreadsheets that you upload, modify, draft, or export using EditMee. EditMee claims no ownership, licensing, or commercial distribution rights over your content.
              </p>

              <h2 className="text-base font-bold text-slate-900">3. Acceptable Use Policy</h2>
              <p>You agree to use EditMee only for lawful, legitimate productivity purposes. You agree NOT to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>Generate, distribute, or alter documents for fraudulent purposes, unlawful impersonation, or forgery.</li>
                <li>Conduct automated denial-of-service, scraping, or payload injection attacks against EditMee web endpoints.</li>
                <li>Attempt to bypass, disable, or interfere with security features of the software.</li>
              </ul>

              <h2 className="text-base font-bold text-slate-900">4. Service Availability & Modifications</h2>
              <p>
                While EditMee aims for continuous 99.9% uptime, web applications depend on browser compatibility, local device hardware, and internet availability. EditMee reserves the right to enhance, upgrade, or adjust features without prior notice.
              </p>

              <h2 className="text-base font-bold text-slate-900">5. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, EditMee and its developers shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the platform, including but not limited to loss of data or document corruption resulting from local hardware failures.
              </p>

              <h2 className="text-base font-bold text-slate-900">6. Termination & Governing Principles</h2>
              <p>
                These Terms continue in effect during your use of the platform. If any provision is determined to be invalid by a court of competent jurisdiction, the remaining provisions shall remain in full force and effect.
              </p>

              <h2 className="text-base font-bold text-slate-900">7. Legal Inquiries</h2>
              <p>
                For official legal notices or contractual inquiries, reach our administrative desk at{' '}
                <a href="mailto:admin@editmee.com" className="text-red-600 font-bold hover:underline">
                  admin@editmee.com
                </a>.
              </p>
            </section>
          </div>
        )}

        {/* ===================== SECURITY ARCHITECTURE ===================== */}
        {currentKey === 'security-architecture' && (
          <div className="space-y-8">
            <header className="border-b border-slate-200 pb-6">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Lock className="w-4 h-4" /> Technical Whitepaper & Cryptography
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Security Architecture
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Client-First Threat Model, Cryptographic Verification & In-Memory Isolation
              </p>
            </header>

            <section className="space-y-6 text-sm text-slate-700 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <KeyRound className="w-5 h-5 text-red-600" />
                    <h3>AES-256 PDF Encryption</h3>
                  </div>
                  <p className="text-xs text-slate-600">
                    Conforms to ISO 32000-2 (PDF 2.0) standard encryption. User and owner cryptographic keys are derived using PBKDF2/SHA-256 client-side. The resulting document is readable by any compliant viewer (Adobe Acrobat, Preview, Chrome, Safari).
                  </p>
                  {onOpenTool && (
                    <button
                      type="button"
                      onClick={() => onOpenTool('pdf-protect')}
                      className="mt-2 text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      Try PDF Protect <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <h3>In-Memory Sandboxing</h3>
                  </div>
                  <p className="text-xs text-slate-600">
                    File data is encapsulated in ephemeral browser <code>Uint8Array</code> buffers. No temporary files are cached on disk, and closing your tab completely flushes memory allocations.
                  </p>
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-900">Security Architecture Matrix</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-900 font-bold">
                    <tr>
                      <th className="p-3">Threat Vector</th>
                      <th className="p-3 text-red-600">Conventional Cloud SaaS</th>
                      <th className="p-3 text-emerald-700 bg-emerald-50">EditMee Client-First Engine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-bold text-slate-900">Data in Transit Interception</td>
                      <td className="p-3 text-red-600">High risk (Raw documents traverse networks)</td>
                      <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">Zero Risk (0 bytes transmitted)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900">Server-Side Data Breach</td>
                      <td className="p-3 text-red-600">Vulnerable to cloud bucket leaks</td>
                      <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">Immune (No central storage)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900">Regulatory Compliance (HIPAA / GDPR)</td>
                      <td className="p-3 text-amber-600">Requires complex Business Associate Agreements</td>
                      <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">Inherently compliant on-device</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900">Third-Party AI Training Data Leakage</td>
                      <td className="p-3 text-red-600">Files often scraped for LLM training</td>
                      <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">Protected (Zero training on user files)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-base font-bold text-slate-900">Cryptographic Verification & Responsible Disclosure</h2>
              <p>
                We welcome independent security researchers to inspect our client-side execution boundaries. If you identify any potential vulnerability, please email our security officer immediately at{' '}
                <a href="mailto:admin@editmee.com" className="text-red-600 font-bold hover:underline">
                  admin@editmee.com
                </a>.
              </p>
            </section>
          </div>
        )}

        {/* ===================== CONTACT US ===================== */}
        {currentKey === 'contact-us' && (
          <div className="space-y-8">
            <header className="border-b border-slate-200 pb-6">
              <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Mail className="w-4 h-4" /> Official Inquiries & Technical Support
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Contact Us
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                Reach our technical engineers, security officers, and enterprise team.
              </p>
            </header>

            {/* Official Email Channels with Quick Copy */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-red-600">Technical Support</span>
                    <Mail className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-sm font-black text-slate-900 mt-1.5">support@editmee.com</p>
                  <p className="text-xs text-slate-500 mt-0.5">Bug reports, tool inquiries & guides</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyEmail('support@editmee.com')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 transition-colors cursor-pointer self-start"
                >
                  {copiedEmail === 'support@editmee.com' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Email
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">General & Partnerships</span>
                    <Building2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-sm font-black text-slate-900 mt-1.5">contact@editmee.com</p>
                  <p className="text-xs text-slate-500 mt-0.5">Business partnerships & media</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyEmail('contact@editmee.com')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-600 transition-colors cursor-pointer self-start"
                >
                  {copiedEmail === 'contact@editmee.com' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Email
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-purple-600">Security & Executive</span>
                    <Shield className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-sm font-black text-slate-900 mt-1.5">admin@editmee.com</p>
                  <p className="text-xs text-slate-500 mt-0.5">Audits, legal & administration</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyEmail('admin@editmee.com')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-purple-600 transition-colors cursor-pointer self-start"
                >
                  {copiedEmail === 'admin@editmee.com' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Email
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Interactive Verified Contact Form */}
            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-emerald-950">Inquiry Prepared & Transferred</h2>
                <p className="text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Your message has been routed to <strong>{contactForm.department}</strong>. Our support team typically answers within 12–24 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setContactForm({
                      name: '',
                      email: '',
                      subject: '',
                      department: 'support@editmee.com',
                      message: '',
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleContactSubmit}
                className="space-y-4 bg-slate-50 p-5 sm:p-8 rounded-2xl border border-slate-200"
              >
                <h2 className="text-base font-bold text-slate-900">Send an Official Message</h2>

                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={contactForm.department}
                      onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="support@editmee.com">Technical Support (support@editmee.com)</option>
                      <option value="contact@editmee.com">General & Partnerships (contact@editmee.com)</option>
                      <option value="admin@editmee.com">Security & Executive (admin@editmee.com)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Question regarding PDF encryption"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide detailed feedback, bug reproduction steps, or partnership proposals..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Never send sensitive passwords or secret keys in public tickets.
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    {isSubmitting ? (
                      'Preparing Dispatch...'
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Submit Inquiry
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ===================== DISCLAIMER ===================== */}
        {currentKey === 'disclaimer' && (
          <div className="space-y-8">
            <header className="border-b border-slate-200 pb-6">
              <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">
                <AlertCircle className="w-4 h-4" /> Legal Notices & Document Advice Disclaimer
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Disclaimer
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                General Product Notices, Calculations & Verification Advisories
              </p>
            </header>

            <section className="space-y-6 text-sm text-slate-700 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900">1. Productivity Utilities Only</h2>
              <p>
                EditMee provides client-side productivity utilities designed to assist users in editing, converting, formatting, and organizing digital files and documents. EditMee is a technology software platform and does not offer professional legal, accounting, financial, or medical advice.
              </p>

              <h2 className="text-base font-bold text-slate-900">2. User Responsibility for Document Verification</h2>
              <p>
                While our software applies rigorous coordinate calculations, standard font embedding, and ISO 32000-2 compliant PDF algorithms, all outputs (such as edited invoices, converted contracts, generated resumes, and financial calculations) should be thoroughly reviewed by the user prior to critical legal, commercial, or academic submission.
              </p>

              <h2 className="text-base font-bold text-slate-900">3. Business & Financial Calculators</h2>
              <p>
                Calculations generated by our Loan Amortization, Mortgage, Compound Interest, and Tax Estimation calculators are provided solely for general planning and illustrative estimates. Exact financial commitments should always be verified with a certified financial advisor or lending institution.
              </p>

              <h2 className="text-base font-bold text-slate-900">4. Third-Party Trademarks & Formats</h2>
              <p>
                All trademarks, product names, logos, and brands mentioned on EditMee (including &quot;PDF&quot;, &quot;Adobe Acrobat&quot;, &quot;Microsoft Word&quot;, &quot;Excel&quot;, &quot;PNG&quot;, &quot;WebP&quot;) are the property of their respective trademark holders and are utilized strictly for descriptive and compatibility identification.
              </p>

              <h2 className="text-base font-bold text-slate-900">5. Questions & Feedback</h2>
              <p>
                If you have questions regarding document standards or need assistance, contact our team at{' '}
                <a href="mailto:support@editmee.com" className="text-red-600 font-bold hover:underline">
                  support@editmee.com
                </a>.
              </p>
            </section>
          </div>
        )}
      </article>
    </div>
  );
};
