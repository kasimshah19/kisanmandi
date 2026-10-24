import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentPosition } from '../utils/geo';
import { Navigation, MapPin } from 'lucide-react';
import Button from './ui/Button';
import toast from 'react-hot-toast';

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
      setForm((prev) => ({ ...prev, latitude: pos.lat, longitude: pos.lng }));
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
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const inputCls = (field) =>
    `w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm transition ${
      errors[field] ? 'border-red-400 bg-red-50/20' : 'border-neutral-200'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label htmlFor="addr-fullName" className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
          {t('addresses.full_name')} <span className="text-red-500">*</span>
        </label>
        <input
          id="addr-fullName"
          value={form.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          autoComplete="name"
          className={inputCls('fullName')}
          placeholder={t('addresses.full_name')}
        />
        {errors.fullName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.fullName}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="addr-phone" className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
          {t('addresses.phone')} <span className="text-red-500">*</span>
        </label>
        <input
          id="addr-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
          className={inputCls('phone')}
          placeholder="10-digit number"
        />
        {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>}
      </div>

      {/* Address line */}
      <div>
        <label htmlFor="addr-line1" className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
          {t('addresses.address_line')} <span className="text-red-500">*</span>
        </label>
        <input
          id="addr-line1"
          value={form.line1}
          onChange={(e) => handleChange('line1', e.target.value)}
          autoComplete="street-address"
          className={inputCls('line1')}
          placeholder={t('addresses.address_line')}
        />
        {errors.line1 && <p className="text-xs text-red-500 mt-1 font-medium">{errors.line1}</p>}
      </div>

      {/* City + State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label htmlFor="addr-city" className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
            {t('addresses.city')} <span className="text-red-500">*</span>
          </label>
          <input
            id="addr-city"
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
            autoComplete="address-level2"
            className={inputCls('city')}
            placeholder={t('addresses.city')}
          />
          {errors.city && <p className="text-xs text-red-500 mt-1 font-medium">{errors.city}</p>}
        </div>
        <div>
          <label htmlFor="addr-state" className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
            {t('addresses.state')} <span className="text-red-500">*</span>
          </label>
          <input
            id="addr-state"
            value={form.state}
            onChange={(e) => handleChange('state', e.target.value)}
            autoComplete="address-level1"
            className={inputCls('state')}
            placeholder={t('addresses.state')}
          />
          {errors.state && <p className="text-xs text-red-500 mt-1 font-medium">{errors.state}</p>}
        </div>
      </div>

      {/* Pincode */}
      <div>
        <label htmlFor="addr-pincode" className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
          {t('addresses.pincode')} <span className="text-red-500">*</span>
        </label>
        <input
          id="addr-pincode"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={form.pincode}
          onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
          className={inputCls('pincode')}
          placeholder="6-digit pincode"
        />
        {errors.pincode && <p className="text-xs text-red-500 mt-1 font-medium">{errors.pincode}</p>}
      </div>

      {/* Default Checkbox */}
      <label className="flex items-center gap-2.5 cursor-pointer py-1">
        <input
          type="checkbox"
          checked={form.defaultAddress}
          onChange={(e) => handleChange('defaultAddress', e.target.checked)}
          className="w-4 h-4 rounded-md border-neutral-300 text-brand-700 focus:ring-brand-500"
        />
        <span className="text-xs sm:text-sm font-medium text-neutral-700">
          {t('addresses.make_default')}
        </span>
      </label>

      {/* Location Button */}
      <div className="py-2.5 border-t border-neutral-100 flex items-center justify-between">
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locating}
          className="flex items-center gap-2 text-xs font-bold text-brand-700 hover:text-brand-900 disabled:opacity-50 min-h-[40px]"
        >
          <Navigation size={14} className={locating ? 'animate-spin' : ''} />
          {locating ? t('addresses.locating') : t('addresses.use_location')}
        </button>
        {form.latitude && form.longitude && (
          <span className="text-[11px] font-bold text-brand-800 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <MapPin size={10} />
            {t('addresses.location_saved')}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          disabled={loading}
          className="flex-1"
        >
          {loading ? t('common.loading') : initial ? t('common.save') : t('addresses.add_address')}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onCancel}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
}
