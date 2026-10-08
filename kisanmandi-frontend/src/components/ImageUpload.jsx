import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ImageUpload = ({ onFileSelect, initialPreview = null, hint, accept = "image/jpeg,image/png,image/webp" }) => {
  const [preview, setPreview] = useState(initialPreview);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    onFileSelect(file);
  };

  const clearImage = (e) => {
    e.stopPropagation(); // prevent opening file dialog
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center
          cursor-pointer transition-colors overflow-hidden
          ${preview ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-green-500 bg-gray-50'}
        `}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="h-48 object-contain" />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-500 hover:text-red-500 shadow-sm"
              type="button"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 font-medium">Click to upload image</p>
            <p className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP (Max 5MB)</p>
          </div>
        )}
      </div>
      {hint && <p className="text-sm text-gray-500">{hint}</p>}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUpload;
