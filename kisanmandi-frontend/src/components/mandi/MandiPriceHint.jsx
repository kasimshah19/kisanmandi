import { useState, useEffect } from 'react';
import { mandiService } from '../../services/mandiService';
import { formatPrice, perKg, formatDate } from '../../utils/format';
import { Info } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';

export default function MandiPriceHint({ productName, unit, district, state }) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedName = useDebounce(productName, 500);

  useEffect(() => {
    const fetchHint = async () => {
      if (!debouncedName || debouncedName.length < 3) {
        setSummary(null);
        return;
      }
      
      setIsLoading(true);
      try {
        // Find best match summary using just the name as commodity
        const res = await mandiService.getSummary({ 
          commodity: debouncedName, 
          state: state, 
          district: district 
        });
        
        // Backend returns 204 No Content if no match
        if (res.status === 204 || !res.data) {
          setSummary(null);
        } else {
          setSummary(res.data);
        }
      } catch (err) {
        // Silently fail, hint is non-blocking
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHint();
  }, [debouncedName, state, district]);

  if (!debouncedName || debouncedName.length < 3) return null;
  if (isLoading) return <div className="text-xs text-gray-500 mt-1 animate-pulse">Checking mandi rates...</div>;
  if (!summary) return null; // No error shown if not found

  const isKgUnit = unit === 'KG';
  const notQuintalSuitable = unit === 'DOZEN' || unit === 'PIECE' || unit === 'LITRE';

  return (
    <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2 text-sm text-green-800">
      <Info className="h-5 w-5 text-green-600 flex-shrink-0" />
      <div>
        <p>
          <strong>Today's mandi rate for {summary.commodity}:</strong> ₹{formatPrice(summary.avgMinPrice)} - ₹{formatPrice(summary.avgMaxPrice)} per quintal 
          (average ₹{formatPrice(summary.avgModalPrice)}, about ₹{perKg(summary.avgModalPrice)} per kg) 
          in {district || state || 'All Markets'}, data of {formatDate(summary.latestPriceDate)}.
        </p>
        
        {isKgUnit && (
          <p className="mt-1 font-medium text-green-900">
            Suggested range per kg: ₹{perKg(summary.avgMinPrice)} - ₹{perKg(summary.avgMaxPrice)}
          </p>
        )}
        
        {notQuintalSuitable && (
          <p className="mt-1 text-xs text-green-700">Note: Mandi rates are per quintal.</p>
        )}
        
        <p className="mt-1 text-xs text-green-600/80 italic">Wholesale mandi rate. Retail prices are usually higher.</p>
      </div>
    </div>
  );
}
