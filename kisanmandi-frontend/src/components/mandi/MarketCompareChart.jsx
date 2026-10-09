import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatPrice } from '../../utils/format';
import Skeleton from '../Skeleton';
import EmptyState from '../EmptyState';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-lg text-sm">
        <p className="font-bold text-gray-800 mb-1">{data.market}</p>
        <p className="text-gray-600 text-xs mb-2">{data.district}</p>
        <p className="font-medium text-green-700">Modal Price: ₹{formatPrice(data.avgModalPrice)}</p>
      </div>
    );
  }
  return null;
};

export default function MarketCompareChart({ data, isLoading, commodity }) {
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(item => ({
      ...item,
      // truncate long market names for Y axis
      displayMarket: item.market.length > 15 ? item.market.substring(0, 15) + '...' : item.market,
      avgModalPrice: Number(item.modalPrice || 0)
    }));
  }, [data]);

  if (!commodity) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-[350px]">
        <p className="text-gray-500">Select a commodity to see market comparison</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[350px]">
        <EmptyState message="No comparison data available for this selection." />
      </div>
    );
  }

  // Find max value to highlight
  const maxPrice = Math.max(...chartData.map(d => d.avgModalPrice));

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Top Markets: {commodity}</h3>
      <div className="w-full h-72 md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="displayMarket" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#4b5563' }}
              width={90}
            />
            <Tooltip cursor={{ fill: '#f3f4f6' }} content={<CustomTooltip />} />
            <Bar dataKey="avgModalPrice" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.avgModalPrice === maxPrice ? '#15803d' : '#22c55e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
