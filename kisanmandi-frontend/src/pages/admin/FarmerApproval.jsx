import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminService } from '../../services/adminService';
import ErrorState from '../../components/ErrorState';
import { SkeletonRow } from '../../components/Skeleton';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import toast from 'react-hot-toast';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Eye, 
  Search, 
  UserCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  X,
  ExternalLink
} from 'lucide-react';

const FarmerApproval = () => {
  useDocumentTitle('Farmer Verification | KisanMandi');

  const [farmers, setFarmers] = useState([]);
  const [statusTab, setStatusTab] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectFarmerId, setRejectFarmerId] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    loadFarmers();
  }, [statusTab]);

  const loadFarmers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.getFarmers(statusTab);
      setFarmers(res.data || []);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || 'Failed to load farmers';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFarmers = useMemo(() => {
    if (!searchQuery.trim()) return farmers;
    const q = searchQuery.toLowerCase();
    return farmers.filter((f) => 
      (f.farmName && f.farmName.toLowerCase().includes(q)) ||
      (f.farmerName && f.farmerName.toLowerCase().includes(q)) ||
      (f.district && f.district.toLowerCase().includes(q)) ||
      (f.village && f.village.toLowerCase().includes(q))
    );
  }, [farmers, searchQuery]);

  const handleApprove = async (id) => {
    setIsApproving(true);
    try {
      await adminService.approveFarmer(id);
      toast.success('Farmer approved successfully');
      setIsModalOpen(false);
      setSelectedFarmer(null);
      loadFarmers();
    } catch (error) {
      toast.error('Failed to approve farmer');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (reason) => {
    try {
      await adminService.rejectFarmer(rejectFarmerId, reason);
      toast.success('Farmer application rejected');
      setRejectFarmerId(null);
      setIsModalOpen(false);
      setSelectedFarmer(null);
      loadFarmers();
    } catch (error) {
      toast.error('Failed to reject farmer');
    }
  };

  const openDocument = async (id) => {
    try {
      const res = await adminService.getFarmerDocumentUrl(id);
      window.open(res.data.url, '_blank');
    } catch (error) {
      toast.error('Failed to fetch document URL');
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <PageHeader 
          title="Farmer Verification"
          subtitle="Review agricultural identity and farm credentials before granting selling access"
          badge={<StatusBadge status="ADMIN" text="Admin Portal" />}
        />

        {/* Toolbar Card */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          {/* Tabs */}
          <div className="flex bg-neutral-100 p-1 rounded-xl">
            {['PENDING', 'APPROVED', 'REJECTED'].map((tab) => {
              const active = statusTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setStatusTab(tab);
                    setSearchQuery('');
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all capitalize ${
                    active
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {tab.toLowerCase()}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search farm, name, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : error ? (
          <ErrorState
            title="Could not load farmers"
            message={error}
            onRetry={loadFarmers}
          />
        ) : filteredFarmers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">
              No {statusTab.toLowerCase()} farmers
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery ? 'No applicants match your search query.' : `There are currently no farmer applications under "${statusTab.toLowerCase()}".`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xs border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3.5">Farm & Applicant</th>
                    <th className="px-5 py-3.5">Location</th>
                    <th className="px-5 py-3.5">Document</th>
                    <th className="px-5 py-3.5">Submission Date</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {filteredFarmers.map((f) => (
                    <tr key={f.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-neutral-900 text-sm">{f.farmName}</div>
                        <div className="text-neutral-500 mt-0.5">{f.farmerName}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-neutral-800">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{f.village ? `${f.village}, ` : ''}{f.district}</span>
                        </div>
                        {f.state && <div className="text-neutral-400 text-[11px] ml-5">{f.state} {f.pincode ? `(${f.pincode})` : ''}</div>}
                      </td>
                      <td className="px-5 py-4">
                        {f.hasDocument ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <FileText className="w-3 h-3" /> Attached
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-500">
                            Missing
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-neutral-500 tabular-nums">
                        {new Date(f.submittedAt || f.reviewedAt || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button 
                          onClick={() => { setSelectedFarmer(f); setIsModalOpen(true); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Inspection Modal */}
        {isModalOpen && selectedFarmer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">Farmer Verification Details</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Application ID #{selectedFarmer.id}</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-neutral-700">
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
                  <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">Farm & Personal Information</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-neutral-400 block text-[11px] mb-0.5">Farmer Name</span>
                      <span className="font-semibold text-neutral-900 text-sm">{selectedFarmer.farmerName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px] mb-0.5">Farm Enterprise</span>
                      <span className="font-semibold text-neutral-900 text-sm">{selectedFarmer.farmName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px] mb-0.5">Email</span>
                      <div className="flex items-center gap-1.5 text-neutral-800">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{selectedFarmer.farmerEmail || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px] mb-0.5">Phone Contact</span>
                      <div className="flex items-center gap-1.5 text-neutral-800 font-medium">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{selectedFarmer.farmerPhone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-2">
                  <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-1">Geographical Location</div>
                  <div className="flex items-start gap-2 text-neutral-800 font-medium">
                    <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>
                      {selectedFarmer.village ? `${selectedFarmer.village}, ` : ''}
                      {selectedFarmer.district}, {selectedFarmer.state}
                      {selectedFarmer.pincode ? ` - ${selectedFarmer.pincode}` : ''}
                    </span>
                  </div>
                </div>

                {/* Document Card */}
                {selectedFarmer.hasDocument ? (
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900 text-xs">Official Land / ID Proof</div>
                        <div className="text-emerald-700 text-[11px]">Submitted for marketplace verification</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => openDocument(selectedFarmer.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-emerald-300 shadow-xs rounded-xl text-emerald-800 hover:bg-emerald-50 text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View File</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs">
                    No verification document attached. Resubmission or rejection advised if verification document is mandatory.
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 text-xs font-semibold transition-colors"
                >
                  Close
                </button>

                {statusTab === 'PENDING' && (
                  <>
                    <button 
                      type="button"
                      onClick={() => setRejectFarmerId(selectedFarmer.id)}
                      className="px-4 py-2.5 text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> <span>Reject Application</span>
                    </button>
                    <button 
                      type="button"
                      disabled={isApproving}
                      onClick={() => handleApprove(selectedFarmer.id)}
                      className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> <span>Approve Farmer</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog 
          isOpen={!!rejectFarmerId}
          title="Reject Farmer Application"
          message="Please state a clear reason for rejecting this profile. The farmer will be notified and guided on how to resubmit."
          showReasonInput={true}
          confirmText="Confirm Rejection"
          onConfirm={handleReject}
          onCancel={() => setRejectFarmerId(null)}
        />
      </div>
    </DashboardLayout>
  );
};

export default FarmerApproval;
