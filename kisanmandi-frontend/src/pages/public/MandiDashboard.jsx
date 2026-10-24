import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { mandiService } from '../../services/mandiService';
import { formatDate, formatINR } from '../../utils/format';
import toast from 'react-hot-toast';

import MandiFilters from '../../components/mandi/MandiFilters';
import PriceSummaryCards from '../../components/mandi/PriceSummaryCards';
import PriceTable from '../../components/mandi/PriceTable';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import BottomSheet from '../../components/ui/BottomSheet';
import ListenButton from '../../components/ListenButton';
import VoiceSearchButton from '../../components/ui/VoiceSearchButton';
import CommodityIcon from '../../utils/commodityIcons';
import EmptyState from '../../components/EmptyState';
import NoResults from '../../components/illustrations/NoResults';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Database,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

// Lazy load Recharts-dependent charts ONLY for Detailed view
const PriceTrendChart = React.lazy(() => import('../../components/mandi/PriceTrendChart'));
const MarketCompareChart = React.lazy(() => import('../../components/mandi/MarketCompareChart'));

const COMMON_CROPS = [
  'Tomato',
  'Potato',
  'Onion',
  'Green Chilli',
  'Wheat',
  'Rice',
  'Soyabean',
  'Cotton',
  'Banana',
  'Garlic',
];

