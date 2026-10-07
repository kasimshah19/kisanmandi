import { useState, useEffect } from 'react';
import { checkHealth } from '../../services/healthService';

export default function Home() {
  const [health, setHealth] = useState({ status: 'LOADING...', database: 'LOADING...' });

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
