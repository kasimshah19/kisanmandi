import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import ProductForm from '../../components/ProductForm';
import { farmerService } from '../../services/farmerService';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

const AddProduct = () => {
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
      toast.error('Failed to check approval status');
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
      
      await productService.createProduct(data);
      toast.success('Product created successfully!');
      navigate('/farmer/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <DashboardLayout role="FARMER"><div className="p-8">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>

        {profile?.approvalStatus !== 'APPROVED' ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
            <h2 className="text-lg font-bold text-red-800 mb-2">Profile Not Approved</h2>
            <p className="text-red-600 mb-4">
              You can only add products after your profile has been approved by an admin.
              Your current status is: <strong>{profile?.approvalStatus?.replace('_', ' ') || 'NOT SUBMITTED'}</strong>
            </p>
            <Link to="/farmer/profile" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Go to My Profile
            </Link>
          </div>
        ) : (
          <ProductForm 
            onSubmit={handleSubmit} 
            isLoading={isSubmitting} 
            submitText="Create Product" 
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AddProduct;
