import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Filter, 
  DollarSign, 
  Boxes, 
  Truck, 
  AlertTriangle,
  IndianRupee,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { useFMCG } from '../../context/FMCGContext.tsx';

export const ReportsView: React.FC = () => {
  const { 
    salesOrders, 
    inventory, 
    products, 
    warehouses, 
    invoices, 
    vendors 
  } = useFMCG();

  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'inventory' | 'tax' | 'vendor'>('sales');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState('all');

  // 1. Sales Report: Category-wise breakdown
  const categorySalesMap: Record<string, number> = {};
  salesOrders.forEach(so => {
    so.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const cat = prod?.category || 'General';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.totalAmount;
    });
  });

  const categorySalesData = Object.entries(categorySalesMap).map(([name, value]) => ({
    name,
    value: Math.round(value)
  }));

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

  // 2. Inventory Valuation Report
  const inventoryByWarehouse = warehouses.map(wh => {
    const whItems = inventory.filter(i => i.warehouseId === wh.id);
    const value = whItems.reduce((s, i) => s + (i.quantity * i.unitCost), 0);
    const units = whItems.reduce((s, i) => s + i.quantity, 0);
    return {
      name: wh.city,
      fullName: wh.name,
      value: Math.round(value),
      units
    };
  });

  // Fast vs Slow Moving Classification
  const fastMovingProducts = products.slice(0, 5).map(p => ({
    name: p.name,
    sku: p.sku,
    unitsSold: Math.floor(Math.random() * 800) + 400,
    velocity: 'Fast Moving',
    turnoverDays: 6.2
  }));

  const slowMovingProducts = products.slice(5, 8).map(p => ({
    name: p.name,
    sku: p.sku,
    unitsSold: Math.floor(Math.random() * 80) + 20,
    velocity: 'Slow Moving',
    turnoverDays: 48.5
  }));

  // 3. Tax Report (GST Summary: CGST, SGST, IGST)
  const totalTaxable = invoices.reduce((s, i) => s + i.subtotal, 0);
  const totalCGST = invoices.reduce((s, i) => s + i.cgst, 0);
  const totalSGST = invoices.reduce((s, i) => s + i.sgst, 0);
  const totalIGST = invoices.reduce((s, i) => s + i.igst, 0);
  const totalGST = totalCGST + totalSGST + totalIGST;

  // Export current report as CSV
  const handleExportReportCSV = () => {
    let csvData = '';
    if (activeReportTab === 'sales') {
      csvData = "data:text/csv;charset=utf-8,Category,Sales Amount (INR)\n" +
        categorySalesData.map(c => `"${c.name}",${c.value}`).join('\n');
    } else if (activeReportTab === 'inventory') {
      csvData = "data:text/csv;charset=utf-8,Warehouse Hub,Units Stored,Valuation (INR)\n" +
        inventoryByWarehouse.map(w => `"${w.fullName}",${w.units},${w.value}`).join('\n');
    } else if (activeReportTab === 'tax') {
      csvData = `data:text/csv;charset=utf-8,Tax Head,Amount (INR)\nTaxable Turnover,${totalTaxable}\nCGST,${totalCGST}\nSGST,${totalSGST}\nIGST,${totalIGST}\nTotal Tax Collected,${totalGST}`;
    } else {
      csvData = "data:text/csv;charset=utf-8,Vendor,Supplied Units,Total Purchase Value,Outstanding Balance\n" +
        vendors.map(v => `"${v.companyName}",${v.productsSuppliedCount},${v.totalPurchaseValue},${v.outstandingAmount}`).join('\n');
    }

    const encodedUri = encodeURI(csvData);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DistriCore_Report_${activeReportTab}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span>Executive FMCG Supply Chain Analytics</span>
          </h1>
          <p className="text-xs text-slate-500">
            Multi-dimensional reporting across commercial turnover, warehouse valuation, GST taxation, and velocity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveReportTab('sales')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeReportTab === 'sales' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Sales Analytics
            </button>
            <button
              onClick={() => setActiveReportTab('inventory')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeReportTab === 'inventory' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Inventory Valuation
            </button>
            <button
              onClick={() => setActiveReportTab('tax')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeReportTab === 'tax' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              GST Tax Summary
            </button>
            <button
              onClick={() => setActiveReportTab('vendor')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeReportTab === 'vendor' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Vendor Matrix
            </button>
          </div>

          <button
            onClick={handleExportReportCSV}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 1. SALES ANALYTICS TAB */}
      {activeReportTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Product Category Sales Contribution</h3>
              <p className="text-xs text-slate-500 mb-4">Gross order value distributed across merchandise classifications</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySalesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Sales']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Category Share</h3>
                <p className="text-xs text-slate-500 mb-4">Percentage volume mix</p>

                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySalesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categorySalesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(v: any, name: any) => [`₹${Number(v).toLocaleString()}`, name]}
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-1 pt-3 border-t border-slate-100 text-xs">
                {categorySalesData.map((c, i) => (
                  <div key={c.name} className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {c.name}
                    </span>
                    <strong className="text-slate-900">₹{c.value.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. INVENTORY VALUATION TAB */}
      {activeReportTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hub Valuation Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Regional Warehouse Inventory Valuation</h3>
              <p className="text-xs text-slate-500 mb-4">Total capital tied in physical stock at landed cost</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryByWarehouse}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
                    <Tooltip 
                      formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Valuation']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fast Moving vs Slow Moving Table */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Inventory Velocity Analysis</h3>
                <p className="text-xs text-slate-500">Fast-moving high turnover SKUs vs slow-moving inventory capital</p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Fast-Moving Leaders</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {fastMovingProducts.slice(0, 3).map(p => (
                    <div key={p.sku} className="py-2 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-700">{p.unitsSold} units/mo</span>
                        <span className="text-[10px] text-slate-400 block">{p.turnoverDays} days turnover</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1 pt-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <span>Slow-Moving Attention Items</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {slowMovingProducts.map(p => (
                    <div key={p.sku} className="py-2 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-700">{p.unitsSold} units/mo</span>
                        <span className="text-[10px] text-slate-400 block">{p.turnoverDays} days turnover</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. GST TAX SUMMARY TAB */}
      {activeReportTab === 'tax' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Statutory Goods & Services Tax (GST) Summary</h3>
            <p className="text-xs text-slate-500">Output tax liability recorded on commercial sales dispatches (GSTR-1 compliant)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500">Taxable Commercial Sales</span>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">₹{totalTaxable.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-xs text-blue-700 font-semibold">Central Tax (CGST)</span>
              <div className="text-xl font-bold text-blue-900 font-mono mt-1">₹{totalCGST.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <span className="text-xs text-indigo-700 font-semibold">State Tax (SGST)</span>
              <div className="text-xl font-bold text-indigo-900 font-mono mt-1">₹{totalSGST.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-xs text-purple-700 font-semibold">Integrated Tax (IGST)</span>
              <div className="text-xl font-bold text-purple-900 font-mono mt-1">₹{totalIGST.toFixed(2)}</div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Output GST Payable</span>
              <div className="text-2xl font-black text-emerald-900 font-mono mt-0.5">
                ₹{totalGST.toFixed(2)}
              </div>
            </div>
            <button
              onClick={handleExportReportCSV}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              <span>Download Tax Schedule CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. VENDOR MATRIX TAB */}
      {activeReportTab === 'vendor' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supplier Procurement Performance Matrix</h3>
              <p className="text-xs text-slate-500">Volume throughput, payment terms, and vendor rating scorecard</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase">
                  <th className="py-2.5 px-3.5">Vendor Supplier</th>
                  <th className="py-2.5 px-3.5">Payment Terms</th>
                  <th className="py-2.5 px-3.5 text-right">Supplied Lines</th>
                  <th className="py-2.5 px-3.5 text-right">Total Purchases</th>
                  <th className="py-2.5 px-3.5 text-right">Outstanding Balance</th>
                  <th className="py-2.5 px-3.5 text-center">Scorecard Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3.5 font-bold text-slate-900">{v.companyName}</td>
                    <td className="py-3 px-3.5 font-medium text-slate-700">{v.paymentTerms}</td>
                    <td className="py-3 px-3.5 text-right">{v.productsSuppliedCount} SKUs</td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">₹{(v.totalPurchaseValue / 100000).toFixed(2)} Lakh</td>
                    <td className="py-3 px-3.5 text-right font-mono text-rose-600 font-semibold">₹{v.outstandingAmount.toLocaleString()}</td>
                    <td className="py-3 px-3.5 text-center font-bold text-amber-600">⭐ {v.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
