import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import { categoryService } from '../services/categoryService';
import { farmerService } from '../services/farmerService';
import MandiPriceHint from './mandi/MandiPriceHint';
import toast from 'react-hot-toast';

const ProductForm = ({ initialData, onSubmit, isLoading, submitText = 'Save Product' }) => {
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
      toast.error('Failed to load categories');
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
      toast.error('Please select a category');
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input
            type="text"
            name="name"
            required
            maxLength="100"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            placeholder="e.g., Fresh Organic Tomatoes"
          />
          <MandiPriceHint 
            productName={formData.name} 
            unit={formData.unit} 
            state={farmerLocation.state} 
            district={farmerLocation.district} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            name="categoryId"
            required
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            rows="3"
            maxLength="1000"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            placeholder="Describe your product (quality, origin, etc.)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit (₹) *</label>
          <input
            type="number"
            name="pricePerUnit"
            required
            min="1"
            step="0.01"
            value={formData.pricePerUnit}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
          <select
            name="unit"
            required
            value={formData.unit}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          >
            <option value="KG">KG</option>
            <option value="QUINTAL">Quintal</option>
            <option value="DOZEN">Dozen</option>
            <option value="PIECE">Piece</option>
            <option value="LITRE">Litre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Available Quantity *</label>
          <input
            type="number"
            name="quantityAvailable"
            required
            min="0"
            step="0.01"
            value={formData.quantityAvailable}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
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
          className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : submitText}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
