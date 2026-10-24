import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminService } from '../../services/adminService';
import ErrorState from '../../components/ErrorState';
import { SkeletonRow } from '../../components/Skeleton';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';
import { PlusCircle, Edit2, Check, X, Tags, Power, AlertCircle } from 'lucide-react';

const ManageCategories = () => {
  useDocumentTitle('Manage Categories | KisanMandi');

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.getAllCategories();
      setCategories(res.data || []);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || 'Failed to load categories';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSubmitting(true);
    try {
      await adminService.createCategory({ name: newCatName.trim() });
      toast.success('Category created successfully');
      setNewCatName('');
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      await adminService.updateCategory(id, { name: editName.trim() });
      toast.success('Category renamed');
      setEditingId(null);
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await adminService.setCategoryStatus(id, !currentStatus);
      toast.success(`Category ${!currentStatus ? 'enabled' : 'disabled'}`);
      loadCategories();
    } catch (error) {
      toast.error('Failed to update category status');
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <PageHeader 
          title="Produce Categories"
          subtitle="Define marketplace taxonomy, crop classifications, and catalog availability"
          badge={<StatusBadge status="ADMIN" text="Admin Portal" />}
        />

        {/* Add Category Form Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Create New Category
              </label>
              <input 
                type="text" 
                required
                maxLength="50"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-medium rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                placeholder="e.g. Leafy Greens, Tubers & Roots, Pulses"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting || !newCatName.trim()}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold text-xs flex items-center justify-center gap-2 h-[40px] shadow-sm transition-colors disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" /> 
              <span>Add Category</span>
            </button>
          </form>
        </div>

        {/* Category List */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : error ? (
          <ErrorState
            title="Could not load categories"
            message={error}
            onRetry={loadCategories}
          />
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
              <Tags className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-neutral-900 mb-1">No categories defined</p>
            <p className="text-xs text-neutral-500">Create your first crop category using the form above.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xs border border-neutral-200 overflow-hidden">
            <div className="p-4 bg-neutral-50/60 border-b border-neutral-200 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                Configured Categories ({categories.length})
              </span>
              <span className="text-[11px] text-neutral-400">
                Disabled categories are hidden from consumer filter menus
              </span>
            </div>

            <ul className="divide-y divide-neutral-100">
              {categories.map(cat => (
                <li key={cat.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/80 transition-colors">
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 flex-1 max-w-sm"
                        autoFocus
                      />
                      <button 
                        type="button"
                        onClick={() => handleUpdate(cat.id)} 
                        className="p-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg transition-colors"
                        title="Save Changes"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEditingId(null)} 
                        className="p-1.5 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        cat.active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        <Tags className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${!cat.active ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                          {cat.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            cat.active ? 'text-emerald-700' : 'text-neutral-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cat.active ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                            {cat.active ? 'Active on marketplace' : 'Disabled / Hidden'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {editingId !== cat.id && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        type="button"
                        onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> 
                        <span>Rename</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleToggleStatus(cat.id, cat.active)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                          cat.active 
                            ? 'text-rose-700 border-rose-200 bg-rose-50 hover:bg-rose-100' 
                            : 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{cat.active ? 'Disable' : 'Enable'}</span>
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageCategories;
