import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { getCurrentPosition } from '../utils/geo';
import toast from 'react-hot-toast';

export default function NearMeBar({ onLocationChange, onRadiusChange, isActive, currentRadius }) {
  const [loading, setLoading] = useState(false);

  const handleUseLocation = async () => {
    setLoading(true);
    try {
      const pos = await getCurrentPosition();
      onLocationChange(pos);
      toast.success('Location found');
    } catch (err) {
      toast.error(err.message || 'Failed to get location');
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
            <h3 className="font-medium text-green-900">Nearby Farmers</h3>
            <p className="text-sm text-green-700">Find fresh produce near you. Only farmers with location enabled are shown.</p>
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
              {loading ? 'Locating...' : 'Use my current location'}
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-green-200 shadow-sm">
                <span className="text-sm font-medium text-gray-700">Within</span>
                <select
                  value={currentRadius}
                  onChange={(e) => onRadiusChange(Number(e.target.value))}
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
                Turn off
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
