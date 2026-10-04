import React, { useState } from 'react';
import {
  Pill,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  PackagePlus,
  Layers,
  Calendar,
  DollarSign,
  X,
  TrendingDown,
  CheckCircle,
} from 'lucide-react';
import { Medicine, UserRole } from '../types/hms.ts';
import { api } from '../services/api.ts';

interface PharmacyViewProps {
  medicines: Medicine[];
  currentRole: UserRole;
  onRefresh: () => void;
}

export const PharmacyView: React.FC<PharmacyViewProps> = ({ medicines, currentRole, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [adjustingId, setAdjustingId] = useState<number | null>(null);
  const [restockAmount, setRestockAmount] = useState('50');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Analgesic',
    manufacturer: '',
    batchNumber: '',
    expiryDate: '2028-12-31',
    purchasePrice: '5.00',
    sellingPrice: '12.00',
    stockQuantity: '100',
    minStockLevel: '20',
    locationRack: 'Shelf A-1',
  });
  const [submitting, setSubmitting] = useState(false);

  // Filter
  const filtered = medicines.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      m.name.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.medicineCode.toLowerCase().includes(q);
    const matchCategory = categoryFilter === 'all' || m.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categories = Array.from(new Set(medicines.map((m) => m.category)));

  const handleStockAdjust = async (id: number, delta: number) => {
    try {
      await api.updateMedicineStock(id, delta);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingId) return;
    try {
      await api.updateMedicineStock(adjustingId, parseInt(restockAmount));
      setAdjustingId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to restock');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createMedicine(formData);
      setShowAddModal(false);
      onRefresh();
      setFormData({
        name: '',
        genericName: '',
        category: 'Analgesic',
        manufacturer: '',
        batchNumber: '',
        expiryDate: '2028-12-31',
        purchasePrice: '5.00',
        sellingPrice: '12.00',
        stockQuantity: '100',
        minStockLevel: '20',
        locationRack: 'Shelf A-1',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to add medicine');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hospital Pharmacy & Inventory Dispensary</h1>
          <p className="text-xs text-slate-500 mt-0.5">Automated stock deduction, batch expiry tracking, and restock alerts</p>
        </div>

        {['pharmacist', 'admin', 'super_admin'].includes(currentRole) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Medicine Name, Generic Molecule, or Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
        >
          <option value="all">All Drug Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Brand / Generic Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Batch & Expiry</th>
                <th className="py-3 px-4">Rack</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4 text-right">Inventory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No medications found in pharmacy inventory.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const isLow = m.stockQuantity <= m.minStockLevel;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-700">{m.medicineCode}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-slate-500 text-[11px]">{m.genericName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {m.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        <div className="font-mono text-slate-800">{m.batchNumber}</div>
                        <div className="text-slate-400">Exp: {m.expiryDate}</div>
                      </td>
                      <td className="py-3 px-4 text-[11px] font-medium text-slate-600">{m.locationRack || 'Shelf A'}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">${parseFloat(m.sellingPrice).toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isLow
                                ? 'bg-rose-100 text-rose-800 animate-pulse'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {m.stockQuantity} units
                          </span>
                          {isLow && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Min: {m.minStockLevel}</div>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {['pharmacist', 'admin', 'super_admin'].includes(currentRole) && (
                          <>
                            <button
                              onClick={() => handleStockAdjust(m.id, -1)}
                              title="Dispense 1 Unit"
                              className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => handleStockAdjust(m.id, 10)}
                              title="Add 10 Units"
                              className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => setAdjustingId(m.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 rounded hover:bg-teal-100 transition-colors"
                            >
                              Restock Batch
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Batch Modal */}
      {adjustingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Restock Pharmacy Inventory</h3>
            <p className="text-xs text-slate-500 mb-4">Enter the inbound delivery units received from supplier.</p>
            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Inbound Quantity (Units)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingId(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-900">Add Medicine to Formulary</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Commercial Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lipitor 20mg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Generic Molecule *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atorvastatin"
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Therapeutic Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Analgesic">Analgesic / Antipyretic</option>
                    <option value="Antibiotic">Antibiotic / Antimicrobial</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Antidiabetic">Antidiabetic</option>
                    <option value="Antacid / PPI">Antacid / PPI</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Antihistamine">Antihistamine</option>
                    <option value="Endocrine">Endocrine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Pfizer Labs"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Storage Rack</label>
                  <input
                    type="text"
                    placeholder="e.g. Shelf B-2"
                    value={formData.locationRack}
                    onChange={(e) => setFormData({ ...formData, locationRack: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Purchase Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Stock (Units)</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Min Threshold Alert</label>
                  <input
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg"
                >
                  {submitting ? 'Adding...' : 'Save to Pharmacy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
