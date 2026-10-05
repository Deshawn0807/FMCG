import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  User, 
  Product, 
  Warehouse, 
  WarehouseInventory, 
  InventoryTransaction, 
  Vendor, 
  Customer, 
  PurchaseOrder, 
  SalesOrder, 
  StockTransfer, 
  Invoice, 
  PaymentRecord, 
  NotificationItem, 
  AuditLog, 
  CompanySettings,
  SOStatus,
  POStatus,
  TransferStatus,
  InvoiceItem
} from '../types/index.ts';
import { 
  INITIAL_COMPANY_SETTINGS, 
  INITIAL_USERS, 
  INITIAL_WAREHOUSES, 
  INITIAL_VENDORS, 
  INITIAL_CUSTOMERS, 
  INITIAL_PRODUCTS, 
  INITIAL_INVENTORY, 
  INITIAL_SALES_ORDERS, 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_TRANSFERS, 
  INITIAL_INVOICES, 
  INITIAL_PAYMENTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_TRANSACTIONS 
} from '../data/mockData.ts';

interface ShortageDetail {
  productId: string;
  productName: string;
  sku: string;
  required: number;
  available: number;
  shortage: number;
  alternativeWarehouse?: {
    warehouseId: string;
    warehouseName: string;
    availableStock: number;
  };
}

interface FMCGContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  companySettings: CompanySettings;
  updateCompanySettings: (settings: CompanySettings) => void;
  products: Product[];
  warehouses: Warehouse[];
  inventory: WarehouseInventory[];
  transactions: InventoryTransaction[];
  vendors: Vendor[];
  customers: Customer[];
  purchaseOrders: PurchaseOrder[];
  salesOrders: SalesOrder[];
  transfers: StockTransfer[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  
  // Real-time synchronization state
  isLiveSync: boolean;
  lastEventTime: Date;
  toggleLiveSync: () => void;
  
  // Actions
  adjustStock: (params: {
    warehouseId: string;
    productId: string;
    quantityChange: number;
    reason: string;
    notes?: string;
  }) => boolean;
  
  createSalesOrder: (order: Omit<SalesOrder, 'id' | 'soNumber' | 'created_at'>) => SalesOrder;
  confirmSalesOrder: (soId: string) => { success: boolean; shortages?: ShortageDetail[] };
  dispatchSalesOrder: (soId: string) => boolean;
  deliverSalesOrder: (soId: string) => boolean;
  cancelSalesOrder: (soId: string) => boolean;
  generateInvoiceForSO: (soId: string) => Invoice | null;
  
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber'>) => PurchaseOrder;
  updatePOStatus: (poId: string, status: POStatus) => boolean;
  receivePurchaseOrder: (poId: string) => boolean;
  
  createStockTransfer: (transfer: Omit<StockTransfer, 'id' | 'transferNumber' | 'status'>) => StockTransfer;
  updateTransferStatus: (transferId: string, newStatus: TransferStatus) => boolean;
  
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'receiptNumber'>) => PaymentRecord;
  
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => boolean;
  
  addWarehouse: (warehouse: Omit<Warehouse, 'id' | 'code'>) => Warehouse;
  updateWarehouse: (id: string, warehouse: Partial<Warehouse>) => boolean;
  
  addVendor: (vendor: Omit<Vendor, 'id' | 'vendorCode'>) => Vendor;
  updateVendor: (id: string, vendor: Partial<Vendor>) => boolean;

  addCustomer: (customer: Omit<Customer, 'id' | 'customerCode'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => boolean;
  
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  simulateLiveEvent: () => void;
}

const FMCGContext = createContext<FMCGContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'districore_fmcg_';

