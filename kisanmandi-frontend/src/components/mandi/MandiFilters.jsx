import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { mandiService } from '../../services/mandiService';
import { Filter, X, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import toast from 'react-hot-toast';

const POPULAR_COMMODITIES = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Rice', 'Soyabean', 'Cotton', 'Banana', 'Apple'];

export default function MandiFilters({ filters, onFilterChange, latestDate }) {
  const { t } = useTranslation();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Options state
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [commodities, setCommodities] = useState([]);

  // Fetch States on mount
  useEffect(() => {
    mandiService
      .getStates()
      .then((res) => setStates(res.data || []))
      .catch(() => toast.error(t('errors.generic_retry')));
  }, []);

  // Fetch Districts when State changes
  useEffect(() => {
    if (filters.state) {
      mandiService
        .getDistricts(filters.state)
        .then((res) => setDistricts(res.data || []))
        .catch(() => toast.error(t('errors.generic_retry')));
    } else {
      setDistricts([]);
    }
  }, [filters.state]);

  // Fetch Markets when District changes
  useEffect(() => {
    if (filters.state && filters.district) {
      mandiService
        .getMarkets(filters.state, filters.district)
        .then((res) => setMarkets(res.data || []))
        .catch(() => toast.error(t('errors.generic_retry')));
    } else {
      setMarkets([]);
    }
  }, [filters.state, filters.district]);

  // Fetch Commodities based on selected scope
  useEffect(() => {
    mandiService
      .getCommodities(filters.state, filters.district, filters.market)
      .then((res) => setCommodities(res.data || []))
      .catch(() => toast.error(t('errors.generic_retry')));
  }, [filters.state, filters.district, filters.market]);

  // Lock body scroll when mobile filter sheet is open
  useEffect(() => {
    if (isMobileSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSheetOpen]);

  // Escape key closes sheet
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMobileSheetOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStateChange = (e) => {
    onFilterChange({ state: e.target.value, district: '', market: '' });
  };

  const handleDistrictChange = (e) => {
    onFilterChange({ district: e.target.value, market: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleClear = () => {
    onFilterChange({ state: '', district: '', market: '', commodity: '', date: latestDate || '' });
    setIsMobileSheetOpen(false);
  };

  const activeFiltersCount = [
    filters.state,
    filters.district,
    filters.market,
    filters.commodity,
    filters.date && filters.date !== latestDate ? filters.date : null,
  ].filter(Boolean).length;

  const renderFilterSelects = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
      {/* State */}
      <div>
        <label className="block text-2xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
          {t('mandi.select_state')}
        </label>
        <select
          name="state"
          value={filters.state || ''}
          onChange={handleStateChange}
          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition min-h-[42px]"
        >
          <option value="">{t('mandi.all_states')}</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      <div>
        <label className="block text-2xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
          {t('mandi.select_district')}
        </label>
        <select
          name="district"
          value={filters.district || ''}
          onChange={handleDistrictChange}
          disabled={!filters.state}
          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition disabled:opacity-50 min-h-[42px]"
        >
          <option value="">{t('mandi.all_districts')}</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Market */}
      <div>
        <label className="block text-2xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
          {t('mandi.select_market')}
        </label>
        <select
          name="market"
          value={filters.market || ''}
          onChange={handleChange}
          disabled={!filters.district}
          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition disabled:opacity-50 min-h-[42px]"
        >
          <option value="">{t('mandi.all_markets')}</option>
          {markets.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Commodity */}
      <div>
        <label className="block text-2xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
          {t('mandi.select_commodity')}
        </label>
        <select
          name="commodity"
          value={filters.commodity || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition min-h-[42px]"
        >
          <option value="">{t('mandi.all_commodities')}</option>
          {commodities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Date & Clear button */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="block text-2xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
            {t('mandi.select_date')}
          </label>
          <input
            type="date"
            name="date"
            value={filters.date || ''}
            onChange={handleChange}
            max={latestDate || undefined}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition min-h-[42px]"
          />
        </div>

        <button
          onClick={handleClear}
          title={t('common.clear')}
          className="mt-5 p-2.5 rounded-xl border border-neutral-200 text-neutral-500 hover:text-red-600 hover:bg-red-50 transition shrink-0 min-h-[42px]"
          aria-label={t('common.clear')}
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 mb-6">
      {/* Desktop Sticky Filter Card */}
      <div className="hidden lg:block bg-white p-5 rounded-3xl border border-neutral-200/90 shadow-xs sticky top-20 z-10">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={17} className="text-brand-700" />
            <h3 className="font-bold text-neutral-900 text-sm tracking-tight">
              Mandi Market Filters
            </h3>
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="brand" size="sm">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        {renderFilterSelects()}
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <SlidersHorizontal size={16} className="text-brand-700 shrink-0" />
          <span className="text-xs font-bold text-neutral-900 truncate">
            {filters.commodity ? `${filters.commodity}` : 'All Produce'}
            {filters.district ? ` • ${filters.district}` : ''}
          </span>
        </div>

        <button
          onClick={() => setIsMobileSheetOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 font-bold text-xs shrink-0 min-h-[40px]"
        >
          <Filter size={14} className="text-brand-700" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-brand-700 text-white text-2xs flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Commodity Quick-Pick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-2xs font-bold text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles size={12} className="text-amber-500" /> Quick Pick:
        </span>
        {POPULAR_COMMODITIES.map((com) => {
          const isSelected = filters.commodity?.toLowerCase() === com.toLowerCase();
          return (
            <button
              key={com}
              onClick={() => onFilterChange({ commodity: isSelected ? '' : com })}
              className={`
                px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition shrink-0 min-h-[34px]
                ${
                  isSelected
                    ? 'bg-brand-700 text-white shadow-2xs font-bold'
                    : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200/90'
                }
              `}
            >
              {com}
            </button>
          );
        })}
      </div>

      {/* Mobile Bottom Sheet Portal */}
      {isMobileSheetOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSheetOpen(false)}
          >
            <div
              className="bg-white w-full max-h-[85vh] sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-brand-700" />
                  <h3 className="font-bold text-neutral-900 text-base">
                    {t('mandi.filter_heading')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileSheetOpen(false)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                  aria-label={t('common.close')}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1">
                {renderFilterSelects()}
              </div>

              <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between gap-3">
                <Button variant="ghost" size="md" onClick={handleClear}>
                  {t('common.clear')}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={() => setIsMobileSheetOpen(false)}
                >
                  {t('common.apply')}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
