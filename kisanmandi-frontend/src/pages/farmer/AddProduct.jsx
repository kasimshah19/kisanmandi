import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import ProductForm from '../../components/ProductForm';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { farmerService } from '../../services/farmerService';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import { AlertCircle, UserCheck, ArrowRight } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function AddProduct() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('farmer.add_new_product')} | KisanMandi`);

  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await farmerService.getProfile();
      setProfile(res.data);
    } catch (error) {
      toast.error(t('errors.generic_retry'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData, imageFile) => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (imageFile) {
        data.append('image', imageFile);
      }

      await productService.createProduct(data);
      toast.success(t('farmer.publish_success_title', 'Your product is live!'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('errors.generic_retry'));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const isApproved = profile?.approvalStatus === 'APPROVED';

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('farmer.manage_products'), to: '/farmer/products' },
            { label: t('farmer.add_new_product') },
          ]}
          title={t('farmer.add_new_product')}
          subtitle="List your newly harvested crops directly for local buyers with live mandi rate comparisons."
        />

        {isLoading ? (
          <div className="p-12 text-center text-neutral-400 font-medium">Loading form...</div>
        ) : !isApproved ? (
          <div className="bg-white border border-amber-200 rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center max-w-xl mx-auto shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                Producer Approval Required
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {t('farmer.profile_not_submitted_msg')}. Your current account status is{' '}
                <strong className="text-neutral-900">
                  {t(`status.${profile?.approvalStatus || 'NOT_SUBMITTED'}`)}
                </strong>.
              </p>
            </div>
            <Button
              as={Link}
              to="/farmer/profile"
              variant="primary"
              size="md"
              rightIcon={<ArrowRight size={16} />}
            >
              {t('farmer.my_profile')}
            </Button>
          </div>
        ) : (
          <ProductForm
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitText={t('farmer.save_product_btn')}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
