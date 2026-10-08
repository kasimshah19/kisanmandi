import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, FileText, Eye } from 'lucide-react';

const FarmerApproval = () => {
  const [farmers, setFarmers] = useState([]);
  const [statusTab, setStatusTab] = useState('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectFarmerId, setRejectFarmerId] = useState(null);

  useEffect(() => {
    loadFarmers();
  }, [statusTab]);

  const loadFarmers = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getFarmers(statusTab);
      setFarmers(res.data);
    } catch (error) {
      toast.error('Failed to load farmers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveFarmer(id);
      toast.success('Farmer approved');
      setIsModalOpen(false);
      loadFarmers();
    } catch (error) {
      toast.error('Failed to approve farmer');
    }
  };

  const handleReject = async (reason) => {
    try {
      await adminService.rejectFarmer(rejectFarmerId, reason);
      toast.success('Farmer rejected');
      setRejectFarmerId(null);
      setIsModalOpen(false);
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
        <h1 className="text-2xl font-bold text-gray-800">Farmer Approvals</h1>

        <div className="flex space-x-1 border-b border-gray-200">
          {['PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                statusTab === tab 
                  ? 'border-green-600 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : farmers.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
            No farmers found with status {statusTab}.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-600">Farm Name</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Farmer</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Location</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Date</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {farmers.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{f.farmName}</td>
                    <td className="px-6 py-4">{f.farmerName}</td>
                    <td className="px-6 py-4">{f.village}, {f.district}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(f.submittedAt || f.reviewedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => { setSelectedFarmer(f); setIsModalOpen(true); }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail Modal */}
        {isModalOpen && selectedFarmer && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold">Farmer Profile Details</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                    X
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div><span className="text-gray-500 block">Name</span>{selectedFarmer.farmerName}</div>
                  <div><span className="text-gray-500 block">Email</span>{selectedFarmer.farmerEmail}</div>
                  <div><span className="text-gray-500 block">Phone</span>{selectedFarmer.farmerPhone}</div>
                  <div><span className="text-gray-500 block">Farm Name</span>{selectedFarmer.farmName}</div>
                  <div className="col-span-2"><span className="text-gray-500 block">Address</span>{selectedFarmer.village}, {selectedFarmer.district}, {selectedFarmer.state} - {selectedFarmer.pincode}</div>
                  
                  {selectedFarmer.hasDocument && (
                    <div className="col-span-2 mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center border">
                      <div className="flex items-center space-x-3">
                        <FileText className="text-blue-500" />
                        <span className="font-medium">Farm Document Uploaded</span>
                      </div>
                      <button 
                        onClick={() => openDocument(selectedFarmer.id)}
                        className="px-4 py-2 bg-white border shadow-sm rounded-lg text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                      >
                        <Eye size={16} /> <span>View Document</span>
                      </button>
                    </div>
                  )}
                </div>

                {statusTab === 'PENDING' && (
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button 
                      onClick={() => { setRejectFarmerId(selectedFarmer.id); }}
                      className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center space-x-2 font-medium"
                    >
                      <XCircle size={18} /> <span>Reject</span>
                    </button>
                    <button 
                      onClick={() => handleApprove(selectedFarmer.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 font-medium"
                    >
                      <CheckCircle size={18} /> <span>Approve</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog 
          isOpen={!!rejectFarmerId}
          title="Reject Farmer"
          message="Please provide a reason for rejecting this profile. The farmer will see this message and can resubmit."
          showReasonInput={true}
          confirmText="Reject Profile"
          onConfirm={handleReject}
          onCancel={() => setRejectFarmerId(null)}
        />
      </div>
    </DashboardLayout>
  );
};

export default FarmerApproval;
