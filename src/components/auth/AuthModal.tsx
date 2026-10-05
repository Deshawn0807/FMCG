import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Mail, Lock, Key, ArrowRight, X } from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';
import { UserRole } from '../../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose
}) => {
  const { users, currentUser, setCurrentUser } = useFMCG();

  const [authMode, setAuthMode] = useState<'login' | 'forgot' | 'profile'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSelectRoleUser = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      onClose();
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setAuthMode('login');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>
              {authMode === 'login' ? 'Authentication & Role Impersonation' : 
               authMode === 'forgot' ? 'Reset Account Password' : 'User Profile'}
            </span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {authMode === 'login' && (
            <div className="space-y-4">
              <div>
                <p className="text-slate-600 leading-relaxed">
                  Select a pre-configured role to immediately experience that role's permissions and workflow:
                </p>
              </div>

              {/* 1-Click Role Switch Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleSelectRoleUser('admin')}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    currentUser.role === 'admin' ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg font-bold text-[10px]">ADMIN</span>
                    <div>
                      <p className="font-bold text-slate-900">Rajesh Sharma</p>
                      <p className="text-[10px] text-slate-500">Full system & financial oversight</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRoleUser('warehouse_manager')}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    currentUser.role === 'warehouse_manager' ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg font-bold text-[10px]">WH MGR</span>
                    <div>
                      <p className="font-bold text-slate-900">Vikram Malhotra</p>
                      <p className="text-[10px] text-slate-500">Warehouse stock, transfers & receiving</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRoleUser('sales_manager')}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    currentUser.role === 'sales_manager' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-[10px]">SALES</span>
                    <div>
                      <p className="font-bold text-slate-900">Pooja Varma</p>
                      <p className="text-[10px] text-slate-500">Customers, Sales Orders & Invoicing</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRoleUser('vendor')}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    currentUser.role === 'vendor' ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg font-bold text-[10px]">VENDOR</span>
                    <div>
                      <p className="font-bold text-slate-900">Anand Singhania (Britannia)</p>
                      <p className="text-[10px] text-slate-500">Purchase orders & supplied lines</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className="text-blue-600 hover:underline text-[11px]"
                >
                  Forgot login password?
                </button>
              </div>
            </div>
          )}

          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <p className="text-slate-600 leading-relaxed">
                Enter your corporate email address and we'll send a password recovery token.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="rajesh.admin@districore.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {resetSent && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                  Password reset link sent to your email inbox!
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-slate-600 hover:underline"
                >
                  ← Back to Login
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
