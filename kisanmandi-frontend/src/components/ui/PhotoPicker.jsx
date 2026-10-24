import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { compressImage } from '../../utils/image';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * PhotoPicker: High-accessibility photo capture & selection component for farmers.
 * Features 2 prominent 56px action buttons, live preview, automatic client-side canvas compression (< 1600px),
 * and plain language validation.
 */
export default function PhotoPicker({
  value = null, // Can be a File, URL string, or null
  onChange,
  label = null,
  hint = null,
  error = null,
  disabled = false,
  className = '',
  labels = {
    takePhoto: 'Take a photo',
    chooseGallery: 'Choose from gallery',
    changePhoto: 'Change photo',
    removePhoto: 'Remove photo',
    invalidType: 'Please pick a JPG, PNG, or WebP photo.',
    fileTooLarge: 'Photo is larger than 5 MB. Please choose a smaller photo.',
    compressing: 'Compressing photo for faster upload...',
  },
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Sync preview when value changes externally
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    if (typeof value === 'string') {
      setPreviewUrl(value);
    } else if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [value]);

  const handleFileSelected = async (e) => {
    setLocalError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // 1. Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError(labels.invalidType);
      e.target.value = '';
      return;
    }

    // 2. Validate file size (max 5 MB)
    if (file.size > MAX_SIZE_BYTES) {
      setLocalError(labels.fileTooLarge);
      e.target.value = '';
      return;
    }

    // 3. Client-side compression
    setIsCompressing(true);
    try {
      const compressed = await compressImage(file, 1600, 0.8);
      onChange?.(compressed);
    } catch {
      onChange?.(file);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setLocalError(null);
    onChange?.(null);
  };

  const activeError = error || localError;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <span className="block text-sm font-semibold text-stone-800 mb-2">
          {label}
        </span>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        disabled={disabled || isCompressing}
        className="hidden"
        aria-hidden="true"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelected}
        disabled={disabled || isCompressing}
        className="hidden"
        aria-hidden="true"
      />

      {/* State A: Preview with Change & Remove */}
      {previewUrl ? (
        <div className="relative rounded-2xl border-2 border-stone-200 overflow-hidden bg-stone-50 p-3">
          <div className="relative aspect-4/3 max-h-64 w-full rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Produce preview"
              className="w-full h-full object-cover"
            />
            {isCompressing && (
              <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white text-sm font-medium px-4 text-center">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                {labels.compressing}
              </div>
            )}
          </div>

          {/* Action buttons below preview */}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={disabled || isCompressing}
              className="flex-1 min-h-[48px] px-3 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-sm text-stone-700 flex items-center justify-center gap-2 active:bg-stone-100 transition-colors focus-visible:ring-2 focus-visible:ring-green-600 outline-none"
            >
              <RefreshCw className="w-4 h-4 text-stone-500" />
              <span>{labels.changePhoto}</span>
            </button>

            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isCompressing}
              className="min-h-[48px] px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 font-semibold text-sm text-red-700 flex items-center justify-center gap-2 active:bg-red-200 transition-colors focus-visible:ring-2 focus-visible:ring-red-600 outline-none"
              aria-label={labels.removePhoto}
            >
              <Trash2 className="w-4 h-4" />
              <span>{labels.removePhoto}</span>
            </button>
          </div>
        </div>
      ) : (
        /* State B: Empty - Two Large 56px Action Buttons */
        <div className="rounded-2xl border-2 border-dashed border-stone-300 p-4 sm:p-6 bg-stone-50 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Take a Photo Button */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={disabled || isCompressing}
              className="min-h-[56px] px-4 py-3 rounded-xl bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-sm transition-colors focus-visible:ring-3 focus-visible:ring-green-600 outline-none disabled:opacity-50"
            >
              <Camera className="w-5 h-5 stroke-[2.5]" />
              <span>{labels.takePhoto}</span>
            </button>

            {/* Choose from Gallery Button */}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={disabled || isCompressing}
              className="min-h-[56px] px-4 py-3 rounded-xl bg-white border-2 border-stone-200 hover:border-green-600 hover:bg-stone-50 text-stone-800 font-bold text-base flex items-center justify-center gap-2.5 transition-colors focus-visible:ring-3 focus-visible:ring-green-600 outline-none disabled:opacity-50"
            >
              <ImageIcon className="w-5 h-5 text-stone-600 stroke-[2.5]" />
              <span>{labels.chooseGallery}</span>
            </button>
          </div>

          {hint && (
            <p className="mt-3 text-xs sm:text-sm text-stone-500 font-medium">
              {hint}
            </p>
          )}
        </div>
      )}

      {/* Validation Error Message */}
      {activeError && (
        <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-red-600" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
}
