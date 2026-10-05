import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Boxes, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';
import { Vendor } from '../../types/index.ts';

interface VendorViewProps {
  onOpenNewPO?: (vendorId: string) => void;
}

export const VendorView: React.FC<VendorViewProps> = ({
  onOpenNewPO
}) => {
  const { vendors, products, purchaseOrders, addVendor } = useFMCG();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(vendors[0] || null);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [gstNumber, setGstNumber] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');

  const filteredVendors = vendors.filter(v => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return v.companyName.toLowerCase().includes(q) || 
             v.vendorCode.toLowerCase().includes(q) ||
             v.contactPerson.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson) return;

    addVendor({
      companyName,
      contactPerson,
      phone: phone || '+91 98000 00000',
      email: email || 'orders@vendor.com',
      address: address || `${city} Industrial Zone`,
      city: city || 'Mumbai',
      state,
      gstNumber: gstNumber || '27AAACB0000A1Z0',
      paymentTerms,
      productsSuppliedCount: 0,
      totalPurchaseValue: 0,
      outstandingAmount: 0,
      rating: 5.0,
      status: 'active'
    });

    setIsAddVendorOpen(false);
    setCompanyName('');
    setContactPerson('');
  };

  // Vendor Detail calculations
  const vendorProducts = selectedVendor 
    ? products.filter(p => p.supplierId === selectedVendor.id) 
    : [];

  const vendorPOs = selectedVendor 
    ? purchaseOrders.filter(po => po.vendorId === selectedVendor.id) 
    : [];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" />
            <span>FMCG Vendor & Supplier Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Maintain authorized OEM manufacturers, direct distributor terms, and replenishment supply pipelines.
          </p>
        </div>

        <button
          onClick={() => setIsAddVendorOpen(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Vendor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vendor Directory List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendor company, code, person..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
            {filteredVendors.map(ven => {
              const isSelected = selectedVendor?.id === ven.id;
              return (
                <div
                  key={ven.id}
                  onClick={() => setSelectedVendor(ven)}
                  className={`p-4 transition-colors cursor-pointer text-xs ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        {ven.vendorCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{ven.companyName}</h3>
                      <p className="text-slate-500 text-[11px] mt-0.5">{ven.contactPerson}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                      <Star className="h-3 w-3 fill-amber-400" />
                      <span>{ven.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Supplied</span>
                      <span className="font-semibold text-slate-700">₹{(ven.totalPurchaseValue / 100000).toFixed(1)}L</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Payment Terms</span>
                      <span className="font-semibold text-slate-700">{ven.paymentTerms}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Vendor Profile */}
        <div className="lg:col-span-7">
          {selectedVendor ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-4 border-b border-slate-200 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                      {selectedVendor.vendorCode}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ACTIVE SUPPLIER
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedVendor.companyName}</h2>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{selectedVendor.address}, {selectedVendor.city}, {selectedVendor.state}</span>
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end">
                  <div className="text-xs text-slate-500">Supplier Rating</div>
                  <div className="flex items-center gap-1 text-base font-bold text-slate-900 mt-0.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                    <span>{selectedVendor.rating} / 5.0</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">98.5% On-Time Delivery</span>
                </div>
              </div>

              {/* Contact & Statutory Data */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block">Contact Representative</span>
                  <strong className="text-slate-800 mt-0.5 block">{selectedVendor.contactPerson}</strong>
                  <span className="text-slate-500 text-[11px] block mt-1">{selectedVendor.phone}</span>
                  <span className="text-slate-500 text-[11px] block">{selectedVendor.email}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block">Statutory GSTIN</span>
                  <strong className="font-mono text-slate-800 mt-0.5 block">{selectedVendor.gstNumber}</strong>
                  <span className="text-[10px] text-slate-400 block mt-2">Payment Terms</span>
                  <strong className="text-slate-800">{selectedVendor.paymentTerms}</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block">Outstanding Balance</span>
                  <strong className="text-rose-600 text-sm mt-0.5 block">
                    ₹{selectedVendor.outstandingAmount.toLocaleString()}
                  </strong>
                  <span className="text-[10px] text-slate-400 block mt-1">Total Lifetime Purchases</span>
                  <strong className="text-slate-800">₹{(selectedVendor.totalPurchaseValue / 100000).toFixed(2)} Lakh</strong>
                </div>
              </div>

              {/* Products Supplied Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Boxes className="h-4 w-4 text-blue-600" />
                    <span>Catalog Products Supplied ({vendorProducts.length})</span>
                  </h3>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">Pack Size</th>
                        <th className="py-2.5 px-3 text-right">Contract Price</th>
                        <th className="py-2.5 px-3 text-right">Selling MRP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vendorProducts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400">
                            No specific catalog items mapped to this supplier.
                          </td>
                        </tr>
                      ) : (
                        vendorProducts.map(prod => (
                          <tr key={prod.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">{prod.sku}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{prod.name}</td>
                            <td className="py-2 px-3 text-slate-600">{prod.packSize}</td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">₹{prod.purchasePrice.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-500">₹{prod.sellingPrice.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Purchase Orders History */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <span>Recent Purchase Orders ({vendorPOs.length})</span>
                  </h3>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3">PO Number</th>
                        <th className="py-2.5 px-3">Order Date</th>
                        <th className="py-2.5 px-3">Warehouse</th>
                        <th className="py-2.5 px-3 text-right">Total Amount</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vendorPOs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400">
                            No purchase orders issued to this vendor yet.
                          </td>
                        </tr>
                      ) : (
                        vendorPOs.map(po => (
                          <tr key={po.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-bold text-slate-900">{po.poNumber}</td>
                            <td className="py-2 px-3 text-slate-600">{po.orderDate}</td>
                            <td className="py-2 px-3 text-slate-700">{po.warehouseName}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">₹{po.grandTotal.toLocaleString()}</td>
                            <td className="py-2 px-3 text-center">
                              <span className="capitalize font-semibold text-slate-700">{po.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
              Select a vendor to view detailed performance metrics.
            </div>
          )}
        </div>
      </div>

      {/* Add Vendor Modal */}
      {isAddVendorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>Register New FMCG Supplier</span>
              </h2>
              <button onClick={() => setIsAddVendorOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateVendor} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Entity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marico Limited"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alok Roy"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  placeholder="27AAACM1234F1Z8"
                  value={gstNumber}
                  onChange={e => setGstNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={e => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Immediate">Immediate / Advance</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddVendorOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
