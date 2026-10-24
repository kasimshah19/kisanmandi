import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import ProductForm from '../../components/ProductForm';
import PageHeader from '../../components/ui/PageHeader';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function EditProduct() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('farmer.edit_product_title')} | KisanMandi`);

  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await productService.getMyProduct(id);
      setProduct(res.data);
    } catch (error) {
      toast.error(t('errors.generic_retry'));
      navigate('/farmer/products');
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

      await productService.updateProduct(id, data);
      toast.success(t('common.save'));
      navigate('/farmer/products');
    } catch (error) {
      toast.error(error.response?.data?.message || t('errors.generic_retry'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="FARMER">
        <div className="p-12 text-center text-neutral-400 font-medium">Loading produce details...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('farmer.manage_products'), to: '/farmer/products' },
            { label: t('farmer.edit_product_title') },
          ]}
          title={t('farmer.edit_product_title')}
          subtitle={`Updating details for "${product?.name || 'Produce'}"`}
        />

        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitText={t('common.save')}
        />
      </div>
    </DashboardLayout>
  );
}
