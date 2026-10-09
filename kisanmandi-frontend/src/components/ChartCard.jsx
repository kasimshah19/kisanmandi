import React from 'react';

export default function ChartCard({ title, children, height = 300 }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div style={{ height, width: '100%' }}>
        {children}
      </div>
    </div>
  );
}
