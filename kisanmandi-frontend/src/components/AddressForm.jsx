import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentPosition } from '../utils/geo';
import { Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

// Reusable address form used in Addresses page and Checkout
export default function AddressForm({ initial, onSubmit, onCancel, loading }) {
  const { t } = useTranslation();
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
      toast.success(t('addresses.location_saved'));
    } catch (err) {
      toast.error(err.message || t('errors.generic_retry'));
    } finally {
      setLocating(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = t('errors.field_required');
    if (!/^\d{10}$/.test(form.phone)) e.phone = t('errors.enter_valid_phone');
    if (!form.line1.trim()) e.line1 = t('errors.field_required');
    if (!form.city.trim()) e.city = t('errors.field_required');
    if (!form.state.trim()) e.state = t('errors.field_required');
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = t('errors.field_required');
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
        <label htmlFor="addr-fullName" className="block text-sm font-medium text-gray-700 mb-1">
          {t('addresses.full_name')} <span className="text-red-500">*</span>
        </label>
        <input
          id="addr-fullName"
          value={form.fullName}
          onChange={e => handleChange('fullName', e.target.value)}
          autoComplete="name"
          className={inputCls('fullName')}
          placeholder={t('addresses.full_name')}
        />
        {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="addr-phone" className="block text-sm font-medium text-gray-700 mb-1">
          {t('addresses.phone')} <span className="text-red-500">*</span>
        </label>
        <input
          id="addr-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          value={form.phone}
          onChange={e => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
          className={inputCls('phone')}
          placeholder="10-digit number"
        />
        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
      </div>

      {/* Address line */}
      <div>
        <label htmlFor="addr-line1" className="block text-sm font-medium text-gray-700 mb-1">
          {t('addresses.address_line')} <span className="text-red-500">*</span>
        </label>
        <input
          id="addr-line1"
          value={form.line1}
          onChange={e => handleChange('line1', e.target.value)}
          autoComplete="street-address"
          className={inputCls('line1')}
          placeholder={t('addresses.address_line')}
        />
        {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1}</p>}
      </div>

      {/* City + State row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="addr-city" className="block text-sm font-medium text-gray-700 mb-1">
            {t('addresses.city')} <span className="text-red-500">*</span>
          </label>
          <input
            id="addr-city"
            value={form.city}
            onChange={e => handleChange('city', e.target.value)}
            autoComplete="address-level2"
            className={inputCls('city')}
            placeholder={t('addresses.city')}
          />
          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
        </div>
        <div>
          <label htmlFor="addr-state" className="block text-sm font-medium text-gray-700 mb-1">
            {t('addresses.state')} <span className="text-red-500">*</span>
          </label>
          <input
            id="addr-state"
            value={form.state}
            onChange={e => handleChange('state', e.target.value)}
            autoComplete="address-level1"
            className={inputCls('state')}
            placeholder={t('addresses.state')}
          />
          {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
        </div>
      </div>

      {/* Pincode */}
      <div>
        <label htmlFor="addr-pincode" className="block text-sm font-medium text-gray-700 mb-1">
          {t('addresses.pincode')} <span className="text-red-500">*</span>
        </label>
        <input
          id="addr-pincode"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={form.pincode}
          onChange={e => handleChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
          className={inputCls('pincode')}
          placeholder="6-digit pincode"
        />
        {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
      </div>

      {/* Default checkbox */}
      <label className="flex items-center gap-2 cursor-pointer py-1">
        <input
          type="checkbox"
          checked={form.defaultAddress}
          onChange={e => handleChange('defaultAddress', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-600"
        />
        <span className="text-sm text-gray-700">{t('addresses.make_default')}</span>
      </label>

      {/* Location */}
      <div className="py-2 border-t mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locating}
          className="flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 disabled:opacity-50 min-h-[44px]"
        >
          <Navigation size={16} /> {locating ? t('addresses.locating') : t('addresses.use_location')}
        </button>
        {form.latitude && form.longitude && (
          <span className="text-xs text-green-800 bg-green-50 px-2 py-1 rounded">{t('addresses.location_saved')}</span>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-700 text-white py-2.5 rounded-lg font-medium hover:bg-green-800 transition disabled:opacity-50 min-h-[44px]"
        >
          {loading ? t('common.loading') : initial ? t('common.save') : t('addresses.add_address')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition min-h-[44px]"
          >
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
