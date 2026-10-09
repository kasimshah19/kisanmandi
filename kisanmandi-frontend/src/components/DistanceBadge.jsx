import React from 'react';
import { MapPin } from 'lucide-react';
import { formatDistance } from '../utils/geo';

export default function DistanceBadge({ distanceKm }) {
  if (distanceKm == null) return null;
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium border border-green-100">
      <MapPin size={12} />
      {formatDistance(distanceKm)} away
    </div>
  );
}
