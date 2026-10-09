import { useState } from 'react';
import { formatPrice, perKg, formatDate } from '../../utils/format';
import PriceUnitToggle from './PriceUnitToggle';
import Pagination from '../Pagination';
import Skeleton from '../Skeleton';
import EmptyState from '../EmptyState';
import { ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';

export default function PriceTable({ data, isLoading, pagination, onPageChange }) {
  const [isKg, setIsKg] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'modalPrice', direction: 'desc' });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
        <EmptyState message="No mandi prices found for the selected filters." />
      </div>
    );
  }

  // Client-side sort
  const sortedData = [...data].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="ml-1 text-green-600" /> : <ArrowDown size={14} className="ml-1 text-green-600" />;
  };

  const displayValue = (val) => {
    if (val === null || val === undefined) return '-';
    return isKg ? perKg(val) : formatPrice(val);
  };

  const latestDate = data[0]?.priceDate ? formatDate(data[0].priceDate) : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6 overflow-hidden">
      <div className="p-4 md:p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Detailed Prices</h3>
          {latestDate && <p className="text-sm text-gray-500">Data as of {latestDate}</p>}
        </div>
        <PriceUnitToggle isKg={isKg} onChange={setIsKg} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm font-medium border-b border-gray-200">
              <th className="p-4 sticky left-0 bg-gray-50 z-10 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('market')}>
                <div className="flex items-center">Market {getSortIcon('market')}</div>
              </th>
              <th className="p-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('district')}>
                <div className="flex items-center">District {getSortIcon('district')}</div>
              </th>
              <th className="p-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('commodity')}>
                <div className="flex items-center">Commodity {getSortIcon('commodity')}</div>
              </th>
              <th className="p-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('variety')}>
                <div className="flex items-center">Variety {getSortIcon('variety')}</div>
              </th>
              <th className="p-4 text-right whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('minPrice')}>
                <div className="flex items-center justify-end">Min {getSortIcon('minPrice')}</div>
              </th>
              <th className="p-4 text-right whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('maxPrice')}>
                <div className="flex items-center justify-end">Max {getSortIcon('maxPrice')}</div>
              </th>
              <th className="p-4 text-right whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('modalPrice')}>
                <div className="flex items-center justify-end">Modal {getSortIcon('modalPrice')}</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {sortedData.map((row, index) => (
              <tr key={`${row.market}-${row.commodity}-${index}`} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 sticky left-0 bg-white group-hover:bg-gray-50 z-10 font-medium text-gray-800 whitespace-nowrap">
                  {row.market}
                </td>
                <td className="p-4 text-gray-600 whitespace-nowrap">{row.district}, {row.state}</td>
                <td className="p-4 text-gray-800 font-medium whitespace-nowrap">{row.commodity}</td>
                <td className="p-4 text-gray-600 whitespace-nowrap">{row.variety} {row.grade !== 'Other' && `(${row.grade})`}</td>
                <td className="p-4 text-right text-gray-600 whitespace-nowrap">₹{displayValue(row.minPrice)}</td>
                <td className="p-4 text-right text-gray-600 whitespace-nowrap">₹{displayValue(row.maxPrice)}</td>
                <td className="p-4 text-right font-bold text-green-700 whitespace-nowrap">₹{displayValue(row.modalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-gray-100">
          <Pagination
            currentPage={pagination.pageable.pageNumber}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
