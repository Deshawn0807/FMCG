import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose
}) => {
  const { warehouses, products, inventory, adjustStock } = useFMCG();

  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [quantityChange, setQuantityChange] = useState<number>(10);
  const [reason, setAdjustReason] = useState('Physical Stock Count Reconciliation');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentInv = inventory.find(
    i => i.warehouseId === warehouseId && i.productId === productId
  );
  const currentQty = currentInv ? currentInv.quantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityChange === 0) return;

    adjustStock({
      warehouseId,
      productId,
      quantityChange,
      reason,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-600" />
            <span>Stock Count Reconciliation & Adjustment</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Warehouse</label>
            <select
              value={warehouseId}
              onChange={e => setWarehouseId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Product SKU</label>
            <select
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
            <span className="text-slate-500">Current Recorded Physical Stock:</span>
            <strong className="text-slate-900">{currentQty} units</strong>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Quantity Change (+ to add, - to deduct)
            </label>
            <input
              type="number"
              value={quantityChange}
              onChange={e => setQuantityChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-sm text-center"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              New physical stock will be: <strong className="text-slate-900">{Math.max(0, currentQty + quantityChange)} units</strong>
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reconciliation Reason</label>
            <select
              value={reason}
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
            <label className="block font-semibold text-slate-700 mb-1">Audit Reference / Remarks</label>
            <input
              type="text"
              placeholder="e.g. Approved by Warehouse Manager"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={quantityChange === 0}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs"
            >
              Commit Stock Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
