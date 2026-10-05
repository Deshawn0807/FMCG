import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Radio, 
  Bell, 
  Plus, 
  ChevronDown, 
  ShieldAlert, 
  CheckCheck, 
  RefreshCw, 
  UserCheck, 
  LogOut,
  Sparkles,
  Zap,
  Boxes,
  ShoppingCart,
  ArrowLeftRight
} from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';
import { UserRole } from '../../types/index.ts';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenQuickAction: (actionType: 'sales_order' | 'purchase_order' | 'stock_adjust' | 'transfer') => void;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  onOpenQuickAction,
  onOpenAuthModal
}) => {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    isLiveSync, 
    lastEventTime, 
    toggleLiveSync, 
    simulateLiveEvent, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    resetDemoData
  } = useFMCG();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleOpen(false);
      }
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setIsQuickOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSimulate = () => {
    setIsSimulating(true);
    simulateLiveEvent();
    setTimeout(() => setIsSimulating(false), 800);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'System Administrator';
      case 'warehouse_manager': return 'Warehouse Manager';
      case 'sales_manager': return 'Sales Manager';
      case 'vendor': return 'Vendor Supplier';
      case 'staff': return 'Warehouse Staff';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Toggle & Global Search trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 text-slate-500 rounded-lg text-xs transition-colors w-48 sm:w-64 md:w-80 group text-left cursor-pointer"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
          <span className="truncate flex-1">Search SKU, product, order, warehouse...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-300 rounded shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time synchronization indicator */}
        <div className="flex items-center">
          <button
            onClick={handleSimulate}
            title="Click to trigger simulated live inventory event"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-medium hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isSimulating ? 'scale-150' : ''}`}></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden md:inline font-bold tracking-tight text-[11px]">LIVE SYNC</span>
            <span className="text-[10px] text-emerald-700 hidden lg:inline">
              {lastEventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <Zap className={`h-3 w-3 text-emerald-600 ml-0.5 ${isSimulating ? 'animate-bounce text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="relative" ref={quickRef}>
          <button
            onClick={() => setIsQuickOpen(!isQuickOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-blue-600/30 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Action</span>
            <ChevronDown className="h-3 w-3 opacity-80" />
          </button>

          {isQuickOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Operations
              </div>
              <button
                onClick={() => { setIsQuickOpen(false); onOpenQuickAction('sales_order'); }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                <span>Create Sales Order</span>
              </button>
              <button
                onClick={() => { setIsQuickOpen(false); onOpenQuickAction('purchase_order'); }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
              >
                <Boxes className="h-4 w-4 text-emerald-600" />
                <span>Create Purchase Order</span>
              </button>
              <button
                onClick={() => { setIsQuickOpen(false); onOpenQuickAction('stock_adjust'); }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4 text-amber-600" />
                <span>Adjust Stock (Reconcile)</span>
              </button>
              <button
                onClick={() => { setIsQuickOpen(false); onOpenQuickAction('transfer'); }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
              >
                <ArrowLeftRight className="h-4 w-4 text-indigo-600" />
                <span>Warehouse Stock Transfer</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Center */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    No notifications right now
                  </div>
                ) : (
                  notifications.slice(0, 8).map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                        !notif.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                          notif.priority === 'high' ? 'bg-rose-500 ring-2 ring-rose-200' :
                          notif.type === 'order' ? 'bg-blue-500' :
                          notif.type === 'transfer' ? 'bg-indigo-500' : 'bg-emerald-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 leading-snug">{notif.title}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {notif.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Dropdown (Allows instant evaluation of Admin, WH Manager, Sales, Vendor, Staff) */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleOpen(!isRoleOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-7 w-7 rounded-full object-cover border border-slate-200"
            />
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
          </button>

          {isRoleOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                  <UserCheck className="h-3 w-3" />
                  Active: {getRoleLabel(currentUser.role)}
                </div>
              </div>

              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Role (Demo Impersonation)
              </div>

              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setIsRoleOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                    u.id === currentUser.id ? 'bg-blue-50/70 text-blue-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img src={u.avatar} alt={u.name} className="h-6 w-6 rounded-full object-cover" />
                    <div>
                      <p className="leading-tight">{u.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{u.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  {u.id === currentUser.id && (
                    <span className="text-[10px] text-blue-600 font-bold">Current</span>
                  )}
                </button>
              ))}

              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setIsRoleOpen(false);
                    if (window.confirm('Reset all inventory, orders, and demo data to initial factory state?')) {
                      resetDemoData();
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reset Demo Seed Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
