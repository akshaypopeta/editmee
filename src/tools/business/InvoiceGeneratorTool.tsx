import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ToolDefinition, ToolResult } from '../../types';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Receipt,
  Download,
  Plus,
  Trash2,
  Building,
  User,
  CreditCard,
  Printer,
  Sparkles,
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  company: {
    name: string;
    email: string;
    address: string;
    taxId: string;
  };
  client: {
    name: string;
    email: string;
    address: string;
    taxId: string;
  };
  items: InvoiceItem[];
  taxRatePercent: number;
  discountPercent: number;
  notes: string;
}

const INITIAL_INVOICE: InvoiceData = {
  invoiceNumber: 'INV-2026-0042',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  currency: '$',
  company: {
    name: 'EditMee Technologies Inc.',
    email: 'billing@editmee.app',
    address: '100 Innovation Way, Suite 400, San Francisco, CA',
    taxId: 'US-94827104',
  },
  client: {
    name: 'Acme Global Ventures',
    email: 'accounts@acmeventures.com',
    address: '450 Lexington Avenue, New York, NY',
    taxId: 'US-10293847',
  },
  items: [
    { id: '1', description: 'Enterprise Cloud Architecture Consulting', quantity: 40, unitPrice: 175.0 },
    { id: '2', description: 'Custom Digital Tooling Integration', quantity: 1, unitPrice: 3500.0 },
    { id: '3', description: 'Security Hardening & Performance Audit', quantity: 1, unitPrice: 2200.0 },
  ],
  taxRatePercent: 8.5,
  discountPercent: 5,
  notes: 'Thank you for your business. Payment is requested within 14 days via wire transfer or ACH.',
};

