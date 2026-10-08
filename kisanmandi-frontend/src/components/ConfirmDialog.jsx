import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  confirmStyle = "danger",
  onConfirm, 
  onCancel,
  showReasonInput = false,
  reasonLabel = "Reason"
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (showReasonInput) {
      onConfirm(reason);
    } else {
      onConfirm();
    }
  };

  const btnColors = {
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${confirmStyle === 'danger' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">{message}</p>
          </div>

          {showReasonInput && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{reasonLabel} *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Enter a reason..."
                required
              />
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={showReasonInput && !reason.trim()}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${btnColors[confirmStyle]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
