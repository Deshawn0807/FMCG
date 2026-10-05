export type UserRole = 'admin' | 'warehouse_manager' | 'sales_manager' | 'vendor' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  warehouseId?: string; // If restricted to specific warehouse
  vendorId?: string; // If role is vendor
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  unit: string; // e.g. 'Pack', 'Box', 'Kg', 'Bottle', 'Carton'
  packSize: string; // e.g. '250g', '1L', 'Pack of 12'
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number; // e.g. 5, 12, 18
  reorderLevel: number;
  minStock: number;
  maxStock: number;
  supplierId: string;
  supplierName: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  imageUrl?: string;
  hsnCode: string;
  status: 'active' | 'inactive';
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  city: string;
  state: string;
  address: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  capacityUnits: number;
  currentUnits: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface WarehouseInventory {
  id: string;
  warehouseId: string;
  productId: string;
  productName: string;
  sku: string;
  brand: string;
  category: string;
  batchNumber: string;
  quantity: number; // Total physical
  reservedQuantity: number;
  availableQuantity: number; // quantity - reservedQuantity
  damagedQuantity: number;
  unitCost: number;
  sellingPrice: number;
  reorderLevel: number;
  expiryDate: string;
  lastUpdated: string;
}

export type TransactionType = 
  | 'receive' 
  | 'dispatch' 
  | 'transfer_in' 
  | 'transfer_out' 
  | 'adjust' 
  | 'reserve' 
  | 'release' 
  | 'damage';

export interface InventoryTransaction {
  id: string;
  timestamp: string;
  type: TransactionType;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  referenceType: 'purchase_order' | 'sales_order' | 'stock_transfer' | 'manual_adjustment';
  referenceId: string;
  performedBy: string;
  notes?: string;
}

export interface Vendor {
  id: string;
  vendorCode: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  gstNumber: string;
  paymentTerms: string; // 'Net 15', 'Net 30', 'Immediate'
  productsSuppliedCount: number;
  totalPurchaseValue: number;
  outstandingAmount: number;
  rating: number; // 1-5
  status: 'active' | 'blocked' | 'under_review';
}

export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  gstNumber: string;
  creditLimit: number;
  outstandingAmount: number;
  status: 'active' | 'inactive';
}

export interface POItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

export type POStatus = 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'closed';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  warehouseId: string;
  warehouseName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: POItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: POStatus;
  notes?: string;
}

export interface SOItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
}

export type SOStatus = 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';

export interface SalesOrder {
  id: string;
  soNumber: string;
  customerId: string;
  customerName: string;
  warehouseId: string;
  warehouseName: string;
  orderDate: string;
  dispatchDueDate: string;
  items: SOItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  orderStatus: SOStatus;
  deliveryAddress: string;
  notes?: string;
  invoiceId?: string;
}

export type TransferStatus = 'requested' | 'approved' | 'dispatched' | 'in_transit' | 'received' | 'rejected';

export interface StockTransfer {
  id: string;
  transferNumber: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  productId: string;
  productName: string;
  sku: string;
  batchNumber: string;
  quantity: number;
  requestedBy: string;
  approvedBy?: string;
  requestDate: string;
  dispatchedDate?: string;
  receivedDate?: string;
  status: TransferStatus;
  notes?: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  sku: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxableValue: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: 'sales' | 'purchase';
  orderId: string;
  orderNumber: string;
  partyName: string;
  partyGst: string;
  partyAddress: string;
  partyPhone: string;
  partyEmail: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  warehouseName: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  partyName: string;
  partyType: 'customer' | 'vendor';
  amount: number;
  paymentMethod: 'UPI' | 'Bank Transfer' | 'Cash' | 'Card' | 'Cheque';
  transactionRef: string;
  paymentDate: string;
  status: 'completed' | 'pending' | 'failed';
  recordedBy: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'low_stock' | 'expiry' | 'order' | 'transfer' | 'payment' | 'system';
  read: boolean;
  timestamp: string;
  linkModule?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  module: string;
  oldValue?: string;
  newValue?: string;
  details: string;
}

export interface CompanySettings {
  companyName: string;
  legalEntity: string;
  gstin: string;
  panNumber: string;
  cinNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  upiId: string;
  currencySymbol: string;
}
