import React, { useState } from 'react';
import { ArrowLeftRight, Boxes, Warehouse, AlertCircle } from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';
import { WarehouseInventory } from '../../types/index.ts';

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: WarehouseInventory | null;
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({
  isOpen,
  onClose,
  initialItem
}) => {
  const { warehouses, products, inventory, createStockTransfer, currentUser } = useFMCG();

  const [sourceWarehouseId, setSourceWarehouseId] = useState(
    initialItem?.warehouseId || warehouses[1]?.id || warehouses[0]?.id || ''
  );
  const [destinationWarehouseId, setDestinationWarehouseId] = useState(
    warehouses[0]?.id || warehouses[1]?.id || ''
  );
  const [productId, setProductId] = useState(
    initialItem?.productId || products[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(20);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Find available stock at source warehouse
  const sourceInv = inventory.find(
    i => i.warehouseId === sourceWarehouseId && i.productId === productId
  );
  const availableAtSource = sourceInv ? sourceInv.availableQuantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceWarehouseId === destinationWarehouseId) {
      alert('Source and destination warehouses must be distinct.');
      return;
    }
    if (quantity > availableAtSource) {
      alert(`Cannot transfer ${quantity} units. Only ${availableAtSource} units available at source warehouse.`);
      return;
    }

    const prod = products.find(p => p.id === productId);
    const srcWh = warehouses.find(w => w.id === sourceWarehouseId);
    const destWh = warehouses.find(w => w.id === destinationWarehouseId);

    if (!prod || !srcWh || !destWh) return;

    createStockTransfer({
      sourceWarehouseId: srcWh.id,
      sourceWarehouseName: srcWh.name,
      destinationWarehouseId: destWh.id,
      destinationWarehouseName: destWh.name,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      batchNumber: sourceInv?.batchNumber || prod.batchNumber || 'BATCH-001',
      quantity,
      requestedBy: currentUser.name,
      requestDate: new Date().toISOString().substring(0, 10),
      notes: notes || 'Regional stock rebalancing transfer'
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
            <ArrowLeftRight className="h-4 w-4 text-blue-600" />
            <span>Inter-Warehouse Stock Transfer</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Product SKU to Transfer</label>
            <select
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Source Warehouse (From)</label>
              <select
                value={sourceWarehouseId}
                onChange={e => setSourceWarehouseId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.code} - {w.city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destination (To)</label>
              <select
                value={destinationWarehouseId}
                onChange={e => setDestinationWarehouseId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.code} - {w.city}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Available Stock at Source:</span>
              <strong className={`font-bold ${availableAtSource > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {availableAtSource} units
              </strong>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transfer Quantity (Units)</label>
            <input
              type="number"
              min="1"
              max={availableAtSource || 9999}
              required
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transfer Reason / Reference</label>
            <input
              type="text"
              placeholder="e.g. Replenish low stock before festive demand"
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
              disabled={availableAtSource === 0 || sourceWarehouseId === destinationWarehouseId}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs"
            >
              Submit Transfer Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
