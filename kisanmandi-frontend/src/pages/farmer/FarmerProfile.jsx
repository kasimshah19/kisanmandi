import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import PhotoPicker from '../../components/ui/PhotoPicker';
import ErrorState from '../../components/ErrorState';
import { SkeletonCard } from '../../components/Skeleton';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
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
  ExternalLink,
  Sparkles
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
      toast.error(t('products.location_denied', 'Location is not supported on this device.'));
      return;
    }
    toast.loading(t('products.location_detecting', 'Detecting your farm coordinates...'), { id: 'loc' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        toast.success(t('products.location_detected', 'Farm location detected!'), { id: 'loc' });
      },
      () => {
        toast.error(t('products.location_denied', 'Permission to access location was denied.'), { id: 'loc' });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (profile?.approvalStatus === 'APPROVED') {
        if (!window.confirm(t('farmer.confirm_profile_edit', 'Updating your farm details will be saved immediately. Do you want to continue?'))) {
          setIsSaving(false);
          return;
        }
      }

      await farmerService.saveProfile(formData);
      if (documentFile instanceof File) {
        await farmerService.uploadDocument(documentFile);
      }
      toast.success(t('common.save', 'Profile saved successfully!'));
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
      <div className="space-y-6 sm:space-y-8 pb-16 sm:pb-0">
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
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 border border-brand-100">
              <ShieldCheck size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-bold text-neutral-400 uppercase tracking-wider">
                  Verification Status
                </span>
                <StatusBadge status={approvalStatus} size="sm" />
              </div>
              <p className="text-sm sm:text-base font-extrabold text-neutral-900 mt-0.5">
                {approvalStatus === 'APPROVED'
                  ? 'Verified Producer — Your produce listings appear directly to customers.'
                  : approvalStatus === 'PENDING'
                  ? 'Application Under Review — Documents are being verified by administrators.'
                  : approvalStatus === 'REJECTED'
                  ? 'Action Needed — Please re-upload a clear photo of your 7/12 extract or ID.'
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
                <Building2 size={22} className="text-brand-700" />
                <h3 className="font-extrabold text-neutral-900 text-lg">Farm Identity</h3>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-1.5">
                  {t('auth.farm_name_label', 'Farm Name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="farmName"
                  required
                  value={formData.farmName}
                  onChange={handleChange}
                  placeholder="e.g. Sahyadri Organic Orchards"
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-base font-semibold focus:bg-white focus:outline-none focus:border-brand-600 transition min-h-[48px]"
                />
              </div>
            </div>

            {/* Section 2: Farm Location & GPS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <MapPin size={22} className="text-brand-700" />
                  <h3 className="font-extrabold text-neutral-900 text-lg">Location Details</h3>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  leftIcon={<Navigation size={16} />}
                  className="font-bold border-brand-300 text-brand-900 hover:bg-brand-50 min-h-[42px]"
                >
                  {t('products.use_current_location', 'Use my current location')}
                </Button>
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-50/60 border border-brand-200 text-xs sm:text-sm text-brand-950 flex items-start gap-2.5">
                <Sparkles size={18} className="text-brand-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Why we use location:</strong> We use your phone's GPS so customers living near your village can find your fresh harvest first. Your exact home is never shown publicly, only approximate distance in kilometers.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-1.5">
                    {t('auth.address_label', 'Village or locality')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="village"
                    required
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="Village / Area name"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-base font-medium focus:bg-white focus:outline-none focus:border-brand-600 transition min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-1.5">
                    {t('auth.district_label', 'District')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Pune, Nashik"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-base font-medium focus:bg-white focus:outline-none focus:border-brand-600 transition min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-1.5">
                    {t('auth.state_label', 'State')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-base font-medium focus:bg-white focus:outline-none focus:border-brand-600 transition min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-1.5">
                    Postal PIN code (6 digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 422003"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-base font-medium focus:bg-white focus:outline-none focus:border-brand-600 transition min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 19.9975"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-base font-mono focus:bg-white focus:outline-none focus:border-brand-600 transition min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="e.g. 73.7898"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-base font-mono focus:bg-white focus:outline-none focus:border-brand-600 transition min-h-[48px]"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Verification Document Upload with PhotoPicker */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
                <FileText size={22} className="text-brand-700" />
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-lg">Verification Paper</h3>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                    Upload official proof of agricultural land (7/12 extract, Kisan credit card, or identity proof).
                  </p>
                </div>
              </div>

              {profile?.documentUrl && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold">
                    <CheckCircle2 size={18} className="text-emerald-700" />
                    <span>Current verification paper is on file.</span>
                  </div>
                  <a
                    href={profile.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-800 underline font-bold"
                  >
                    View Document &rarr;
                  </a>
                </div>
              )}

              <PhotoPicker
                value={documentFile}
                onChange={setDocumentFile}
                label="Take a photo of your paper (Camera or Gallery)"
                hint="Make sure the text is clear and readable so admin can approve quickly."
              />
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSaving}
                leftIcon={<Save size={18} />}
                className="min-h-[50px] px-8 font-extrabold shadow-sm"
              >
                {t('common.save', 'Save Profile')}
              </Button>
            </div>

            {/* Mobile Fixed Bottom Sticky Save Bar */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-xl">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSaving}
                leftIcon={<Save size={18} />}
                className="font-extrabold min-h-[50px]"
              >
                {t('common.save', 'Save Profile')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
