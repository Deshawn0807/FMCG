import React, { useState, useEffect } from 'react';
import { FMCGProvider } from './context/FMCGContext.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { InventoryView } from './components/inventory/InventoryView.tsx';
import { ProductView } from './components/products/ProductView.tsx';
import { WarehouseView } from './components/warehouses/WarehouseView.tsx';
import { OrdersView } from './components/orders/OrdersView.tsx';
import { VendorView } from './components/vendors/VendorView.tsx';
import { CustomerView } from './components/customers/CustomerView.tsx';
import { BillingView } from './components/billing/BillingView.tsx';
import { PaymentsView } from './components/payments/PaymentsView.tsx';
import { ReportsView } from './components/reports/ReportsView.tsx';
import { AuditLogsView } from './components/audit/AuditLogsView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { GlobalSearchModal } from './components/search/GlobalSearchModal.tsx';
import { StockTransferModal } from './components/modals/StockTransferModal.tsx';
import { StockAdjustModal } from './components/modals/StockAdjustModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { WarehouseInventory, Invoice } from './types/index.ts';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);

  // Deep linking item states
  const [targetWarehouseId, setTargetWarehouseId] = useState<string | undefined>();
  const [targetInvoiceId, setTargetInvoiceId] = useState<string | undefined>();
  const [transferInitialItem, setTransferInitialItem] = useState<WarehouseInventory | null>(null);

  // Keyboard shortcut for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (tab: string, itemId?: string) => {
    setCurrentTab(tab);
    if (tab === 'warehouses' && itemId) {
      setTargetWarehouseId(itemId);
    }
    if (tab === 'billing' && itemId) {
      setTargetInvoiceId(itemId);
    }
  };

  const handleQuickAction = (actionType: 'sales_order' | 'purchase_order' | 'stock_adjust' | 'transfer') => {
    if (actionType === 'transfer') {
      setTransferInitialItem(null);
      setIsTransferModalOpen(true);
    } else if (actionType === 'stock_adjust') {
      setIsAdjustModalOpen(true);
    } else if (actionType === 'sales_order' || actionType === 'purchase_order') {
      setCurrentTab('orders');
    }
  };

  const handleOpenTransferWithItem = (item: WarehouseInventory) => {
    setTransferInitialItem(item);
    setIsTransferModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Sidebar Component */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQuickAction={handleQuickAction}
          onOpenAuthModal={() => setIsAuthOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              onQuickAction={handleQuickAction}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              onQuickAction={handleQuickAction}
              onOpenTransferWithItem={handleOpenTransferWithItem}
            />
          )}

          {currentTab === 'products' && (
            <ProductView
              onQuickAction={handleQuickAction}
            />
          )}

          {currentTab === 'warehouses' && (
            <WarehouseView
              selectedWarehouseId={targetWarehouseId}
              onQuickTransfer={() => {
                setTransferInitialItem(null);
                setIsTransferModalOpen(true);
              }}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersView
              onNavigate={handleNavigate}
              onQuickAction={handleQuickAction}
            />
          )}

          {currentTab === 'transfers' && (
            <WarehouseView
              selectedWarehouseId={targetWarehouseId}
              onQuickTransfer={() => {
                setTransferInitialItem(null);
                setIsTransferModalOpen(true);
              }}
            />
          )}

          {currentTab === 'vendors' && (
            <VendorView />
          )}

          {currentTab === 'customers' && (
            <CustomerView />
          )}

          {currentTab === 'billing' && (
            <BillingView
              selectedInvoiceId={targetInvoiceId}
              onOpenRecordPayment={(inv: Invoice) => {
                setCurrentTab('payments');
              }}
            />
          )}

          {currentTab === 'payments' && (
            <PaymentsView
              onOpenInvoice={(invId: string) => {
                setTargetInvoiceId(invId);
                setCurrentTab('billing');
              }}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView />
          )}

          {currentTab === 'audit' && (
            <AuditLogsView />
          )}

          {currentTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      <StockTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        initialItem={transferInitialItem}
      />

      <StockAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FMCGProvider>
      <AppContent />
    </FMCGProvider>
  );
}
