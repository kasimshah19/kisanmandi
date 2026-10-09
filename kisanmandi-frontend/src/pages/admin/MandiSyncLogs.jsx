import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminMandiService } from '../../services/adminMandiService';
import { formatDateTime } from '../../utils/format';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { RefreshCw, Play, Clock, Database, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MandiSyncLogs() {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState(null);
  const [page, setPage] = useState(0);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

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
  }, [page, status?.lastSync?.id]); // Refetch logs if lastSync ID changes

  const fetchStatus = async () => {
    try {
      const res = await adminMandiService.getStatus();
      setStatus(res.data);
      if (isSyncing && !res.data.running) {
        setIsSyncing(false);
        toast.success("Sync completed");
      }
    } catch (err) {
      console.error("Failed to fetch sync status", err);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await adminMandiService.getSyncLogs(page, 20);
      setLogs(res.data);
    } catch (err) {
      toast.error('Failed to load sync logs');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setIsSyncing(true);
      await adminMandiService.triggerSync();
      toast.success("Sync started");
      fetchStatus();
    } catch (err) {
      setIsSyncing(false);
      if (err.response?.status === 409) {
        toast.error("A sync is already running");
      } else {
        toast.error("Failed to start sync");
      }
    }
  };

  const renderStatusBadge = (syncStatus) => {
    switch (syncStatus) {
      case 'SUCCESS':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Success</span>;
      case 'FAILED':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><XCircle size={12}/> Failed</span>;
      case 'PARTIAL_SUCCESS':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><AlertTriangle size={12}/> Partial</span>;
      case 'RUNNING':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><RefreshCw size={12} className="animate-spin"/> Running</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">{syncStatus}</span>;
    }
  };

  const msToMins = (ms) => {
    if (!ms) return '0s';
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Mandi Sync Logs</h1>
          <button
            onClick={handleSyncNow}
            disabled={status?.running || isSyncing}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {(status?.running || isSyncing) ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
            {(status?.running || isSyncing) ? 'Sync Running...' : 'Sync Now'}
          </button>
        </div>

        {/* Status Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Database size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Latest Data Date</p>
                <p className="text-xl font-bold text-gray-900">
                  {status?.latestPriceDate ? status.latestPriceDate : 'Unknown'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Last Sync Run</p>
                {status?.lastSync ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{formatDateTime(status.lastSync.startedAt)}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Duration: {msToMins(status.lastSync.durationMs)}</p>
                  </div>
                ) : (
                  <p className="text-gray-900">Never</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
               <p className="text-sm text-gray-500 font-medium mb-1">Status</p>
               {status?.lastSync ? renderStatusBadge(status.lastSync.status) : <span className="text-gray-400">N/A</span>}
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-800">Sync History</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm font-medium border-b border-gray-200">
                  <th className="p-4">Started At</th>
                  <th className="p-4">Trigger</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Fetched</th>
                  <th className="p-4 text-right">Inserted</th>
                  <th className="p-4 text-right">Updated</th>
                  <th className="p-4 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {isLoadingLogs ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading logs...</td></tr>
                ) : !logs || logs.content.length === 0 ? (
                  <tr><td colSpan="7"><div className="p-8"><EmptyState message="No sync logs found." /></div></td></tr>
                ) : (
                  logs.content.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-800 font-medium whitespace-nowrap">
                        {formatDateTime(log.startedAt)}
                        {log.errorMessage && (
                           <p className="text-xs text-red-500 mt-1 truncate max-w-xs" title={log.errorMessage}>
                             {log.errorMessage}
                           </p>
                        )}
                      </td>
                      <td className="p-4 text-gray-600 whitespace-nowrap">{log.triggerSource}</td>
                      <td className="p-4 whitespace-nowrap">{renderStatusBadge(log.status)}</td>
                      <td className="p-4 text-right text-gray-600">{log.recordsFetched}</td>
                      <td className="p-4 text-right text-gray-600">{log.recordsInserted}</td>
                      <td className="p-4 text-right text-gray-600">{log.recordsUpdated}</td>
                      <td className="p-4 text-right text-gray-600 whitespace-nowrap">{msToMins(log.durationMs)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {logs && logs.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100">
              <Pagination
                currentPage={logs.pageable.pageNumber}
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
