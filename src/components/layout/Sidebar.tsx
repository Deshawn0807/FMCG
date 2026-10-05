import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  Package, 
  Warehouse as WarehouseIcon, 
  ShoppingCart, 
  ArrowLeftRight, 
  Truck, 
  Users, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Clock, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  setIsOpen
}) => {
  const { currentUser, inventory, salesOrders, transfers } = useFMCG();

  // Compute live badges
  const lowStockCount = inventory.filter(i => i.quantity <= i.reorderLevel).length;
  const pendingOrdersCount = salesOrders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'confirmed').length;
  const activeTransfersCount = transfers.filter(t => t.status === 'requested' || t.status === 'in_transit').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Core' },
    { id: 'inventory', label: 'Inventory', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-500', category: 'Core' },
    { id: 'products', label: 'Products & SKUs', icon: Package, category: 'Core' },
    { id: 'warehouses', label: 'Warehouses', icon: WarehouseIcon, category: 'Operations' },
    { id: 'orders', label: 'Orders (SO & PO)', icon: ShoppingCart, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badgeColor: 'bg-blue-600', category: 'Operations' },
    { id: 'transfers', label: 'Stock Transfers', icon: ArrowLeftRight, badge: activeTransfersCount > 0 ? activeTransfersCount : undefined, badgeColor: 'bg-indigo-600', category: 'Operations' },
    { id: 'vendors', label: 'Vendors', icon: Truck, category: 'Parties' },
    { id: 'customers', label: 'Customers', icon: Users, category: 'Parties' },
    { id: 'billing', label: 'Billing & Invoices', icon: FileText, category: 'Finance' },
    { id: 'payments', label: 'Payments', icon: CreditCard, category: 'Finance' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, category: 'System' },
    { id: 'audit', label: 'Audit Logs', icon: Clock, category: 'System' },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'System' },
  ];

  // Group items by category
  const categories = ['Core', 'Operations', 'Parties', 'Finance', 'System'];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-800 rounded">Admin</span>;
      case 'warehouse_manager':
        return <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded">WH Manager</span>;
      case 'sales_manager':
        return <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">Sales Lead</span>;
      case 'vendor':
        return <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-800 rounded">Vendor</span>;
      default:
        return <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded">Staff</span>;
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base flex items-center gap-1.5">
                Distri<span className="text-blue-400">Core</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1 py-0.2 bg-blue-500/20 text-blue-300 rounded">FMCG</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">Enterprise ERP</p>
            </div>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {categories.map(cat => {
            const items = navItems.filter(i => i.category === cat);
            return (
              <div key={cat} className="space-y-1">
                <div className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  {cat}
                </div>
                {items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group
                        ${isActive 
                          ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30' 
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'}
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-slate-700'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Low Stock Warning Banner in Sidebar if any */}
        {lowStockCount > 0 && (
          <div className="mx-3 mb-3 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <div className="text-[11px] leading-tight text-amber-200/90">
              <span className="font-semibold text-amber-300">{lowStockCount} items</span> below reorder level
            </div>
          </div>
        )}

        {/* User profile footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="h-8 w-8 rounded-full object-cover border border-slate-700 shrink-0" 
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {getRoleBadge(currentUser.role)}
                </div>
              </div>
            </div>
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 ml-1" />
          </div>
        </div>
      </aside>
    </>
  );
};
