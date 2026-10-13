import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import ImageUpload from '../../components/ImageUpload';
import ErrorState from '../../components/ErrorState';
import { SkeletonCard } from '../../components/Skeleton';
import { farmerService } from '../../services/farmerService';
import toast from 'react-hot-toast';
import { MapPin } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const FarmerProfile = () => {
  const { t } = useTranslation();
  useDocumentTitle(`${t('farmer.my_profile')} | KisanMandi`);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
    setIsLoading(true);
    setError(null);
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
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || t('errors.generic_retry');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('products.location_denied'));
      return;
    }
    toast.loading(t('products.location_detecting'), { id: 'loc' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        toast.success(t('products.location_detected'), { id: 'loc' });
      },
      () => {
        toast.error(t('products.location_denied'), { id: 'loc' });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (profile?.approvalStatus === 'APPROVED') {
        if (!window.confirm(t('common.confirm'))) {
          setIsSaving(false);
          return;
        }
      }

      await farmerService.saveProfile(formData);
      if (documentFile) {
        await farmerService.uploadDocument(documentFile);
      }
      toast.success(t('common.save'));
      loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || t('errors.generic_retry'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="FARMER">
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !profile) {
    return (
      <DashboardLayout role="FARMER">
        <ErrorState
          title={t('errors.generic_retry')}
          message={error}
          onRetry={loadProfile}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('farmer.my_profile')}</h1>

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
              {profile?.approvalStatus === 'NOT_SUBMITTED' && t('farmer.profile_not_submitted_msg')}
              {profile?.approvalStatus === 'PENDING' && t('farmer.profile_pending_msg')}
              {profile?.approvalStatus === 'APPROVED' && t('farmer.profile_approved_msg')}
              {profile?.approvalStatus === 'REJECTED' && t('farmer.profile_rejected_msg')}
            </span>
          </div>
          {profile?.approvalStatus === 'REJECTED' && profile?.rejectionReason && (
            <p className="mt-2 text-sm text-red-700 bg-red-100 p-3 rounded-lg">
              <strong>{t('common.reason')}:</strong> {profile.rejectionReason}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.farm_name_label')} *</label>
              <input type="text" name="farmName" required value={formData.farmName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.address_label')} *</label>
              <input type="text" name="village" required value={formData.village} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.district_label')} *</label>
              <input type="text" name="district" required value={formData.district} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.state_label')} *</label>
              <input type="text" name="state" required value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('addresses.pincode')} *</label>
              <input type="text" name="pincode" pattern="[0-9]{6}" required value={formData.pincode} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-blue-800 mb-6 flex items-start gap-3">
              <MapPin size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{t('farmer.nearby_discovery_title')}</p>
                <p>{t('farmer.nearby_discovery_desc')}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{t('farmer.farm_location')}</h3>
              <button type="button" onClick={handleGetLocation} className="flex items-center space-x-2 text-sm text-green-600 hover:text-green-700">
                <MapPin size={16} /> <span>{t('farmer.use_current_location')}</span>
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
            <h3 className="text-lg font-medium mb-4">{t('farmer.farm_document')}</h3>
            <ImageUpload 
              onFileSelect={setDocumentFile}
              hint={t('farmer.farm_doc_hint')}
            />
            {profile?.hasDocument && !documentFile && (
              <p className="text-sm text-green-600 mt-2">✓ {t('farmer.doc_uploaded_already')}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
              {isSaving ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default FarmerProfile;
