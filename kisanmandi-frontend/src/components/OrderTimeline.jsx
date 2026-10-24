import React from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HAPPY_PATH, getOrderStatusLabel } from '../utils/orderStatus';
import { formatDateTime } from '../utils/format';

const STEP_ICONS = {
  PLACED: Clock,
  ACCEPTED: UserCheck,
  PACKED: Package,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: CheckCircle2,
  REJECTED: AlertTriangle,
  CANCELLED: XCircle
};

export default function OrderTimeline({ history, currentStatus }) {
  const { t } = useTranslation();

  const historyMap = {};
  (history || []).forEach((h) => {
    historyMap[h.status] = h;
  });

  const isRejected = currentStatus === 'REJECTED';
  const isCancelled = currentStatus === 'CANCELLED';
  const isTerminal = isRejected || isCancelled;

  // Find index of current status in HAPPY_PATH
  const currentPathIndex = HAPPY_PATH.indexOf(currentStatus);

  const steps = [];

  for (let i = 0; i < HAPPY_PATH.length; i++) {
    const status = HAPPY_PATH[i];
    const h = historyMap[status];

    // If terminal and step wasn't reached, omit or skip
    if (isTerminal && !h && (currentPathIndex === -1 || i > currentPathIndex)) {
      continue;
    }

    const isCurrent = status === currentStatus;
    const isCompleted = !isTerminal
      ? i < currentPathIndex || (!!h && !isCurrent)
      : !!h && !isCurrent;

    const nextSentence =
      t(`status.${status.toLowerCase()}.next`, '') ||
      t(`status.${status}_next`, '');

    steps.push({
      status,
      label: getOrderStatusLabel(status, t),
      time: h?.changedAt,
      note: h?.note,
      completed: isCompleted,
      current: isCurrent,
      nextSentence: isCurrent ? nextSentence : null,
      icon: STEP_ICONS[status] || Clock
    });
  }

  // If rejected, add terminal step
  if (isRejected) {
    const h = historyMap.REJECTED;
    steps.push({
      status: 'REJECTED',
      label: getOrderStatusLabel('REJECTED', t),
      time: h?.changedAt,
      note: h?.note,
      completed: false,
      current: true,
      isError: true,
      icon: AlertTriangle,
      nextSentence: t('status.rejected.next', 'Farmer could not take this order')
    });
  }

  // If cancelled, add terminal step
  if (isCancelled) {
    const h = historyMap.CANCELLED;
    steps.push({
      status: 'CANCELLED',
      label: getOrderStatusLabel('CANCELLED', t),
      time: h?.changedAt,
      note: h?.note,
      completed: false,
      current: true,
      isError: true,
      icon: XCircle,
      nextSentence: t('status.cancelled.next', 'Order cancelled')
    });
  }

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const Icon = step.icon;

        let circleStyle = 'bg-neutral-100 text-neutral-400 border-2 border-neutral-300';
        let lineStyle = 'bg-neutral-200';

        if (step.isError) {
          circleStyle = 'bg-red-600 text-white border-2 border-red-700 shadow-md';
          lineStyle = 'bg-red-300';
        } else if (step.current) {
          circleStyle = 'bg-green-700 text-white border-4 border-green-100 shadow-md ring-4 ring-green-600/20';
          lineStyle = 'bg-neutral-200';
        } else if (step.completed) {
          circleStyle = 'bg-green-700 text-white border-2 border-green-800 shadow-sm';
          lineStyle = 'bg-green-600';
        }

        return (
          <div key={step.status} className="relative flex items-start gap-4 sm:gap-5">
            {/* Connecting vertical line */}
            {!isLast && (
              <div
                className={`absolute left-5 sm:left-6 top-11 bottom-[-24px] w-1 rounded-full transition-colors ${
                  step.completed ? 'bg-green-600' : 'bg-neutral-200'
                }`}
              />
            )}

            {/* BIG Icon Circle (44px mobile, 48px desktop) */}
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-transform ${circleStyle}`}
            >
              {step.completed ? (
                <Check size={22} className="stroke-[3]" />
              ) : (
                <Icon size={20} className="stroke-[2.2]" />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h4
                  className={`text-base sm:text-lg font-black tracking-tight ${
                    step.isError
                      ? 'text-red-700'
                      : step.current
                      ? 'text-green-900'
                      : step.completed
                      ? 'text-neutral-900'
                      : 'text-neutral-400'
                  }`}
                >
                  {step.label}
                </h4>

                {step.completed && (
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-800 border border-green-200/80 px-2 py-0.5 rounded-full text-xs font-bold">
                    <Check size={12} className="stroke-[3]" />
                    {t('common.done')}
                  </span>
                )}

                {step.current && !step.isError && (
                  <span className="inline-flex items-center gap-1 bg-green-700 text-white px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
                    Current
                  </span>
                )}
              </div>

              {/* Timestamp if recorded */}
              {step.time && (
                <p className="text-xs text-neutral-500 font-semibold tabular-nums mt-0.5">
                  {formatDateTime(step.time)}
                </p>
              )}

              {/* Highlight current step with "What happens next" sentence */}
              {step.current && step.nextSentence && (
                <div
                  className={`mt-2 p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm font-semibold leading-relaxed border ${
                    step.isError
                      ? 'bg-red-50 text-red-900 border-red-200'
                      : 'bg-green-50/80 text-green-950 border-green-200/80'
                  }`}
                >
                  <span className="font-black block uppercase text-[11px] tracking-wider mb-0.5 text-green-800">
                    {t('orders.what_happens_next')}:
                  </span>
                  {step.nextSentence}
                </div>
              )}

              {/* Note / Reason if cancelled or rejected */}
              {step.note && (
                <div
                  className={`mt-2 p-3 rounded-2xl text-xs sm:text-sm leading-relaxed border ${
                    step.isError
                      ? 'bg-red-50 text-red-900 border-red-200'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                  }`}
                >
                  <span className="font-bold block text-[11px] uppercase tracking-wider text-neutral-500">
                    {t('common.reason')}:
                  </span>
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
