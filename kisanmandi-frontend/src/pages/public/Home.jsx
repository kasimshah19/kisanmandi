import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { checkHealth } from '../../services/healthService';
import { mandiService } from '../../services/mandiService';
import { formatPrice } from '../../utils/format';

export default function Home() {
  const [health, setHealth] = useState({ status: 'LOADING...', database: 'LOADING...' });
  const [rates, setRates] = useState([]);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await checkHealth();
        setHealth({ status: data.status, database: data.database });
      } catch (error) {
        setHealth({ status: 'ERROR', database: 'ERROR' });
      }
    };
    fetchHealth();
    
    const fetchRates = async () => {
      const topCommodities = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Soyabean'];
      const fetchedRates = [];
      for (const commodity of topCommodities) {
        try {
          const res = await mandiService.getSummary({ commodity });
          if (res.status === 200 && res.data) {
            fetchedRates.push(res.data);
          }
        } catch (e) {
          // tolerate failure silently
        }
      }
      setRates(fetchedRates);
    };
    fetchRates();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-primary-50 rounded-2xl p-8 text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary-700">Welcome to KisanMandi</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Connecting farmers directly with customers and providing real-time mandi prices.
        </p>
      </section>

      {/* Today's Mandi Rates Strip */}
      {rates.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Today's Mandi Rates</h2>
            <Link to="/mandi" className="text-green-600 font-medium hover:underline text-sm">
              See all mandi rates &rarr;
            </Link>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 hide-scroll-bar">
            {rates.map(rate => (
              <div key={rate.commodity} className="min-w-[160px] bg-green-50 border border-green-100 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                <span className="font-semibold text-gray-800 mb-1">{rate.commodity}</span>
                <span className="text-green-700 font-bold text-lg">₹{formatPrice(rate.avgModalPrice)}</span>
                <span className="text-xs text-gray-500 mt-1">/ quintal</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Backend Status Card */}
      <section className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">System Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Backend API:</span>
              <span className={`font-medium ${health.status === 'UP' ? 'text-green-600' : 'text-red-600'}`}>
                {health.status === 'UP' ? 'Backend OK' : health.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database:</span>
              <span className={`font-medium ${health.database === 'CONNECTED' ? 'text-green-600' : 'text-red-600'}`}>
                {health.database}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
