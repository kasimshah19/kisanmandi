import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ImageUpload from './ImageUpload';
import { categoryService } from '../services/categoryService';
import { farmerService } from '../services/farmerService';
import MandiPriceHint from './mandi/MandiPriceHint';
import FormField from './ui/FormField';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { unitLabel, formatINR } from '../utils/format';
import toast from 'react-hot-toast';
import { Sparkles, Save, Eye, Layers, DollarSign, Package } from 'lucide-react';

export default function ProductForm({ initialData, onSubmit, isLoading, submitText }) {
  const { t } = useTranslation();
  const effectiveSubmitText = submitText || t('farmer.save_product_btn');

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    pricePerUnit: '',
    unit: 'KG',
    quantityAvailable: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(initialData?.imageUrl || null);
  const [farmerLocation, setFarmerLocation] = useState({ state: '', district: '', farmName: '' });

  useEffect(() => {
    loadCategories();
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        categoryId: initialData.categoryId || '',
        description: initialData.description || '',
        pricePerUnit: initialData.pricePerUnit || '',
        unit: initialData.unit || 'KG',
        quantityAvailable: initialData.quantityAvailable || '',
      });
      setImagePreviewUrl(initialData.imageUrl || null);
    }
  }, [initialData]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data || []);
    } catch (error) {
      toast.error(t('errors.generic_retry'));
    }
  };

  const loadFarmerProfile = async () => {
    try {
      const res = await farmerService.getProfile();
      if (res.data) {
        setFarmerLocation({
          state: res.data.state || '',
          district: res.data.district || '',
          farmName: res.data.farmName || '',
        });
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadFarmerProfile();
  }, []);

  const handleImageSelect = (file) => {
    setImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    } else {
      setImagePreviewUrl(initialData?.imageUrl || null);
    }
  };

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

  const selectedCategory = categories.find((c) => String(c.id) === String(formData.categoryId));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 2-Column Desktop Layout: Form on Left, Live Customer Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Section: Basic Info */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 shadow-xs space-y-5">
            <h3 className="font-bold text-neutral-900 text-base pb-3 border-b border-neutral-100 flex items-center gap-2">
              <Layers size={18} className="text-brand-700" />
              Produce Information
            </h3>

            <div>
              <FormField
                label={t('farmer.product_name')}
                name="name"
                required
                maxLength="100"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Fresh Organic Tomatoes, Alphanso Mango"
              />
            </div>

            {/* Live Mandi Benchmark Info Card */}
            <MandiPriceHint
              productName={formData.name}
              unit={formData.unit}
              state={farmerLocation.state}
              district={farmerLocation.district}
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                {t('farmer.category_select')} <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              >
                <option value="">-- Choose Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                {t('products.description')}
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                placeholder="Describe freshness, harvesting method, soil quality, or variety..."
              />
            </div>
          </div>

          {/* Section: Price & Inventory */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 shadow-xs space-y-5">
            <h3 className="font-bold text-neutral-900 text-base pb-3 border-b border-neutral-100 flex items-center gap-2">
              <DollarSign size={18} className="text-brand-700" />
              Pricing & Quantity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <FormField
                  label={t('farmer.price_per_unit')}
                  name="pricePerUnit"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  placeholder="₹ 45"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  {t('farmer.unit_label')}
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                >
                  <option value="KG">Kilogram (kg)</option>
                  <option value="QUINTAL">Quintal (100 kg)</option>
                  <option value="DOZEN">Dozen (12 pcs)</option>
                  <option value="PIECE">Piece</option>
                  <option value="LITRE">Litre</option>
                </select>
              </div>

              <div>
                <FormField
                  label={t('farmer.stock_available_label')}
                  name="quantityAvailable"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.quantityAvailable}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                />
              </div>
            </div>
          </div>

          {/* Section: Photo Upload */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 shadow-xs space-y-4">
            <h3 className="font-bold text-neutral-900 text-base pb-3 border-b border-neutral-100 flex items-center gap-2">
              <Sparkles size={18} className="text-brand-700" />
              Harvest Photo
            </h3>
            <ImageUpload
              onFileSelect={handleImageSelect}
              initialPreview={initialData?.imageUrl}
              hint="Real harvest photos receive up to 3x more buyer orders."
            />
          </div>

          {/* Desktop Submit Button */}
          <div className="hidden sm:flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              leftIcon={<Save size={18} />}
            >
              {effectiveSubmitText}
            </Button>
          </div>
        </div>

        {/* Right Column: Live Marketplace Customer Preview Card (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Eye size={14} className="text-brand-700" />
                Customer Marketplace Preview
              </span>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-800">
                Live
              </span>
            </div>

            {/* Preview of ProductCard */}
            <div className="rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs bg-white">
              {/* Image Box 4:3 */}
              <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
                {imagePreviewUrl ? (
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-50">
                    <Package size={32} className="opacity-40 mb-1" />
                    <span className="text-xs font-medium">No photo uploaded</span>
                  </div>
                )}

                <div className="absolute top-2.5 left-2.5">
                  <Badge variant="neutral" size="sm" className="bg-white/95 backdrop-blur-xs">
                    {selectedCategory?.name || 'Category'}
                  </Badge>
                </div>

                {Number(formData.quantityAvailable) <= 5 && Number(formData.quantityAvailable) > 0 && (
                  <div className="absolute bottom-2 left-2 right-2 px-2 py-0.5 rounded-lg bg-amber-500/90 text-neutral-950 text-2xs font-bold text-center">
                    Only {formData.quantityAvailable} {unitLabel(formData.unit, t)} left
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2">
                <h4 className="font-extrabold text-sm text-neutral-900 line-clamp-1">
                  {formData.name || 'Your Produce Name'}
                </h4>
                <p className="text-xs text-neutral-500 line-clamp-2">
                  {formData.description || 'Description will appear here to prospective buyers.'}
                </p>

                <div className="pt-2 border-t border-neutral-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-base font-extrabold text-neutral-900 font-mono">
                      {formData.pricePerUnit ? formatINR(formData.pricePerUnit) : '₹ --'}
                    </span>
                    <span className="text-xs text-neutral-500 ml-1">
                      / {unitLabel(formData.unit, t)}
                    </span>
                  </div>

                  <span className="text-2xs font-semibold text-neutral-500">
                    Stock: {formData.quantityAvailable || 0}
                  </span>
                </div>

                <div className="pt-1 text-2xs text-neutral-400 truncate">
                  Farm: {farmerLocation.farmName || 'Your Farm'} • {farmerLocation.district || 'District'}
                </div>
              </div>
            </div>

            <p className="text-2xs text-neutral-400 text-center">
              This is how your listing appears in customer search results and category grids.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Submit Bar */}
      <div className="sm:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-3 shadow-lg flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={isLoading}
          leftIcon={<Save size={16} />}
        >
          {effectiveSubmitText}
        </Button>
      </div>
    </form>
  );
}
