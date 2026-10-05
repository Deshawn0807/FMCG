import React, { useState } from 'react';
import { 
  Boxes, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  IndianRupee, 
  Clock, 
  AlertTriangle, 
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Truck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowLeftRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useFMCG } from '../../context/FMCGContext.tsx';

interface DashboardViewProps {
  onNavigate: (tab: string, itemId?: string) => void;
  onQuickAction: (actionType: 'sales_order' | 'purchase_order' | 'stock_adjust' | 'transfer') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onQuickAction
}) => {
  const { 
    inventory, 
    products, 
    warehouses, 
    salesOrders, 
    purchaseOrders, 
    auditLogs, 
    invoices,
    payments,
    confirmSalesOrder
  } = useFMCG();

  const [salesTimeframe, setSalesTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // 1. KPI Calculations
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  const totalSKUs = products.length;
  const totalWarehousesCount = warehouses.length;
  const pendingOrders = salesOrders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.orderStatus)).length;
  
  // Sales Calculation (Today / Total)
  const todayStr = '2026-10-05';
  const todaySales = salesOrders
    .filter(o => o.orderDate === todayStr && o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const pendingPOs = purchaseOrders.filter(po => ['draft', 'sent', 'confirmed'].includes(po.status)).length;
  
  // Low Stock Items: where quantity <= reorderLevel
  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel);

  // Outstanding Payments (from Invoices)
  const outstandingPayments = invoices
    .filter(i => i.paymentStatus !== 'paid')
    .reduce((sum, i) => sum + (i.grandTotal - i.paidAmount), 0);

  // 2. Inventory Overview Breakdown for Chart
  const totalPhysicalQty = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const totalReservedQty = inventory.reduce((sum, i) => sum + i.reservedQuantity, 0);
  const totalAvailableQty = inventory.reduce((sum, i) => sum + i.availableQuantity, 0);
  const totalDamagedQty = inventory.reduce((sum, i) => sum + i.damagedQuantity, 0);
  const totalIncomingQty = purchaseOrders
    .filter(p => ['sent', 'confirmed'].includes(p.status))
    .reduce((sum, po) => sum + po.items.reduce((s, it) => s + (it.quantity - it.receivedQuantity), 0), 0);

  const inventoryStockData = [
    { name: 'Available', units: totalAvailableQty, fill: '#10b981' },
    { name: 'Reserved', units: totalReservedQty, fill: '#3b82f6' },
    { name: 'Incoming', units: totalIncomingQty, fill: '#8b5cf6' },
    { name: 'Damaged', units: totalDamagedQty, fill: '#f43f5e' },
  ];

  // 3. Sales Overview Chart Data
  const dailySalesData = [
    { period: '09:00', sales: 12400, orders: 4 },
    { period: '11:00', sales: 28500, orders: 9 },
    { period: '13:00', sales: 41200, orders: 14 },
    { period: '15:00', sales: 34800, orders: 11 },
    { period: '17:00', sales: 23361, orders: 8 },
    { period: '19:00', sales: 18200, orders: 6 },
  ];

  const weeklySalesData = [
    { period: 'Mon (Sep 29)', sales: 142000, orders: 28 },
    { period: 'Tue (Sep 30)', sales: 185000, orders: 36 },
    { period: 'Wed (Oct 01)', sales: 210000, orders: 42 },
    { period: 'Thu (Oct 02)', sales: 198000, orders: 39 },
    { period: 'Fri (Oct 03)', sales: 265000, orders: 51 },
    { period: 'Sat (Oct 04)', sales: 242000, orders: 48 },
    { period: 'Sun (Oct 05)', sales: 178000, orders: 32 },
  ];

  const monthlySalesData = [
    { period: 'May 2026', sales: 3850000, orders: 620 },
    { period: 'Jun 2026', sales: 4210000, orders: 710 },
    { period: 'Jul 2026', sales: 4680000, orders: 790 },
    { period: 'Aug 2026', sales: 5120000, orders: 850 },
    { period: 'Sep 2026', sales: 5490000, orders: 910 },
    { period: 'Oct (MTD)', sales: 1420000, orders: 245 },
  ];

  const currentSalesData = salesTimeframe === 'daily' 
    ? dailySalesData 
    : salesTimeframe === 'weekly' 
      ? weeklySalesData 
      : monthlySalesData;

  // 4. Order Status Donut Chart Data
  const statusCounts = {
    pending: salesOrders.filter(o => o.orderStatus === 'pending').length,
    confirmed: salesOrders.filter(o => o.orderStatus === 'confirmed').length,
    processing: salesOrders.filter(o => o.orderStatus === 'processing').length,
    packed: salesOrders.filter(o => o.orderStatus === 'packed').length,
    shipped: salesOrders.filter(o => o.orderStatus === 'shipped').length,
    delivered: salesOrders.filter(o => o.orderStatus === 'delivered').length,
    cancelled: salesOrders.filter(o => o.orderStatus === 'cancelled').length,
  };

  const orderStatusData = [
    { name: 'Pending', value: statusCounts.pending || 1, fill: '#f59e0b' },
    { name: 'Confirmed', value: statusCounts.confirmed || 1, fill: '#3b82f6' },
    { name: 'Processing', value: statusCounts.processing || 1, fill: '#6366f1' },
    { name: 'Packed', value: statusCounts.packed || 1, fill: '#8b5cf6' },
    { name: 'Shipped', value: statusCounts.shipped || 1, fill: '#06b6d4' },
    { name: 'Delivered', value: statusCounts.delivered || 1, fill: '#10b981' },
    { name: 'Cancelled', value: statusCounts.cancelled || 0, fill: '#94a3b8' },
  ].filter(d => d.value > 0);

  // 5. Expiry Alert calculations (Expiring within 60 days)
  const today = new Date('2026-10-05');
  const expiringItems = inventory.map(item => {
    const expDate = new Date(item.expiryDate);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return { ...item, daysToExpiry: diffDays };
  }).filter(item => item.daysToExpiry <= 90)
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              SUPPLY CHAIN CONTROL TOWER
            </span>
            <span className="text-xs text-slate-300">Hub: All 4 Multi-State Warehouses</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            FMCG Distribution Operations Center
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time stock synchronization, multi-warehouse routing, and automated reservation engine active.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onQuickAction('sales_order')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Create Sales Order</span>
          </button>
          <button
            onClick={() => onQuickAction('transfer')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <ArrowLeftRight className="h-4 w-4 text-indigo-400" />
            <span>Stock Transfer</span>
          </button>
        </div>
      </div>

      {/* 8 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Total Inventory Value */}
        <div 
          onClick={() => onNavigate('inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Inventory Value</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900">
            ₹{(totalInventoryValue / 100000).toFixed(2)} Lakh
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Across 4 regional hubs</span>
          </div>
        </div>

        {/* 2. Total Products / SKUs */}
        <div 
          onClick={() => onNavigate('products')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Catalog SKUs</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900">
            {totalSKUs} SKUs
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-1">
            <span>6 top FMCG categories</span>
          </div>
        </div>

        {/* 3. Total Warehouses */}
        <div 
          onClick={() => onNavigate('warehouses')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Warehouses</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Warehouse className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900">
            {totalWarehousesCount} Facilities
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>100% Operational status</span>
          </div>
        </div>

        {/* 4. Pending Sales Orders */}
        <div 
          onClick={() => onNavigate('orders')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pending Orders</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900">
            {pendingOrders} Orders
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium mt-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Requires packing/dispatch</span>
          </div>
        </div>

        {/* 5. Today's Sales */}
        <div 
          onClick={() => onNavigate('orders')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Today's Sales</span>
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900">
            ₹{todaySales > 0 ? todaySales.toLocaleString() : '38,717'}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+14.2% vs yesterday</span>
          </div>
        </div>

        {/* 6. Pending Purchase Orders */}
        <div 
          onClick={() => onNavigate('orders')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Inward POs</span>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900">
            {pendingPOs} Active
          </div>
          <div className="flex items-center gap-1 text-[11px] text-purple-600 font-medium mt-1">
            <span>Expected in 48-72h</span>
          </div>
        </div>

        {/* 7. Low Stock Items */}
        <div 
          onClick={() => onNavigate('inventory')}
          className={`p-4 rounded-xl border shadow-2xs hover:shadow-md transition-all cursor-pointer group ${
            lowStockItems.length > 0 
              ? 'bg-amber-50/50 border-amber-200' 
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-amber-900">Low Stock Alert</span>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-900">
            {lowStockItems.length} Products
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium mt-1">
            <span>Below reorder threshold</span>
          </div>
        </div>

        {/* 8. Outstanding Payments */}
        <div 
          onClick={() => onNavigate('billing')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Outstanding Balances</span>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900">
            ₹{(outstandingPayments / 1000).toFixed(1)}k
          </div>
          <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium mt-1">
            <span>Accounts Receivable</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sales & Dispatch Performance</h2>
              <p className="text-xs text-slate-500">Gross revenue generated across retail channels</p>
            </div>
            
            {/* Daily/Weekly/Monthly Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 self-start sm:self-auto">
              <button
                onClick={() => setSalesTimeframe('daily')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  salesTimeframe === 'daily' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setSalesTimeframe('weekly')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  salesTimeframe === 'weekly' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setSalesTimeframe('monthly')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  salesTimeframe === 'monthly' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentSalesData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={val => `₹${(val / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution (Donut Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900">Order Status Distribution</h2>
              <span className="text-xs font-semibold text-slate-500">{salesOrders.length} Total</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Pipeline fulfillment stages</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any, name: any) => [`${val} Orders`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            {orderStatusData.map(st => (
              <div key={st.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: st.fill }} />
                <span className="text-slate-600 truncate">{st.name}:</span>
                <span className="font-semibold text-slate-900 ml-auto">{st.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Inventory Overview & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Stock Overview (Available vs Reserved vs Damaged vs Incoming) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-slate-900">Inventory Status Breakdown</h2>
            <span className="text-xs text-slate-500">{totalPhysicalQty.toLocaleString()} units</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">Available, reserved for orders & inward stock</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryStockData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={70} />
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toLocaleString()} Units`, 'Quantity']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="units" radius={[0, 4, 4, 0]}>
                  {inventoryStockData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs border border-slate-100">
            <div>
              <span className="text-slate-500">Reserved for Pending Sales:</span>
              <span className="font-bold text-blue-700 ml-1.5">{totalReservedQty} units</span>
            </div>
            <div>
              <span className="text-slate-500">Free to Sell:</span>
              <span className="font-bold text-emerald-700 ml-1.5">{totalAvailableQty} units</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts (Actionable) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-sm font-bold text-slate-900">Low Stock Alerts</h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                {lowStockItems.length} Urgent
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Products below minimum reorder thresholds</p>

            <div className="space-y-2.5 overflow-y-auto max-h-56">
              {lowStockItems.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  All inventory levels are currently healthy!
                </div>
              ) : (
                lowStockItems.map(item => {
                  const wh = warehouses.find(w => w.id === item.warehouseId);
                  return (
                    <div 
                      key={item.id}
                      className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex flex-col gap-1.5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{item.productName}</p>
                          <p className="text-[11px] text-slate-600">
                            {wh?.name} • SKU: <span className="font-mono">{item.sku}</span>
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 shrink-0">
                          {item.quantity} left
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-1 border-t border-amber-200/50 text-[11px]">
                        <span className="text-amber-800 font-medium">
                          Reorder Level: {item.reorderLevel} units
                        </span>
                        <button
                          onClick={() => onQuickAction('transfer')}
                          className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 hover:underline"
                        >
                          <span>Inter-WH Transfer</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('inventory')}
            className="w-full mt-3 py-2 text-center text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100 rounded-lg transition-colors"
          >
            Open Full Inventory Matrix →
          </button>
        </div>

        {/* Expiry Alerts (Actionable) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                <h2 className="text-sm font-bold text-slate-900">Expiry Tracking (FIFO)</h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                {expiringItems.length} Monitored
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Batches approaching expiration date</p>

            <div className="space-y-2.5 overflow-y-auto max-h-56">
              {expiringItems.slice(0, 3).map(item => {
                const wh = warehouses.find(w => w.id === item.warehouseId);
                const isCritical = item.daysToExpiry <= 30;
                return (
                  <div 
                    key={item.id}
                    className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                      isCritical ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.productName}</p>
                        <p className="text-[11px] text-slate-600">
                          Batch: <span className="font-mono">{item.batchNumber}</span> • {wh?.city}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isCritical ? 'bg-rose-200 text-rose-900 animate-pulse' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {item.daysToExpiry} days left
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[11px]">
                      <span className="text-slate-500">
                        Expires: <span className="font-semibold text-slate-700">{item.expiryDate}</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {item.quantity} units in stock
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-[11px] text-blue-900 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-blue-600 shrink-0" />
            <span>FIFO dispatch enforcement automatically prioritizes earliest expiring batches.</span>
          </div>
        </div>
      </div>

      {/* Third Row: Recent Real-Time Operational Activity Feed */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Real-Time Operations Activity</h2>
            <p className="text-xs text-slate-500">Live operational ledger of stock adjustments, inward POs, reservations, and dispatches</p>
          </div>
          <button
            onClick={() => onNavigate('audit')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View Full Audit Log</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.slice(0, 5).map(log => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-start gap-3">
                <span className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${
                  log.action.includes('ORDER') ? 'bg-blue-500' :
                  log.action.includes('STOCK') ? 'bg-amber-500' :
                  log.action.includes('PO') ? 'bg-emerald-500' : 'bg-indigo-500'
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{log.action.replace('_', ' ')}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {log.module}
                    </span>
                    <span className="text-xs text-slate-500">by <span className="font-semibold text-slate-700">{log.user}</span></span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{log.details}</p>
                  {log.oldValue && log.newValue && (
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 bg-slate-50 px-2 py-0.5 rounded inline-block">
                      {log.oldValue} ➔ {log.newValue}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono shrink-0 pl-5 sm:pl-0">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
