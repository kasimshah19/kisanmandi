import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatShortDate, formatPrice } from '../../utils/format';
import Skeleton from '../Skeleton';
import EmptyState from '../EmptyState';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-lg text-sm">
        <p className="font-bold text-gray-700 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.name}: ₹{formatPrice(entry.value)}
          </p>
        ))}
        {payload[0]?.payload?.marketsCount && (
          <p className="text-gray-500 text-xs mt-1 border-t pt-1">
            Markets: {payload[0].payload.marketsCount}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function PriceTrendChart({ data, isLoading, days, onDaysChange, commodity, hasDemoData }) {
  const chartData = useMemo(() => {
    if (!data) return [];
    // Convert backend numbers and sort by date ascending
    return [...data].reverse().map(item => ({
      ...item,
      displayDate: formatShortDate(item.date),
      avgModalPrice: Number(item.avgModal || 0),
      avgMaxPrice: Number(item.maxPrice || 0),
      avgMinPrice: Number(item.minPrice || 0)
    }));
  }, [data]);

  if (!commodity) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-80">
        <p className="text-gray-500">Select a commodity to see its trend</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
        <EmptyState message="No trend data available for this selection." />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Price Trend: {commodity}</h3>
          {hasDemoData && (
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1 font-semibold">
              Includes demo data (for testing only)
            </span>
          )}
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onDaysChange(7)}
            className={`px-4 py-1 text-sm rounded-md transition-colors ${days === 7 ? 'bg-white shadow-sm font-medium text-green-700' : 'text-gray-600 hover:text-gray-800'}`}
          >
            7 Days
          </button>
          <button
            onClick={() => onDaysChange(30)}
            className={`px-4 py-1 text-sm rounded-md transition-colors ${days === 30 ? 'bg-white shadow-sm font-medium text-green-700' : 'text-gray-600 hover:text-gray-800'}`}
          >
            30 Days
          </button>
        </div>
      </div>

      {chartData.length === 1 && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
          Trend builds up day by day. Only 1 day of data so far.
        </div>
      )}

      <div className="w-full h-64 md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val}`} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
            <Line type="monotone" dataKey="avgModalPrice" name="Modal Price" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="avgMaxPrice" name="Max Price" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="avgMinPrice" name="Min Price" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
