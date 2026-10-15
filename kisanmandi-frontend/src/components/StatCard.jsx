import React from 'react';
import { formatINR } from '../utils/format';

export default function StatCard({ icon: Icon, label, title, value, hint, type }) {
  const displayLabel = label || title;
  const isMissing = value === null || value === undefined || value === '';
  const displayValue = isMissing ? '—' : (type === 'currency' ? formatINR(value) : value);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-start gap-4">
      <div className="p-3 bg-green-50 text-green-600 rounded-lg">
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{displayLabel}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{displayValue}</p>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
    </div>
  );
}
