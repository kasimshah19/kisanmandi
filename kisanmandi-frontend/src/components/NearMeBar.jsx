import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Navigation, X } from 'lucide-react';
import { getCurrentPosition } from '../utils/geo';
import toast from 'react-hot-toast';

export default function NearMeBar({ onLocationChange, onRadiusChange, isActive, currentRadius }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleUseLocation = async () => {
    setLoading(true);
    try {
      const pos = await getCurrentPosition();
      onLocationChange(pos);
      toast.success(t('products.location_detected'));
    } catch (err) {
      toast.error(err.message || t('products.location_denied'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full text-green-600">
            <MapPin size={20} />
          </div>
          <div>
            <h3 className="font-medium text-green-900">{t('products.nearby_farmers_title')}</h3>
            <p className="text-sm text-green-700">{t('products.nearby_farmers_desc')}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {!isActive ? (
            <button
              onClick={handleUseLocation}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Navigation size={16} />
              {loading ? t('products.location_detecting') : t('products.use_current_location')}
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-green-200 shadow-sm">
                <span className="text-sm font-medium text-gray-700">{t('products.within_radius')}</span>
                <select
                  value={currentRadius}
                  onChange={(e) => onRadiusChange(Number(e.target.value))}
                  aria-label={t('products.radius_km')}
                  className="bg-transparent border-none text-sm font-bold text-green-700 focus:ring-0 cursor-pointer"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                </select>
              </div>
              <button
                onClick={() => onLocationChange(null)}
                className="flex items-center gap-2 bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <X size={16} />
                {t('products.turn_off')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
