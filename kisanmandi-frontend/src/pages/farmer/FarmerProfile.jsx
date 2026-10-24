import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import ImageUpload from '../../components/ImageUpload';
import ErrorState from '../../components/ErrorState';
import { SkeletonCard } from '../../components/Skeleton';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Badge from '../../components/ui/Badge';
import { farmerService } from '../../services/farmerService';
import toast from 'react-hot-toast';
import {
  MapPin,
  FileText,
  Navigation,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Clock,
  Save,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function FarmerProfile() {
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
    longitude: '',
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
          longitude: res.data.longitude || '',
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
          longitude: position.coords.longitude,
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
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.generic_retry'));
    } finally {
      setIsSaving(false);
    }
  };

  const approvalStatus = profile?.approvalStatus || 'NOT_SUBMITTED';

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.dashboard'), to: '/farmer/dashboard' },
            { label: t('farmer.my_profile') },
          ]}
          title={t('farmer.my_profile')}
          subtitle="Keep your farm details and land verification documents up to date for buyer trust."
        />

        {/* Verification Status Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 border border-brand-100">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Verification Status
                </span>
                <StatusBadge status={approvalStatus} size="sm" />
              </div>
              <p className="text-sm font-semibold text-neutral-800 mt-0.5">
                {approvalStatus === 'APPROVED'
                  ? 'Verified Producer — Your listings appear directly in public marketplace.'
                  : approvalStatus === 'PENDING'
                  ? 'Application Under Review — Documents are being verified by administrators.'
                  : approvalStatus === 'REJECTED'
                  ? 'Action Required — Re-upload valid agricultural identity or land proof.'
                  : 'Profile Incomplete — Fill in farm details and upload document to submit.'}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState title={t('errors.generic_retry')} message={error} onRetry={loadProfile} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Section 1: Farm Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
                <Building2 size={20} className="text-brand-700" />
                <h3 className="font-bold text-neutral-900 text-lg">Farm Identity</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <FormField
                    label={t('auth.farm_name_label')}
                    name="farmName"
                    required
                    value={formData.farmName}
                    onChange={handleChange}
                    placeholder="e.g. Sahyadri Agro Orchards"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Farm Location & GPS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <MapPin size={20} className="text-brand-700" />
                  <h3 className="font-bold text-neutral-900 text-lg">Location Details</h3>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  leftIcon={<Navigation size={14} />}
                >
                  {t('products.use_current_location')}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <FormField
                    label={t('auth.address_label')}
                    name="village"
                    required
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="Village or locality"
                  />
                </div>

                <div>
                  <FormField
                    label={t('auth.district_label')}
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Pune, Nashik"
                  />
                </div>

                <div>
                  <FormField
                    label={t('auth.state_label')}
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Maharashtra"
                  />
                </div>

                <div>
                  <FormField
                    label="PIN Code"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit PIN code"
                  />
                </div>

                <div>
                  <FormField
                    label="Latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="18.5204"
                  />
                </div>

                <div>
                  <FormField
                    label="Longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="73.8567"
                  />
                </div>
              </div>

              <p className="text-2xs sm:text-xs text-neutral-500 flex items-center gap-1.5 pt-1">
                <Navigation size={13} className="text-brand-600 shrink-0" />
                Accurate coordinates help buyers find your farm when filtering produce "Near Me".
              </p>
            </div>

            {/* Section 3: Verification Document Upload */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
                <FileText size={20} className="text-brand-700" />
                <div>
                  <h3 className="font-bold text-neutral-900 text-lg">Verification Proof</h3>
                  <p className="text-xs text-neutral-500">
                    Upload official proof of agricultural activity (7/12 extract, Kisan credit card, or identity document).
                  </p>
                </div>
              </div>

              <ImageUpload
                onFileSelect={setDocumentFile}
                hint="Accepted formats: JPG, PNG, WEBP (Max 5MB). Admin will verify this before granting full selling approval."
              />
            </div>

            {/* Desktop Actions & Mobile Sticky Save Bar */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSaving}
                leftIcon={<Save size={18} />}
                className="w-full sm:w-auto"
              >
                {t('common.save')}
              </Button>
            </div>

            {/* Mobile Fixed Bottom Save Bar */}
            <div className="sm:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-3 shadow-lg flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                loading={isSaving}
                leftIcon={<Save size={16} />}
              >
                {t('common.save')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
