import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ChartCard({ title, children, data, type = 'bar', dataKey = 'sales', height = 300 }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div style={{ height, width: '100%' }}>
        {children ? (
          children
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} />
              <Bar dataKey={dataKey} fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