// Helper to compute SVG sparkline path
function Sparkline({ data = [], width = 120, height = 36, color = '#15803d' }) {
  if (!data || data.length < 2) return null;

  const values = data.map((d) => Number(d.avgModal || d.modalPrice || 0)).filter((v) => v > 0);
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((val, idx) => {
    const x = (idx / (values.length - 1)) * (width - 8) + 4;
    const y = height - 4 - ((val - min) / range) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const lastPoint = points[points.length - 1].split(',');

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0" aria-hidden="true">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(' ')}
      />
      <circle
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r="3.5"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function MandiDashboard() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('mandi.title')} | KisanMandi`);

  const [searchParams, setSearchParams] = useSearchParams();

  // Persist view toggle (simple vs detailed) in localStorage
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('kisanmandi_mandi_view') || 'simple';
    } catch {
      return 'simple';
    }
  });

  const handleToggleView = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('kisanmandi_mandi_view', mode);
    } catch {
      // ignore
    }
  };

  // Read initial filters from URL
  const initialFilters = {
    state: searchParams.get('state') || '',
    district: searchParams.get('district') || '',
    market: searchParams.get('market') || '',
    commodity: searchParams.get('commodity') || 'Tomato',
    date: searchParams.get('date') || '',
  };

  const initialDays = parseInt(searchParams.get('days') || '7', 10);
  const initialPage = parseInt(searchParams.get('page') || '0', 10);

  const [filters, setFilters] = useState(initialFilters);
  const [days, setDays] = useState(initialDays);
  const [page, setPage] = useState(initialPage);

  const [status, setStatus] = useState(null);
  const [summary, setSummary] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [compareData, setCompareData] = useState([]);
  const [pricesData, setPricesData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [hasDemoData, setHasDemoData] = useState(false);

  // Commodity list and search
  const [allCommodities, setAllCommodities] = useState([]);
  const [cropSearchTerm, setCropSearchTerm] = useState('');
  const [isCropSearchOpen, setIsCropSearchOpen] = useState(false);

  // Change location bottom sheet
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableMarkets, setAvailableMarkets] = useState([]);
  const [tempDistrict, setTempDistrict] = useState(filters.district);
  const [tempMarket, setTempMarket] = useState(filters.market);

  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingTrend, setIsLoadingTrend] = useState(true);
  const [isLoadingCompare, setIsLoadingCompare] = useState(true);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [isDataAvailable, setIsDataAvailable] = useState(true);

  // Sync state to URL
  const handleFilterChange = useCallback(
    (newFilters) => {
      const merged = { ...filters, ...newFilters };
      setFilters(merged);

      const params = new URLSearchParams();
      Object.keys(merged).forEach((k) => {
        if (merged[k]) params.set(k, merged[k]);
      });
      params.set('days', days);
      setSearchParams(params);
      setPage(0);
    },
    [filters, days, setSearchParams]
  );

  const handleDaysChange = (newDays) => {
    setDays(newDays);
    const params = new URLSearchParams(searchParams);
    params.set('days', newDays);
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
  };

  // Initial load: get status and default state
  useEffect(() => {
    mandiService
      .getStatus()
      .then((res) => {
        setStatus(res.data);
        if (!res.data.latestPriceDate) {
          setIsDataAvailable(false);
        } else if (!filters.state) {
          mandiService
            .getStates()
            .then((statesRes) => {
              if (statesRes.data.length > 0 && !filters.state) {
                const defaultState = statesRes.data.includes('Maharashtra')
                  ? 'Maharashtra'
                  : statesRes.data[0];
                handleFilterChange({ state: defaultState, date: res.data.latestPriceDate });
              }
            })
            .catch(() => {});
        } else if (!filters.date) {
          handleFilterChange({ date: res.data.latestPriceDate });
        }
      })
      .catch(() => {
        setIsDataAvailable(false);
      });

    // Load full commodity names list for search
    mandiService
      .getCommodities()
      .then((res) => setAllCommodities(res.data || []))
      .catch(() => {});
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (filters.state) {
      mandiService
        .getDistricts(filters.state)
        .then((res) => setAvailableDistricts(res.data || []))
        .catch(() => setAvailableDistricts([]));
    }
  }, [filters.state]);

  // Fetch markets when district changes
  useEffect(() => {
    if (filters.state && tempDistrict) {
      mandiService
        .getMarkets(filters.state, tempDistrict)
        .then((res) => setAvailableMarkets(res.data || []))
        .catch(() => setAvailableMarkets([]));
    } else {
      setAvailableMarkets([]);
    }
  }, [filters.state, tempDistrict]);

  // Fetch Summary
  useEffect(() => {
    if (!filters.commodity || !isDataAvailable) {
      setSummary(null);
      setIsLoadingSummary(false);
      return;
    }

    const abortCtrl = new AbortController();
    setIsLoadingSummary(true);

    mandiService
      .getSummary(
        {
          commodity: filters.commodity,
          state: filters.state,
          district: filters.district,
        },
        { signal: abortCtrl.signal }
      )
      .then((res) => {
        setSummary(res.status === 204 ? null : res.data);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError') setSummary(null);
      })
      .finally(() => setIsLoadingSummary(false));

    return () => abortCtrl.abort();
  }, [filters.commodity, filters.state, filters.district, isDataAvailable]);

  // Fetch Trend
  useEffect(() => {
    if (!filters.commodity || !isDataAvailable) {
      setTrendData([]);
      setIsLoadingTrend(false);
      return;
    }

    const abortCtrl = new AbortController();
    setIsLoadingTrend(true);

    mandiService
      .getTrend(
        {
          commodity: filters.commodity,
          state: filters.state,
          district: filters.district,
          market: filters.market,
          days: days,
        },
        { signal: abortCtrl.signal }
      )
      .then((res) => {
        setTrendData(res.data.points || []);
        setHasDemoData(res.data.hasDemoData || false);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError') toast.error('Failed to load trend data');
      })
      .finally(() => setIsLoadingTrend(false));

    return () => abortCtrl.abort();
  }, [filters.commodity, filters.state, filters.district, filters.market, days, isDataAvailable]);

  // Fetch Compare
  useEffect(() => {
    if (!filters.commodity || !isDataAvailable) {
      setCompareData([]);
      setIsLoadingCompare(false);
      return;
    }

    const abortCtrl = new AbortController();
    setIsLoadingCompare(true);

    mandiService
      .getCompare(
        {
          commodity: filters.commodity,
          state: filters.state,
          district: filters.district,
          date: filters.date,
          limit: 10,
        },
        { signal: abortCtrl.signal }
      )
      .then((res) => {
        setCompareData(res.data.points || []);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError') toast.error('Failed to load compare data');
      })
      .finally(() => setIsLoadingCompare(false));

    return () => abortCtrl.abort();
  }, [filters.commodity, filters.state, filters.district, filters.date, isDataAvailable]);

  // Fetch Prices
  useEffect(() => {
    if (!isDataAvailable) {
      setPricesData([]);
      setIsLoadingPrices(false);
      return;
    }

    const abortCtrl = new AbortController();
    setIsLoadingPrices(true);

    mandiService
      .getPrices(
        {
          state: filters.state,
          district: filters.district,
          market: filters.market,
          commodity: filters.commodity,
          date: filters.date,
          page: page,
          size: 20,
        },
        { signal: abortCtrl.signal }
      )
      .then((res) => {
        setPricesData(res.data.content || []);
        setPagination(res.data);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError') toast.error('Failed to load prices table');
      })
      .finally(() => setIsLoadingPrices(false));

    return () => abortCtrl.abort();
  }, [filters.state, filters.district, filters.market, filters.commodity, filters.date, page, isDataAvailable]);

  // Price change calculation in words
  const priceChange = useMemo(() => {
    if (!trendData || trendData.length < 2) return null;
    const sorted = [...trendData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const latest = Number(sorted[sorted.length - 1]?.avgModal || 0);
    const prev = Number(sorted[sorted.length - 2]?.avgModal || 0);
    if (!latest || !prev) return null;
    const diff = Math.round(latest - prev);
    return {
      diff,
      isHigher: diff > 0,
      isLower: diff < 0,
      isSteady: diff === 0,
      text:
        diff > 0
          ? `Rs ${diff} more than yesterday`
          : diff < 0
          ? `Rs ${Math.abs(diff)} less than yesterday`
          : 'Same as yesterday',
    };
  }, [trendData]);

  // Trend summary sentence in plain words
  const trendSentence = useMemo(() => {
    if (!trendData || trendData.length < 2) return null;
    const sorted = [...trendData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const first = Number(sorted[0]?.avgModal || 0);
    const last = Number(sorted[sorted.length - 1]?.avgModal || 0);
    const change = last - first;
    if (change > 30) return { text: 'Price went up this week', isUp: true };
    if (change < -30) return { text: 'Price went down this week', isDown: true };
    return { text: 'Price was steady this week', isSteady: true };
  }, [trendData]);

  // Top 3 markets from compareData
  const topMarkets = useMemo(() => {
    if (!compareData || compareData.length === 0) return [];
    return [...compareData]
      .sort((a, b) => (Number(b.modalPrice) || 0) - (Number(a.modalPrice) || 0))
      .slice(0, 3);
  }, [compareData]);

  // Speech readout text for ListenButton
  const currentCommodity = filters.commodity || 'Produce';
  const modalQuintal = Math.round(Number(summary?.avgModal || 0));
  const modalKg = (Number(summary?.avgModal || 0) / 100).toFixed(1);
  const speechText = summary
    ? `Today's mandi price for ${currentCommodity} is ${modalQuintal} rupees per quintal, about ${modalKg} rupees per kilogram. ${
        priceChange ? priceChange.text : ''
      }`
    : `Mandi rates for ${currentCommodity}`;

  // Filter crops for More Crops picker
  const filteredCrops = allCommodities.filter((c) =>
    c.toLowerCase().includes(cropSearchTerm.toLowerCase())
  );

  const lastUpdatedText = status?.latestPriceDate
    ? formatDate(status.latestPriceDate)
    : t('common.loading');

  if (!isDataAvailable) {
    return (
      <div className="py-8 space-y-6">
        <PageHeader
          breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.mandi_rates') }]}
          title={t('mandi.title')}
          subtitle="Daily wholesale modal prices synced directly from Agmarknet."
        />
        <div className="bg-white p-12 rounded-3xl shadow-xs border border-neutral-200/90 text-center mt-6">
          <EmptyState
            illustration={NoResults}
            title={t('mandi.fetching_data')}
            message={t('mandi.check_later')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with Segmented View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <PageHeader
          breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.mandi_rates') }]}
          title={t('mandi.title')}
          subtitle={`Source: Agmarknet via data.gov.in. Wholesale mandi rates. • Last updated ${lastUpdatedText}`}
        />

        {/* Big Segmented View Toggle */}
        <div className="flex items-center gap-1.5 p-1.5 bg-neutral-100 rounded-2xl border border-neutral-200/90 self-start md:self-auto shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={() => handleToggleView('simple')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all min-h-[42px] ${
              viewMode === 'simple'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t('mandi.simple_view', 'Simple view')}
          </button>
          <button
            type="button"
            onClick={() => handleToggleView('detailed')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all min-h-[42px] ${
              viewMode === 'detailed'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t('mandi.detailed_view', 'Detailed view')}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SIMPLE VIEW (Phone-First Big Tiles) */}
      {/* ========================================================= */}
      {viewMode === 'simple' ? (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
          {/* (a) Pick your crop: Big Commodity Chips */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-neutral-900">
                  {t('mandi.pick_crop', 'Pick your crop')}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Tap any produce to view today's price and market trends.
                </p>
              </div>

              {/* Location Badge + Change Place Button */}
              <button
                type="button"
                onClick={() => {
                  setTempDistrict(filters.district);
                  setTempMarket(filters.market);
                  setIsLocationSheetOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-900 font-bold text-xs border border-brand-200 transition min-h-[38px]"
              >
                <MapPin size={14} className="text-brand-700" />
                <span>{filters.district || filters.state || 'All Markets'}</span>
                <span className="text-brand-700 underline ml-0.5">Change</span>
              </button>
            </div>

            {/* Horizontal scroll of common crop chips */}
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
              {COMMON_CROPS.map((crop) => {
                const isSelected = filters.commodity?.toLowerCase() === crop.toLowerCase();
                return (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => handleFilterChange({ commodity: crop })}
                    className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 transition-all shrink-0 min-h-[50px] ${
                      isSelected
                        ? 'border-brand-700 bg-brand-50/80 text-brand-950 font-extrabold shadow-2xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800 font-bold'
                    }`}
                  >
                    <CommodityIcon name={crop} size="sm" />
                    <span className="text-sm">{crop}</span>
                  </button>
                );
              })}

              {/* "More crops" search button */}
              <button
                type="button"
                onClick={() => setIsCropSearchOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-brand-600 bg-neutral-50 hover:bg-brand-50 text-neutral-700 font-bold text-xs sm:text-sm shrink-0 min-h-[50px] transition"
              >
                <Search size={16} />
                <span>More crops</span>
              </button>
            </div>
          </div>

          {/* (b) ONE BIG CARD: Today's Price for chosen crop */}
          {summary ? (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-200 shadow-sm relative overflow-hidden space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <CommodityIcon name={currentCommodity} size="lg" />
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                        {currentCommodity}
                      </h2>
                      <p className="text-xs text-neutral-500 font-medium">
                        {filters.district ? `${filters.district}, ${filters.state}` : filters.state || 'All Mandis'}
                      </p>
                    </div>
                  </div>

                  <ListenButton text={speechText} size="md" variant="secondary" />
                </div>

                {/* Big Price Display */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                    Today's Mandi Price
                  </span>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-3xl sm:text-5xl font-black text-brand-900 font-mono tracking-tight">
                      Rs {modalQuintal.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm sm:text-lg font-bold text-neutral-600">
                      per quintal (100 kg)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="text-base sm:text-xl font-extrabold text-neutral-800 font-mono">
                      about Rs {modalKg} per kg
                    </span>

                    {/* Change in words with arrow */}
                    {priceChange && (
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                          priceChange.isHigher
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : priceChange.isLower
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {priceChange.isHigher ? (
                          <TrendingUp size={14} className="stroke-[3]" />
                        ) : priceChange.isLower ? (
                          <TrendingDown size={14} className="stroke-[3]" />
                        ) : (
                          <Minus size={14} />
                        )}
                        <span>{priceChange.text}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* (e) Friendly trend sentence with tiny SVG sparkline */}
                {trendSentence && trendData.length >= 2 && (
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Sparkline
                        data={trendData}
                        color={trendSentence.isDown ? '#e11d48' : '#15803d'}
                      />
                      <div>
                        <p className="text-sm font-extrabold text-neutral-900">
                          {trendSentence.text}
                        </p>
                        <p className="text-xs text-neutral-500">Based on past 7 days wholesale rates</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleView('detailed')}
                      className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>See full details & charts</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* (c) Lowest and highest: Two small cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/90 shadow-xs space-y-1">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                    Lowest Price Today
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono">
                    Rs {Math.round(Number(summary.minPrice || 0)).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs font-medium text-neutral-500">
                    per quintal (~Rs {(Number(summary.minPrice || 0) / 100).toFixed(1)} per kg)
                  </p>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/90 shadow-xs space-y-1">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                    Highest Price Today
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono">
                    Rs {Math.round(Number(summary.maxPrice || 0)).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs font-medium text-neutral-500">
                    per quintal (~Rs {(Number(summary.maxPrice || 0) / 100).toFixed(1)} per kg)
                  </p>
                </div>
              </div>

              {/* (d) Best markets today: Top 3 markets from compareData */}
              {topMarkets.length > 0 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
                  <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-neutral-900">
                        Best Markets Today
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Top paying wholesale markets for {currentCommodity} in this region.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {topMarkets.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-white border border-neutral-200 font-extrabold text-xs text-brand-800 flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-sm sm:text-base text-neutral-900">
                              {m.market || m.marketName || 'Mandi Market'}
                            </h4>
                            <p className="text-xs text-neutral-500 font-medium">
                              {m.district || filters.district || 'District'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base sm:text-lg font-black text-brand-900 font-mono block">
                            Rs {Math.round(Number(m.modalPrice || m.price || 0)).toLocaleString('en-IN')}
                          </span>
                          <span className="text-2xs text-neutral-500 font-semibold block">
                            ~Rs {((Number(m.modalPrice || m.price || 0)) / 100).toFixed(1)} / kg
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-3xl border border-neutral-200/90 text-center space-y-3">
              <p className="text-base font-bold text-neutral-800">
                No rates recorded for {currentCommodity} today in {filters.district || filters.state || 'this area'}.
              </p>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Markets may be closed or haven't reported wholesale prices yet. Try picking Tomato, Potato, or Onion.
              </p>
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange({ commodity: 'Tomato' })}
                >
                  View Tomato Rates
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================= */
        /* DETAILED VIEW (Filters, Charts, Table) */
        /* ========================================================= */
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
          {/* Sticky Filters & Commodity Quick-Picks */}
          <MandiFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            latestDate={status?.latestPriceDate}
          />

          {/* 4 Summary StatCards */}
          <PriceSummaryCards
            summary={summary}
            status={status}
            isLoading={isLoadingSummary}
          />

          {/* 2 Comparison / Trend Charts (Recharts lazy-loaded) */}
          <Suspense
            fallback={
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl h-72 animate-pulse" />
                <div className="bg-white p-6 rounded-3xl h-72 animate-pulse" />
              </div>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <PriceTrendChart
                data={trendData}
                isLoading={isLoadingTrend}
                days={days}
                onDaysChange={handleDaysChange}
                commodity={filters.commodity}
                hasDemoData={hasDemoData}
              />
              <MarketCompareChart
                data={compareData}
                isLoading={isLoadingCompare}
                commodity={filters.commodity}
              />
            </div>
          </Suspense>

          {/* Detailed Prices Table */}
          <PriceTable
            data={pricesData}
            isLoading={isLoadingPrices}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* "Change Place" BottomSheet in Simple View */}
      <BottomSheet
        isOpen={isLocationSheetOpen}
        onClose={() => setIsLocationSheetOpen(false)}
        title="Change Market Place"
      >
        <div className="space-y-5">
          <p className="text-xs text-neutral-600">
            Select your district to see mandi rates and best markets nearest to your farm.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1.5">
                District
              </label>
              <select
                value={tempDistrict}
                onChange={(e) => {
                  setTempDistrict(e.target.value);
                  setTempMarket('');
                }}
                className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-none focus:border-brand-600 transition min-h-[48px]"
              >
                <option value="">All Districts ({filters.state || 'State'})</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {availableMarkets.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-1.5">
                  Specific Market (Optional)
                </label>
                <select
                  value={tempMarket}
                  onChange={(e) => setTempMarket(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-600 transition min-h-[48px]"
                >
                  <option value="">All Markets in District</option>
                  {availableMarkets.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsLocationSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                handleFilterChange({ district: tempDistrict, market: tempMarket });
                setIsLocationSheetOpen(false);
              }}
            >
              Apply Location
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* "More Crops" Search BottomSheet */}
      <BottomSheet
        isOpen={isCropSearchOpen}
        onClose={() => {
          setIsCropSearchOpen(false);
          setCropSearchTerm('');
        }}
        title="Find More Crops"
      >
        <div className="space-y-4">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3.5 text-neutral-400" />
            <input
              type="text"
              value={cropSearchTerm}
              onChange={(e) => setCropSearchTerm(e.target.value)}
              placeholder="Search crop name (e.g. Ginger, Mango, Cotton)..."
              className="w-full pl-10 pr-12 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-600 transition min-h-[46px]"
            />
            <div className="absolute right-2">
              <VoiceSearchButton
                onResult={(val) => setCropSearchTerm(val)}
                size="sm"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 pr-1">
            {filteredCrops.length > 0 ? (
              filteredCrops.map((crop) => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => {
                    handleFilterChange({ commodity: crop });
                    setIsCropSearchOpen(false);
                    setCropSearchTerm('');
                  }}
                  className="w-full text-left p-3 hover:bg-brand-50 rounded-xl transition flex items-center gap-3"
                >
                  <CommodityIcon name={crop} size="sm" />
                  <span className="text-sm font-bold text-neutral-900">{crop}</span>
                </button>
              ))
            ) : (
              <p className="text-xs text-neutral-500 py-4 text-center">
                No matching crops found.
              </p>
            )}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
