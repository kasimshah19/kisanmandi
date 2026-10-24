import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPrice, perKg, formatDate } from '../../utils/format';
import PriceUnitToggle from './PriceUnitToggle';
import Pagination from '../Pagination';
import Skeleton from '../Skeleton';
import EmptyState from '../EmptyState';
import NoResults from '../illustrations/NoResults';
import { ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';

export default function PriceTable({ data, isLoading, pagination, onPageChange }) {
  const { t } = useTranslation();
  const [isKg, setIsKg] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'modalPrice', direction: 'desc' });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-neutral-200/90 mt-6 space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-neutral-200/90 mt-6 min-h-[260px]">
        <EmptyState
          illustration={NoResults}
          title={t('mandi.no_prices_found')}
          message="No market mandi prices recorded for the selected combination today."
        />
      </div>
    );
  }

  // Client-side sort
  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
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
    if (sortConfig.key !== key) return <ArrowUpDown size={13} className="ml-1 text-neutral-400" />;
    return sortConfig.direction === 'asc' ? (
      <ArrowUp size={13} className="ml-1 text-brand-700" />
    ) : (
      <ArrowDown size={13} className="ml-1 text-brand-700" />
    );
  };

  const displayValue = (val) => {
    if (val === null || val === undefined) return '—';
    if (isKg) {
      // 2 decimals for per-kg
      return perKg(val);
    }
    // Whole rupees for quintal
    const num = Math.round(Number(val) || 0);
    return num.toLocaleString('en-IN');
  };

  const latestDate = data[0]?.priceDate ? formatDate(data[0].priceDate) : '';

  return (
    <div className="bg-white rounded-3xl shadow-xs border border-neutral-200/90 mt-6 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-6 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
            {t('mandi.detailed_prices')}
          </h3>
          {latestDate && (
            <p className="text-xs text-neutral-500 mt-0.5 font-medium">
              {t('mandi.data_as_of', { date: latestDate })}
            </p>
          )}
        </div>
        <PriceUnitToggle isKg={isKg} onChange={setIsKg} />
      </div>

      {/* Horizontally scrollable table container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-neutral-50/90 text-neutral-700 font-bold border-b border-neutral-200 text-2xs uppercase tracking-wider sticky top-0 z-20">
              <th
                className="p-3.5 sm:p-4 sticky left-0 bg-neutral-50 z-30 whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
                onClick={() => handleSort('market')}
              >
                <div className="flex items-center">
                  {t('mandi.market_col')} {getSortIcon('market')}
                </div>
              </th>
              <th
                className="p-3.5 sm:p-4 whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition"
                onClick={() => handleSort('district')}
              >
                <div className="flex items-center">
                  {t('mandi.district_col')} {getSortIcon('district')}
                </div>
              </th>
              <th
                className="p-3.5 sm:p-4 whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition"
                onClick={() => handleSort('commodity')}
              >
                <div className="flex items-center">
                  {t('mandi.commodity_col')} {getSortIcon('commodity')}
                </div>
              </th>
              <th
                className="p-3.5 sm:p-4 whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition"
                onClick={() => handleSort('variety')}
              >
                <div className="flex items-center">
                  {t('mandi.variety_col')} {getSortIcon('variety')}
                </div>
              </th>
              <th
                className="p-3.5 sm:p-4 text-right whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition"
                onClick={() => handleSort('minPrice')}
              >
                <div className="flex items-center justify-end">
                  {t('mandi.min_col')} {getSortIcon('minPrice')}
                </div>
              </th>
              <th
                className="p-3.5 sm:p-4 text-right whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition"
                onClick={() => handleSort('maxPrice')}
              >
                <div className="flex items-center justify-end">
                  {t('mandi.max_col')} {getSortIcon('maxPrice')}
                </div>
              </th>
              <th
                className="p-3.5 sm:p-4 text-right whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition"
                onClick={() => handleSort('modalPrice')}
              >
                <div className="flex items-center justify-end">
                  {t('mandi.modal_col')} {getSortIcon('modalPrice')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sortedData.map((row, index) => (
              <tr
                key={`${row.market}-${row.commodity}-${index}`}
                className="odd:bg-white even:bg-neutral-50/40 hover:bg-brand-50/30 transition-colors"
              >
                {/* Sticky First Column on Mobile with shadow divider */}
                <td className="p-3.5 sm:p-4 sticky left-0 bg-white group-hover:bg-brand-50/30 z-10 font-bold text-neutral-900 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  {row.market}
                </td>
                <td className="p-3.5 sm:p-4 text-neutral-600 whitespace-nowrap">
                  {row.district}, {row.state}
                </td>
                <td className="p-3.5 sm:p-4 text-neutral-900 font-bold whitespace-nowrap">
                  {row.commodity}
                </td>
                <td className="p-3.5 sm:p-4 text-neutral-600 whitespace-nowrap">
                  {row.variety} {row.grade && row.grade !== 'Other' && `(${row.grade})`}
                </td>
                <td className="p-3.5 sm:p-4 text-right text-neutral-600 font-mono tabular-nums whitespace-nowrap">
                  ₹{displayValue(row.minPrice)}
                </td>
                <td className="p-3.5 sm:p-4 text-right text-neutral-600 font-mono tabular-nums whitespace-nowrap">
                  ₹{displayValue(row.maxPrice)}
                </td>
                <td className="p-3.5 sm:p-4 text-right font-extrabold text-brand-900 font-mono tabular-nums whitespace-nowrap">
                  ₹{displayValue(row.modalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (pagination.totalPages > 1 || pagination.totalElements > 0) && (
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
          <Pagination
            page={pagination.page ?? pagination.pageable?.pageNumber ?? pagination.number ?? 0}
            totalPages={pagination.totalPages || 0}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
