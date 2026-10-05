import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  Truck, 
  Users, 
  FileText, 
  X, 
  ArrowRight,
  Boxes
} from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, itemId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { products, warehouses, salesOrders, vendors, customers, invoices } = useFMCG();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search results
  const matchedProducts = q ? products.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.sku.toLowerCase().includes(q) || 
    p.brand.toLowerCase().includes(q) ||
    p.barcode.includes(q)
  ).slice(0, 4) : [];

  const matchedOrders = q ? salesOrders.filter(o => 
    o.soNumber.toLowerCase().includes(q) || 
    o.customerName.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedWarehouses = q ? warehouses.filter(w => 
    w.name.toLowerCase().includes(q) || 
    w.code.toLowerCase().includes(q) || 
    w.city.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedVendors = q ? vendors.filter(v => 
    v.companyName.toLowerCase().includes(q) || 
    v.vendorCode.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedInvoices = q ? invoices.filter(i => 
    i.invoiceNumber.toLowerCase().includes(q) || 
    i.partyName.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const totalResults = matchedProducts.length + matchedOrders.length + matchedWarehouses.length + matchedVendors.length + matchedInvoices.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search products, SKUs, orders, warehouses, vendors..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-slate-800 placeholder-slate-400 text-sm focus:outline-hidden"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="px-2 py-1 text-[11px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-3 divide-y divide-slate-100">
          {!q && (
            <div className="p-8 text-center text-slate-400">
              <Boxes className="h-10 w-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium text-slate-600">Quick FMCG Enterprise Search</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching "Britannia", "Atta", "WH-MUM", "Reliance", "SO-2026", or "INV"
              </p>
            </div>
          )}

          {q && totalResults === 0 && (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm">No results found for "<span className="font-semibold text-slate-700">{query}</span>"</p>
              <p className="text-xs text-slate-400 mt-1">Check for spelling errors or try a generic term.</p>
            </div>
          )}

          {/* Products Results */}
          {matchedProducts.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Package className="h-3 w-3" />
                Products & SKUs ({matchedProducts.length})
              </div>
              {matchedProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => { onNavigate('products', p.id); onClose(); }}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-blue-50/70 cursor-pointer transition-colors group"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">{p.name}</p>
                    <p className="text-[11px] text-slate-500">
                      SKU: <span className="font-mono text-slate-600">{p.sku}</span> • {p.brand} • MRP: ₹{p.sellingPrice}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600" />
                </div>
              ))}
            </div>
          )}

          {/* Orders Results */}
          {matchedOrders.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShoppingCart className="h-3 w-3" />
                Sales Orders ({matchedOrders.length})
              </div>
              {matchedOrders.map(o => (
                <div
                  key={o.id}
                  onClick={() => { onNavigate('orders', o.id); onClose(); }}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-blue-50/70 cursor-pointer transition-colors group"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">{o.soNumber}</p>
                    <p className="text-[11px] text-slate-500">
                      Customer: {o.customerName} • Status: <span className="capitalize font-medium text-slate-700">{o.orderStatus}</span> • Total: ₹{o.grandTotal.toLocaleString()}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600" />
                </div>
              ))}
            </div>
          )}

          {/* Warehouses Results */}
          {matchedWarehouses.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Warehouse className="h-3 w-3" />
                Warehouses ({matchedWarehouses.length})
              </div>
              {matchedWarehouses.map(w => (
                <div
                  key={w.id}
                  onClick={() => { onNavigate('warehouses', w.id); onClose(); }}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-blue-50/70 cursor-pointer transition-colors group"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">{w.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Code: {w.code} • Location: {w.location} • Manager: {w.managerName}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600" />
                </div>
              ))}
            </div>
          )}

          {/* Vendors */}
          {matchedVendors.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Truck className="h-3 w-3" />
                Vendors ({matchedVendors.length})
              </div>
              {matchedVendors.map(v => (
                <div
                  key={v.id}
                  onClick={() => { onNavigate('vendors', v.id); onClose(); }}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-blue-50/70 cursor-pointer transition-colors group"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">{v.companyName}</p>
                    <p className="text-[11px] text-slate-500">
                      Code: {v.vendorCode} • GST: {v.gstNumber} • Rating: ⭐ {v.rating}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600" />
                </div>
              ))}
            </div>
          )}

          {/* Invoices */}
          {matchedInvoices.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="h-3 w-3" />
                Invoices ({matchedInvoices.length})
              </div>
              {matchedInvoices.map(inv => (
                <div
                  key={inv.id}
                  onClick={() => { onNavigate('billing', inv.id); onClose(); }}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-blue-50/70 cursor-pointer transition-colors group"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">{inv.invoiceNumber}</p>
                    <p className="text-[11px] text-slate-500">
                      Party: {inv.partyName} • Amount: ₹{inv.grandTotal.toLocaleString()} • Status: <span className="capitalize font-medium text-slate-700">{inv.paymentStatus}</span>
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Navigate with <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded">↑</kbd> <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded">↓</kbd></span>
          <span>Click result to inspect record</span>
        </div>
      </div>
    </div>
  );
};
