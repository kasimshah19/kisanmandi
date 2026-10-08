import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import ProductForm from '../../components/ProductForm';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';

const EditProduct = () => {
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
      const res = await productService.getPublicProduct(id); // assuming farmer can fetch their own product details this way
      setProduct(res.data);
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/farmer/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData, imageFile) => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (imageFile) {
        data.append('image', imageFile);
      }
      
      await productService.updateProduct(id, data);
      toast.success('Product updated successfully!');
      navigate('/farmer/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <DashboardLayout role="FARMER"><div className="p-8">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
        <ProductForm 
          initialData={product}
          onSubmit={handleSubmit} 
          isLoading={isSubmitting} 
          submitText="Update Product" 
        />
      </div>
    </DashboardLayout>
  );
};

export default EditProduct;
