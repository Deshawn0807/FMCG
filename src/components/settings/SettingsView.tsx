import React, { useState } from 'react';
import { 
  Settings, 
  Building, 
  CreditCard, 
  ShieldCheck, 
  Bell, 
  RefreshCw, 
  Check, 
  Save, 
  Users,
  Database
} from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';
import { CompanySettings } from '../../types/index.ts';

export const SettingsView: React.FC = () => {
  const { companySettings, updateCompanySettings, resetDemoData, users, currentUser } = useFMCG();

  const [formData, setFormData] = useState<CompanySettings>(companySettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'company' | 'gst' | 'users' | 'system'>('company');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            <span>Enterprise System & Configuration Settings</span>
          </h1>
          <p className="text-xs text-slate-500">
            Company legal entity, GSTIN registration, invoice numbering formats, and system defaults.
          </p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('company')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'company' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Company Profile
          </button>
          <button
            onClick={() => setActiveTab('gst')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'gst' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            GST & Taxation
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'users' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Users & Roles
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'system' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            System Maintenance
          </button>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
        {/* Tab 1: Company Profile */}
        {activeTab === 'company' && (
          <form onSubmit={handleSave} className="space-y-4 max-w-2xl text-xs">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600" />
              <span>Company Legal Entity Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trading Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registered Legal Entity</label>
                <input
                  type="text"
                  value={formData.legalEntity}
                  onChange={e => setFormData({ ...formData, legalEntity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Commercial Billing Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Billing Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Headquarters Dispatch Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </button>
              {savedSuccess && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Saved successfully!
                </span>
              )}
            </div>
          </form>
        )}

        {/* Tab 2: GST & Taxation */}
        {activeTab === 'gst' && (
          <form onSubmit={handleSave} className="space-y-4 max-w-2xl text-xs">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span>Statutory Goods & Services Tax (GST) & Banking</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Income Tax PAN</label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={e => setFormData({ ...formData, panNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Settlement Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank IFSC Code</label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={e => setFormData({ ...formData, ifscCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate UPI VPA</label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-blue-700"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>Save Tax & Bank Setup</span>
              </button>
              {savedSuccess && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Saved successfully!
                </span>
              )}
            </div>
          </form>
        )}

        {/* Tab 3: Users & Roles */}
        {activeTab === 'users' && (
          <div className="space-y-4 max-w-3xl text-xs">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>Role-Based Access Control (RBAC) Hierarchy</span>
            </h2>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {users.map(u => (
                <div key={u.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-full object-cover border border-slate-200" />
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-sm">{u.name}</strong>
                        {u.id === currentUser.id && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                            Current Session
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500">{u.email} • {u.phone}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
              Use the top-right role switcher dropdown in the navigation header to instantly evaluate the app as Admin, Warehouse Manager, Sales Lead, Vendor, or Staff.
            </div>
          </div>
        )}

        {/* Tab 4: System Maintenance & Reset */}
        {activeTab === 'system' && (
          <div className="space-y-4 max-w-xl text-xs">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span>Database Persistence & Seed Re-initialization</span>
            </h2>

            <p className="text-slate-600 leading-relaxed">
              DistriCore saves all warehouse modifications, stock transfers, reservations, and invoices in your browser's persistent storage. If you want to reset the environment back to the clean initial demo seed data, use the action below:
            </p>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                Factory Demo Reset
              </span>
              <p className="text-rose-700 text-xs">
                This will wipe any custom created orders, stock adjustments, or invoices and restore the initial Britannia, Parle-G, Aashirvaad Atta, and Surf Excel FMCG baseline.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all inventory, orders, and demo data to factory state?')) {
                    resetDemoData();
                    alert('System reset to demo initial state.');
                  }
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Confirm Reset to Initial Demo Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
