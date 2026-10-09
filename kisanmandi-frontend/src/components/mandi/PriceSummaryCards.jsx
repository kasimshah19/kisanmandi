import { formatPrice } from '../../utils/format';
import { MapPin, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import Skeleton from '../Skeleton';

export default function PriceSummaryCards({ summary, status, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  // If no summary available for selected filters
  if (!summary) return null;

  const isUp = summary.changePercent > 0;
  const isDown = summary.changePercent < 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Latest Data Date</p>
          <p className="text-xl font-bold text-gray-800">
            {status?.latestPriceDate ? new Date(status.latestPriceDate).toLocaleDateString('en-IN') : 'N/A'}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg mr-4">
          <MapPin className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Markets Covered</p>
          <p className="text-xl font-bold text-gray-800">{summary.marketCount || 0}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg mr-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg Modal Price</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-800">
                  {summary.avgModal ? `₹${formatPrice(summary.avgModal)}` : '—'}
                </p>
                {summary.changePercent !== null && summary.changePercent !== undefined && summary.changePercent !== 0 && (
                  <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isUp ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                    {Math.abs(summary.changePercent).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-right">
          Range: {summary.minPrice ? `₹${formatPrice(summary.minPrice)}` : '—'} - {summary.maxPrice ? `₹${formatPrice(summary.maxPrice)}` : '—'} / quintal
        </p>
      </div>
    </div>
  );
}
