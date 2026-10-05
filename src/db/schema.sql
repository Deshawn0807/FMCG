-- ==============================================================================
-- DISTRICORE FMCG ENTERPRISE DISTRIBUTION MANAGEMENT SYSTEM
-- PostgreSQL Production Schema DDL
-- Compatible with PostgreSQL 14+, Cloud SQL, AWS RDS, Neon, Supabase
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles & Permissions
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    CONSTRAINT uq_module_action UNIQUE (module, action)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'staff',
    avatar_url TEXT,
    phone VARCHAR(30),
    warehouse_id VARCHAR(50),
    vendor_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories & Brands
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    manufacturer VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(50) PRIMARY KEY,
    vendor_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    gst_number VARCHAR(20) NOT NULL,
    payment_terms VARCHAR(50) DEFAULT 'Net 30',
    outstanding_amount NUMERIC(14, 2) DEFAULT 0.00,
    rating NUMERIC(3, 2) DEFAULT 4.5,
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    gst_number VARCHAR(20) NOT NULL,
    credit_limit NUMERIC(14, 2) DEFAULT 500000.00,
    outstanding_amount NUMERIC(14, 2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Warehouses Table
CREATE TABLE IF NOT EXISTS warehouses (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    manager_name VARCHAR(100) NOT NULL,
    manager_phone VARCHAR(30),
    manager_email VARCHAR(150),
    capacity_units INT NOT NULL DEFAULT 100000,
    current_units INT NOT NULL DEFAULT 0,
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Products / SKUs Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(60) UNIQUE NOT NULL,
    barcode VARCHAR(60) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    description TEXT,
    unit VARCHAR(30) NOT NULL,
    pack_size VARCHAR(50) NOT NULL,
    purchase_price NUMERIC(12, 2) NOT NULL,
    selling_price NUMERIC(12, 2) NOT NULL,
    gst_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    hsn_code VARCHAR(20) NOT NULL,
    reorder_level INT NOT NULL DEFAULT 50,
    min_stock INT NOT NULL DEFAULT 20,
    max_stock INT NOT NULL DEFAULT 5000,
    supplier_id VARCHAR(50) REFERENCES vendors(id) ON DELETE SET NULL,
    batch_number VARCHAR(60),
    expiry_date DATE,
    image_url TEXT,
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Warehouse Inventory & Batches
CREATE TABLE IF NOT EXISTS warehouse_inventory (
    id VARCHAR(60) PRIMARY KEY,
    warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    batch_number VARCHAR(60) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    damaged_quantity INT NOT NULL DEFAULT 0,
    unit_cost NUMERIC(12, 2) NOT NULL,
    selling_price NUMERIC(12, 2) NOT NULL,
    reorder_level INT NOT NULL DEFAULT 50,
    expiry_date DATE NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_wh_product_batch UNIQUE (warehouse_id, product_id, batch_number),
    CONSTRAINT chk_qty_non_negative CHECK (quantity >= 0),
    CONSTRAINT chk_reserved_lte_qty CHECK (reserved_quantity <= quantity)
);

CREATE TABLE IF NOT EXISTS inventory_batches (
    id VARCHAR(60) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    batch_number VARCHAR(60) NOT NULL,
    manufacture_date DATE,
    expiry_date DATE NOT NULL,
    mrp NUMERIC(12, 2) NOT NULL,
    purchase_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Inventory Transactions (Immutable Audit of Every Stock Change)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id VARCHAR(60) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(40) NOT NULL, -- receive, dispatch, transfer_in, transfer_out, adjust, reserve, release, damage
    product_id VARCHAR(50) NOT NULL REFERENCES products(id),
    warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id),
    quantity_change INT NOT NULL,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    reference_type VARCHAR(40) NOT NULL,
    reference_id VARCHAR(60) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    notes TEXT
);

-- 10. Purchase Orders & Items
CREATE TABLE IF NOT EXISTS purchase_orders (
    id VARCHAR(50) PRIMARY KEY,
    po_number VARCHAR(60) UNIQUE NOT NULL,
    vendor_id VARCHAR(50) NOT NULL REFERENCES vendors(id),
    warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id),
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
    tax_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    status VARCHAR(40) NOT NULL DEFAULT 'draft', -- draft, sent, confirmed, partially_received, received, closed
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    po_id VARCHAR(50) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    received_quantity INT NOT NULL DEFAULT 0,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL
);

