import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { PlusCircle, Edit2, Check, X } from 'lucide-react';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await adminService.getAllCategories();
      setCategories(res.data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await adminService.createCategory({ name: newCatName.trim() });
      toast.success('Category added');
      setNewCatName('');
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add category');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await adminService.updateCategory(id, { name: editName.trim() });
      toast.success('Category updated');
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
      toast.error('Failed to update status');
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Categories</h1>

        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex space-x-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Category Name</label>
            <input 
              type="text" 
              required
              maxLength="50"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" 
              placeholder="e.g., Organic Vegetables"
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center space-x-2 h-[42px]">
            <PlusCircle size={18} /> <span>Add Category</span>
          </button>
        </form>

        {isLoading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <ul className="divide-y divide-gray-100">
              {categories.map(cat => (
                <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  {editingId === cat.id ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-3 py-1 border rounded focus:ring-green-500"
                        autoFocus
                      />
                      <button onClick={() => handleUpdate(cat.id)} className="p-1 text-green-600 hover:bg-green-100 rounded">
                        <Check size={20} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4 flex-1">
                      <span className={`font-medium ${!cat.active ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {cat.name}
                      </span>
                      {!cat.active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Disabled</span>}
                    </div>
                  )}

                  {editingId !== cat.id && (
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                      >
                        <Edit2 size={16} /> <span>Rename</span>
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(cat.id, cat.active)}
                        className={`text-sm font-medium ${cat.active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                      >
                        {cat.active ? 'Disable' : 'Enable'}
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