export const InvoiceGeneratorTool: React.FC = () => {
  const [invoice, setInvoice] = useState<InvoiceData>(INITIAL_INVOICE);

  // Totals calculation
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = (subtotal * invoice.discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * invoice.taxRatePercent) / 100;
  const total = taxableAmount + taxAmount;

  // Add Item
  const handleAddItem = () => {
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: String(Date.now()),
          description: 'New Deliverable or Service',
          quantity: 1,
          unitPrice: 100,
        },
      ],
    }));
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  };

  // Generate PDF Invoice via pdf-lib
  const handleExportPdf = async () => {
    try {
      const doc = await PDFDocument.create();
      const page = doc.addPage([595.28, 841.89]); // A4
      const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

      const margin = 40;
      let y = 841.89 - margin;

      // Header: Invoice Title & Number
      page.drawText('INVOICE', {
        x: margin,
        y: y - 24,
        size: 26,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      page.drawText(`# ${invoice.invoiceNumber}`, {
        x: 400,
        y: y - 20,
        size: 14,
        font: fontBold,
        color: rgb(0.2, 0.4, 0.8),
      });
      y -= 45;

      // Dates
      page.drawText(`Issue Date: ${invoice.issueDate}   |   Due Date: ${invoice.dueDate}`, {
        x: margin,
        y,
        size: 9.5,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });
      y -= 25;

      // Two Column: Company vs Client
      page.drawText('FROM:', { x: margin, y, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawText('BILL TO:', { x: 300, y, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      y -= 14;

      page.drawText(invoice.company.name, { x: margin, y, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(invoice.client.name, { x: 300, y, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      y -= 12;

      page.drawText(invoice.company.address, { x: margin, y, size: 8.5, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(invoice.client.address, { x: 300, y, size: 8.5, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      y -= 12;

      page.drawText(`Email: ${invoice.company.email}`, { x: margin, y, size: 8.5, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(`Email: ${invoice.client.email}`, { x: 300, y, size: 8.5, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      y -= 28;

      // Table Header
      page.drawRectangle({
        x: margin,
        y: y - 8,
        width: 595.28 - margin * 2,
        height: 24,
        color: rgb(0.95, 0.95, 0.95),
      });

      page.drawText('DESCRIPTION', { x: margin + 8, y: y - 2, size: 9, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawText('QTY', { x: 340, y: y - 2, size: 9, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawText('PRICE', { x: 410, y: y - 2, size: 9, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawText('TOTAL', { x: 485, y: y - 2, size: 9, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      y -= 22;

      // Items Rows
      for (const item of invoice.items) {
        const itemTotal = item.quantity * item.unitPrice;
        page.drawText(item.description, { x: margin + 8, y, size: 9, font: fontRegular, color: rgb(0.15, 0.15, 0.15) });
        page.drawText(String(item.quantity), { x: 345, y, size: 9, font: fontRegular, color: rgb(0.15, 0.15, 0.15) });
        page.drawText(`${invoice.currency}${item.unitPrice.toFixed(2)}`, {
          x: 410,
          y,
          size: 9,
          font: fontRegular,
          color: rgb(0.15, 0.15, 0.15),
        });
        page.drawText(`${invoice.currency}${itemTotal.toFixed(2)}`, {
          x: 485,
          y,
          size: 9,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.1),
        });
        y -= 16;
      }
      y -= 15;

      // Total Breakdown Box
      page.drawLine({ start: { x: 330, y }, end: { x: 595.28 - margin, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
      y -= 14;

      page.drawText('Subtotal:', { x: 350, y, size: 9, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(`${invoice.currency}${subtotal.toFixed(2)}`, { x: 485, y, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
      y -= 14;

      if (invoice.discountPercent > 0) {
        page.drawText(`Discount (${invoice.discountPercent}%):`, { x: 350, y, size: 9, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
        page.drawText(`-${invoice.currency}${discountAmount.toFixed(2)}`, { x: 485, y, size: 9, font: fontRegular, color: rgb(0.2, 0.7, 0.3) });
        y -= 14;
      }

      page.drawText(`Tax (${invoice.taxRatePercent}%):`, { x: 350, y, size: 9, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(`${invoice.currency}${taxAmount.toFixed(2)}`, { x: 485, y, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
      y -= 16;

      page.drawText('TOTAL DUE:', { x: 350, y, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(`${invoice.currency}${total.toFixed(2)}`, { x: 485, y, size: 12, font: fontBold, color: rgb(0.2, 0.4, 0.8) });
      y -= 30;

      // Notes
      if (invoice.notes) {
        page.drawText('NOTES & PAYMENT INSTRUCTIONS:', { x: margin, y, size: 8.5, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
        y -= 12;
        page.drawText(invoice.notes, { x: margin, y, size: 8, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const filename = `${invoice.invoiceNumber}.pdf`;
      FileEngine.downloadBlob(blob, filename);

      storageEngine.addHistoryItem({
        toolId: 'invoice-generator',
        toolName: 'Invoice Generator',
        category: 'business',
        status: 'completed',
        outputFilename: filename,
        outputSummary: `Generated ${invoice.currency}${total.toFixed(2)} invoice for ${invoice.client.name}`,
      });
    } catch (err) {
      console.error('Invoice PDF error:', err);
    }
  };

  return (
    <div id="invoice-generator-workspace" className="flex flex-col h-[calc(100vh-8rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-sm">
      {/* Top Header */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            Invoice & Billing Generator
          </h1>
          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
            Total: {invoice.currency}
            {total.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={invoice.currency}
            onChange={(e) => setInvoice((prev) => ({ ...prev, currency: e.target.value }))}
            className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-xs text-slate-300 outline-none"
          >
            <option value="$">USD ($)</option>
            <option value="€">EUR (€)</option>
            <option value="£">GBP (£)</option>
            <option value="¥">JPY (¥)</option>
            <option value="C$">CAD (C$)</option>
            <option value="A$">AUD (A$)</option>
          </select>

          <button
            onClick={handleExportPdf}
            className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-medium text-white flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Invoice PDF
          </button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Invoice Form Inputs (w-1/2) */}
        <div className="w-1/2 bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-3 gap-3 text-xs bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400">Invoice Number</label>
              <input
                type="text"
                value={invoice.invoiceNumber}
                onChange={(e) => setInvoice((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-md p-2 text-slate-200 text-xs focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Issue Date</label>
              <input
                type="date"
                value={invoice.issueDate}
                onChange={(e) => setInvoice((prev) => ({ ...prev, issueDate: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-md p-2 text-slate-200 text-xs focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Due Date</label>
              <input
                type="date"
                value={invoice.dueDate}
                onChange={(e) => setInvoice((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-md p-2 text-slate-200 text-xs focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* From & Bill To */}
          <div className="grid grid-cols-2 gap-4">
            {/* Sender */}
            <div className="space-y-2 bg-slate-950/60 p-4 rounded-lg border border-slate-800 text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-400" /> Your Business (From)
              </div>
              <input
                type="text"
                placeholder="Company Name"
                value={invoice.company.name}
                onChange={(e) =>
                  setInvoice((prev) => ({ ...prev, company: { ...prev.company, name: e.target.value } }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-md p-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Address"
                value={invoice.company.address}
                onChange={(e) =>
                  setInvoice((prev) => ({ ...prev, company: { ...prev.company, address: e.target.value } }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-md p-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={invoice.company.email}
                onChange={(e) =>
                  setInvoice((prev) => ({ ...prev, company: { ...prev.company, email: e.target.value } }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-md p-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
              />
            </div>

            {/* Client */}
            <div className="space-y-2 bg-slate-950/60 p-4 rounded-lg border border-slate-800 text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" /> Client (Bill To)
              </div>
              <input
                type="text"
                placeholder="Client Name / Org"
                value={invoice.client.name}
                onChange={(e) =>
                  setInvoice((prev) => ({ ...prev, client: { ...prev.client, name: e.target.value } }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-md p-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Client Address"
                value={invoice.client.address}
                onChange={(e) =>
                  setInvoice((prev) => ({ ...prev, client: { ...prev.client, address: e.target.value } }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-md p-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
              />
              <input
                type="email"
                placeholder="Client Email"
                value={invoice.client.email}
                onChange={(e) =>
                  setInvoice((prev) => ({ ...prev, client: { ...prev.client, email: e.target.value } }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-md p-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-200">Line Items ({invoice.items.length})</div>
              <button
                onClick={handleAddItem}
                className="px-2 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer transition-colors border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {invoice.items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 text-xs items-center bg-slate-900 p-2 rounded-md border border-slate-800">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => {
                      const copy = [...invoice.items];
                      copy[idx].description = e.target.value;
                      setInvoice((prev) => ({ ...prev, items: copy }));
                    }}
                    className="col-span-6 bg-slate-950 border border-slate-800 rounded-md p-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => {
                      const copy = [...invoice.items];
                      copy[idx].quantity = Number(e.target.value);
                      setInvoice((prev) => ({ ...prev, items: copy }));
                    }}
                    className="col-span-2 bg-slate-950 border border-slate-800 rounded-md p-1.5 text-slate-200 text-center text-xs focus:border-blue-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const copy = [...invoice.items];
                      copy[idx].unitPrice = Number(e.target.value);
                      setInvoice((prev) => ({ ...prev, items: copy }));
                    }}
                    className="col-span-3 bg-slate-950 border border-slate-800 rounded-md p-1.5 text-slate-200 text-right font-mono text-xs focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="col-span-1 text-slate-500 hover:text-red-400 flex justify-center cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tax, Discount & Notes */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Tax Rate (%)</label>
              <input
                type="number"
                value={invoice.taxRatePercent}
                onChange={(e) => setInvoice((prev) => ({ ...prev, taxRatePercent: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 text-xs focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Discount (%)</label>
              <input
                type="number"
                value={invoice.discountPercent}
                onChange={(e) => setInvoice((prev) => ({ ...prev, discountPercent: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 text-xs focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right: Live Invoice Paper Preview (w-1/2) */}
        <div className="w-1/2 bg-slate-950 p-8 overflow-y-auto flex justify-center">
          <div className="max-w-xl w-full bg-white text-slate-900 rounded-lg shadow-2xl p-8 min-h-[750px] font-sans text-xs space-y-6 border border-slate-200">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-300 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">INVOICE</h1>
                <p className="text-xs text-slate-500 mt-0.5">#{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right text-[11px] text-slate-600 space-y-0.5">
                <div>
                  <span className="font-semibold">Issue:</span> {invoice.issueDate}
                </div>
                <div>
                  <span className="font-semibold">Due:</span> {invoice.dueDate}
                </div>
              </div>
            </div>

            {/* From / To */}
            <div className="grid grid-cols-2 gap-6 text-[11px]">
              <div>
                <span className="font-bold text-slate-900 uppercase">From:</span>
                <div className="font-semibold text-slate-800 mt-1">{invoice.company.name}</div>
                <div className="text-slate-600">{invoice.company.address}</div>
                <div className="text-slate-600">{invoice.company.email}</div>
              </div>
              <div>
                <span className="font-bold text-slate-900 uppercase">Billed To:</span>
                <div className="font-semibold text-slate-800 mt-1">{invoice.client.name}</div>
                <div className="text-slate-600">{invoice.client.address}</div>
                <div className="text-slate-600">{invoice.client.email}</div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                  <th className="p-2">Description</th>
                  <th className="p-2 text-center w-12">Qty</th>
                  <th className="p-2 text-right w-20">Price</th>
                  <th className="p-2 text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2 text-slate-800">{item.description}</td>
                    <td className="p-2 text-center text-slate-600">{item.quantity}</td>
                    <td className="p-2 text-right font-mono text-slate-600">
                      {invoice.currency}
                      {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="p-2 text-right font-mono font-semibold text-slate-900">
                      {invoice.currency}
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Calculation */}
            <div className="flex justify-end pt-2">
              <div className="w-56 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">
                    {invoice.currency}
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                {invoice.discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({invoice.discountPercent}%):</span>
                    <span className="font-mono">
                      -{invoice.currency}
                      {discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({invoice.taxRatePercent}%):</span>
                  <span className="font-mono">
                    {invoice.currency}
                    {taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-slate-900 border-t border-slate-300 pt-1.5">
                  <span>Total Due:</span>
                  <span className="font-mono text-blue-600">
                    {invoice.currency}
                    {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-0.5">
                <span className="font-bold text-slate-700 uppercase">Payment Terms:</span>
                <p>{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const invoiceGeneratorToolDef: ToolDefinition = {
  id: 'invoice-generator',
  name: 'Commercial Invoice & Receipt Studio',
  description: 'Generate customizable commercial invoices, track line items, calculate taxes & discounts, and export PDF billing receipts.',
  category: 'business',
  subcategory: 'billing',
  iconName: 'Receipt',
  version: '2.0.0',
  tags: ['invoice', 'receipt', 'billing', 'business', 'tax', 'pdf', 'commercial', 'flagship'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'invoiceNumber', label: 'Invoice Number', type: 'text', defaultValue: 'INV-2026-0042' },
      { name: 'clientName', label: 'Client Company', type: 'text', defaultValue: 'Acme Global Ventures' },
    ],
  },
  outputSchema: {
    type: 'pdf',
    mimeType: 'application/pdf',
    filename: 'invoice.pdf',
  },
  customWorkspace: InvoiceGeneratorTool,
  execute: async (input: any): Promise<ToolResult> => {
    return {
      success: true,
      filename: `${input.invoiceNumber || 'Invoice'}.pdf`,
    };
  },
};

