import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Send, 
  PackageCheck, 
  Truck, 
  FileText, 
  AlertTriangle, 
  ArrowRight,
  Eye,
  X,
  CreditCard,
  MapPin,
  ChevronRight,
  ArrowLeftRight
} from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';
import { SalesOrder, PurchaseOrder, SOStatus, POStatus, SOItem } from '../../types/index.ts';

interface OrdersViewProps {
  onNavigate: (tab: string, itemId?: string) => void;
  onQuickAction: (actionType: 'sales_order' | 'purchase_order' | 'stock_adjust' | 'transfer') => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  onNavigate,
  onQuickAction
}) => {
  const { 
    salesOrders, 
    purchaseOrders, 
    warehouses, 
    customers, 
    vendors, 
    products, 
    inventory,
    confirmSalesOrder, 
    dispatchSalesOrder, 
    deliverSalesOrder, 
    generateInvoiceForSO,
    receivePurchaseOrder,
    createSalesOrder,
    createPurchaseOrder
  } = useFMCG();

  const [orderTypeTab, setOrderTypeTab] = useState<'sales' | 'purchases'>('sales');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detailed Order Inspection Drawer/Modal
  const [selectedSO, setSelectedSO] = useState<SalesOrder | null>(null);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Shortage Alert Modal State
  const [shortageInfo, setShortageInfo] = useState<{
    orderNumber: string;
    shortages: any[];
  } | null>(null);

  // Create Sales Order Modal
  const [isCreateSOOpen, setIsCreateSOOpen] = useState(false);
  const [soCustomerId, setSoCustomerId] = useState(customers[0]?.id || '');
  const [soWarehouseId, setSoWarehouseId] = useState(warehouses[0]?.id || '');
  const [soItems, setSoItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || '', quantity: 20 }
  ]);
  const [soAddress, setSoAddress] = useState('');

  // Create PO Modal
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  const [poVendorId, setPoVendorId] = useState(vendors[0]?.id || '');
  const [poWarehouseId, setPoWarehouseId] = useState(warehouses[0]?.id || '');
  const [poItems, setPoItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || '', quantity: 100 }
  ]);

  // Handle SO Confirmation (Automated Reservation)
  const handleConfirmSO = (soId: string) => {
    const res = confirmSalesOrder(soId);
    if (!res.success && res.shortages) {
      const order = salesOrders.find(o => o.id === soId);
      setShortageInfo({
        orderNumber: order?.soNumber || '',
        shortages: res.shortages
      });
    }
  };

  const handleGenerateInvoice = (soId: string) => {
    const invoice = generateInvoiceForSO(soId);
    if (invoice) {
      onNavigate('billing', invoice.id);
    }
  };

  // Submit New Sales Order
  const handleSaveSO = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === soCustomerId);
    const wh = warehouses.find(w => w.id === soWarehouseId);
    if (!cust || !wh || soItems.length === 0) return;

    const items: SOItem[] = soItems.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      const unitPrice = p?.sellingPrice || 100;
      const taxRate = p?.gstRate || 18;
      const taxable = unitPrice * item.quantity;
      const taxAmount = (taxable * taxRate) / 100;
      return {
        productId: item.productId,
        productName: p?.name || 'FMCG Product',
        sku: p?.sku || 'SKU-001',
        unit: p?.unit || 'Pack',
        quantity: item.quantity,
        unitPrice,
        taxRate,
        taxAmount,
        discount: 0,
        totalAmount: taxable + taxAmount
      };
    });

    const subtotal = items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
    const taxTotal = items.reduce((s, i) => s + i.taxAmount, 0);
    const grandTotal = subtotal + taxTotal;

    const todayStr = new Date().toISOString().substring(0, 10);
    const dueStr = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().substring(0, 10);

    createSalesOrder({
      customerId: cust.id,
      customerName: cust.businessName,
      warehouseId: wh.id,
      warehouseName: wh.name,
      orderDate: todayStr,
      dispatchDueDate: dueStr,
      items,
      subtotal,
      taxTotal,
      grandTotal,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      deliveryAddress: soAddress || cust.address
    });

    setIsCreateSOOpen(false);
  };

  // Submit New Purchase Order
  const handleSavePO = (e: React.FormEvent) => {
    e.preventDefault();
    const ven = vendors.find(v => v.id === poVendorId);
    const wh = warehouses.find(w => w.id === poWarehouseId);
    if (!ven || !wh || poItems.length === 0) return;

    const items = poItems.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      const unitPrice = p?.purchasePrice || 80;
      const taxRate = p?.gstRate || 18;
      const taxable = unitPrice * item.quantity;
      const taxAmount = (taxable * taxRate) / 100;
      return {
        productId: item.productId,
        productName: p?.name || 'FMCG Product',
        sku: p?.sku || 'SKU-001',
        unit: p?.unit || 'Pack',
        quantity: item.quantity,
        receivedQuantity: 0,
        unitPrice,
        taxRate,
        taxAmount,
        totalAmount: taxable + taxAmount
      };
    });

    const subtotal = items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
    const taxTotal = items.reduce((s, i) => s + i.taxAmount, 0);
    const grandTotal = subtotal + taxTotal;

    const todayStr = new Date().toISOString().substring(0, 10);
    const expDate = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().substring(0, 10);

    createPurchaseOrder({
      vendorId: ven.id,
      vendorName: ven.companyName,
      warehouseId: wh.id,
      warehouseName: wh.name,
      orderDate: todayStr,
      expectedDeliveryDate: expDate,
      items,
      subtotal,
      taxTotal,
      grandTotal,
      status: 'confirmed'
    });

    setIsCreatePOOpen(false);
  };

  const getSOStatusBadge = (status: SOStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Pending Review</span>;
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Reserved & Confirmed</span>;
      case 'processing':
      case 'packed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Packed & Staged</span>;
      case 'shipped':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">Dispatched 🚚</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Delivered ✓</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Cancelled</span>;
    }
  };

  const getPOStatusBadge = (status: POStatus) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Draft</span>;
      case 'sent':
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Confirmed (Awaiting Delivery)</span>;
      case 'partially_received':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Partial Inward</span>;
      case 'received':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Stock Received ✓</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">Closed</span>;
    }
  };

  // Filter lists
  const filteredSalesOrders = salesOrders.filter(so => {
    if (statusFilter !== 'all' && so.orderStatus !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return so.soNumber.toLowerCase().includes(q) || so.customerName.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredPurchaseOrders = purchaseOrders.filter(po => {
    if (statusFilter !== 'all' && po.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return po.poNumber.toLowerCase().includes(q) || po.vendorName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            <span>Centralized Order Fulfillment & Procurement</span>
          </h1>
          <p className="text-xs text-slate-500">
            End-to-end B2B sales orders with automated warehouse stock reservation and supplier PO receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sales vs Purchases Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => { setOrderTypeTab('sales'); setStatusFilter('all'); }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                orderTypeTab === 'sales' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Sales Orders ({salesOrders.length})
            </button>
            <button
              onClick={() => { setOrderTypeTab('purchases'); setStatusFilter('all'); }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                orderTypeTab === 'purchases' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Purchase Orders ({purchaseOrders.length})
            </button>
          </div>

          {orderTypeTab === 'sales' ? (
            <button
              onClick={() => setIsCreateSOOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Sales Order</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCreatePOOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Purchase Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={orderTypeTab === 'sales' ? "Search SO number, customer..." : "Search PO number, vendor..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden w-full sm:w-48"
          >
            <option value="all">All Statuses</option>
            {orderTypeTab === 'sales' ? (
              <>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </>
            ) : (
              <>
                <option value="sent">Sent / Confirmed</option>
                <option value="received">Received</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* SALES ORDERS TABLE */}
      {orderTypeTab === 'sales' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3.5">Order Number</th>
                  <th className="py-3 px-3.5">Customer & Destination</th>
                  <th className="py-3 px-3.5">Fulfillment Hub</th>
                  <th className="py-3 px-3.5 text-center">Items</th>
                  <th className="py-3 px-3.5 text-right">Order Value</th>
                  <th className="py-3 px-3.5 text-center">Order Status</th>
                  <th className="py-3 px-3.5 text-center">Payment</th>
                  <th className="py-3 px-3.5 text-center">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSalesOrders.map(so => (
                  <tr key={so.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* SO Number & Date */}
                    <td className="py-3 px-3.5">
                      <div className="font-mono font-bold text-slate-900">{so.soNumber}</div>
                      <div className="text-[11px] text-slate-500">{so.orderDate}</div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900">{so.customerName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{so.deliveryAddress}</div>
                    </td>

                    {/* Warehouse */}
                    <td className="py-3 px-3.5 font-medium text-slate-700">
                      {so.warehouseName}
                    </td>

                    {/* Items */}
                    <td className="py-3 px-3.5 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                        {so.items.length} SKUs
                      </span>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900 text-sm">
                      ₹{so.grandTotal.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5 text-center">
                      {getSOStatusBadge(so.orderStatus)}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-3.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        so.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        so.paymentStatus === 'partial' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {so.paymentStatus.toUpperCase()}
                      </span>
                    </td>

                    {/* Actions Workflow: Confirm (Reserve) -> Dispatch -> Generate Invoice */}
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. Confirm Order (Triggers automated stock reservation) */}
                        {so.orderStatus === 'pending' && (
                          <button
                            onClick={() => handleConfirmSO(so.id)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold shadow-2xs"
                          >
                            Reserve & Confirm
                          </button>
                        )}

                        {/* 2. Dispatch Order (Deducts reserved stock) */}
                        {(so.orderStatus === 'confirmed' || so.orderStatus === 'packed') && (
                          <button
                            onClick={() => dispatchSalesOrder(so.id)}
                            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-[11px] font-semibold shadow-2xs flex items-center gap-1"
                          >
                            <Truck className="h-3 w-3" />
                            <span>Dispatch</span>
                          </button>
                        )}

                        {/* 3. Mark Delivered */}
                        {so.orderStatus === 'shipped' && (
                          <button
                            onClick={() => deliverSalesOrder(so.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-semibold shadow-2xs"
                          >
                            Mark Delivered
                          </button>
                        )}

                        {/* Generate / View Tax Invoice */}
                        <button
                          onClick={() => handleGenerateInvoice(so.id)}
                          title="Generate or View GST Tax Invoice"
                          className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-md text-[11px] font-semibold flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          <span>{so.invoiceId ? 'View Invoice' : 'Invoice'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PURCHASE ORDERS TABLE */}
      {orderTypeTab === 'purchases' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3.5">PO Number</th>
                  <th className="py-3 px-3.5">Vendor Supplier</th>
                  <th className="py-3 px-3.5">Receiving Warehouse</th>
                  <th className="py-3 px-3.5">Order / Expected Date</th>
                  <th className="py-3 px-3.5 text-center">Items</th>
                  <th className="py-3 px-3.5 text-right">PO Total</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                  <th className="py-3 px-3.5 text-center">Inward Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPurchaseOrders.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900">{po.poNumber}</td>
                    <td className="py-3 px-3.5 font-semibold text-slate-800">{po.vendorName}</td>
                    <td className="py-3 px-3.5 font-medium text-slate-700">{po.warehouseName}</td>
                    <td className="py-3 px-3.5 text-slate-600">
                      <div>Issued: {po.orderDate}</div>
                      <div className="text-[10px] text-slate-400">Due: {po.expectedDeliveryDate}</div>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                        {po.items.length} SKUs
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900 text-sm">
                      ₹{po.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {getPOStatusBadge(po.status)}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {['sent', 'confirmed', 'partially_received'].includes(po.status) ? (
                        <button
                          onClick={() => receivePurchaseOrder(po.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-semibold shadow-2xs flex items-center gap-1 mx-auto"
                        >
                          <Boxes className="h-3 w-3" />
                          <span>Receive Shipment</span>
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Inwarded to Stock</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Shortage Alert Modal (Section 12: Automated Reservation Failure) */}
      {shortageInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-rose-100 bg-rose-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                <span>Insufficient Inventory Warning</span>
              </div>
              <button onClick={() => setShortageInfo(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Sales Order <strong className="text-slate-900 font-mono">{shortageInfo.orderNumber}</strong> cannot be reserved. The target warehouse does not have adequate available stock for the following items:
              </p>

              <div className="space-y-3">
                {shortageInfo.shortages.map((st: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{st.productName}</p>
                        <p className="text-[11px] font-mono text-slate-500">SKU: {st.sku}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        Shortage: {st.shortage} units
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
                      <div>Required: <strong className="text-slate-800">{st.required}</strong></div>
                      <div>Available at WH: <strong className="text-rose-600">{st.available}</strong></div>
                    </div>

                    {st.alternativeWarehouse && (
                      <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Alternative Stock Available</p>
                          <p className="text-xs text-slate-700 font-semibold">{st.alternativeWarehouse.warehouseName}: {st.alternativeWarehouse.availableStock} units</p>
                        </div>
                        <button
                          onClick={() => {
                            setShortageInfo(null);
                            onQuickAction('transfer');
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px] flex items-center gap-1"
                        >
                          <ArrowLeftRight className="h-3 w-3" />
                          <span>1-Click Transfer</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShortageInfo(null)}
                  className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SALES ORDER MODAL */}
      {isCreateSOOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                <span>Create New Sales Order</span>
              </h2>
              <button onClick={() => setIsCreateSOOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveSO} className="p-4 space-y-4 overflow-y-auto text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Client</label>
                  <select
                    value={soCustomerId}
                    onChange={e => setSoCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.businessName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fulfillment Warehouse</label>
                  <select
                    value={soWarehouseId}
                    onChange={e => setSoWarehouseId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Line Items</label>
                {soItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <select
                      value={item.productId}
                      onChange={e => {
                        const copy = [...soItems];
                        copy[idx].productId = e.target.value;
                        setSoItems(copy);
                      }}
                      className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₹{p.sellingPrice})</option>
                      ))}
                    </select>

                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => {
                          const copy = [...soItems];
                          copy[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                          setSoItems(copy);
                        }}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-center"
                      />
                    </div>

                    {soItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSoItems(soItems.filter((_, i) => i !== idx))}
                        className="text-rose-600 p-1 hover:bg-rose-50 rounded"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setSoItems([...soItems, { productId: products[0].id, quantity: 10 }])}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Another Product</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Destination Address</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Retail Bay 4, Western Express Industrial Park"
                  value={soAddress}
                  onChange={e => setSoAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateSOOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PURCHASE ORDER MODAL */}
      {isCreatePOOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Boxes className="h-4 w-4 text-emerald-600" />
                <span>Create Purchase Order (Supplier Replenishment)</span>
              </h2>
              <button onClick={() => setIsCreatePOOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSavePO} className="p-4 space-y-4 overflow-y-auto text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor Supplier</label>
                  <select
                    value={poVendorId}
                    onChange={e => setPoVendorId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.companyName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Receiving Warehouse</label>
                  <select
                    value={poWarehouseId}
                    onChange={e => setPoWarehouseId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PO Items */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Supplied Products</label>
                {poItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <select
                      value={item.productId}
                      onChange={e => {
                        const copy = [...poItems];
                        copy[idx].productId = e.target.value;
                        setPoItems(copy);
                      }}
                      className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Purchase: ₹{p.purchasePrice})</option>
                      ))}
                    </select>

                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => {
                          const copy = [...poItems];
                          copy[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                          setPoItems(copy);
                        }}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-center"
                      />
                    </div>

                    {poItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPoItems(poItems.filter((_, i) => i !== idx))}
                        className="text-rose-600 p-1 hover:bg-rose-50 rounded"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setPoItems([...poItems, { productId: products[0].id, quantity: 50 }])}
                  className="text-emerald-600 hover:text-emerald-800 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Another Item</span>
                </button>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatePOOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