export const FMCGProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load helper
  const loadState = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => 
    loadState('settings', INITIAL_COMPANY_SETTINGS)
  );
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = loadState<User>('current_user', INITIAL_USERS[0]);
    return INITIAL_USERS.find(u => u.id === savedUser.id) || INITIAL_USERS[0];
  });
  
  const [products, setProducts] = useState<Product[]>(() => loadState('products', INITIAL_PRODUCTS));
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => loadState('warehouses', INITIAL_WAREHOUSES));
  const [inventory, setInventory] = useState<WarehouseInventory[]>(() => loadState('inventory', INITIAL_INVENTORY));
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => loadState('transactions', INITIAL_TRANSACTIONS));
  const [vendors, setVendors] = useState<Vendor[]>(() => loadState('vendors', INITIAL_VENDORS));
  const [customers, setCustomers] = useState<Customer[]>(() => loadState('customers', INITIAL_CUSTOMERS));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => loadState('purchase_orders', INITIAL_PURCHASE_ORDERS));
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => loadState('sales_orders', INITIAL_SALES_ORDERS));
  const [transfers, setTransfers] = useState<StockTransfer[]>(() => loadState('transfers', INITIAL_TRANSFERS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadState('invoices', INITIAL_INVOICES));
  const [payments, setPayments] = useState<PaymentRecord[]>(() => loadState('payments', INITIAL_PAYMENTS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadState('notifications', INITIAL_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadState('audit_logs', INITIAL_AUDIT_LOGS));

  const [isLiveSync, setIsLiveSync] = useState<boolean>(true);
  const [lastEventTime, setLastEventTime] = useState<Date>(new Date());

  // Save changes to localStorage
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'settings', JSON.stringify(companySettings)); }, [companySettings]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'current_user', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'warehouses', JSON.stringify(warehouses)); }, [warehouses]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'purchase_orders', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'sales_orders', JSON.stringify(salesOrders)); }, [salesOrders]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'transfers', JSON.stringify(transfers)); }, [transfers]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'payments', JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);

  const addAuditLog = useCallback((action: string, module: string, details: string, oldValue?: string, newValue?: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      details,
      oldValue,
      newValue
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setLastEventTime(new Date());
  }, [currentUser]);

  const addNotification = useCallback((title: string, message: string, type: NotificationItem['type'], linkModule?: string, priority: NotificationItem['priority'] = 'medium') => {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      linkModule,
      priority
    };
    setNotifications(prev => [newNotif, ...prev]);
    setLastEventTime(new Date());
  }, []);

  const toggleLiveSync = () => setIsLiveSync(prev => !prev);

  // 1. Stock Adjustment
  const adjustStock = (params: {
    warehouseId: string;
    productId: string;
    quantityChange: number;
    reason: string;
    notes?: string;
  }): boolean => {
    const invIndex = inventory.findIndex(
      i => i.warehouseId === params.warehouseId && i.productId === params.productId
    );
    const prod = products.find(p => p.id === params.productId);
    const wh = warehouses.find(w => w.id === params.warehouseId);

    if (!prod || !wh) return false;

    let prevQty = 0;
    let newQty = 0;

    if (invIndex >= 0) {
      const current = inventory[invIndex];
      prevQty = current.quantity;
      newQty = Math.max(0, current.quantity + params.quantityChange);
      const newAvail = Math.max(0, current.availableQuantity + params.quantityChange);

      const updatedItem: WarehouseInventory = {
        ...current,
        quantity: newQty,
        availableQuantity: newAvail,
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      setInventory(prev => {
        const copy = [...prev];
        copy[invIndex] = updatedItem;
        return copy;
      });
    } else {
      prevQty = 0;
      newQty = Math.max(0, params.quantityChange);
      const newItem: WarehouseInventory = {
        id: `inv_${Date.now()}`,
        warehouseId: params.warehouseId,
        productId: params.productId,
        productName: prod.name,
        sku: prod.sku,
        brand: prod.brand,
        category: prod.category,
        batchNumber: prod.batchNumber || 'BATCH-DEFAULT',
        quantity: newQty,
        reservedQuantity: 0,
        availableQuantity: newQty,
        damagedQuantity: 0,
        unitCost: prod.purchasePrice,
        sellingPrice: prod.sellingPrice,
        reorderLevel: prod.reorderLevel,
        expiryDate: prod.expiryDate,
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setInventory(prev => [...prev, newItem]);
    }

    // Record Transaction
    const tx: InventoryTransaction = {
      id: `tx_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: 'adjust',
      productId: params.productId,
      productName: prod.name,
      sku: prod.sku,
      warehouseId: params.warehouseId,
      warehouseName: wh.name,
      quantityChange: params.quantityChange,
      previousQuantity: prevQty,
      newQuantity: newQty,
      referenceType: 'manual_adjustment',
      referenceId: `ADJ-${Date.now().toString().slice(-4)}`,
      performedBy: currentUser.name,
      notes: `${params.reason}: ${params.notes || ''}`
    };
    setTransactions(prev => [tx, ...prev]);

    addAuditLog(
      'STOCK_ADJUSTMENT',
      'Inventory',
      `Stock adjusted by ${params.quantityChange > 0 ? '+' : ''}${params.quantityChange} for ${prod.name} at ${wh.name}. Reason: ${params.reason}`,
      `Quantity: ${prevQty}`,
      `Quantity: ${newQty}`
    );

    // Alert if stock fell below reorder level
    if (newQty <= prod.reorderLevel) {
      addNotification(
        `Low Stock Alert: ${prod.name}`,
        `${wh.name} has ${newQty} units remaining (Reorder Level: ${prod.reorderLevel}). Replenishment recommended.`,
        'low_stock',
        'inventory',
        'high'
      );
    }

    return true;
  };

  // 2. Automated Inventory Reservation & Sales Order Confirmation
  const confirmSalesOrder = (soId: string): { success: boolean; shortages?: ShortageDetail[] } => {
    const order = salesOrders.find(o => o.id === soId);
    if (!order) return { success: false };

    const shortages: ShortageDetail[] = [];

    // Verify availability for all items in order's warehouse
    for (const item of order.items) {
      const inv = inventory.find(
        i => i.warehouseId === order.warehouseId && i.productId === item.productId
      );
      const available = inv ? inv.availableQuantity : 0;
      if (available < item.quantity) {
        // Look for alternative warehouse with available stock
        const otherInv = inventory.find(
          i => i.productId === item.productId && i.warehouseId !== order.warehouseId && i.availableQuantity >= item.quantity
        );
        const altWarehouse = otherInv ? warehouses.find(w => w.id === otherInv.warehouseId) : undefined;

        shortages.push({
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          required: item.quantity,
          available,
          shortage: item.quantity - available,
          alternativeWarehouse: altWarehouse && otherInv ? {
            warehouseId: altWarehouse.id,
            warehouseName: altWarehouse.name,
            availableStock: otherInv.availableQuantity
          } : undefined
        });
      }
    }

    if (shortages.length > 0) {
      addNotification(
        `Order ${order.soNumber} Insufficient Inventory`,
        `Cannot confirm order due to stock shortage in ${order.warehouseName}. Check alternative warehouses.`,
        'low_stock',
        'orders',
        'high'
      );
      return { success: false, shortages };
    }

    // Reserve stock in warehouse
    setInventory(prev => {
      const copy = [...prev];
      for (const item of order.items) {
        const idx = copy.findIndex(
          i => i.warehouseId === order.warehouseId && i.productId === item.productId
        );
        if (idx >= 0) {
          const current = copy[idx];
          copy[idx] = {
            ...current,
            reservedQuantity: current.reservedQuantity + item.quantity,
            availableQuantity: Math.max(0, current.availableQuantity - item.quantity),
            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };
        }
      }
      return copy;
    });

    // Record Reserve Transactions
    for (const item of order.items) {
      const inv = inventory.find(
        i => i.warehouseId === order.warehouseId && i.productId === item.productId
      );
      const prevAvail = inv ? inv.availableQuantity : item.quantity;
      const tx: InventoryTransaction = {
        id: `tx_${Date.now()}_${item.productId}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'reserve',
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        warehouseId: order.warehouseId,
        warehouseName: order.warehouseName,
        quantityChange: item.quantity,
        previousQuantity: prevAvail,
        newQuantity: Math.max(0, prevAvail - item.quantity),
        referenceType: 'sales_order',
        referenceId: order.soNumber,
        performedBy: currentUser.name,
        notes: `Reserved for Sales Order ${order.soNumber}`
      };
      setTransactions(prev => [tx, ...prev]);
    }

    // Update Sales Order status
    setSalesOrders(prev => prev.map(o => o.id === soId ? { ...o, orderStatus: 'confirmed' } : o));

    addAuditLog(
      'ORDER_CONFIRMED',
      'Orders',
      `Sales Order ${order.soNumber} confirmed. Reserved inventory allocated for ${order.items.length} line items at ${order.warehouseName}.`,
      'Status: pending',
      'Status: confirmed'
    );

    addNotification(
      `Sales Order ${order.soNumber} Confirmed`,
      `Inventory reserved for customer ${order.customerName}. Ready for packing & dispatch.`,
      'order',
      'orders',
      'medium'
    );

    return { success: true };
  };

  // 3. Dispatch Sales Order
  const dispatchSalesOrder = (soId: string): boolean => {
    const order = salesOrders.find(o => o.id === soId);
    if (!order) return false;

    // Deduct physical quantity and reserved quantity
    setInventory(prev => {
      const copy = [...prev];
      for (const item of order.items) {
        const idx = copy.findIndex(
          i => i.warehouseId === order.warehouseId && i.productId === item.productId
        );
        if (idx >= 0) {
          const current = copy[idx];
          copy[idx] = {
            ...current,
            quantity: Math.max(0, current.quantity - item.quantity),
            reservedQuantity: Math.max(0, current.reservedQuantity - item.quantity),
            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };
        }
      }
      return copy;
    });

    // Record Dispatch Transactions
    for (const item of order.items) {
      const inv = inventory.find(
        i => i.warehouseId === order.warehouseId && i.productId === item.productId
      );
      const prevQty = inv ? inv.quantity : item.quantity;
      const tx: InventoryTransaction = {
        id: `tx_${Date.now()}_${item.productId}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'dispatch',
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        warehouseId: order.warehouseId,
        warehouseName: order.warehouseName,
        quantityChange: -item.quantity,
        previousQuantity: prevQty,
        newQuantity: Math.max(0, prevQty - item.quantity),
        referenceType: 'sales_order',
        referenceId: order.soNumber,
        performedBy: currentUser.name,
        notes: `Dispatched to ${order.customerName}`
      };
      setTransactions(prev => [tx, ...prev]);
    }

    setSalesOrders(prev => prev.map(o => o.id === soId ? { ...o, orderStatus: 'shipped' } : o));

    addAuditLog(
      'ORDER_DISPATCHED',
      'Orders',
      `Sales Order ${order.soNumber} dispatched from ${order.warehouseName} to ${order.customerName}.`,
      'Status: confirmed/packed',
      'Status: shipped'
    );

    addNotification(
      `Order ${order.soNumber} Dispatched`,
      `Shipment is en route to ${order.customerName}.`,
      'order',
      'orders',
      'medium'
    );

    return true;
  };

  const deliverSalesOrder = (soId: string): boolean => {
    setSalesOrders(prev => prev.map(o => o.id === soId ? { ...o, orderStatus: 'delivered' } : o));
    const order = salesOrders.find(o => o.id === soId);
    if (order) {
      addAuditLog(
        'ORDER_DELIVERED',
        'Orders',
        `Sales Order ${order.soNumber} marked as delivered to ${order.customerName}.`,
        'Status: shipped',
        'Status: delivered'
      );
    }
    return true;
  };

  const cancelSalesOrder = (soId: string): boolean => {
    const order = salesOrders.find(o => o.id === soId);
    if (!order) return false;

    // Release reserved inventory if it was confirmed
    if (['confirmed', 'processing', 'packed'].includes(order.orderStatus)) {
      setInventory(prev => {
        const copy = [...prev];
        for (const item of order.items) {
          const idx = copy.findIndex(
            i => i.warehouseId === order.warehouseId && i.productId === item.productId
          );
          if (idx >= 0) {
            const current = copy[idx];
            copy[idx] = {
              ...current,
              reservedQuantity: Math.max(0, current.reservedQuantity - item.quantity),
              availableQuantity: current.availableQuantity + item.quantity
            };
          }
        }
        return copy;
      });
    }

    setSalesOrders(prev => prev.map(o => o.id === soId ? { ...o, orderStatus: 'cancelled' } : o));

    addAuditLog(
      'ORDER_CANCELLED',
      'Orders',
      `Sales Order ${order.soNumber} cancelled. Any reserved stock has been released.`,
      `Status: ${order.orderStatus}`,
      'Status: cancelled'
    );

    return true;
  };

  // 4. Create Sales Order
  const createSalesOrder = (orderData: Omit<SalesOrder, 'id' | 'soNumber'>): SalesOrder => {
    const nextNum = 8920 + salesOrders.length + 1;
    const soNumber = `SO-2026-${nextNum}`;
    const newOrder: SalesOrder = {
      ...orderData,
      id: `so_${Date.now()}`,
      soNumber
    };

    setSalesOrders(prev => [newOrder, ...prev]);

    addAuditLog(
      'ORDER_CREATED',
      'Orders',
      `Created Sales Order ${soNumber} for ${orderData.customerName} (₹${orderData.grandTotal.toLocaleString()}).`
    );

    addNotification(
      `New Sales Order: ${soNumber}`,
      `Order from ${orderData.customerName} for ₹${orderData.grandTotal.toLocaleString()} created.`,
      'order',
      'orders',
      'medium'
    );

    return newOrder;
  };

  // 5. Generate Invoice
  const generateInvoiceForSO = (soId: string): Invoice | null => {
    const order = salesOrders.find(o => o.id === soId);
    if (!order) return null;

    // Check if invoice already exists
    const existing = invoices.find(i => i.orderId === soId);
    if (existing) return existing;

    const cust = customers.find(c => c.id === order.customerId);
    const invoiceNum = `INV-2026-${4400 + invoices.length + 1}`;
    
    // Determine IGST vs CGST+SGST (assuming intra-state if Maharashtra 27, inter-state otherwise)
    const isInterState = cust?.gstNumber && !cust.gstNumber.startsWith('27');

    const invoiceItems: InvoiceItem[] = order.items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const taxable = item.unitPrice * item.quantity - item.discount;
      const taxRate = item.taxRate;
      const taxTotal = (taxable * taxRate) / 100;
      
      return {
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        hsnCode: prod?.hsnCode || '19053100',
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        taxableValue: taxable,
        gstRate: taxRate,
        cgstAmount: isInterState ? 0 : taxTotal / 2,
        sgstAmount: isInterState ? 0 : taxTotal / 2,
        igstAmount: isInterState ? taxTotal : 0,
        total: taxable + taxTotal
      };
    });

    const subtotal = invoiceItems.reduce((sum, i) => sum + i.taxableValue, 0);
    const cgst = invoiceItems.reduce((sum, i) => sum + i.cgstAmount, 0);
    const sgst = invoiceItems.reduce((sum, i) => sum + i.sgstAmount, 0);
    const igst = invoiceItems.reduce((sum, i) => sum + i.igstAmount, 0);
    const totalTax = cgst + sgst + igst;
    const grandTotal = subtotal + totalTax;

    const today = new Date().toISOString().substring(0, 10);
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    const newInvoice: Invoice = {
      id: `inv_so_${Date.now()}`,
      invoiceNumber: invoiceNum,
      invoiceType: 'sales',
      orderId: order.id,
      orderNumber: order.soNumber,
      partyName: order.customerName,
      partyGst: cust?.gstNumber || '27AAACP0124M1Z2',
      partyAddress: order.deliveryAddress,
      partyPhone: cust?.phone || '+91 98200 00000',
      partyEmail: cust?.email || 'accounts@client.com',
      issueDate: today,
      dueDate,
      items: invoiceItems,
      subtotal,
      cgst,
      sgst,
      igst,
      totalTax,
      discount: order.items.reduce((sum, i) => sum + i.discount, 0),
      grandTotal,
      paidAmount: order.paymentStatus === 'paid' ? grandTotal : 0,
      paymentStatus: order.paymentStatus,
      warehouseName: order.warehouseName,
      notes: 'GST Tax Invoice. All disputes are subject to Mumbai jurisdiction.'
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Link invoiceId to order
    setSalesOrders(prev => prev.map(o => o.id === soId ? { ...o, invoiceId: newInvoice.id } : o));

    addAuditLog(
      'INVOICE_GENERATED',
      'Billing',
      `Generated GST Tax Invoice ${invoiceNum} for ${order.customerName} for ₹${grandTotal.toLocaleString()}.`
    );

    addNotification(
      `Invoice ${invoiceNum} Generated`,
      `Tax invoice for ${order.customerName} (₹${grandTotal.toLocaleString()}) is ready for download/print.`,
      'payment',
      'billing',
      'medium'
    );

    return newInvoice;
  };

  // 6. Purchase Order Receiving
  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'poNumber'>): PurchaseOrder => {
    const nextNum = 1040 + purchaseOrders.length + 1;
    const poNumber = `PO-2026-${nextNum}`;
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po_${Date.now()}`,
      poNumber
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    addAuditLog(
      'PO_CREATED',
      'Purchases',
      `Created Purchase Order ${poNumber} for vendor ${poData.vendorName} (₹${poData.grandTotal.toLocaleString()}).`
    );

    return newPO;
  };

  const updatePOStatus = (poId: string, status: POStatus): boolean => {
    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status } : p));
    addAuditLog('PO_STATUS_CHANGED', 'Purchases', `Purchase Order status changed to ${status}.`);
    return true;
  };

  const receivePurchaseOrder = (poId: string): boolean => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return false;

    // Credit inventory
    setInventory(prev => {
      const copy = [...prev];
      for (const item of po.items) {
        const idx = copy.findIndex(
          i => i.warehouseId === po.warehouseId && i.productId === item.productId
        );
        if (idx >= 0) {
          const current = copy[idx];
          copy[idx] = {
            ...current,
            quantity: current.quantity + item.quantity,
            availableQuantity: current.availableQuantity + item.quantity,
            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };
        } else {
          // create new inventory entry
          const prod = products.find(p => p.id === item.productId);
          copy.push({
            id: `inv_${Date.now()}_${item.productId}`,
            warehouseId: po.warehouseId,
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            brand: prod?.brand || 'FMCG',
            category: prod?.category || 'General',
            batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
            quantity: item.quantity,
            reservedQuantity: 0,
            availableQuantity: item.quantity,
            damagedQuantity: 0,
            unitCost: item.unitPrice,
            sellingPrice: prod?.sellingPrice || item.unitPrice * 1.25,
            reorderLevel: prod?.reorderLevel || 50,
            expiryDate: prod?.expiryDate || '2027-12-31',
            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19)
          });
        }
      }
      return copy;
    });

    // Record Inward Transactions
    for (const item of po.items) {
      const inv = inventory.find(i => i.warehouseId === po.warehouseId && i.productId === item.productId);
      const prevQty = inv ? inv.quantity : 0;
      const tx: InventoryTransaction = {
        id: `tx_${Date.now()}_${item.productId}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'receive',
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        warehouseId: po.warehouseId,
        warehouseName: po.warehouseName,
        quantityChange: item.quantity,
        previousQuantity: prevQty,
        newQuantity: prevQty + item.quantity,
        referenceType: 'purchase_order',
        referenceId: po.poNumber,
        performedBy: currentUser.name,
        notes: `Inward receipt from ${po.vendorName}`
      };
      setTransactions(prev => [tx, ...prev]);
    }

    // Update PO status
    setPurchaseOrders(prev => prev.map(p => p.id === poId ? {
      ...p,
      status: 'received',
      items: p.items.map(i => ({ ...i, receivedQuantity: i.quantity }))
    } : p));

    addAuditLog(
      'PO_RECEIVED',
      'Purchases',
      `Received shipment for ${po.poNumber} at ${po.warehouseName}. Credited inventory for ${po.items.length} products.`,
      'Status: confirmed/sent',
      'Status: received'
    );

    addNotification(
      `PO ${po.poNumber} Received`,
      `Stock inward completed at ${po.warehouseName}. Available inventory updated.`,
      'order',
      'purchases',
      'medium'
    );

    return true;
  };

  // 7. Stock Transfers
  const createStockTransfer = (transferData: Omit<StockTransfer, 'id' | 'transferNumber' | 'status'>): StockTransfer => {
    const nextNum = 80 + transfers.length + 1;
    const transferNumber = `TR-2026-00${nextNum}`;
    const newTransfer: StockTransfer = {
      ...transferData,
      id: `tr_${Date.now()}`,
      transferNumber,
      status: 'requested',
      requestDate: new Date().toISOString().substring(0, 10)
    };

    setTransfers(prev => [newTransfer, ...prev]);

    addAuditLog(
      'TRANSFER_REQUESTED',
      'Warehouses',
      `Requested stock transfer ${transferNumber} of ${transferData.quantity} units (${transferData.productName}) from ${transferData.sourceWarehouseName} to ${transferData.destinationWarehouseName}.`
    );

    addNotification(
      `Stock Transfer Request: ${transferNumber}`,
      `Transfer of ${transferData.quantity} units requested from ${transferData.sourceWarehouseName} to ${transferData.destinationWarehouseName}.`,
      'transfer',
      'warehouses',
      'medium'
    );

    return newTransfer;
  };

  const updateTransferStatus = (transferId: string, newStatus: TransferStatus): boolean => {
    const tr = transfers.find(t => t.id === transferId);
    if (!tr) return false;

    // Dispatched: Deduct source warehouse stock
    if (newStatus === 'dispatched' && tr.status !== 'dispatched') {
      setInventory(prev => {
        const copy = [...prev];
        const idx = copy.findIndex(
          i => i.warehouseId === tr.sourceWarehouseId && i.productId === tr.productId
        );
        if (idx >= 0) {
          const current = copy[idx];
          copy[idx] = {
            ...current,
            quantity: Math.max(0, current.quantity - tr.quantity),
            availableQuantity: Math.max(0, current.availableQuantity - tr.quantity)
          };
        }
        return copy;
      });

      const tx: InventoryTransaction = {
        id: `tx_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'transfer_out',
        productId: tr.productId,
        productName: tr.productName,
        sku: tr.sku,
        warehouseId: tr.sourceWarehouseId,
        warehouseName: tr.sourceWarehouseName,
        quantityChange: -tr.quantity,
        previousQuantity: 0,
        newQuantity: 0,
        referenceType: 'stock_transfer',
        referenceId: tr.transferNumber,
        performedBy: currentUser.name,
        notes: `Dispatched to ${tr.destinationWarehouseName}`
      };
      setTransactions(prev => [tx, ...prev]);
    }

    // Received: Add to destination warehouse stock
    if (newStatus === 'received' && tr.status !== 'received') {
      setInventory(prev => {
        const copy = [...prev];
        const idx = copy.findIndex(
          i => i.warehouseId === tr.destinationWarehouseId && i.productId === tr.productId
        );
        if (idx >= 0) {
          const current = copy[idx];
          copy[idx] = {
            ...current,
            quantity: current.quantity + tr.quantity,
            availableQuantity: current.availableQuantity + tr.quantity
          };
        } else {
          const prod = products.find(p => p.id === tr.productId);
          copy.push({
            id: `inv_${Date.now()}`,
            warehouseId: tr.destinationWarehouseId,
            productId: tr.productId,
            productName: tr.productName,
            sku: tr.sku,
            brand: prod?.brand || 'FMCG',
            category: prod?.category || 'General',
            batchNumber: tr.batchNumber,
            quantity: tr.quantity,
            reservedQuantity: 0,
            availableQuantity: tr.quantity,
            damagedQuantity: 0,
            unitCost: prod?.purchasePrice || 0,
            sellingPrice: prod?.sellingPrice || 0,
            reorderLevel: prod?.reorderLevel || 50,
            expiryDate: prod?.expiryDate || '2027-12-31',
            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19)
          });
        }
        return copy;
      });

      const tx: InventoryTransaction = {
        id: `tx_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'transfer_in',
        productId: tr.productId,
        productName: tr.productName,
        sku: tr.sku,
        warehouseId: tr.destinationWarehouseId,
        warehouseName: tr.destinationWarehouseName,
        quantityChange: tr.quantity,
        previousQuantity: 0,
        newQuantity: tr.quantity,
        referenceType: 'stock_transfer',
        referenceId: tr.transferNumber,
        performedBy: currentUser.name,
        notes: `Received from ${tr.sourceWarehouseName}`
      };
      setTransactions(prev => [tx, ...prev]);
    }

    setTransfers(prev => prev.map(t => t.id === transferId ? {
      ...t,
      status: newStatus,
      approvedBy: newStatus === 'approved' ? currentUser.name : t.approvedBy,
      dispatchedDate: newStatus === 'dispatched' ? new Date().toISOString().substring(0, 10) : t.dispatchedDate,
      receivedDate: newStatus === 'received' ? new Date().toISOString().substring(0, 10) : t.receivedDate
    } : t));

    addAuditLog(
      'TRANSFER_STATUS_UPDATED',
      'Warehouses',
      `Stock Transfer ${tr.transferNumber} status updated from ${tr.status} to ${newStatus}.`,
      `Status: ${tr.status}`,
      `Status: ${newStatus}`
    );

    return true;
  };

  // 8. Record Payment
  const recordPayment = (paymentData: Omit<PaymentRecord, 'id' | 'receiptNumber'>): PaymentRecord => {
    const receiptNumber = `RCT-2026-${780 + payments.length + 1}`;
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay_${Date.now()}`,
      receiptNumber
    };

    setPayments(prev => [newPayment, ...prev]);

    // Update invoice balance
    setInvoices(prev => prev.map(inv => {
      if (inv.id === paymentData.invoiceId) {
        const newPaid = inv.paidAmount + paymentData.amount;
        const newStatus = newPaid >= inv.grandTotal ? 'paid' : (newPaid > 0 ? 'partial' : 'pending');
        return {
          ...inv,
          paidAmount: newPaid,
          paymentStatus: newStatus
        };
      }
      return inv;
    }));

    addAuditLog(
      'PAYMENT_RECORDED',
      'Payments',
      `Recorded payment of ₹${paymentData.amount.toLocaleString()} for ${paymentData.partyName} (Receipt: ${receiptNumber}, Method: ${paymentData.paymentMethod}).`
    );

    addNotification(
      `Payment Received: ₹${paymentData.amount.toLocaleString()}`,
      `Receipt ${receiptNumber} logged for ${paymentData.partyName} via ${paymentData.paymentMethod}.`,
      'payment',
      'payments',
      'low'
    );

    return newPayment;
  };

  // 9. Catalog CRUD
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProd: Product = {
      ...prodData,
      id: `prod_${Date.now()}`
    };
    setProducts(prev => [newProd, ...prev]);
    addAuditLog('PRODUCT_ADDED', 'Products', `Added new product ${newProd.name} (SKU: ${newProd.sku}).`);
    return newProd;
  };

  const updateProduct = (id: string, prodData: Partial<Product>): boolean => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...prodData } : p));
    addAuditLog('PRODUCT_UPDATED', 'Products', `Updated product details for ID ${id}.`);
    return true;
  };

  const addWarehouse = (whData: Omit<Warehouse, 'id' | 'code'>): Warehouse => {
    const code = `WH-${whData.city.slice(0, 3).toUpperCase()}-0${warehouses.length + 1}`;
    const newWh: Warehouse = {
      ...whData,
      id: `wh_${Date.now()}`,
      code
    };
    setWarehouses(prev => [...prev, newWh]);
    addAuditLog('WAREHOUSE_ADDED', 'Warehouses', `Added new warehouse facility ${newWh.name} (${code}).`);
    return newWh;
  };

  const updateWarehouse = (id: string, whData: Partial<Warehouse>): boolean => {
    setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...whData } : w));
    return true;
  };

  const addVendor = (venData: Omit<Vendor, 'id' | 'vendorCode'>): Vendor => {
    const code = `VEN-00${vendors.length + 1}`;
    const newVen: Vendor = {
      ...venData,
      id: `ven_${Date.now()}`,
      vendorCode: code
    };
    setVendors(prev => [...prev, newVen]);
    addAuditLog('VENDOR_ADDED', 'Vendors', `Registered new supplier ${newVen.companyName} (${code}).`);
    return newVen;
  };

  const updateVendor = (id: string, venData: Partial<Vendor>): boolean => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...venData } : v));
    return true;
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'customerCode'>): Customer => {
    const code = `CUST-00${customers.length + 1}`;
    const newCust: Customer = {
      ...custData,
      id: `cust_${Date.now()}`,
      customerCode: code
    };
    setCustomers(prev => [...prev, newCust]);
    addAuditLog('CUSTOMER_ADDED', 'Customers', `Registered customer ${newCust.businessName} (${code}).`);
    return newCust;
  };

  const updateCustomer = (id: string, custData: Partial<Customer>): boolean => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...custData } : c));
    return true;
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetDemoData = () => {
    localStorage.clear();
    setCompanySettings(INITIAL_COMPANY_SETTINGS);
    setCurrentUser(INITIAL_USERS[0]);
    setProducts(INITIAL_PRODUCTS);
    setWarehouses(INITIAL_WAREHOUSES);
    setInventory(INITIAL_INVENTORY);
    setTransactions(INITIAL_TRANSACTIONS);
    setVendors(INITIAL_VENDORS);
    setCustomers(INITIAL_CUSTOMERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setSalesOrders(INITIAL_SALES_ORDERS);
    setTransfers(INITIAL_TRANSFERS);
    setInvoices(INITIAL_INVOICES);
    setPayments(INITIAL_PAYMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setLastEventTime(new Date());
  };

  // Simulate a live external event (e.g. background delivery or dispatch)
  const simulateLiveEvent = () => {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomWarehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
    
    // Pick an action: stock change
    const delta = (Math.random() > 0.4 ? 1 : -1) * (Math.floor(Math.random() * 20) + 5);
    adjustStock({
      warehouseId: randomWarehouse.id,
      productId: randomProduct.id,
      quantityChange: delta,
      reason: delta > 0 ? 'Live Supplier Cross-Dock Inward' : 'Live Retail Dispatch',
      notes: 'Real-time WebSocket event received'
    });
  };

  const updateCompanySettings = (settings: CompanySettings) => {
    setCompanySettings(settings);
    addAuditLog('SETTINGS_UPDATED', 'Settings', 'Updated company profile and taxation settings.');
  };

  return (
    <FMCGContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        companySettings,
        updateCompanySettings,
        products,
        warehouses,
        inventory,
        transactions,
        vendors,
        customers,
        purchaseOrders,
        salesOrders,
        transfers,
        invoices,
        payments,
        notifications,
        auditLogs,
        isLiveSync,
        lastEventTime,
        toggleLiveSync,
        adjustStock,
        createSalesOrder,
        confirmSalesOrder,
        dispatchSalesOrder,
        deliverSalesOrder,
        cancelSalesOrder,
        generateInvoiceForSO,
        createPurchaseOrder,
        updatePOStatus,
        receivePurchaseOrder,
        createStockTransfer,
        updateTransferStatus,
        recordPayment,
        addProduct,
        updateProduct,
        addWarehouse,
        updateWarehouse,
        addVendor,
        updateVendor,
        addCustomer,
        updateCustomer,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
        simulateLiveEvent
      }}
    >
      {children}
    </FMCGContext.Provider>
  );
};

export const useFMCG = () => {
  const context = useContext(FMCGContext);
  if (!context) {
    throw new Error('useFMCG must be used within an FMCGProvider');
  }
  return context;
};
