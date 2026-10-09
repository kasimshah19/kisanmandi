import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import ImageUpload from '../../components/ImageUpload';
import { farmerService } from '../../services/farmerService';
import toast from 'react-hot-toast';
import { MapPin } from 'lucide-react';

const FarmerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  
  const [formData, setFormData] = useState({
    farmName: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await farmerService.getProfile();
      setProfile(res.data);
      if (res.data.approvalStatus !== 'NOT_SUBMITTED') {
        setFormData({
          farmName: res.data.farmName || '',
          village: res.data.village || '',
          district: res.data.district || '',
          state: res.data.state || '',
          pincode: res.data.pincode || '',
          latitude: res.data.latitude || '',
          longitude: res.data.longitude || ''
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    toast.loading('Fetching location...', { id: 'loc' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        toast.success('Location fetched', { id: 'loc' });
      },
      () => {
        toast.error('Unable to retrieve your location', { id: 'loc' });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (profile?.approvalStatus === 'APPROVED') {
        if (!window.confirm('Editing your profile will require re-approval. Continue?')) {
          setIsSaving(false);
          return;
        }
      }

      await farmerService.saveProfile(formData);
      if (documentFile) {
        await farmerService.uploadDocument(documentFile);
      }
      toast.success('Profile saved successfully');
      loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <DashboardLayout role="FARMER"><div className="text-center p-8">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

        {/* Status Banner */}
        <div className={`p-4 rounded-xl border ${
          profile?.approvalStatus === 'NOT_SUBMITTED' ? 'bg-gray-50 border-gray-200' :
          profile?.approvalStatus === 'PENDING' ? 'bg-yellow-50 border-yellow-200' :
          profile?.approvalStatus === 'APPROVED' ? 'bg-green-50 border-green-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-3">
            <StatusBadge status={profile?.approvalStatus} />
            <span className="font-medium">
              {profile?.approvalStatus === 'NOT_SUBMITTED' && 'Complete your profile to start selling'}
              {profile?.approvalStatus === 'PENDING' && 'Waiting for admin approval'}
              {profile?.approvalStatus === 'APPROVED' && 'Your profile is approved'}
              {profile?.approvalStatus === 'REJECTED' && 'Your profile was rejected. Please fix issues and resubmit.'}
            </span>
          </div>
          {profile?.approvalStatus === 'REJECTED' && profile?.rejectionReason && (
            <p className="mt-2 text-sm text-red-700 bg-red-100 p-3 rounded-lg">
              <strong>Reason:</strong> {profile.rejectionReason}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name *</label>
              <input type="text" name="farmName" required value={formData.farmName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village *</label>
              <input type="text" name="village" required value={formData.village} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
              <input type="text" name="district" required value={formData.district} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input type="text" name="state" required value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode (6 digits) *</label>
              <input type="text" name="pincode" pattern="[0-9]{6}" required value={formData.pincode} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-blue-800 mb-6 flex items-start gap-3">
              <MapPin size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Enable "Nearby Farmers" discovery</p>
                <p>Customers can easily find your farm if you enter your location accurately.</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Farm Location (Optional)</h3>
              <button type="button" onClick={handleGetLocation} className="flex items-center space-x-2 text-sm text-green-600 hover:text-green-700">
                <MapPin size={16} /> <span>Use my current location</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Farm Document *</h3>
            <ImageUpload 
              onFileSelect={setDocumentFile}
              hint="Upload a photo of your 7/12 utara or any farm proof. Please do not upload Aadhaar."
            />
            {profile?.hasDocument && !documentFile && (
              <p className="text-sm text-green-600 mt-2">✓ You have already uploaded a document.</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default FarmerProfile;
