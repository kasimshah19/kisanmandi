import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categoryService } from '../services/categoryService';
import { farmerService } from '../services/farmerService';
import MandiPriceHint from './mandi/MandiPriceHint';
import PhotoPicker from './ui/PhotoPicker';
import PriceInput from './ui/PriceInput';
import NumberStepper from './ui/NumberStepper';
import VoiceSearchButton from './ui/VoiceSearchButton';
import Stepper from './ui/Stepper';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { getCategoryIconData } from '../utils/categoryIcons';
import { unitLabel, formatINR } from '../utils/format';
import { getOptimizedImageUrl } from '../utils/image';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Save,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Package,
  Check,
  Eye,
  Plus,
  RefreshCw
} from 'lucide-react';

const UNIT_OPTIONS = [
  { value: 'KG', label: 'kg (Kilogram)', short: 'kg' },
  { value: 'QUINTAL', label: 'quintal (100 kg)', short: 'quintal' },
  { value: 'DOZEN', label: 'dozen (12 pcs)', short: 'dozen' },
  { value: 'PIECE', label: 'piece (1 item)', short: 'piece' },
  { value: 'LITRE', label: 'litre (Liquid)', short: 'litre' },
];

export default function ProductForm({
  initialData,
  onSubmit,
  isLoading,
  submitText,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isEditMode = Boolean(initialData);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    pricePerUnit: '',
    unit: 'KG',
    quantityAvailable: 10,
  });
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(initialData?.imageUrl || null);
  const [farmerLocation, setFarmerLocation] = useState({ state: '', district: '', farmName: '' });

  // Wizard state: 0 = Photo, 1 = Name & Category, 2 = Price & Quantity, 3 = Check & Publish
  const [currentStep, setCurrentStep] = useState(0);
  const [stepErrors, setStepErrors] = useState({});
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  useEffect(() => {
    loadCategories();
    loadFarmerProfile();
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        categoryId: initialData.categoryId || '',
        description: initialData.description || '',
        pricePerUnit: initialData.pricePerUnit || '',
        unit: initialData.unit || 'KG',
        quantityAvailable: initialData.quantityAvailable ?? 10,
      });
      setImagePreviewUrl(initialData.imageUrl || null);
    }
  }, [initialData]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data || []);
    } catch {
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
    } catch {
      // ignore
    }
  };

  const handleImageSelect = (fileOrUrl) => {
    if (fileOrUrl instanceof File) {
      setImage(fileOrUrl);
      const url = URL.createObjectURL(fileOrUrl);
      setImagePreviewUrl(url);
    } else if (typeof fileOrUrl === 'string') {
      setImage(null);
      setImagePreviewUrl(fileOrUrl);
    } else {
      setImage(null);
      setImagePreviewUrl(null);
    }
  };

  // Step validation
  const validateStep = (stepIndex) => {
    const errs = {};
    if (stepIndex === 0) {
      // Photo is optional
    } else if (stepIndex === 1) {
      if (!formData.name.trim()) {
        errs.name = t('farmer.name_required', 'Please enter what you are selling.');
      }
      if (!formData.categoryId) {
        errs.categoryId = t('farmer.category_select', 'Please choose a category.');
      }
    } else if (stepIndex === 2) {
      const price = parseFloat(formData.pricePerUnit);
      if (isNaN(price) || price <= 0) {
        errs.pricePerUnit = t('farmer.price_positive', 'Please enter a valid price greater than 0.');
      }
      const qty = parseFloat(formData.quantityAvailable);
      if (isNaN(qty) || qty <= 0) {
        errs.quantityAvailable = t('farmer.qty_positive', 'Please enter available stock greater than 0.');
      }
    }
    setStepErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStepErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Full form validation
    const hasCategory = Boolean(formData.categoryId);
    const hasName = Boolean(formData.name.trim());
    const hasPrice = parseFloat(formData.pricePerUnit) > 0;
    const hasQty = parseFloat(formData.quantityAvailable) > 0;

    if (!hasName || !hasCategory || !hasPrice || !hasQty) {
      toast.error(t('farmer.complete_all_fields', 'Please complete all required fields.'));
      return;
    }

    try {
      await onSubmit(formData, image);
      if (!isEditMode) {
        setIsSubmittedSuccess(true);
      }
    } catch {
      // Error handled by parent
    }
  };

  const handleResetWizard = () => {
    setFormData({
      name: '',
      categoryId: '',
      description: '',
      pricePerUnit: '',
      unit: 'KG',
      quantityAvailable: 10,
    });
    setImage(null);
    setImagePreviewUrl(null);
    setCurrentStep(0);
    setIsSubmittedSuccess(false);
  };

  const selectedCategory = categories.find((c) => String(c.id) === String(formData.categoryId));

  // SUCCESS SCREEN (After successful publish in Add mode)
  if (isSubmittedSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-200 shadow-sm text-center max-w-lg mx-auto space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={40} className="stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t('farmer.publish_success_title', 'Your product is live!')}
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {t(
              'farmer.publish_success_desc',
              'Nearby customers can now see your harvest on KisanMandi and order directly.'
            )}
          </p>
        </div>

        {/* Live Mini Preview */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-left flex items-center gap-3">
          {imagePreviewUrl ? (
            <img
              src={imagePreviewUrl}
              alt={formData.name}
              className="w-16 h-16 rounded-xl object-cover border border-neutral-200 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-neutral-200 flex items-center justify-center text-neutral-500 shrink-0">
              <Package size={24} />
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-extrabold text-sm text-neutral-900 truncate">{formData.name}</h4>
            <p className="text-xs text-neutral-500 font-medium">
              {formatINR(formData.pricePerUnit)} / {unitLabel(formData.unit, t)} • {formData.quantityAvailable} {unitLabel(formData.unit, t)} available
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleResetWizard}
            className="flex-1 min-h-[50px] font-bold"
          >
            <Plus size={18} />
            <span>{t('farmer.add_another_product', 'Add another product')}</span>
          </Button>
          <Button
            as={Link}
            to="/farmer/products"
            variant="primary"
            size="lg"
            className="flex-1 min-h-[50px] font-bold"
          >
            {t('farmer.see_my_products', 'See my products')} &rarr;
          </Button>
        </div>
      </div>
    );
  }

  // EDIT MODE: High-touch single-page form with identical big touch inputs
  if (isEditMode) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
          {/* Produce Photo */}
          <div>
            <PhotoPicker
              value={image || imagePreviewUrl}
              onChange={handleImageSelect}
              label={t('farmer.step1_title', 'Produce Photo')}
              hint={t('farmer.photo_optional_hint', 'Optional: Clear photo helps customers buy with confidence')}
            />
          </div>

          {/* Name & Voice Input */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-neutral-900">
              {t('farmer.product_name', 'What are you selling?')} <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                name="name"
                required
                maxLength={100}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Fresh Tomatoes, Alphanso Mango"
                className="w-full pl-4 pr-14 py-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-base font-medium focus:bg-white focus:outline-none focus:border-brand-600 transition"
              />
              <div className="absolute right-2.5">
                <VoiceSearchButton
                  onResult={(transcript) => setFormData((prev) => ({ ...prev, name: transcript }))}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-neutral-900">
              {t('farmer.category_label', 'Category')} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categories.map((cat) => {
                const iconData = getCategoryIconData(cat.name);
                const isSelected = String(cat.id) === String(formData.categoryId);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, categoryId: cat.id })}
                    className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition min-h-[56px] ${
                      isSelected
                        ? 'border-brand-700 bg-brand-50/70 text-brand-950 font-bold shadow-2xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800'
                    }`}
                  >
                    <span className="text-2xl">{iconData.emoji}</span>
                    <span className="text-sm truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unit Chips */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-neutral-900">
              {t('farmer.unit_label', 'Selling Unit')} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {UNIT_OPTIONS.map((opt) => {
                const isSelected = formData.unit === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, unit: opt.value })}
                    className={`py-3 px-4 rounded-2xl border-2 text-center text-sm font-bold transition min-h-[50px] ${
                      isSelected
                        ? 'border-brand-700 bg-brand-50 text-brand-950'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price & Quantity Steppers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <PriceInput
              label={`${t('farmer.price_per_unit', 'Price')} (per ${unitLabel(formData.unit, t)})`}
              value={formData.pricePerUnit}
              onChange={(val) => setFormData({ ...formData, pricePerUnit: val })}
              required
            />

            <NumberStepper
              label={`${t('farmer.stock_available_label', 'Quantity in stock')} (${unitLabel(formData.unit, t)})`}
              value={formData.quantityAvailable}
              onChange={(val) => setFormData({ ...formData, quantityAvailable: val })}
              min={0}
              max={100000}
            />
          </div>

          {/* Live Mandi Benchmark Green Card */}
          <MandiPriceHint
            productName={formData.name}
            unit={formData.unit}
            district={farmerLocation.district}
            state={farmerLocation.state}
          />

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-neutral-900">
              {t('farmer.product_description', 'Produce Notes')} (Optional)
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Freshly harvested, naturally grown, chemical-free..."
              className="w-full p-4 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-sm focus:bg-white focus:outline-none focus:border-brand-600 transition"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full min-h-[54px] text-base font-extrabold shadow-sm"
          >
            <Save size={18} />
            <span>{submitText || t('common.save', 'Save Changes')}</span>
          </Button>
        </div>
      </form>
    );
  }

  // ADD MODE: 4-STEP WIZARD
  const wizardSteps = [
    { label: t('farmer.wizard_photo', 'Photo') },
    { label: t('farmer.wizard_produce', 'Produce') },
    { label: t('farmer.wizard_price', 'Price & Stock') },
    { label: t('farmer.wizard_publish', 'Publish') },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Stepper Indicator */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/90 shadow-xs">
        <Stepper
          steps={wizardSteps}
          currentStep={currentStep}
          stepLabel={t('farmer.step', 'Step')}
          ofLabel={t('farmer.of', 'of')}
        />
      </div>

      {/* Screen Card: One Question Per Screen */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
        {/* STEP 1: Take a photo of your produce */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-1">
              <span className="text-2xs font-bold text-brand-700 uppercase tracking-wider">
                Step 1 of 4
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                {t('farmer.step1_heading', 'Take a photo of your produce')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                {t('farmer.step1_sub', 'Use your phone camera or pick a picture from your gallery. A clear photo helps customers choose quickly.')}
              </p>
            </div>

            <PhotoPicker
              value={image || imagePreviewUrl}
              onChange={handleImageSelect}
              labels={{
                takePhoto: t('farmer.take_photo', 'Take a photo'),
                chooseGallery: t('farmer.choose_gallery', 'Choose from gallery'),
                changePhoto: t('farmer.change_photo', 'Change photo'),
                removePhoto: t('farmer.remove_photo', 'Remove photo'),
              }}
            />

            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-center gap-2">
              <Sparkles size={16} className="text-brand-700 shrink-0" />
              <span>
                {t('farmer.photo_optional_notice', 'Photo is optional. If you do not have one right now, you can continue and add it later.')}
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: What are you selling? */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-1">
              <span className="text-2xs font-bold text-brand-700 uppercase tracking-wider">
                Step 2 of 4
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                {t('farmer.step2_heading', 'What are you selling?')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                {t('farmer.step2_sub', 'Type the name of your harvest or tap the microphone to speak.')}
              </p>
            </div>

            {/* Produce Name Input with VoiceSearchButton */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-neutral-900">
                {t('farmer.product_name', 'Produce Name')} <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (stepErrors.name) setStepErrors({ ...stepErrors, name: null });
                  }}
                  placeholder="e.g. Fresh Red Tomatoes, Alphonso Mango"
                  className={`w-full pl-4 pr-14 py-3.5 bg-neutral-50 border-2 rounded-2xl text-base font-semibold focus:bg-white focus:outline-none transition ${
                    stepErrors.name
                      ? 'border-red-400 focus:border-red-600'
                      : 'border-neutral-200 focus:border-brand-600'
                  }`}
                />
                <div className="absolute right-2.5">
                  <VoiceSearchButton
                    onResult={(transcript) => {
                      setFormData((prev) => ({ ...prev, name: transcript }));
                      if (stepErrors.name) setStepErrors({ ...stepErrors, name: null });
                    }}
                    size="sm"
                  />
                </div>
              </div>
              {stepErrors.name && (
                <p className="text-xs text-red-600 font-bold mt-1">{stepErrors.name}</p>
              )}
            </div>

            {/* Category Choice as Big CategoryIcon Tiles */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-bold text-neutral-900">
                {t('farmer.choose_category', 'Choose Category')} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat) => {
                  const iconData = getCategoryIconData(cat.name);
                  const isSelected = String(cat.id) === String(formData.categoryId);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, categoryId: cat.id });
                        if (stepErrors.categoryId) setStepErrors({ ...stepErrors, categoryId: null });
                      }}
                      className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition min-h-[64px] ${
                        isSelected
                          ? 'border-brand-700 bg-brand-50/80 text-brand-950 font-bold shadow-2xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800'
                      }`}
                    >
                      <span className="text-3xl">{iconData.emoji}</span>
                      <span className="text-sm font-bold truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
              {stepErrors.categoryId && (
                <p className="text-xs text-red-600 font-bold mt-1">{stepErrors.categoryId}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Price and quantity */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-1">
              <span className="text-2xs font-bold text-brand-700 uppercase tracking-wider">
                Step 3 of 4
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                {t('farmer.step3_heading', 'Price and quantity')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                {t('farmer.step3_sub', 'Choose your selling unit and set your price with live mandi rate guidance.')}
              </p>
            </div>

            {/* Selling Unit Big Chips */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-neutral-900">
                {t('farmer.unit_label', 'Selling Unit')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {UNIT_OPTIONS.map((opt) => {
                  const isSelected = formData.unit === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, unit: opt.value })}
                      className={`py-3.5 px-4 rounded-2xl border-2 text-center text-sm font-bold transition min-h-[52px] ${
                        isSelected
                          ? 'border-brand-700 bg-brand-50 text-brand-950 shadow-2xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PriceInput */}
            <div>
              <PriceInput
                label={`Price per ${unitLabel(formData.unit, t)}`}
                value={formData.pricePerUnit}
                onChange={(val) => {
                  setFormData({ ...formData, pricePerUnit: val });
                  if (stepErrors.pricePerUnit) setStepErrors({ ...stepErrors, pricePerUnit: null });
                }}
                error={stepErrors.pricePerUnit}
                required
              />
            </div>

            {/* Live Mandi Benchmark Green Card */}
            <MandiPriceHint
              productName={formData.name}
              unit={formData.unit}
              district={farmerLocation.district}
              state={farmerLocation.state}
            />

            {/* NumberStepper for Quantity Available */}
            <div>
              <NumberStepper
                label={`Quantity available in stock (${unitLabel(formData.unit, t)})`}
                value={formData.quantityAvailable}
                onChange={(val) => {
                  setFormData({ ...formData, quantityAvailable: val });
                  if (stepErrors.quantityAvailable) setStepErrors({ ...stepErrors, quantityAvailable: null });
                }}
                min={1}
                max={100000}
              />
              {stepErrors.quantityAvailable && (
                <p className="text-xs text-red-600 font-bold mt-1">{stepErrors.quantityAvailable}</p>
              )}
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-sm font-bold text-neutral-900">
                {t('farmer.product_description', 'Produce Notes')} (Optional)
              </label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Freshly harvested this morning, juicy, sweet, chemical-free..."
                className="w-full p-4 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-sm focus:bg-white focus:outline-none focus:border-brand-600 transition"
              />
              <p className="text-2xs text-neutral-400">
                Hint: Describe the harvest freshness or variety so customers know why your crop is special.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Check and publish (Customer preview card) */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-1">
              <span className="text-2xs font-bold text-brand-700 uppercase tracking-wider">
                Step 4 of 4
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                {t('farmer.step4_heading', 'Check and publish')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                {t('farmer.step4_sub', 'Here is how customers will see your crop on the marketplace.')}
              </p>
            </div>

            {/* Customer Live Preview Card */}
            <div className="bg-white rounded-3xl border-2 border-brand-200 overflow-hidden shadow-sm max-w-sm mx-auto">
              {/* Photo Box */}
              <div className="aspect-4/3 w-full bg-neutral-100 relative overflow-hidden flex items-center justify-center">
                {imagePreviewUrl ? (
                  <img
                    src={imagePreviewUrl}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 text-neutral-400">
                    <Package size={36} className="mx-auto mb-2 text-neutral-400" />
                    <span className="text-xs font-semibold">No photo uploaded</span>
                  </div>
                )}
                {selectedCategory && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="neutral" size="sm" className="bg-white/95 backdrop-blur-xs font-bold">
                      {selectedCategory.name}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-extrabold text-lg text-neutral-900 truncate">{formData.name}</h3>
                  <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
                    {formData.description || 'Fresh field harvested produce directly from farm.'}
                  </p>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-neutral-100">
                  <div>
                    <span className="text-2xl font-extrabold text-brand-900 font-mono">
                      {formatINR(formData.pricePerUnit)}
                    </span>
                    <span className="text-xs text-neutral-500 ml-1 font-semibold">
                      / {unitLabel(formData.unit, t)}
                    </span>
                  </div>
                  <Badge variant="success" size="sm">
                    {formData.quantityAvailable} {unitLabel(formData.unit, t)} in stock
                  </Badge>
                </div>
              </div>
            </div>

            {/* Giant Publish Button */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full min-h-[56px] text-lg font-extrabold shadow-md bg-brand-700 hover:bg-brand-800"
            >
              <Check size={20} className="stroke-[3]" />
              <span>{t('farmer.publish_produce_btn', 'Publish Produce Now')}</span>
            </Button>
          </div>
        )}

        {/* Wizard Bottom Navigation Buttons */}
        {currentStep < 3 && (
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
            {currentStep > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleBack}
                className="min-h-[50px] px-6 font-bold"
              >
                <ArrowLeft size={18} />
                <span>{t('common.back', 'Back')}</span>
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleNext}
              className="min-h-[50px] px-8 font-bold ml-auto"
            >
              <span>{t('common.next', 'Next')}</span>
              <ArrowRight size={18} />
            </Button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-bold text-neutral-500 hover:text-neutral-900 transition underline underline-offset-4"
            >
              &larr; {t('farmer.change_details', 'Go back and edit details')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