-- 11. Sales Orders & Items
CREATE TABLE IF NOT EXISTS sales_orders (
    id VARCHAR(50) PRIMARY KEY,
    so_number VARCHAR(60) UNIQUE NOT NULL,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id),
    warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id),
    order_date DATE NOT NULL,
    dispatch_due_date DATE,
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
    tax_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending', -- paid, partial, pending, overdue
    order_status VARCHAR(40) NOT NULL DEFAULT 'pending', -- pending, confirmed, processing, packed, shipped, delivered, cancelled
    delivery_address TEXT NOT NULL,
    notes TEXT,
    invoice_id VARCHAR(60),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_order_items (
    id SERIAL PRIMARY KEY,
    so_id VARCHAR(50) NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL
);

-- 12. Stock Transfers
CREATE TABLE IF NOT EXISTS stock_transfers (
    id VARCHAR(50) PRIMARY KEY,
    transfer_number VARCHAR(60) UNIQUE NOT NULL,
    source_warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id),
    destination_warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id),
    product_id VARCHAR(50) NOT NULL REFERENCES products(id),
    batch_number VARCHAR(60) NOT NULL,
    quantity INT NOT NULL,
    requested_by VARCHAR(100) NOT NULL,
    approved_by VARCHAR(100),
    request_date DATE NOT NULL,
    dispatched_date DATE,
    received_date DATE,
    status VARCHAR(40) NOT NULL DEFAULT 'requested', -- requested, approved, dispatched, in_transit, received, rejected
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Invoices & Items
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(60) PRIMARY KEY,
    invoice_number VARCHAR(60) UNIQUE NOT NULL,
    invoice_type VARCHAR(30) NOT NULL DEFAULT 'sales', -- sales, purchase
    order_id VARCHAR(50) NOT NULL,
    order_number VARCHAR(60) NOT NULL,
    party_name VARCHAR(200) NOT NULL,
    party_gst VARCHAR(20) NOT NULL,
    party_address TEXT NOT NULL,
    party_phone VARCHAR(30),
    party_email VARCHAR(150),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC(14, 2) NOT NULL,
    cgst NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sgst NUMERIC(12, 2) NOT NULL DEFAULT 0,
    igst NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_tax NUMERIC(14, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0,
    grand_total NUMERIC(14, 2) NOT NULL,
    paid_amount NUMERIC(14, 2) DEFAULT 0,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    warehouse_name VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(60) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id),
    hsn_code VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(30) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    taxable_value NUMERIC(14, 2) NOT NULL,
    gst_rate NUMERIC(5, 2) NOT NULL,
    cgst_amount NUMERIC(12, 2) DEFAULT 0,
    sgst_amount NUMERIC(12, 2) DEFAULT 0,
    igst_amount NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(14, 2) NOT NULL
);

-- 14. Payments
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(60) PRIMARY KEY,
    receipt_number VARCHAR(60) UNIQUE NOT NULL,
    invoice_id VARCHAR(60) NOT NULL REFERENCES invoices(id),
    invoice_number VARCHAR(60) NOT NULL,
    party_name VARCHAR(200) NOT NULL,
    party_type VARCHAR(30) NOT NULL, -- customer, vendor
    amount NUMERIC(14, 2) NOT NULL,
    payment_method VARCHAR(40) NOT NULL, -- UPI, Bank Transfer, Cash, Card, Cheque
    transaction_ref VARCHAR(100) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'completed',
    recorded_by VARCHAR(100) NOT NULL,
    notes TEXT
);

-- 15. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(60) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(40) NOT NULL, -- low_stock, expiry, order, transfer, payment, system
    read BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    link_module VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'medium'
);

-- 16. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(60) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_name VARCHAR(150) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_inventory_wh_prod ON warehouse_inventory(warehouse_id, product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON warehouse_inventory(expiry_date);
CREATE INDEX IF NOT EXISTS idx_transactions_prod ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wh ON inventory_transactions(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_so_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_so_status ON sales_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
