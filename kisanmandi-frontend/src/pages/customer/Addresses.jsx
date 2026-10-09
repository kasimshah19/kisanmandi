import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Star } from 'lucide-react';
import { addressService } from '../../services/addressService';
import AddressForm from '../../components/AddressForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import { SkeletonRow } from '../../components/Skeleton';
import toast from 'react-hot-toast';

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await addressService.getAll();
      setAddresses(res.data);
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editingId) {
        await addressService.update(editingId, data);
        toast.success('Address updated');
      } else {
        await addressService.create(data);
        toast.success('Address added');
      }
      setShowForm(false);
      setEditingId(null);
      loadAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await addressService.remove(deleteId);
      toast.success('Address removed');
      loadAddresses();
    } catch (error) {
      toast.error('Failed to remove address');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefault(id);
      toast.success('Default address updated');
      loadAddresses();
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };

  const openEdit = (addr) => {
    setEditingId(addr.id);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const editAddressData = editingId ? addresses.find(a => a.id === editingId) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Addresses</h1>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={16} /> Add Address
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h2>
          <div className="max-w-2xl">
            <AddressForm 
              initial={editAddressData} 
              onSubmit={handleSave} 
              onCancel={cancelEdit}
              loading={saving}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4"><SkeletonRow /><SkeletonRow /></div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <MapPin size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No addresses saved</h3>
          <p className="text-gray-500 text-sm">Add a delivery address to checkout quickly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative">
              {addr.defaultAddress && (
                <span className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl flex items-center gap-1">
                  <Star size={12} className="fill-green-600" /> Default
                </span>
              )}
              
              <div className="pr-16">
                <h3 className="font-bold text-gray-900">{addr.fullName}</h3>
                <p className="text-sm text-gray-500 mb-2">{addr.phone}</p>
                <p className="text-sm text-gray-700">{addr.line1}</p>
                <p className="text-sm text-gray-700">{addr.city}, {addr.state}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{addr.pincode}</p>
              </div>

              <div className="mt-4 pt-4 border-t flex gap-4 text-sm">
                <button 
                  onClick={() => openEdit(addr)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button 
                  onClick={() => setDeleteId(addr.id)}
                  className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                >
                  <Trash2 size={14} /> Delete
                </button>
                {!addr.defaultAddress && (
                  <button 
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-gray-600 hover:text-gray-900 font-medium ml-auto"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Address"
        message="Are you sure you want to delete this address?"
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
