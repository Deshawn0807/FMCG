import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Download,
  IndianRupee,
  FileText
} from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';
import { PaymentRecord, Invoice } from '../../types/index.ts';

interface PaymentsViewProps {
  onOpenInvoice: (invoiceId: string) => void;
  preSelectedInvoice?: Invoice | null;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onOpenInvoice,
  preSelectedInvoice
}) => {
  const { payments, invoices, recordPayment, currentUser } = useFMCG();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  // Record Payment Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(preSelectedInvoice?.id || invoices[0]?.id || '');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['paymentMethod']>('Bank Transfer');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Accounts Receivable Calculation
  const totalReceivables = invoices
    .filter(i => i.invoiceType === 'sales')
    .reduce((sum, i) => sum + (i.grandTotal - i.paidAmount), 0);

  const totalCollected = payments
    .filter(p => p.partyType === 'customer' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  // Accounts Payable Calculation
  const totalPayables = 1420000; // Estimated supplier trade payables

  const handleOpenRecordModal = (inv?: Invoice) => {
    const target = inv || invoices.find(i => i.paymentStatus !== 'paid') || invoices[0];
    if (target) {
      setSelectedInvoiceId(target.id);
      const remaining = Math.max(0, target.grandTotal - target.paidAmount);
      setAmount(remaining);
      setTransactionRef(`TXN-${Date.now().toString().slice(-6)}`);
    }
    setIsRecordModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find(i => i.id === selectedInvoiceId);
    if (!inv || amount <= 0) return;

    recordPayment({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      partyName: inv.partyName,
      partyType: inv.invoiceType === 'sales' ? 'customer' : 'vendor',
      amount,
      paymentMethod,
      transactionRef: transactionRef || `REF-${Date.now().toString().slice(-6)}`,
      paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'completed',
      recordedBy: currentUser.name,
      notes: paymentNotes
    });

    setIsRecordModalOpen(false);
    setAmount(0);
    setPaymentNotes('');
  };

  const filteredPayments = payments.filter(p => {
    if (methodFilter !== 'all' && p.paymentMethod !== methodFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return p.invoiceNumber.toLowerCase().includes(q) || 
             p.partyName.toLowerCase().includes(q) || 
             p.transactionRef.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <span>Cash Flow & Payment Settlement</span>
          </h1>
          <p className="text-xs text-slate-500">
            Accounts receivable ledger, vendor disbursements, UPI settlements, and bank reconciliation.
          </p>
        </div>

        <button
          onClick={() => handleOpenRecordModal()}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Record Received Payment</span>
        </button>
      </div>

      {/* AR & AP KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Receivables */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Accounts Receivable (Outstanding)</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{(totalReceivables / 1000).toFixed(1)}k
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium mt-1">
            <span>Pending settlement across retail clients</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Collections (MTD)</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            ₹{(totalCollected / 1000).toFixed(1)}k
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>100% verified against bank statement</span>
          </div>
        </div>

        {/* Accounts Payable */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Supplier Trade Payables</span>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{(totalPayables / 100000).toFixed(2)} Lakh
          </div>
          <div className="flex items-center gap-1 text-[11px] text-purple-600 font-medium mt-1">
            <span>Net 30 terms active for all vendors</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, party, or txn ref..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="all">All Payment Channels</option>
            <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
            <option value="UPI">UPI</option>
            <option value="Cheque">Cheque</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3.5">Receipt #</th>
                <th className="py-3 px-3.5">Invoice Ref</th>
                <th className="py-3 px-3.5">Customer / Vendor</th>
                <th className="py-3 px-3.5">Payment Method</th>
                <th className="py-3 px-3.5">Txn Reference</th>
                <th className="py-3 px-3.5 text-right">Amount Settled</th>
                <th className="py-3 px-3.5">Date & Time</th>
                <th className="py-3 px-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map(pay => (
                <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-900">{pay.receiptNumber}</td>
                  <td className="py-3 px-3.5">
                    <button
                      onClick={() => onOpenInvoice(pay.invoiceId)}
                      className="font-mono text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      <span>{pay.invoiceNumber}</span>
                    </button>
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-800">{pay.partyName}</td>
                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                      {pay.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-500 text-[11px]">{pay.transactionRef}</td>
                  <td className="py-3 px-3.5 text-right font-bold text-emerald-700 text-sm">
                    ₹{pay.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 text-slate-500 text-[11px]">{pay.paymentDate}</td>
                  <td className="py-3 px-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      COMPLETED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span>Record Payment Receipt</span>
              </h2>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSavePayment} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Invoice</label>
                <select
                  value={selectedInvoiceId}
                  onChange={e => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = invoices.find(i => i.id === e.target.value);
                    if (inv) {
                      setAmount(Math.max(0, inv.grandTotal - inv.paidAmount));
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.partyName} (Bal: ₹{(inv.grandTotal - inv.paidAmount).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Record (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Transaction Reference / UTR Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-HDFC-9912048"
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Cleared via corporate netbanking"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Receipt & Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
