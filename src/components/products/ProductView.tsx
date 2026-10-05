import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Barcode, 
  QrCode, 
  Edit2, 
  Boxes, 
  Tag, 
  IndianRupee, 
  Layers, 
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';
import { Product } from '../../types/index.ts';

interface ProductViewProps {
  onQuickAction?: (actionType: 'sales_order' | 'purchase_order' | 'stock_adjust' | 'transfer') => void;
}

export const ProductView: React.FC<ProductViewProps> = () => {
  const { products, vendors, addProduct, updateProduct } = useFMCG();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Barcode / SKU Preview Modal
  const [barcodePreviewItem, setBarcodePreviewItem] = useState<Product | null>(null);

  // Add Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Biscuits & Bakery');
  const [subcategory, setSubcategory] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [unit, setUnit] = useState('Pack');
  const [packSize, setPackSize] = useState('500g');
  const [purchasePrice, setPurchasePrice] = useState(50);
  const [sellingPrice, setSellingPrice] = useState(65);
  const [gstRate, setGstRate] = useState(18);
  const [hsnCode, setHsnCode] = useState('19053100');
  const [reorderLevel, setReorderLevel] = useState(50);
  const [supplierId, setSupplierId] = useState(vendors[0]?.id || '');

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || 
             p.sku.toLowerCase().includes(q) || 
             p.brand.toLowerCase().includes(q) ||
             p.barcode.includes(q);
    }
    return true;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand) return;

    const autoSku = sku || `FMCG-${brand.slice(0, 3).toUpperCase()}-${name.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-3)}`;
    const autoBarcode = barcode || `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const ven = vendors.find(v => v.id === supplierId);

    addProduct({
      sku: autoSku,
      barcode: autoBarcode,
      name,
      brand,
      category,
      subcategory: subcategory || category,
      description: `${name} standard retail pack.`,
      unit,
      packSize,
      purchasePrice,
      sellingPrice,
      gstRate,
      hsnCode: hsnCode || '19053100',
      reorderLevel,
      minStock: Math.round(reorderLevel * 0.5),
      maxStock: reorderLevel * 50,
      supplierId: supplierId || (vendors[0]?.id || ''),
      supplierName: ven?.companyName || 'Authorized FMCG Supplier',
      batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
      expiryDate: '2027-12-31',
      status: 'active'
    });

    setIsAddModalOpen(false);
    setName('');
    setBrand('');
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            <span>Master Product & SKU Catalog</span>
          </h1>
          <p className="text-xs text-slate-500">
            FMCG brand packaging, GST taxation slabs, HSN tariff codes, and barcode scanner mapping.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Grid Cards
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search product name, SKU, brand, or barcode..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden w-full sm:w-48"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3.5">SKU / Barcode</th>
                  <th className="py-3 px-3.5">Product Title & Brand</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5">Pack Size</th>
                  <th className="py-3 px-3.5 text-center">HSN Code</th>
                  <th className="py-3 px-3.5 text-right">Purchase Price</th>
                  <th className="py-3 px-3.5 text-right font-bold text-slate-900">Retail MRP</th>
                  <th className="py-3 px-3.5 text-center">GST Slab</th>
                  <th className="py-3 px-3.5 text-center">Reorder Threshold</th>
                  <th className="py-3 px-3.5 text-center">Barcode Scan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* SKU & Barcode */}
                    <td className="py-3 px-3.5">
                      <div className="font-mono font-bold text-slate-900">{p.sku}</div>
                      <div className="text-[10px] font-mono text-slate-500">{p.barcode}</div>
                    </td>

                    {/* Title & Brand */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500">{p.brand} • {p.supplierName}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3.5 text-slate-700 font-medium">
                      {p.category}
                    </td>

                    {/* Pack Size */}
                    <td className="py-3 px-3.5 text-slate-700">
                      {p.packSize}
                    </td>

                    {/* HSN */}
                    <td className="py-3 px-3.5 text-center font-mono text-slate-600 font-semibold">
                      {p.hsnCode}
                    </td>

                    {/* Purchase Price */}
                    <td className="py-3 px-3.5 text-right font-mono text-slate-600">
                      ₹{p.purchasePrice.toFixed(2)}
                    </td>

                    {/* Selling MRP */}
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                      ₹{p.sellingPrice.toFixed(2)}
                    </td>

                    {/* GST Rate */}
                    <td className="py-3 px-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {p.gstRate}%
                      </span>
                    </td>

                    {/* Reorder Level */}
                    <td className="py-3 px-3.5 text-center">
                      <span className="font-semibold text-amber-700">
                        {p.reorderLevel} units
                      </span>
                    </td>

                    {/* Barcode preview */}
                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => setBarcodePreviewItem(p)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Barcode Label"
                      >
                        <Barcode className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200/50">
                    {p.sku}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    GST {p.gstRate}%
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-2">{p.name}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{p.brand} • {p.category}</p>

                <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pack Size:</span>
                    <strong className="text-slate-800">{p.packSize}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">HSN Code:</span>
                    <strong className="font-mono text-slate-800">{p.hsnCode}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Barcode EAN:</span>
                    <strong className="font-mono text-slate-800">{p.barcode}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] block">Selling MRP</span>
                  <span className="text-base font-bold text-slate-900 font-mono">₹{p.sellingPrice.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setBarcodePreviewItem(p)}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Barcode className="h-3.5 w-3.5" />
                  <span>Scan Label</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Barcode & Shelf Label Preview Modal */}
      {barcodePreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Warehouse Shelf Label</span>
              <button onClick={() => setBarcodePreviewItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div>
              <p className="font-bold text-slate-900 text-sm">{barcodePreviewItem.name}</p>
              <p className="text-xs text-slate-500">{barcodePreviewItem.packSize} • {barcodePreviewItem.brand}</p>
            </div>

            {/* Visual Simulated Barcode */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
              <div className="flex items-center gap-0.5 h-16 justify-center w-full px-4">
                {[4, 2, 6, 2, 4, 1, 3, 5, 2, 6, 1, 4, 3, 2, 5, 2, 6, 1, 3, 4, 2, 5, 1, 6, 2].map((w, i) => (
                  <div 
                    key={i} 
                    className="bg-black h-full" 
                    style={{ width: `${w * 1.5}px`, marginRight: `${(i % 3) * 1.5}px` }} 
                  />
                ))}
              </div>
              <p className="font-mono text-xs font-bold tracking-widest text-slate-800 mt-2">
                {barcodePreviewItem.barcode}
              </p>
              <p className="font-mono text-[10px] text-slate-500">
                SKU: {barcodePreviewItem.sku}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs px-2">
              <span className="text-slate-500">Retail MRP:</span>
              <strong className="text-base text-slate-900 font-mono">₹{barcodePreviewItem.sellingPrice.toFixed(2)}</strong>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Print Shelf Tag
            </button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span>Add Product to FMCG Master Catalog</span>
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-4 space-y-3.5 overflow-y-auto text-xs flex-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haldiram Bhujia Sev 400g"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Haldiram"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Biscuits & Bakery">Biscuits & Bakery</option>
                    <option value="Staples & Spices">Staples & Spices</option>
                    <option value="Home Care">Home Care</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Packaged Foods">Packaged Foods</option>
                    <option value="Beverages & Dairy">Beverages & Dairy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pack Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 400g Pouch"
                    value={packSize}
                    onChange={e => setPackSize(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Pack">Pack</option>
                    <option value="Bag">Bag</option>
                    <option value="Bottle">Bottle</option>
                    <option value="Jar">Jar</option>
                    <option value="Carton">Carton</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={purchasePrice}
                    onChange={e => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Retail MRP (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Slab (%)</label>
                  <select
                    value={gstRate}
                    onChange={e => setGstRate(parseInt(e.target.value) || 18)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">HSN Tariff Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 21069099"
                    value={hsnCode}
                    onChange={e => setHsnCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reorder Minimum Level</label>
                  <input
                    type="number"
                    value={reorderLevel}
                    onChange={e => setReorderLevel(parseInt(e.target.value) || 50)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Supplier</label>
                <select
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
