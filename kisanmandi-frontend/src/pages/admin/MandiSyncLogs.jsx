import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminMandiService } from '../../services/adminMandiService';
import { formatDateTime } from '../../utils/format';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { 
  RefreshCw, 
  Play, 
  Clock, 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Layers,
  ArrowDownCircle,
  FileCheck2
} from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export default function MandiSyncLogs() {
  useDocumentTitle('Mandi Sync Logs | KisanMandi');

  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState(null);
  const [page, setPage] = useState(0);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorLogs, setErrorLogs] = useState(null);

  // Poll status when syncing
  useEffect(() => {
    fetchStatus();
    
    let intervalId;
    if (isSyncing) {
      intervalId = setInterval(fetchStatus, 5000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSyncing]);

  // Fetch logs when page changes or status indicates sync completed
  useEffect(() => {
    fetchLogs();
  }, [page, status?.lastSync?.id]);

  const fetchStatus = async () => {
    try {
      const res = await adminMandiService.getStatus();
      setStatus(res.data);
      if (isSyncing && !res.data.running) {
        setIsSyncing(false);
        toast.success("Mandi sync completed successfully");
      }
    } catch {
      // Tolerate background status polling error silently
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    setErrorLogs(null);
    try {
      const res = await adminMandiService.getSyncLogs(page, 20);
      setLogs(res.data);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || 'Failed to load sync logs';
      setErrorLogs(msg);
      toast.error(msg);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setIsSyncing(true);
      await adminMandiService.triggerSync();
      toast.success("Mandi sync routine started");
      fetchStatus();
    } catch (err) {
      setIsSyncing(false);
      if (err.response?.status === 409) {
        toast.error("A sync routine is currently running");
      } else {
        toast.error("Failed to start sync");
      }
    }
  };

  const renderStatusBadge = (syncStatus) => {
    switch (syncStatus) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Success
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Failed
          </span>
        );
      case 'PARTIAL_SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Partial
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" /> Running
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700">
            {syncStatus || 'N/A'}
          </span>
        );
    }
  };

  const msToMins = (ms) => {
    if (!ms) return '0s';
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const isRunning = status?.running || isSyncing;

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <PageHeader 
          title="Mandi Data Sync"
          subtitle="Agmarknet government API ingestion pipeline and synchronization audit log"
          badge={<StatusBadge status="ADMIN" text="Admin Portal" />}
          actions={
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Trigger Sync Now</span>
                </>
              )}
            </button>
          }
        />

        {/* Sync Status Cards */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-neutral-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-medium">Latest Data Date</p>
                <p className="text-base font-bold text-neutral-900 tabular-nums mt-0.5">
                  {status?.latestPriceDate ? status.latestPriceDate : 'Unknown'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-medium">Last Routine Run</p>
                {status?.lastSync ? (
                  <div>
                    <p className="text-sm font-bold text-neutral-900 tabular-nums">
                      {formatDateTime(status.lastSync.startedAt)}
                    </p>
                    <p className="text-[11px] text-neutral-500 tabular-nums">
                      Duration: {msToMins(status.lastSync.durationMs)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-neutral-700">Never executed</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3.5 sm:border-l sm:border-neutral-100 sm:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-medium mb-1">Pipeline Health</p>
                {status?.lastSync ? renderStatusBadge(status.lastSync.status) : <span className="text-neutral-400 text-xs">No status</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Sync History Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-neutral-200 overflow-hidden">
          <div className="p-4 bg-neutral-50/60 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Execution History
            </h2>
            <span className="text-[11px] text-neutral-400">
              Auto-scheduled daily from Agmarknet API via data.gov.in
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3.5">Started At</th>
                  <th className="px-5 py-3.5">Trigger Source</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Fetched</th>
                  <th className="px-5 py-3.5 text-right">Inserted</th>
                  <th className="px-5 py-3.5 text-right">Updated</th>
                  <th className="px-5 py-3.5 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {isLoadingLogs ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-32"></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-20"></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-16"></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-12 ml-auto"></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-12 ml-auto"></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-12 ml-auto"></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-14 ml-auto"></div></td>
                    </tr>
                  ))
                ) : errorLogs ? (
                  <tr>
                    <td colSpan="7" className="p-6">
                      <ErrorState
                        title="Could not load sync logs"
                        message={errorLogs}
                        onRetry={fetchLogs}
                      />
                    </td>
                  </tr>
                ) : !logs || logs.content.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <EmptyState message="No mandi synchronization runs recorded yet." />
                    </td>
                  </tr>
                ) : (
                  logs.content.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="px-5 py-4 text-neutral-900 font-bold whitespace-nowrap">
                        <div className="tabular-nums">{formatDateTime(log.startedAt)}</div>
                        {log.errorMessage && (
                          <p className="text-[11px] text-rose-600 font-normal mt-0.5 max-w-xs truncate" title={log.errorMessage}>
                            {log.errorMessage}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-neutral-600 whitespace-nowrap font-medium">
                        {log.triggerSource}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {renderStatusBadge(log.status)}
                      </td>
                      <td className="px-5 py-4 text-right text-neutral-900 font-semibold tabular-nums">
                        {log.recordsFetched?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="px-5 py-4 text-right text-emerald-700 font-semibold tabular-nums">
                        +{log.recordsInserted?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="px-5 py-4 text-right text-neutral-700 font-semibold tabular-nums">
                        {log.recordsUpdated?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="px-5 py-4 text-right text-neutral-500 tabular-nums">
                        {msToMins(log.durationMs)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {logs && logs.totalPages > 1 && (
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
              <Pagination
                page={logs.page ?? logs.pageable?.pageNumber ?? logs.number ?? 0}
                totalPages={logs.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
