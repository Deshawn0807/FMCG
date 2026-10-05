import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  AlertTriangle, 
  ArrowLeftRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  RefreshCw,
  Warehouse as WarehouseIcon,
  ShieldAlert,
  ChevronDown,
  Layers
} from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';
import { WarehouseInventory } from '../../types/index.ts';

interface InventoryViewProps {
  onQuickAction: (actionType: 'sales_order' | 'purchase_order' | 'stock_adjust' | 'transfer') => void;
  onOpenTransferWithItem?: (item: WarehouseInventory) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onQuickAction,
  onOpenTransferWithItem
}) => {
  const { inventory, warehouses, products, adjustStock } = useFMCG();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring_soon'>('all');

  // Adjust stock modal state
  const [adjustModalItem, setAdjustModalItem] = useState<WarehouseInventory | null>(null);
  const [adjustChange, setAdjustChange] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Physical Stock Count Reconciliation');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Extract categories & brands
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);
  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand))), [products]);

  // Today reference for expiry
  const today = new Date('2026-10-05');

  // Determine status for an inventory item
  const getItemStatus = (item: WarehouseInventory) => {
    const expDate = new Date(item.expiryDate);
    const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (item.quantity === 0) return { status: 'out_of_stock', label: 'Out of Stock', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    if (daysLeft <= 45) return { status: 'expiring_soon', label: `Expiring Soon (${daysLeft}d)`, color: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (item.quantity <= item.reorderLevel) return { status: 'low_stock', label: 'Low Stock', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { status: 'in_stock', label: 'In Stock', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      // Warehouse filter
      if (selectedWarehouse !== 'all' && item.warehouseId !== selectedWarehouse) return false;
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      // Brand filter
      if (selectedBrand !== 'all' && item.brand !== selectedBrand) return false;
      
      // Stock status filter
      const itemStatus = getItemStatus(item).status;
      if (selectedStatus !== 'all' && itemStatus !== selectedStatus) return false;

      // Text search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesName = item.productName.toLowerCase().includes(q);
        const matchesSku = item.sku.toLowerCase().includes(q);
        const matchesBatch = item.batchNumber.toLowerCase().includes(q);
        const matchesBrand = item.brand.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesBatch && !matchesBrand) return false;
      }

      return true;
    });
  }, [inventory, selectedWarehouse, selectedCategory, selectedBrand, selectedStatus, searchTerm]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['SKU', 'Product Name', 'Brand', 'Category', 'Warehouse', 'Batch', 'Total Qty', 'Reserved', 'Available', 'Reorder Level', 'Unit Cost', 'Selling Price', 'Expiry Date', 'Status'];
    const rows = filteredInventory.map(item => {
      const wh = warehouses.find(w => w.id === item.warehouseId);
      const st = getItemStatus(item);
      return [
        item.sku,
        `"${item.productName.replace(/"/g, '""')}"`,
        item.brand,
        item.category,
        wh?.name || item.warehouseId,
        item.batchNumber,
        item.quantity,
        item.reservedQuantity,
        item.availableQuantity,
        item.reorderLevel,
        item.unitCost,
        item.sellingPrice,
        item.expiryDate,
        st.label
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FMCG_Inventory_Export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalItem || adjustChange === 0) return;

    adjustStock({
      warehouseId: adjustModalItem.warehouseId,
      productId: adjustModalItem.productId,
      quantityChange: adjustChange,
      reason: adjustReason,
      notes: adjustNotes
    });

    setAdjustModalItem(null);
    setAdjustChange(0);
    setAdjustNotes('');
  };

  return (
    <div className="space-y-5">
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="h-6 w-6 text-blue-600" />
            <span>Real-Time Inventory Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Monitor real-time SKU levels, reserved sales buffers, batch expiry dates, and warehouse reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onQuickAction('stock_adjust')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Adjust Stock</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Field */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, SKU, brand, batch..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Warehouse Dropdown */}
          <div>
            <select
              value={selectedWarehouse}
              onChange={e => setSelectedWarehouse(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden"
            >
              <option value="all">All Warehouses (4)</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">🟢 In Stock</option>
              <option value="low_stock">🟡 Low Stock</option>
              <option value="expiring_soon">🟠 Expiring Soon</option>
              <option value="out_of_stock">🔴 Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pill Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-500 text-[11px] font-medium">Quick Status Filters:</span>
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              selectedStatus === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items ({inventory.length})
          </button>
          <button
            onClick={() => setSelectedStatus('low_stock')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
              selectedStatus === 'low_stock' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Low Stock ({inventory.filter(i => i.quantity <= i.reorderLevel && i.quantity > 0).length})</span>
          </button>
          <button
            onClick={() => setSelectedStatus('expiring_soon')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
              selectedStatus === 'expiring_soon' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100'
            }`}
          >
            <Clock className="h-3 w-3" />
            <span>Expiring Soon</span>
          </button>
          <button
            onClick={() => setSelectedStatus('in_stock')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              selectedStatus === 'in_stock' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Healthy Stock
          </button>
        </div>
      </div>

      {/* Inventory Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3.5">SKU / Product Name</th>
                <th className="py-3 px-3.5">Category & Brand</th>
                <th className="py-3 px-3.5">Warehouse</th>
                <th className="py-3 px-3.5">Batch / Expiry</th>
                <th className="py-3 px-3.5 text-right">Physical Qty</th>
                <th className="py-3 px-3.5 text-right text-blue-600">Reserved</th>
                <th className="py-3 px-3.5 text-right text-emerald-600">Available</th>
                <th className="py-3 px-3.5 text-right">Cost / MRP</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    No inventory records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => {
                  const wh = warehouses.find(w => w.id === item.warehouseId);
                  const statusInfo = getItemStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* SKU & Name */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{item.sku}</div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-slate-800">{item.category}</div>
                        <div className="text-[11px] text-slate-500">{item.brand}</div>
                      </td>

                      {/* Warehouse */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <WarehouseIcon className="h-3 w-3 text-slate-400" />
                          <span>{wh?.code}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{wh?.city}</div>
                      </td>

                      {/* Batch & Expiry */}
                      <td className="py-3 px-3.5">
                        <div className="font-mono text-slate-700 text-[11px]">{item.batchNumber}</div>
                        <div className="text-[11px] text-slate-500">Exp: {item.expiryDate}</div>
                      </td>

                      {/* Physical Quantity */}
                      <td className="py-3 px-3.5 text-right font-bold text-slate-900">
                        {item.quantity}
                        <div className="text-[10px] text-slate-400 font-normal">Min: {item.reorderLevel}</div>
                      </td>

                      {/* Reserved Quantity */}
                      <td className="py-3 px-3.5 text-right font-semibold text-blue-600">
                        {item.reservedQuantity}
                      </td>

                      {/* Available Quantity */}
                      <td className="py-3 px-3.5 text-right font-bold text-emerald-700">
                        {item.availableQuantity}
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="font-semibold text-slate-900">₹{item.sellingPrice.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">Cost: ₹{item.unitCost.toFixed(2)}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            title="Adjust physical stock / cycle count"
                            onClick={() => {
                              setAdjustModalItem(item);
                              setAdjustChange(0);
                            }}
                            className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Initiate Inter-Warehouse Transfer"
                            onClick={() => {
                              if (onOpenTransferWithItem) onOpenTransferWithItem(item);
                              else onQuickAction('transfer');
                            }}
                            className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <ArrowLeftRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>Showing <strong>{filteredInventory.length}</strong> items across monitored warehouses</span>
          <div className="flex items-center gap-4">
            <span>Total Units: <strong>{filteredInventory.reduce((s, i) => s + i.quantity, 0).toLocaleString()}</strong></span>
            <span>Total Value: <strong>₹{filteredInventory.reduce((s, i) => s + (i.quantity * i.unitCost), 0).toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <span>Adjust Stock: {adjustModalItem.productName}</span>
              </h2>
              <button 
                onClick={() => setAdjustModalItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-4 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Warehouse:</span>
                  <span className="font-semibold text-slate-800">
                    {warehouses.find(w => w.id === adjustModalItem.warehouseId)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Physical Qty:</span>
                  <span className="font-bold text-slate-900">{adjustModalItem.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reserved for Orders:</span>
                  <span className="font-semibold text-blue-700">{adjustModalItem.reservedQuantity} units</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity Adjustment (positive to add, negative to deduct)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustChange(prev => prev - 1)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-lg text-sm"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={adjustChange}
                    onChange={e => setAdjustChange(parseInt(e.target.value) || 0)}
                    className="w-full text-center py-1.5 border border-slate-300 rounded-lg font-bold text-sm text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustChange(prev => prev + 1)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-lg text-sm"
                  >
                    +
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  New Quantity will be: <strong className="text-slate-900">{Math.max(0, adjustModalItem.quantity + adjustChange)} units</strong>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Adjustment Reason
                </label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Physical Stock Count Reconciliation">Physical Stock Count Reconciliation</option>
                  <option value="Damaged in Warehouse Bay">Damaged in Warehouse Bay</option>
                  <option value="Vendor Return / Quality Rejection">Vendor Return / Quality Rejection</option>
                  <option value="Customer Return Restock">Customer Return Restock</option>
                  <option value="Cycle Count Variance Correction">Cycle Count Variance Correction</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Audit Notes / Reference Document
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Audit slip #994, Bay inspection completed"
                  value={adjustNotes}
                  onChange={e => setAdjustNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalItem(null)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustChange === 0}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs"
                >
                  Commit Stock Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
