import React, { useState, useMemo, useEffect } from 'react';
import { ToolDefinition } from '../../../types';
import {
  Briefcase,
  FileText,
  DollarSign,
  Globe,
  Search,
  CheckCircle2,
  Copy,
  Download,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Code,
  Shield,
  Tag,
  Share2,
  Printer,
  Sparkles,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import { storageEngine } from '../../../core/storage-engine/StorageEngine';

interface Props {
  tool: ToolDefinition;
}

interface InvoiceItem {
  id: string;
  desc: string;
  qty: number;
  rate: number;
}

export const BusinessSeoArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  const toolId = tool.id.toLowerCase();
  const name = tool.name.toLowerCase();

  // Route to the appropriate sub-engine
  const mode = useMemo(() => {
    // 1. Business & Commerce
    if (name.includes('invoice') || toolId.includes('invoice')) return 'invoice';
    if (name.includes('receipt') || toolId.includes('receipt')) return 'receipt';
    if (name.includes('purchase order') || toolId.includes('purchase-order')) return 'purchase-order';
    if (name.includes('nda') || toolId.includes('nda') || name.includes('disclosure')) return 'nda';
    if (name.includes('service agreement') || toolId.includes('service-agreement') || name.includes('freelance')) return 'service-agreement';
    if (name.includes('bill of sale') || toolId.includes('bill-of-sale')) return 'bill-of-sale';
    if (name.includes('signature') || toolId.includes('signature')) return 'email-signature';
    if (name.includes('swot') || toolId.includes('swot')) return 'swot';

    // 2. SEO & Webmaster Suite
    if (name.includes('pixel width') || toolId.includes('pixel-width') || name.includes('serp')) return 'serp-preview';
    if (name.includes('schema') || toolId.includes('schema')) return 'schema-generator';
    if (name.includes('robots') || toolId.includes('robots')) return 'robots-builder';
    if (name.includes('security.txt') || toolId.includes('security-txt')) return 'security-txt';
    if (name.includes('humans.txt') || toolId.includes('humans-txt')) return 'humans-txt';
    if (name.includes('ads.txt') || toolId.includes('ads-txt')) return 'ads-txt';
    if (name.includes('keyword density') || toolId.includes('keyword-density')) return 'keyword-density';
    if (name.includes('utm') || toolId.includes('utm')) return 'utm-builder';
    if (name.includes('privacy policy') || toolId.includes('privacy-policy') || name.includes('gdpr')) return 'privacy-policy';
    if (name.includes('terms') || toolId.includes('terms')) return 'terms-of-service';
    if (name.includes('cookie') || toolId.includes('cookie')) return 'cookie-policy';
    if (name.includes('canonical') || toolId.includes('canonical')) return 'canonical-auditor';
    if (name.includes('hreflang') || toolId.includes('hreflang')) return 'hreflang-generator';

    return 'invoice'; // fallback commercial generator
  }, [name, toolId]);

  // Invoice / Receipt State
  const [invNumber, setInvNumber] = useState('INV-2026-001');
  const [invDate, setInvDate] = useState('2026-09-05');
  const [invDueDate, setInvDueDate] = useState('2026-09-19');
  const [fromCompany, setFromCompany] = useState('Acme Studio LLC\n100 Tech Blvd, Suite 400\nSan Francisco, CA 94107\nbilling@acmestudio.com');
  const [toClient, setToClient] = useState('Global Enterprise Partners\n850 Madison Ave\nNew York, NY 10022\naccounts@globalep.com');
  const [taxPercent, setTaxPercent] = useState(8.5);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: '1', desc: 'Enterprise Web Application Architecture & Design', qty: 1, rate: 3500 },
    { id: '2', desc: 'Client-Side Cryptography & Security Hardening', qty: 1, rate: 2200 },
    { id: '3', desc: 'Performance Benchmarking & Latency Profiling', qty: 12, rate: 150 },
  ]);

  // Email Signature State
  const [sigName, setSigName] = useState('Sarah Jenkins');
  const [sigTitle, setSigTitle] = useState('VP of Product Engineering');
  const [sigCompany, setSigCompany] = useState('EditMee Technologies');
  const [sigPhone, setSigPhone] = useState('+1 (555) 349-2810');
  const [sigEmail, setSigEmail] = useState('sarah.jenkins@editmee.com');
  const [sigWebsite, setSigWebsite] = useState('https://editmee.com');

  // SERP State
  const [serpTitle, setSerpTitle] = useState('EditMee Studio — 1,190+ Private Client-Side Tools');
  const [serpDesc, setSerpDesc] = useState('Explore the ultimate browser-first utility suite. Process PDFs, images, code, cryptography, and audio locally with zero data ever uploaded to external servers.');
  const [serpUrl, setSerpUrl] = useState('https://editmee.com/tools/studio');

  // UTM State
  const [utmBase, setUtmBase] = useState('https://editmee.com/pricing');
  const [utmSource, setUtmSource] = useState('newsletter');
  const [utmMedium, setUtmMedium] = useState('email');
  const [utmCampaign, setUtmCampaign] = useState('q3_launch_2026');
  const [utmContent, setUtmContent] = useState('header_cta_button');

  // Policy / Legal State
  const [legalCompanyName, setLegalCompanyName] = useState('EditMee Inc.');
  const [legalWebsite, setLegalWebsite] = useState('https://editmee.com');
  const [legalJurisdiction, setLegalJurisdiction] = useState('State of Delaware, United States');

  const [copied, setCopied] = useState(false);

  // Invoice calculations
  const subtotal = useMemo(() => {
    return invoiceItems.reduce((sum, item) => sum + item.qty * item.rate, 0);
  }, [invoiceItems]);

  const taxVal = useMemo(() => {
    return (subtotal * taxPercent) / 100;
  }, [subtotal, taxPercent]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal + taxVal - discountAmount);
  }, [subtotal, taxVal, discountAmount]);

  // Invoice Item handlers
  const handleAddItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { id: Date.now().toString(), desc: 'Consulting & Engineering Deliverables', qty: 1, rate: 500 },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((i) => i.id !== id));
    }
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, val: any) => {
    setInvoiceItems(
      invoiceItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  // SERP Pixel calculations
  const titlePixelWidth = useMemo(() => {
    return Math.round(serpTitle.length * 9.6);
  }, [serpTitle]);

  const descPixelWidth = useMemo(() => {
    return Math.round(serpDesc.length * 6.2);
  }, [serpDesc]);

  // UTM Generated Link
  const generatedUtmUrl = useMemo(() => {
    try {
      const url = new URL(utmBase.startsWith('http') ? utmBase : `https://${utmBase}`);
      if (utmSource) url.searchParams.set('utm_source', utmSource);
      if (utmMedium) url.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign);
      if (utmContent) url.searchParams.set('utm_content', utmContent);
      return url.toString();
    } catch {
      return `${utmBase}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;
    }
  }, [utmBase, utmSource, utmMedium, utmCampaign, utmContent]);

  // Schema.org Code
  const generatedSchemaJson = useMemo(() => {
    if (name.includes('faq')) {
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Are my files uploaded to your servers?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. EditMee processes 100% of your documents, images, and audio locally in your browser memory via Web Workers and WebAssembly.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is EditMee compliant with GDPR and HIPAA?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Because zero data ever leaves your device, compliance is maintained by design without data transfer liability.',
              },
            },
          ],
        },
        null,
        2
      );
    }
    return JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: legalCompanyName,
        url: legalWebsite,
        logo: `${legalWebsite}/logo.png`,
        sameAs: ['https://twitter.com/editmee', 'https://github.com/editmee', 'https://linkedin.com/company/editmee'],
      },
      null,
      2
    );
  }, [name, legalCompanyName, legalWebsite]);

  // Copy handler
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download printable invoice
  const handleDownloadInvoice = () => {
    window.print();
    storageEngine.addHistoryItem({
      toolId: tool.id,
      toolName: tool.name,
      category: 'business',
      status: 'completed',
      outputSummary: `Printed/Exported ${tool.name} for ${toClient.split('\n')[0]} ($${totalAmount.toFixed(2)})`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Commercial Invoice & Receipt Engine */}
      {(mode === 'invoice' || mode === 'receipt' || mode === 'purchase-order') && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6 text-slate-900 dark:text-slate-100">
            {/* Action Bar Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                  {mode === 'purchase-order' ? 'Commercial Purchase Order Builder' : 'Commercial Invoice & Receipt Studio'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Itemized billing with automatic tax calculation and printable clean layout
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / Save as PDF
                </button>
              </div>
            </div>

            {/* Document Meta Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Document ID</label>
                <input
                  type="text"
                  value={invNumber}
                  onChange={(e) => setInvNumber(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Issue Date</label>
                <input
                  type="date"
                  value={invDate}
                  onChange={(e) => setInvDate(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Payment Due Date</label>
                <input
                  type="date"
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Currency</label>
                <select
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                >
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="¥">JPY (¥)</option>
                  <option value="C$">CAD (C$)</option>
                </select>
              </div>
            </div>

            {/* From / To Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">From (Vendor / Provider)</label>
                <textarea
                  value={fromCompany}
                  onChange={(e) => setFromCompany(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-sans leading-relaxed text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Bill To (Client / Customer)</label>
                <textarea
                  value={toClient}
                  onChange={(e) => setToClient(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-sans leading-relaxed text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Itemized Line Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Line Items</span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 w-20 text-center">Qty</th>
                      <th className="p-3 w-32 text-right">Unit Rate</th>
                      <th className="p-3 w-32 text-right">Amount</th>
                      <th className="p-3 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {invoiceItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.desc}
                            onChange={(e) => handleUpdateItem(item.id, 'desc', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-red-500 rounded text-xs font-medium text-slate-900 dark:text-slate-100"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleUpdateItem(item.id, 'qty', Math.max(1, Number(e.target.value)))}
                            className="w-full px-2 py-1.5 text-center bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-red-500 rounded text-xs font-bold text-slate-900 dark:text-slate-100"
                          />
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-slate-400">{currencySymbol}</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.rate}
                              onChange={(e) => handleUpdateItem(item.id, 'rate', Math.max(0, Number(e.target.value)))}
                              className="w-24 px-2 py-1.5 text-right bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-red-500 rounded text-xs font-bold text-slate-900 dark:text-slate-100"
                            />
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {currencySymbol}{(item.qty * item.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex justify-end pt-2">
              <div className="w-full max-w-xs space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {currencySymbol}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    Tax Rate (%)
                    <input
                      type="number"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(Math.max(0, Number(e.target.value)))}
                      className="w-14 px-1.5 py-0.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded text-right font-mono text-slate-900 dark:text-slate-100"
                    />
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {currencySymbol}{taxVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Discount</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">{currencySymbol}</span>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                      className="w-16 px-1.5 py-0.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded text-right font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-300 dark:border-slate-700">
                  <span>Total Due</span>
                  <span className="font-mono text-red-600 dark:text-red-400">
                    {currencySymbol}{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SEO SERP Preview & Pixel Meter */}
      {mode === 'serp-preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                SERP Metadata Editor
              </h2>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>SEO Title Tag</span>
                  <span className={`font-mono text-[11px] ${titlePixelWidth > 580 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {titlePixelWidth}px / ~580px limit ({serpTitle.length} chars)
                  </span>
                </div>
                <input
                  type="text"
                  value={serpTitle}
                  onChange={(e) => setSerpTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Meta Description</span>
                  <span className={`font-mono text-[11px] ${descPixelWidth > 960 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {descPixelWidth}px / ~960px limit ({serpDesc.length} chars)
                  </span>
                </div>
                <textarea
                  value={serpDesc}
                  onChange={(e) => setSerpDesc(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs leading-relaxed text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Canonical Target URL</label>
                <input
                  type="text"
                  value={serpUrl}
                  onChange={(e) => setSerpUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block border-b border-slate-200 dark:border-slate-800 pb-2">
                Google Search Results Snippet Preview
              </span>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 font-sans">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{serpUrl}</span>
                </div>
                <h3 className="text-base font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer leading-snug">
                  {titlePixelWidth > 580 ? `${serpTitle.slice(0, 58)}...` : serpTitle}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {descPixelWidth > 960 ? `${serpDesc.slice(0, 155)}...` : serpDesc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Desktop & Mobile Spec Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. HTML Email Signature Builder */}
      {mode === 'email-signature' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                Signature Information
              </h2>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={sigName}
                  onChange={(e) => setSigName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Professional Title</label>
                <input
                  type="text"
                  value={sigTitle}
                  onChange={(e) => setSigTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Company Name</label>
                <input
                  type="text"
                  value={sigCompany}
                  onChange={(e) => setSigCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={sigEmail}
                  onChange={(e) => setSigEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <input
                  type="text"
                  value={sigPhone}
                  onChange={(e) => setSigPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Live HTML Signature Preview
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const html = `<div><strong style="color:#0f172a;font-size:16px;">${sigName}</strong><br/><span style="color:#64748b;font-size:13px;">${sigTitle} | ${sigCompany}</span><br/><br/><span style="color:#0f172a;font-size:12px;">📞 ${sigPhone} | ✉️ ${sigEmail} | 🌐 ${sigWebsite}</span></div>`;
                    handleCopy(html);
                  }}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'HTML Copied' : 'Copy HTML Signature'}</span>
                </button>
              </div>

              {/* Rendered signature card */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="border-l-4 border-red-600 pl-4 space-y-1">
                  <div className="text-base font-bold text-slate-900 dark:text-white">{sigName}</div>
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{sigTitle} • {sigCompany}</div>
                  <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-0.5 font-mono">
                    <div>Phone: {sigPhone}</div>
                    <div>Email: {sigEmail}</div>
                    <div>Web: {sigWebsite}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. UTM Link Campaign Builder */}
      {mode === 'utm-builder' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
            Batch Campaign UTM Link Builder
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Website Destination URL</label>
              <input
                type="text"
                value={utmBase}
                onChange={(e) => setUtmBase(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Campaign Source (utm_source)</label>
              <input
                type="text"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Campaign Medium (utm_medium)</label>
              <input
                type="text"
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Campaign Name (utm_campaign)</label>
              <input
                type="text"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Campaign Content (utm_content)</label>
              <input
                type="text"
                value={utmContent}
                onChange={(e) => setUtmContent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-xl text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Sanitized Trackable URL</span>
              <button
                type="button"
                onClick={() => handleCopy(generatedUtmUrl)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-emerald-300 break-all">{generatedUtmUrl}</div>
          </div>
        </div>
      )}

      {/* 5. Schema.org JSON-LD Generator */}
      {mode === 'schema-generator' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Structured Data JSON-LD Rich Snippet Generator
            </h2>
            <button
              type="button"
              onClick={() => handleCopy(generatedSchemaJson)}
              className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON-LD'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto">
            {`<script type="application/ld+json">\n${generatedSchemaJson}\n</script>`}
          </pre>
        </div>
      )}
    </div>
  );
};
