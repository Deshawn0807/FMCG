import React, { useState } from 'react';
import { 
  Warehouse as WarehouseIcon, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Boxes, 
  TrendingUp, 
  ArrowLeftRight, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Send, 
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';
import { Warehouse, StockTransfer, TransferStatus } from '../../types/index.ts';

interface WarehouseViewProps {
  onQuickTransfer: () => void;
  selectedWarehouseId?: string;
}

export const WarehouseView: React.FC<WarehouseViewProps> = ({
  onQuickTransfer,
  selectedWarehouseId
}) => {
  const { 
    warehouses, 
    inventory, 
    transactions, 
    salesOrders, 
    transfers, 
    updateTransferStatus,
    addWarehouse
  } = useFMCG();

  const [activeTab, setActiveTab] = useState<'facilities' | 'transfers'>('facilities');
  const [activeWarehouse, setActiveWarehouse] = useState<Warehouse | null>(() => {
    if (selectedWarehouseId) {
      return warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0];
    }
    return warehouses[0];
  });
  const [detailSubTab, setDetailSubTab] = useState<'overview' | 'inventory' | 'movements' | 'orders'>('overview');

  // Add Warehouse Modal
  const [isAddWhModalOpen, setIsAddWhModalOpen] = useState(false);
  const [newWhName, setNewWhName] = useState('');
  const [newWhCity, setNewWhCity] = useState('');
  const [newWhState, setNewWhState] = useState('');
  const [newWhAddress, setNewWhAddress] = useState('');
  const [newWhLocation, setNewWhLocation] = useState('');
  const [newWhManager, setNewWhManager] = useState('');
  const [newWhPhone, setNewWhPhone] = useState('');
  const [newWhEmail, setNewWhEmail] = useState('');
  const [newWhCapacity, setNewWhCapacity] = useState(80000);

  // Compute metrics for a warehouse
  const getWarehouseMetrics = (whId: string) => {
    const whInv = inventory.filter(i => i.warehouseId === whId);
    const totalUnits = whInv.reduce((sum, i) => sum + i.quantity, 0);
    const inventoryValue = whInv.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0);
    const lowStockCount = whInv.filter(i => i.quantity <= i.reorderLevel).length;
    const totalSKUs = whInv.length;
    const warehouse = warehouses.find(w => w.id === whId);
    const capacity = warehouse?.capacityUnits || 100000;
    const utilization = Math.min(100, Math.round((totalUnits / capacity) * 100));

    return { totalUnits, inventoryValue, lowStockCount, totalSKUs, utilization, capacity };
  };

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName || !newWhCity) return;

    addWarehouse({
      name: newWhName,
      location: newWhLocation || `${newWhCity} Hub`,
      city: newWhCity,
      state: newWhState || 'Maharashtra',
      address: newWhAddress || `${newWhCity} Industrial Logistics Zone`,
      managerName: newWhManager || 'Operations Lead',
      managerPhone: newWhPhone || '+91 98000 00000',
      managerEmail: newWhEmail || 'manager@districore.com',
      capacityUnits: newWhCapacity,
      currentUnits: 0,
      status: 'active'
    });

    setIsAddWhModalOpen(false);
    setNewWhName('');
    setNewWhCity('');
  };

  const getTransferStatusBadge = (status: TransferStatus) => {
    switch (status) {
      case 'requested':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Requested</span>;
      case 'approved':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Approved</span>;
      case 'dispatched':
      case 'in_transit':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">In Transit 🚚</span>;
      case 'received':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Received ✓</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <WarehouseIcon className="h-6 w-6 text-blue-600" />
            <span>Multi-Warehouse Logistics Network</span>
          </h1>
          <p className="text-xs text-slate-500">
            Monitor spatial capacity, inter-warehouse stock rebalancing, and regional dispatch fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('facilities')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'facilities' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Facilities ({warehouses.length})
            </button>
            <button
              onClick={() => setActiveTab('transfers')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'transfers' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Stock Transfers ({transfers.length})
            </button>
          </div>

          {activeTab === 'facilities' ? (
            <button
              onClick={() => setIsAddWhModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Facility</span>
            </button>
          ) : (
            <button
              onClick={onQuickTransfer}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>New Transfer</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'facilities' ? (
        <div className="space-y-6">
          {/* Warehouse Facility Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {warehouses.map(wh => {
              const metrics = getWarehouseMetrics(wh.id);
              const isSelected = activeWarehouse?.id === wh.id;
              return (
                <div
                  key={wh.id}
                  onClick={() => setActiveWarehouse(wh)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    isSelected 
                      ? 'bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        {wh.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{wh.name}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{wh.city}, {wh.state}</span>
                      </p>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0" />
                  </div>

                  {/* Utilization Progress Bar */}
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Utilization</span>
                      <span className="font-bold text-slate-800">{metrics.utilization}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          metrics.utilization > 85 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${metrics.utilization}%` }}
                      />
                    </div>
                  </div>

                  {/* Summary Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Stored Units</span>
                      <span className="font-bold text-slate-900">{metrics.totalUnits.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">SKU Count</span>
                      <span className="font-bold text-slate-900">{metrics.totalSKUs} items</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Valuation</span>
                      <span className="font-semibold text-emerald-700">₹{(metrics.inventoryValue / 100000).toFixed(1)}L</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Low Stock</span>
                      <span className={`font-semibold ${metrics.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                        {metrics.lowStockCount} items
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Warehouse Detailed View */}
          {activeWarehouse && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* Detailed Header */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                      {activeWarehouse.code}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">{activeWarehouse.name}</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {activeWarehouse.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      Manager: <strong>{activeWarehouse.managerName}</strong> ({activeWarehouse.managerPhone})
                    </span>
                  </p>
                </div>

                {/* Subtabs: Overview, Inventory, Movements, Orders */}
                <div className="flex items-center p-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 shadow-2xs">
                  <button
                    onClick={() => setDetailSubTab('overview')}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      detailSubTab === 'overview' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setDetailSubTab('inventory')}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      detailSubTab === 'inventory' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Stock Matrix ({inventory.filter(i => i.warehouseId === activeWarehouse.id).length})
                  </button>
                  <button
                    onClick={() => setDetailSubTab('movements')}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      detailSubTab === 'movements' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Movement History
                  </button>
                  <button
                    onClick={() => setDetailSubTab('orders')}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      detailSubTab === 'orders' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Fulfillment Orders
                  </button>
                </div>
              </div>

              {/* Subtab Contents */}
              <div className="p-5">
                {/* 1. OVERVIEW */}
                {detailSubTab === 'overview' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(() => {
                        const m = getWarehouseMetrics(activeWarehouse.id);
                        return (
                          <>
                            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                              <span className="text-xs text-slate-500">Storage Capacity</span>
                              <div className="text-lg font-bold text-slate-900 mt-1">
                                {m.capacity.toLocaleString()} units
                              </div>
                              <span className="text-[11px] text-slate-400">Total Pallet Bays</span>
                            </div>
                            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                              <span className="text-xs text-slate-500">Occupied Space</span>
                              <div className="text-lg font-bold text-blue-700 mt-1">
                                {m.totalUnits.toLocaleString()} units ({m.utilization}%)
                              </div>
                              <span className="text-[11px] text-emerald-600 font-medium">Free: {(m.capacity - m.totalUnits).toLocaleString()}</span>
                            </div>
                            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                              <span className="text-xs text-slate-500">Warehouse Valuation</span>
                              <div className="text-lg font-bold text-emerald-700 mt-1">
                                ₹{(m.inventoryValue / 100000).toFixed(2)} Lakh
                              </div>
                              <span className="text-[11px] text-slate-400">At Purchase Cost</span>
                            </div>
                            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                              <span className="text-xs text-slate-500">Active SKUs</span>
                              <div className="text-lg font-bold text-slate-900 mt-1">
                                {m.totalSKUs} items
                              </div>
                              <span className="text-[11px] text-amber-600 font-medium">{m.lowStockCount} below reorder level</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="p-4 bg-blue-50/50 border border-blue-200/70 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Inter-Warehouse Transfer Balancing</p>
                          <p className="text-[11px] text-slate-600">
                            Transfer surplus stock from this facility to other regional distribution hubs.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onQuickTransfer}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        Create Transfer
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. INVENTORY */}
                {detailSubTab === 'inventory' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                          <th className="py-2.5 px-3">SKU</th>
                          <th className="py-2.5 px-3">Product Name</th>
                          <th className="py-2.5 px-3">Batch</th>
                          <th className="py-2.5 px-3 text-right">Physical Qty</th>
                          <th className="py-2.5 px-3 text-right text-blue-600">Reserved</th>
                          <th className="py-2.5 px-3 text-right text-emerald-600">Available</th>
                          <th className="py-2.5 px-3 text-right">Expiry Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inventory.filter(i => i.warehouseId === activeWarehouse.id).map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">{item.sku}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{item.productName}</td>
                            <td className="py-2 px-3 font-mono text-slate-500">{item.batchNumber}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">{item.quantity}</td>
                            <td className="py-2 px-3 text-right font-semibold text-blue-600">{item.reservedQuantity}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-600">{item.availableQuantity}</td>
                            <td className="py-2 px-3 text-right text-slate-500">{item.expiryDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3. MOVEMENTS */}
                {detailSubTab === 'movements' && (
                  <div className="space-y-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                            <th className="py-2.5 px-3">Timestamp</th>
                            <th className="py-2.5 px-3">Movement Type</th>
                            <th className="py-2.5 px-3">Product</th>
                            <th className="py-2.5 px-3 text-right">Qty Change</th>
                            <th className="py-2.5 px-3">Reference</th>
                            <th className="py-2.5 px-3">Operator</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {transactions
                            .filter(t => t.warehouseId === activeWarehouse.id)
                            .slice(0, 10)
                            .map(tx => (
                              <tr key={tx.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{tx.timestamp}</td>
                                <td className="py-2 px-3">
                                  <span className="capitalize font-semibold text-slate-800">{tx.type.replace('_', ' ')}</span>
                                </td>
                                <td className="py-2 px-3 text-slate-900">{tx.productName}</td>
                                <td className={`py-2 px-3 text-right font-bold ${tx.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange}
                                </td>
                                <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">{tx.referenceId}</td>
                                <td className="py-2 px-3 text-slate-600">{tx.performedBy}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. ORDERS */}
                {detailSubTab === 'orders' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                          <th className="py-2.5 px-3">Order Number</th>
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">Order Date</th>
                          <th className="py-2.5 px-3 text-right">Items</th>
                          <th className="py-2.5 px-3 text-right">Amount</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {salesOrders.filter(o => o.warehouseId === activeWarehouse.id).map(o => (
                          <tr key={o.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-semibold text-slate-900 font-mono">{o.soNumber}</td>
                            <td className="py-2 px-3 text-slate-800">{o.customerName}</td>
                            <td className="py-2 px-3 text-slate-500">{o.orderDate}</td>
                            <td className="py-2 px-3 text-right">{o.items.length}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">₹{o.grandTotal.toLocaleString()}</td>
                            <td className="py-2 px-3 text-center capitalize font-semibold">{o.orderStatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TRANSFERS TAB: Section 13: Warehouse-to-Warehouse Transfers */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Inter-Warehouse Stock Transfer Pipeline</h2>
              <p className="text-xs text-slate-500">Workflow: Requested ➔ Approved ➔ Dispatched ➔ In Transit ➔ Received</p>
            </div>
            <button
              onClick={onQuickTransfer}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Transfer</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3.5">Transfer ID</th>
                  <th className="py-3 px-3.5">Product & SKU</th>
                  <th className="py-3 px-3.5">Source ➔ Destination</th>
                  <th className="py-3 px-3.5 text-right">Quantity</th>
                  <th className="py-3 px-3.5">Batch</th>
                  <th className="py-3 px-3.5">Requested By</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                  <th className="py-3 px-3.5 text-center">Progress Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No stock transfers found. Create one to balance warehouse inventory.
                    </td>
                  </tr>
                ) : (
                  transfers.map(tr => (
                    <tr key={tr.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900">{tr.transferNumber}</td>
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900">{tr.productName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{tr.sku}</div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <span>{tr.sourceWarehouseName}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="text-blue-700 font-semibold">{tr.destinationWarehouseName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-slate-900 text-sm">
                        {tr.quantity} units
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-600">{tr.batchNumber}</td>
                      <td className="py-3 px-3.5 text-slate-600">
                        <div>{tr.requestedBy}</div>
                        <div className="text-[10px] text-slate-400">{tr.requestDate}</div>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {getTransferStatusBadge(tr.status)}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {/* Interactive Workflow Action Buttons */}
                        {tr.status === 'requested' && (
                          <button
                            onClick={() => updateTransferStatus(tr.id, 'approved')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold shadow-2xs"
                          >
                            Approve
                          </button>
                        )}
                        {tr.status === 'approved' && (
                          <button
                            onClick={() => updateTransferStatus(tr.id, 'dispatched')}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-[11px] font-semibold shadow-2xs flex items-center gap-1 mx-auto"
                          >
                            <Send className="h-3 w-3" />
                            <span>Dispatch</span>
                          </button>
                        )}
                        {(tr.status === 'dispatched' || tr.status === 'in_transit') && (
                          <button
                            onClick={() => updateTransferStatus(tr.id, 'received')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-semibold shadow-2xs flex items-center gap-1 mx-auto"
                          >
                            <Check className="h-3 w-3" />
                            <span>Receive Stock</span>
                          </button>
                        )}
                        {tr.status === 'received' && (
                          <span className="text-emerald-600 text-[11px] font-semibold flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Stock Inwarded</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Facility Modal */}
      {isAddWhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <WarehouseIcon className="h-4 w-4 text-blue-600" />
                <span>Register Warehouse Facility</span>
              </h2>
              <button onClick={() => setIsAddWhModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Chakan Auto & Food Logistics Hub"
                  value={newWhName}
                  onChange={e => setNewWhName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune"
                    value={newWhCity}
                    onChange={e => setNewWhCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={newWhState}
                    onChange={e => setNewWhState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Manager In-Charge</label>
                <input
                  type="text"
                  placeholder="e.g. Sandeep Deshmukh"
                  value={newWhManager}
                  onChange={e => setNewWhManager(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Capacity (Pallet / Unit Capacity)</label>
                <input
                  type="number"
                  value={newWhCapacity}
                  onChange={e => setNewWhCapacity(parseInt(e.target.value) || 50000)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddWhModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Register Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
