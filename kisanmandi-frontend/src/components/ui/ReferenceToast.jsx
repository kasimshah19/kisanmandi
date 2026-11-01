import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { AlertCircle, Copy, Check, X } from 'lucide-react';
import i18n from '../../i18n';

export default function ReferenceToast({ t, requestId, customMessage }) {
  const [copied, setCopied] = useState(false);
  const shortId = requestId ? requestId.substring(0, 8) : '';

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!shortId) return;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shortId);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex flex-col p-4 border border-rose-200 text-stone-800`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-rose-50 text-rose-600 flex-shrink-0 mt-0.5">
          <AlertCircle size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-stone-900 leading-tight">
            {customMessage || i18n.t('common.something_went_wrong', 'Something went wrong')}
          </h4>

          {shortId && (
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              {i18n.t(
                'common.server_error_with_ref',
                'Something went wrong. If it keeps happening, tell us this reference: {{id}}',
                { id: shortId }
              )}
            </p>
          )}

          {shortId && (
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-stone-100 border border-stone-200 px-2 py-0.5 rounded text-stone-800">
                {shortId}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-stone-50 hover:bg-stone-100 border border-stone-300 text-stone-700 transition cursor-pointer"
                title={i18n.t('common.copy_reference', 'Copy reference')}
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-600" />
                    <span className="text-emerald-700">{i18n.t('common.copied', 'Copied!')}</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>{i18n.t('common.copy_reference', 'Copy')}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => toast.dismiss(t.id)}
          className="text-stone-400 hover:text-stone-600 transition p-1 cursor-pointer"
          aria-label={i18n.t('common.close', 'Close')}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

/**
 * Helper to display a 5xx error toast with reference code
 */
export function showReferenceToast(requestId, message) {
  return toast.custom(
    (t) => <ReferenceToast t={t} requestId={requestId} customMessage={message} />,
    { duration: 6000 }
  );
}
