import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ImageUpload from './ImageUpload';
import { categoryService } from '../services/categoryService';
import { farmerService } from '../services/farmerService';
import MandiPriceHint from './mandi/MandiPriceHint';
import { unitLabel } from '../utils/format';
import toast from 'react-hot-toast';

const ProductForm = ({ initialData, onSubmit, isLoading, submitText }) => {
  const { t } = useTranslation();
  const effectiveSubmitText = submitText || t('farmer.save_product_btn');
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    pricePerUnit: '',
    unit: 'KG',
    quantityAvailable: ''
  });
  const [image, setImage] = useState(null);
  const [farmerLocation, setFarmerLocation] = useState({ state: '', district: '' });

  useEffect(() => {
    loadCategories();
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        categoryId: initialData.categoryId || '',
        description: initialData.description || '',
        pricePerUnit: initialData.pricePerUnit || '',
        unit: initialData.unit || 'KG',
        quantityAvailable: initialData.quantityAvailable || ''
      });
    }
  }, [initialData]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data);
    } catch (error) {
      toast.error(t('errors.generic_retry'));
    }
  };

  const loadFarmerProfile = async () => {
    try {
      const res = await farmerService.getProfile();
      if (res.data) {
        setFarmerLocation({ state: res.data.state || '', district: res.data.district || '' });
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadFarmerProfile();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error(t('farmer.category_select'));
      return;
    }
    onSubmit(formData, image);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('farmer.product_name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            maxLength="100"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            placeholder={t('farmer.product_name')}
          />
          <MandiPriceHint 
            productName={formData.name} 
            unit={formData.unit} 
            state={farmerLocation.state} 
            district={farmerLocation.district} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('farmer.category_select')} <span className="text-red-500">*</span>
          </label>
          <select
            name="categoryId"
            required
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          >
            <option value="">{t('farmer.category_select')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('farmer.description_label')}</label>
          <textarea
            name="description"
            rows="3"
            maxLength="1000"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            placeholder={t('farmer.description_label')}
          />
        </div>

        <div>
          <label htmlFor="prod-price" className="block text-sm font-medium text-gray-700 mb-1">
            {t('farmer.price_per_unit_label')} <span className="text-red-500">*</span>
          </label>
          <input
            id="prod-price"
            type="number"
            inputMode="decimal"
            name="pricePerUnit"
            required
            min="0.01"
            max="1000000"
            step="0.01"
            value={formData.pricePerUnit}
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
            }}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600 text-base"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="prod-unit" className="block text-sm font-medium text-gray-700 mb-1">
            {t('farmer.unit_select')} <span className="text-red-500">*</span>
          </label>
          <select
            id="prod-unit"
            name="unit"
            required
            value={formData.unit}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600 text-base"
          >
            <option value="KG">{unitLabel('KG', t)}</option>
            <option value="QUINTAL">{unitLabel('QUINTAL', t)}</option>
            <option value="DOZEN">{unitLabel('DOZEN', t)}</option>
            <option value="PIECE">{unitLabel('PIECE', t)}</option>
            <option value="LITRE">{unitLabel('LITRE', t)}</option>
          </select>
        </div>

        <div>
          <label htmlFor="prod-quantity" className="block text-sm font-medium text-gray-700 mb-1">
            {t('farmer.stock_available_label')} <span className="text-red-500">*</span>
          </label>
          <input
            id="prod-quantity"
            type="number"
            inputMode="decimal"
            name="quantityAvailable"
            required
            min="0"
            max="100000"
            step="0.01"
            value={formData.quantityAvailable}
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
            }}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600 text-base"
            placeholder="0"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('farmer.upload_image')}</label>
          <ImageUpload 
            onFileSelect={setImage} 
            initialPreview={initialData?.imageUrl}
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 disabled:opacity-50 min-h-[44px] transition active:scale-[0.99]"
        >
          {isLoading ? t('farmer.saving_product') : effectiveSubmitText}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
