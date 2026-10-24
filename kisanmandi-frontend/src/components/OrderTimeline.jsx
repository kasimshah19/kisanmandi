import { Check, Circle, X, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HAPPY_PATH, getOrderStatusLabel } from '../utils/orderStatus';
import { formatDateTime } from '../utils/format';

export default function OrderTimeline({ history, currentStatus }) {
  const { t } = useTranslation();

  const historyMap = {};
  (history || []).forEach((h) => {
    historyMap[h.status] = h;
  });

  const isRejected = currentStatus === 'REJECTED';
  const isCancelled = currentStatus === 'CANCELLED';
  const isTerminal = isRejected || isCancelled;

  const steps = [];

  for (let i = 0; i < HAPPY_PATH.length; i++) {
    const status = HAPPY_PATH[i];
    const h = historyMap[status];

    if (isTerminal && !h) continue;

    const isCurrent = status === currentStatus;
    const isCompleted = !!h && !isCurrent;

    steps.push({
      status,
      label: getOrderStatusLabel(status, t),
      time: h?.changedAt,
      note: h?.note,
      completed: !!h,
      current: isCurrent,
    });
  }

  if (isRejected && historyMap.REJECTED) {
    steps.push({
      status: 'REJECTED',
      label: getOrderStatusLabel('REJECTED', t),
      time: historyMap.REJECTED.changedAt,
      note: historyMap.REJECTED.note,
      completed: true,
      current: true,
      isError: true,
    });
  }

  if (isCancelled && historyMap.CANCELLED) {
    steps.push({
      status: 'CANCELLED',
      label: getOrderStatusLabel('CANCELLED', t),
      time: historyMap.CANCELLED.changedAt,
      note: historyMap.CANCELLED.note,
      completed: true,
      current: true,
      isError: true,
    });
  }

  return (
    <div className="relative pl-7 sm:pl-8 space-y-6">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;

        let iconNode = <Circle size={10} className="text-neutral-400" />;
        let dotClass = 'bg-white border-2 border-neutral-300 text-neutral-400';
        let lineClass = 'bg-neutral-200';

        if (step.isError) {
          dotClass = 'bg-red-600 text-white shadow-xs';
          iconNode = <X size={12} strokeWidth={3} />;
          lineClass = 'bg-red-300';
        } else if (step.current) {
          dotClass = 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-xs motion-safe:animate-pulse';
          iconNode = <Clock size={12} strokeWidth={3} />;
          lineClass = 'bg-brand-200';
        } else if (step.completed) {
          dotClass = 'bg-brand-600 text-white shadow-xs';
          iconNode = <Check size={12} strokeWidth={3} />;
          lineClass = 'bg-brand-500';
        }

        return (
          <div key={step.status} className="relative">
            {/* Connecting line */}
            {!isLast && (
              <div
                className={`absolute left-[-22px] sm:left-[-24px] top-6 bottom-[-24px] w-0.5 ${
                  step.completed ? 'bg-brand-600' : 'bg-neutral-200'
                }`}
              />
            )}

            {/* Dot / Icon */}
            <div
              className={`absolute left-[-30px] sm:left-[-32px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition ${dotClass}`}
            >
              {iconNode}
            </div>

            {/* Content */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={`font-bold text-sm ${
                    step.isError
                      ? 'text-red-700'
                      : step.current
                      ? 'text-brand-900'
                      : step.completed
                      ? 'text-neutral-900'
                      : 'text-neutral-400'
                  }`}
                >
                  {step.label}
                </p>
                {step.current && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>

              {step.time && (
                <p className="text-xs text-neutral-500 mt-0.5 font-medium tabular-nums">
                  {formatDateTime(step.time)}
                </p>
              )}

              {step.note && (
                <div
                  className={`text-xs mt-1.5 p-2 rounded-xl leading-relaxed border ${
                    step.isError
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200/80'
                  }`}
                >
                  {step.note}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
