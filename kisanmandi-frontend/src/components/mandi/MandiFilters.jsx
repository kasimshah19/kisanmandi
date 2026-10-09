import { useState, useEffect } from 'react';
import { mandiService } from '../../services/mandiService';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MandiFilters({ filters, onFilterChange, latestDate }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Options state
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [commodities, setCommodities] = useState([]);

  // Fetch States on mount
  useEffect(() => {
    mandiService.getStates()
      .then(res => setStates(res.data))
      .catch(() => toast.error('Failed to load states'));
  }, []);

  // Fetch Districts when State changes
  useEffect(() => {
    if (filters.state) {
      mandiService.getDistricts(filters.state)
        .then(res => setDistricts(res.data))
        .catch(() => toast.error('Failed to load districts'));
    } else {
      setDistricts([]);
    }
  }, [filters.state]);

  // Fetch Markets when District changes
  useEffect(() => {
    if (filters.state && filters.district) {
      mandiService.getMarkets(filters.state, filters.district)
        .then(res => setMarkets(res.data))
        .catch(() => toast.error('Failed to load markets'));
    } else {
      setMarkets([]);
    }
  }, [filters.state, filters.district]);

  // Fetch Commodities based on selected scope
  useEffect(() => {
    mandiService.getCommodities(filters.state, filters.district, filters.market)
      .then(res => setCommodities(res.data))
      .catch(() => toast.error('Failed to load commodities'));
  }, [filters.state, filters.district, filters.market]);

  // When State changes, clear district, market.
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
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-center md:hidden mb-2">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Filter className="h-5 w-5 text-green-600" /> Filters
        </h2>
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 bg-gray-100 p-2 rounded-lg">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              name="state"
              value={filters.state || ''}
              onChange={handleStateChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              name="district"
              value={filters.district || ''}
              onChange={handleDistrictChange}
              disabled={!filters.state}
              className="w-full border border-gray-300 rounded-lg p-2 disabled:bg-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Market</label>
            <select
              name="market"
              value={filters.market || ''}
              onChange={handleChange}
              disabled={!filters.district}
              className="w-full border border-gray-300 rounded-lg p-2 disabled:bg-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Markets</option>
              {markets.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
            <input
              list="commodity-options"
              name="commodity"
              placeholder="Search or select..."
              value={filters.commodity || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <datalist id="commodity-options">
              {commodities.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={filters.date || ''}
              max={latestDate || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="w-full md:w-auto">
            <button
              onClick={handleClear}
              className="w-full md:w-auto flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <X size={16} /> Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
