import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  confirmStyle = 'danger',
  onConfirm,
  onCancel,
  showReasonInput = false,
  reasonLabel,
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setReason('');
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const effectiveConfirmText = confirmText || t('common.confirm');
  const effectiveCancelText = cancelText || t('common.cancel');
  const effectiveReasonLabel = reasonLabel || t('common.reason');

  const handleConfirm = () => {
    if (showReasonInput) {
      onConfirm(reason);
    } else {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-neutral-200/90 animate-in zoom-in-95 duration-150 flex flex-col"
      >
        <div className="p-6 sm:p-7 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                  confirmStyle === 'danger'
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                <AlertTriangle size={22} />
              </div>
              <h3 id="confirm-dialog-title" className="text-lg font-bold text-neutral-900 tracking-tight">
                {title}
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
              aria-label={t('common.close')}
            >
              <X size={18} />
            </button>
          </div>

          <div>
            <p className="text-sm text-neutral-600 leading-relaxed">{message}</p>
          </div>

          {showReasonInput && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                {effectiveReasonLabel} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                rows="3"
                placeholder="Please state the justification..."
                required
              />
            </div>
          )}
        </div>

        <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3 rounded-b-3xl">
          <Button variant="outline" size="md" onClick={onCancel}>
            {effectiveCancelText}
          </Button>
          <Button
            variant={confirmStyle === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={handleConfirm}
            disabled={showReasonInput && !reason.trim()}
          >
            {effectiveConfirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
