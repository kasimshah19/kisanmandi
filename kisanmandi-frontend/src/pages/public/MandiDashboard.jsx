import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { mandiService } from '../../services/mandiService';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

import MandiFilters from '../../components/mandi/MandiFilters';
import PriceSummaryCards from '../../components/mandi/PriceSummaryCards';
import PriceTrendChart from '../../components/mandi/PriceTrendChart';
import MarketCompareChart from '../../components/mandi/MarketCompareChart';
import PriceTable from '../../components/mandi/PriceTable';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/EmptyState';
import NoResults from '../../components/illustrations/NoResults';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { Database, Sparkles } from 'lucide-react';

export default function MandiDashboard() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('mandi.title')} | KisanMandi`);

  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filters from URL
  const initialFilters = {
    state: searchParams.get('state') || '',
    district: searchParams.get('district') || '',
    market: searchParams.get('market') || '',
    commodity: searchParams.get('commodity') || '',
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

  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingTrend, setIsLoadingTrend] = useState(true);
  const [isLoadingCompare, setIsLoadingCompare] = useState(true);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  const [isDataAvailable, setIsDataAvailable] = useState(true);

  // Sync state to URL and trigger fetch
  const handleFilterChange = useCallback(
    (newFilters) => {
      const merged = { ...filters, ...newFilters };
      setFilters(merged);

      // Update URL
      const params = new URLSearchParams();
      Object.keys(merged).forEach((k) => {
        if (merged[k]) params.set(k, merged[k]);
      });
      params.set('days', days);
      setSearchParams(params);

      // Reset page on filter change
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
          // Default to Maharashtra if no state selected and we can fetch states
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
        // Assume unavailable if status fails
        setIsDataAvailable(false);
      });
  }, []);

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

  if (!isDataAvailable) {
    return (
      <div className="py-8">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.mandi_rates') },
          ]}
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

  const lastUpdatedText = status?.latestPriceDate
    ? formatDate(status.latestPriceDate)
    : t('common.loading');

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* PageHeader with last updated and source note */}
      <PageHeader
        breadcrumbs={[
          { label: t('nav.home'), to: '/' },
          { label: t('nav.mandi_rates') },
        ]}
        title={t('mandi.title')}
        subtitle={`Last updated: ${lastUpdatedText} • Source: Agmarknet via data.gov.in (Wholesale modal benchmark rates)`}
      />

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

      {/* 2 Comparison / Trend Charts */}
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

      {/* Detailed Prices Table */}
      <PriceTable
        data={pricesData}
        isLoading={isLoadingPrices}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
