import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  CreditCard, 
  ShoppingCart, 
  FileText,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';
import { Customer } from '../../types/index.ts';

export const CustomerView: React.FC = () => {
  const { customers, salesOrders, addCustomer } = useFMCG();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [gstNumber, setGstNumber] = useState('');
  const [creditLimit, setCreditLimit] = useState(1500000);

  const filteredCustomers = customers.filter(c => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return c.businessName.toLowerCase().includes(q) || 
             c.customerCode.toLowerCase().includes(q) || 
             c.name.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !name) return;

    addCustomer({
      name,
      businessName,
      phone: phone || '+91 98000 00000',
      email: email || 'procurement@client.com',
      address: address || `${city} Commercial Area`,
      city: city || 'Mumbai',
      state,
      gstNumber: gstNumber || '27AABCX0000A1Z0',
      creditLimit,
      outstandingAmount: 0,
      status: 'active'
    });

    setIsAddCustomerOpen(false);
    setName('');
    setBusinessName('');
  };

  const customerOrders = selectedCustomer 
    ? salesOrders.filter(so => so.customerId === selectedCustomer.id) 
    : [];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span>Retail Chains & Super-Stockists (Customers)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Manage Modern Trade retail chains, hypermarkets, and wholesale stockists.
          </p>
        </div>

        <button
          onClick={() => setIsAddCustomerOpen(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer Account</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer Directory List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search business name, contact, code..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
            {filteredCustomers.map(cust => {
              const isSelected = selectedCustomer?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-4 transition-colors cursor-pointer text-xs ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        {cust.customerCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{cust.businessName}</h3>
                      <p className="text-slate-500 text-[11px] mt-0.5">{cust.name} • {cust.city}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Credit Limit</span>
                      <span className="font-semibold text-slate-700">₹{(cust.creditLimit / 100000).toFixed(1)}L</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Outstanding</span>
                      <span className={`font-semibold ${cust.outstandingAmount > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                        ₹{cust.outstandingAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Customer Details */}
        <div className="lg:col-span-7">
          {selectedCustomer ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-4 border-b border-slate-200 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                      {selectedCustomer.customerCode}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Tier 1 National Retailer</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedCustomer.businessName}</h2>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-slate-400 text-xs block">Approved Credit Ceiling</span>
                  <div className="text-lg font-bold text-blue-700 mt-0.5">
                    ₹{(selectedCustomer.creditLimit / 100000).toFixed(2)} Lakh
                  </div>
                  <span className="text-[11px] text-slate-500">Utilization: {Math.round((selectedCustomer.outstandingAmount / selectedCustomer.creditLimit) * 100)}%</span>
                </div>
              </div>

              {/* Contact Data */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block">Procurement Head</span>
                  <strong className="text-slate-800 mt-0.5 block">{selectedCustomer.name}</strong>
                  <span className="text-slate-500 text-[11px] block mt-1">{selectedCustomer.phone}</span>
                  <span className="text-slate-500 text-[11px] block">{selectedCustomer.email}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block">Statutory GSTIN</span>
                  <strong className="font-mono text-slate-800 mt-0.5 block">{selectedCustomer.gstNumber}</strong>
                  <span className="text-[10px] text-slate-400 block mt-2">State Jurisdiction</span>
                  <strong className="text-slate-800">{selectedCustomer.state} (27)</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block">Current Accounts Receivable</span>
                  <strong className="text-rose-600 text-base mt-0.5 block">
                    ₹{selectedCustomer.outstandingAmount.toLocaleString()}
                  </strong>
                  <span className="text-[10px] text-emerald-600 font-medium block mt-1">Normal Credit Cycle (30 Days)</span>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  <span>Recent Sales Orders ({customerOrders.length})</span>
                </h3>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3">Order Number</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Fulfillment Hub</th>
                        <th className="py-2.5 px-3 text-right">Order Total</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerOrders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400">
                            No orders placed yet.
                          </td>
                        </tr>
                      ) : (
                        customerOrders.map(o => (
                          <tr key={o.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-bold text-slate-900">{o.soNumber}</td>
                            <td className="py-2 px-3 text-slate-600">{o.orderDate}</td>
                            <td className="py-2 px-3 text-slate-700">{o.warehouseName}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">₹{o.grandTotal.toLocaleString()}</td>
                            <td className="py-2 px-3 text-center capitalize font-semibold">{o.orderStatus}</td>
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
              Select a customer account to inspect history.
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Register Customer Account</span>
              </h2>
              <button onClick={() => setIsAddCustomerOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Chain Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vishal Mega Mart"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Officer</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikas Bansal"
                    value={name}
                    onChange={e => setName(e.target.value)}
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
                <label className="block font-semibold text-slate-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  placeholder="27AABCV1234E1Z0"
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
                  <label className="block font-semibold text-slate-700 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={e => setCreditLimit(parseInt(e.target.value) || 1000000)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
