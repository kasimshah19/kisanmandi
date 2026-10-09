import { useState } from 'react';
import { getCurrentPosition } from '../utils/geo';
import { Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

// Reusable address form used in Addresses page and Checkout
export default function AddressForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    fullName: initial?.fullName || '',
    phone: initial?.phone || '',
    line1: initial?.line1 || '',
    city: initial?.city || '',
    state: initial?.state || '',
    pincode: initial?.pincode || '',
    defaultAddress: initial?.defaultAddress || false,
    latitude: initial?.latitude || null,
    longitude: initial?.longitude || null,
  });
  const [errors, setErrors] = useState({});
  const [locating, setLocating] = useState(false);

  const handleUseLocation = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      setForm(prev => ({ ...prev, latitude: pos.lat, longitude: pos.lng }));
      toast.success('Location saved');
    } catch (err) {
      toast.error(err.message || 'Failed to get location');
    } finally {
      setLocating(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit phone number';
    if (!form.line1.trim()) e.line1 = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const inputCls = (field) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm transition ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input value={form.fullName} onChange={e => handleChange('fullName', e.target.value)}
          className={inputCls('fullName')} placeholder="Full name" />
        {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input value={form.phone} onChange={e => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
          className={inputCls('phone')} placeholder="10-digit phone number" />
        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
      </div>

      {/* Address line */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input value={form.line1} onChange={e => handleChange('line1', e.target.value)}
          className={inputCls('line1')} placeholder="House/flat, street, area" />
        {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1}</p>}
      </div>

      {/* City + State row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input value={form.city} onChange={e => handleChange('city', e.target.value)}
            className={inputCls('city')} placeholder="City" />
          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input value={form.state} onChange={e => handleChange('state', e.target.value)}
            className={inputCls('state')} placeholder="State" />
          {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
        </div>
      </div>

      {/* Pincode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
        <input value={form.pincode} onChange={e => handleChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
          className={inputCls('pincode')} placeholder="6-digit pincode" />
        {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
      </div>

      {/* Default checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.defaultAddress}
          onChange={e => handleChange('defaultAddress', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
        <span className="text-sm text-gray-700">Make this my default address</span>
      </label>

      {/* Location */}
      <div className="py-2 border-t mt-2">
        <button type="button" onClick={handleUseLocation} disabled={locating} className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-50">
          <Navigation size={16} /> {locating ? 'Locating...' : 'Use my current location'}
        </button>
        {(form.latitude && form.longitude) && <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded ml-2">Location saved</span>}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50">
          {loading ? 'Saving...' : (initial ? 'Update' : 'Save Address')}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
