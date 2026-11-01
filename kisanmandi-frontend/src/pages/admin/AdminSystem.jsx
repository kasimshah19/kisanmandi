import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { adminService } from '../../services/adminService';
import {
  Clock,
  Shield,
  Database,
  Cpu,
  Activity,
  TrendingUp,
  RefreshCw,
  Server,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSystem() {
  useDocumentTitle('System Status | Admin | KisanMandi');

  const [systemInfo, setSystemInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSystemInfo = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const data = await adminService.getSystemInfo();
      setSystemInfo(data);
    } catch (err) {
      console.error('Failed to load system info:', err);
      setError('Unable to load system telemetry. Please ensure the backend is running and you have admin rights.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const handleManualRefresh = () => {
    fetchSystemInfo(true);
    toast.success('System metrics refreshed');
  };

  const memoryPercent = systemInfo?.jvmMemory?.maxMb
    ? Math.round((systemInfo.jvmMemory.usedMb / systemInfo.jvmMemory.maxMb) * 100)
    : 0;

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <PageHeader
          title="System Telemetry"
          subtitle="Real-time backend health, runtime resources, and operational telemetry"
          breadcrumbs={[
            { label: 'Admin', path: '/admin/dashboard' },
            { label: 'System' }
          ]}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isLoading || isRefreshing}
              leftIcon={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
            >
              Refresh
            </Button>
          }
        />

        {error && (
          <ErrorState
            title="Telemetry Error"
            message={error}
            onRetry={() => fetchSystemInfo(false)}
          />
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : systemInfo ? (
          <div className="space-y-6">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* 1. Uptime */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-neutral-200/80 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-neutral-500 uppercase tracking-wide truncate">
                    Server Uptime
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight font-mono truncate">
                    {systemInfo.uptimeFormatted || '—'}
                  </p>
                  <p className="text-xs text-neutral-400">
                    Process started ~{Math.round(systemInfo.uptimeMs / 1000 / 60)} mins ago
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-emerald-50 text-emerald-700 border-emerald-100">
                  <Clock size={22} />
                </div>
              </div>

              {/* 2. Database Connectivity */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-neutral-200/80 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-neutral-500 uppercase tracking-wide truncate">
                    Database Connectivity
                  </p>
                  <div className="pt-1">
                    {systemInfo.databaseStatus === 'CONNECTED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={16} /> Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle size={16} /> Disconnected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 pt-1">
                    Managed DataSource (HikariPool)
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-blue-50 text-blue-700 border-blue-100">
                  <Database size={22} />
                </div>
              </div>

              {/* 3. JVM Memory */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-neutral-200/80 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-neutral-500 uppercase tracking-wide truncate">
                    JVM Memory Used
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight font-mono truncate">
                    {systemInfo.jvmMemory?.usedMb ?? 0} <span className="text-sm font-normal text-neutral-500">/ {systemInfo.jvmMemory?.maxMb ?? 0} MB</span>
                  </p>
                  <div className="w-full bg-neutral-100 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        memoryPercent > 85 ? 'bg-rose-500' : memoryPercent > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, memoryPercent))}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-400 pt-0.5">{memoryPercent}% Heap utilized</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-purple-50 text-purple-700 border-purple-100">
                  <Cpu size={22} />
                </div>
              </div>

              {/* 4. Active Profile & Version */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-neutral-200/80 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-neutral-500 uppercase tracking-wide truncate">
                    Environment & Version
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight font-mono truncate">
                    v{systemInfo.appVersion || '1.0.0'}
                  </p>
                  <div className="pt-0.5">
                    <Badge variant={systemInfo.activeProfile === 'prod' ? 'danger' : 'success'}>
                      Profile: {systemInfo.activeProfile || 'default'}
                    </Badge>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-indigo-50 text-indigo-700 border-indigo-100">
                  <Shield size={22} />
                </div>
              </div>

              {/* 5. Last Mandi Sync */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-neutral-200/80 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-neutral-500 uppercase tracking-wide truncate">
                    Last Mandi Sync
                  </p>
                  <div className="pt-1">
                    <Badge variant={systemInfo.lastMandiSync?.status === 'SUCCESS' ? 'success' : 'neutral'}>
                      {systemInfo.lastMandiSync?.status || 'IDLE / PENDING'}
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-500 truncate pt-1">
                    {systemInfo.lastMandiSync?.timestamp
                      ? new Date(systemInfo.lastMandiSync.timestamp).toLocaleString()
                      : 'No sync completed yet'}
                  </p>
                  {systemInfo.lastMandiSync?.recordsProcessed != null && (
                    <p className="text-xs text-neutral-400">
                      {systemInfo.lastMandiSync.recordsProcessed} records updated
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-amber-50 text-amber-800 border-amber-100">
                  <Activity size={22} />
                </div>
              </div>

              {/* 6. Recent Requests (if available) */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-neutral-200/80 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-neutral-500 uppercase tracking-wide truncate">
                    Recent Activity
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight font-mono truncate">
                    {systemInfo.requestsLast5Minutes != null ? systemInfo.requestsLast5Minutes : 'Active'}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {systemInfo.requestsLast5Minutes != null
                      ? 'HTTP requests in last 5 min'
                      : 'Live Micrometer metrics active'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-rose-50 text-rose-700 border-rose-100">
                  <TrendingUp size={22} />
                </div>
              </div>
            </div>

            {/* Security & Observability Note Card */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 text-sm text-neutral-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-neutral-900">
                <Server size={18} className="text-brand-600" />
                <span>Observability & Monitoring Info</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                This page reflects live operational telemetry directly from Spring Boot Actuator and the JVM runtime.
                Sensitive credentials, environment dumps, and secret keys are omitted by design.
                Every request carries an <code className="font-mono bg-white px-1 py-0.5 rounded border border-neutral-200">X-Request-Id</code> for end-to-end tracing across structured logs and Sentry error captures.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
