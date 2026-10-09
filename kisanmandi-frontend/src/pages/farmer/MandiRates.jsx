import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import MandiDashboard from '../public/MandiDashboard';
import { farmerService } from '../../services/farmerService';

export default function MandiRates() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // If URL already has filters, don't override
    if (searchParams.get('state') || searchParams.get('commodity')) {
      setIsReady(true);
      return;
    }

    // Otherwise try to load farmer profile to get defaults
    farmerService.getProfile()
      .then(res => {
        const { state, district } = res.data;
        if (state && district) {
          navigate(`${location.pathname}?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`, { replace: true });
        }
      })
      .catch(() => {
        // ignore errors
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  return (
    <DashboardLayout role="FARMER">
      {/* MandiDashboard is layout agnostic, we just embed it */}
      {isReady ? <MandiDashboard /> : <div className="p-8 text-center text-gray-500">Loading your mandi preferences...</div>}
    </DashboardLayout>
  );
}
