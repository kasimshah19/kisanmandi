import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { mandiService } from '../../services/mandiService';
import { getCommodityIconData } from '../../utils/commodityIcons';

const COMMODITIES = [
  'Tomato',
  'Onion',
  'Potato',
  'Wheat',
  'Soyabean',
  'Cotton',
  'Rice',
  'Maize',
];

const CACHE_KEY = 'kisanmandi_home_mandi_v1';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * LivePriceTicker: Horizontally scrolling marquee of APMC mandi prices.
 * Pauses on hover/focus, static grid on reduced motion, hidden if < 3 commodities returned.
 */
export default function PriceTicker() {
  const [tickerItems, setTickerItems] = useState([]);

  useEffect(() => {
    let isMounted = true;

    // 1. Check 10-minute sessionStorage cache
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (
          Date.now() - parsed.timestamp < CACHE_TTL_MS &&
          Array.isArray(parsed.data) &&
          parsed.data.length >= 3
        ) {
          setTickerItems(parsed.data.slice(0, 8));
          return;
        }
      }
    } catch {
      // Ignore cache read failures
    }

    // 2. Fetch up to 8 commodities in parallel with Promise.allSettled
    const fetchTickerData = async () => {
      try {
        const promises = COMMODITIES.map((commodity) =>
          mandiService.getSummary({ commodity })
        );
        const settled = await Promise.allSettled(promises);
        if (!isMounted) return;

        const valid = [];
        settled.forEach((res) => {
          if (res.status === 'fulfilled' && res.value?.data?.avgModal) {
            valid.push(res.value.data);
          }
        });

        if (valid.length >= 3) {
          setTickerItems(valid.slice(0, 8));
          try {
            sessionStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ timestamp: Date.now(), data: valid })
            );
          } catch {
            // Ignore cache write failures
          }
        }
      } catch {
        // Silently fail if API is down
      }
    };

    fetchTickerData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Hidden if fewer than 3 commodities returned
  if (tickerItems.length < 3) {
    return null;
  }

  // Duplicate items for continuous seamless loop marquee
  const loopedItems = [...tickerItems, ...tickerItems];

  return (
    <div
      className="w-full bg-emerald-900 text-white overflow-hidden py-2.5 border-y border-emerald-800 shadow-inner select-none"
      role="region"
      aria-label="Live Mandi Price Ticker"
    >
      <div className="page-container flex items-center gap-4">
        {/* Ticker Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-800 text-[11px] font-extrabold uppercase tracking-wider shrink-0 text-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Mandi</span>
        </div>

        {/* Marquee Track */}
        <div className="relative flex-1 overflow-hidden group">
          {/* Mobile static wrap / desktop animated loop */}
          <div className="flex items-center gap-8 w-max motion-safe:animate-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
            {loopedItems.map((item, idx) => {
              const { emoji } = getCommodityIconData(item.commodity);
              const price = Math.round(item.avgModal);
              const change = item.priceChange || 0;
              const isUp = change >= 0;

              return (
                <Link
                  key={`${item.commodity}-${idx}`}
                  to={`/mandi?commodity=${encodeURIComponent(item.commodity)}`}
                  className="inline-flex items-center gap-2 hover:text-amber-300 transition-colors shrink-0 text-xs sm:text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-300 rounded px-1"
                >
                  <span className="text-base" aria-hidden="true">
                    {emoji}
                  </span>
                  <span className="font-bold">{item.commodity}:</span>
                  <span className="tabular-nums font-extrabold text-amber-300">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-emerald-200">/ quintal</span>

                  {change !== 0 && (
                    <span
                      className={`inline-flex items-center text-[10px] font-bold ${
                        isUp ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {isUp ? (
                        <TrendingUp className="w-3 h-3 inline mr-0.5" />
                      ) : (
                        <TrendingDown className="w-3 h-3 inline mr-0.5" />
                      )}
                      {isUp ? '+' : ''}₹{Math.abs(Math.round(change))}
                    </span>
                  )}
                  <span className="text-emerald-700 mx-2" aria-hidden="true">
                    •
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
