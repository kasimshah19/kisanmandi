import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImageUpload({
  onFileSelect,
  initialPreview = null,
  hint,
  accept = 'image/jpeg,image/png,image/webp',
}) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState(initialPreview);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      const err = 'File size must be less than 5MB';
      setFileError(err);
      toast.error(err);
      return;
    }

    setFileError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    onFileSelect(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    processFile(file);
  };

  const clearImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileError('');
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`
          relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center
          cursor-pointer transition-all overflow-hidden min-h-[170px] outline-none focus-visible:ring-2 focus-visible:ring-brand-500
          ${
            preview
              ? 'border-brand-300 bg-brand-50/40'
              : isDragging
              ? 'border-brand-500 bg-brand-50 scale-[1.01]'
              : 'border-neutral-300 hover:border-brand-500 bg-neutral-50/60 hover:bg-neutral-50'
          }
        `}
      >
        {preview ? (
          <div className="relative w-full flex flex-col items-center">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 w-auto object-contain rounded-xl shadow-xs"
            />
            <button
              onClick={clearImage}
              className="absolute top-0 right-0 p-1.5 bg-white/95 rounded-full text-neutral-500 hover:text-red-600 hover:bg-red-50 shadow-sm border border-neutral-200 transition"
              type="button"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
            <p className="mt-2 text-xs font-semibold text-brand-800">
              Click or drop to replace image
            </p>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 shadow-2xs flex items-center justify-center mx-auto text-neutral-400 group-hover:text-brand-600">
              <Upload size={22} className="text-brand-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-800">
                {t('farmer.upload_image')}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Drag and drop, or <span className="text-brand-700 font-semibold underline underline-offset-2">browse files</span>
              </p>
            </div>
            <p className="text-2xs text-neutral-400 font-medium">
              JPG, PNG, WEBP (Max 5MB)
            </p>
          </div>
        )}
      </div>

      {fileError && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
          <AlertCircle size={13} /> {fileError}
        </p>
      )}

      {hint && !fileError && <p className="text-xs text-neutral-500">{hint}</p>}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
    </div>
  );
}
