import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Search, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building,
  QrCode,
  ShieldCheck,
  Eye,
  Plus
} from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';
import { Invoice } from '../../types/index.ts';

interface BillingViewProps {
  selectedInvoiceId?: string;
  onOpenRecordPayment: (invoice: Invoice) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  selectedInvoiceId,
  onOpenRecordPayment
}) => {
  const { invoices, companySettings } = useFMCG();

  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(() => {
    if (selectedInvoiceId) {
      return invoices.find(i => i.id === selectedInvoiceId) || invoices[0];
    }
    return invoices[0];
  });

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    if (filterStatus !== 'all' && inv.paymentStatus !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return inv.invoiceNumber.toLowerCase().includes(q) || inv.partyName.toLowerCase().includes(q);
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">PAID FULL</span>;
      case 'partial':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">PARTIAL</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">UNPAID</span>;
      case 'overdue':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">OVERDUE</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span>GST Tax Invoices & Commercial Billing</span>
          </h1>
          <p className="text-xs text-slate-500">
            Generate, inspect, and print statutory GST tax invoices compliant with Indian FMCG distribution regulations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>Print Invoice</span>
          </button>
          {activeInvoice && activeInvoice.paymentStatus !== 'paid' && (
            <button
              onClick={() => onOpenRecordPayment(activeInvoice)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="h-4 w-4" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Invoices List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden no-print">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice number, party..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filterStatus === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Unpaid
              </button>
              <button
                onClick={() => setFilterStatus('partial')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filterStatus === 'partial' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Partial
              </button>
              <button
                onClick={() => setFilterStatus('paid')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filterStatus === 'paid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Paid
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
            {filteredInvoices.map(inv => {
              const isSelected = activeInvoice?.id === inv.id;
              return (
                <div
                  key={inv.id}
                  onClick={() => setActiveInvoice(inv)}
                  className={`p-3.5 transition-colors cursor-pointer text-xs ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                      <p className="font-semibold text-slate-800 mt-0.5 truncate max-w-[180px]">{inv.partyName}</p>
                    </div>
                    {getStatusBadge(inv.paymentStatus)}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>Due: {inv.dueDate}</span>
                    <span className="font-bold text-slate-900 text-xs">₹{inv.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Professional GST Invoice Template (Printable) */}
        <div className="lg:col-span-8">
          {activeInvoice ? (
            <div 
              id="printable-invoice"
              className="bg-white rounded-2xl border border-slate-300 shadow-md p-6 sm:p-8 text-slate-800 space-y-6"
            >
              {/* Top Header & Logo */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-slate-300 pb-5 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-600 text-white font-bold text-xs rounded">
                      TAX INVOICE
                    </span>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                      (Original for Recipient)
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                    {companySettings.companyName}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">{companySettings.address}, {companySettings.city} - {companySettings.pincode}</p>
                  <p className="text-xs font-mono text-slate-700 mt-1">
                    <strong>GSTIN:</strong> {companySettings.gstin} • <strong>PAN:</strong> {companySettings.panNumber}
                  </p>
                  <p className="text-xs text-slate-600">State: {companySettings.state} (Code: 27) • Phone: {companySettings.phone}</p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-lg font-mono font-black text-blue-700">{activeInvoice.invoiceNumber}</div>
                  <p className="text-xs text-slate-500 mt-0.5">Date of Issue: <strong>{activeInvoice.issueDate}</strong></p>
                  <p className="text-xs text-slate-500">Due Date: <strong>{activeInvoice.dueDate}</strong></p>
                  <p className="text-xs text-slate-500">Order Ref: <strong className="font-mono text-slate-800">{activeInvoice.orderNumber}</strong></p>
                  <div className="mt-2">
                    {getStatusBadge(activeInvoice.paymentStatus)}
                  </div>
                </div>
              </div>

              {/* Bill To & Ship To Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billed To (Customer):</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{activeInvoice.partyName}</p>
                  <p className="text-slate-600 mt-0.5">{activeInvoice.partyAddress}</p>
                  <p className="font-mono text-slate-700 mt-1">
                    <strong>GSTIN:</strong> {activeInvoice.partyGst}
                  </p>
                  <p className="text-slate-600">Contact: {activeInvoice.partyPhone}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shipped From:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{activeInvoice.warehouseName}</p>
                  <p className="text-slate-600 mt-0.5">Commercial Distribution Depot</p>
                  <p className="text-slate-600 mt-1">Place of Supply: <strong>Maharashtra (27)</strong></p>
                  <p className="text-slate-600">Reverse Charge Applicable: <strong>NO</strong></p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 border-r border-slate-200 w-8">#</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Item Description</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 font-mono text-center">HSN</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-center">Qty</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">Rate</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">Taxable</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-center">GST %</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeInvoice.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 border-r border-slate-200 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <div className="font-semibold text-slate-900">{it.productName}</div>
                          <div className="text-[10px] font-mono text-slate-500">SKU: {it.sku}</div>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-mono text-center text-slate-600">{it.hsnCode}</td>
                        <td className="py-2 px-3 border-r border-slate-200 text-center font-bold text-slate-800">{it.quantity} {it.unit}</td>
                        <td className="py-2 px-3 border-r border-slate-200 text-right font-mono">₹{it.unitPrice.toFixed(2)}</td>
                        <td className="py-2 px-3 border-r border-slate-200 text-right font-mono">₹{it.taxableValue.toFixed(2)}</td>
                        <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">{it.gstRate}%</td>
                        <td className="py-2 px-3 text-right font-bold font-mono">₹{it.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Calculations Breakdown & Bank Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Bank Account Info for Direct Settlement */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remittance Bank Details:</span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank Name:</span>
                    <strong className="text-slate-800">{companySettings.bankName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">A/C Number:</span>
                    <strong className="font-mono text-slate-900">{companySettings.accountNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IFSC Code:</span>
                    <strong className="font-mono text-slate-900">{companySettings.ifscCode}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">UPI VPA:</span>
                    <strong className="font-mono text-blue-700">{companySettings.upiId}</strong>
                  </div>
                </div>

                {/* Tax Breakdown & Totals */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Taxable Subtotal:</span>
                    <strong className="font-mono text-slate-900">₹{activeInvoice.subtotal.toFixed(2)}</strong>
                  </div>
                  {activeInvoice.cgst > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Central Tax (CGST):</span>
                      <span className="font-mono text-slate-800">₹{activeInvoice.cgst.toFixed(2)}</span>
                    </div>
                  )}
                  {activeInvoice.sgst > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>State Tax (SGST):</span>
                      <span className="font-mono text-slate-800">₹{activeInvoice.sgst.toFixed(2)}</span>
                    </div>
                  )}
                  {activeInvoice.igst > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Integrated Tax (IGST):</span>
                      <span className="font-mono text-slate-800">₹{activeInvoice.igst.toFixed(2)}</span>
                    </div>
                  )}
                  {activeInvoice.discount > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600">
                      <span>Trade Discount:</span>
                      <span className="font-mono">-₹{activeInvoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                    <span>Grand Total:</span>
                    <span className="font-mono text-blue-700">₹{activeInvoice.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-[11px] text-slate-500">
                    <span>Amount Paid:</span>
                    <span className="font-mono text-emerald-600 font-semibold">₹{activeInvoice.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-[11px] text-slate-500">
                    <span>Balance Due:</span>
                    <span className="font-mono text-rose-600 font-bold">
                      ₹{Math.max(0, activeInvoice.grandTotal - activeInvoice.paidAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures & Declarations */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end sm:justify-between text-xs text-slate-500 gap-4">
                <div className="max-w-xs space-y-1">
                  <p className="font-bold text-slate-700">Terms & Conditions:</p>
                  <p className="text-[10px]">1. Goods once sold are not returnable without prior authorization.</p>
                  <p className="text-[10px]">2. Payment overdue attracts 18% p.a. interest as per MSMED Act.</p>
                  <p className="text-[10px]">3. Subject to Mumbai Jurisdiction only.</p>
                </div>

                <div className="text-center sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
                  <p className="font-bold text-slate-800">For {companySettings.companyName}</p>
                  <div className="h-12 flex items-center justify-end pr-4 text-slate-300 font-serif italic text-base">
                    Authorized Signatory
                  </div>
                  <p className="text-[10px] text-slate-400">Authorized Officer / Stamp</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
              Select an invoice from the list to preview details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
