import { Check, Circle, X } from 'lucide-react';
import { STATUS_META, HAPPY_PATH } from '../utils/orderStatus';
import { formatDateTime } from '../utils/format';

// Vertical timeline showing order progress through statuses
export default function OrderTimeline({ history, currentStatus }) {
  // Build a map of completed statuses from history
  const historyMap = {};
  (history || []).forEach(h => { historyMap[h.status] = h; });

  const isRejected = currentStatus === 'REJECTED';
  const isCancelled = currentStatus === 'CANCELLED';
  const isTerminal = isRejected || isCancelled;

  // Build steps to display
  const steps = [];
  const happyIndex = HAPPY_PATH.indexOf(currentStatus);

  for (let i = 0; i < HAPPY_PATH.length; i++) {
    const status = HAPPY_PATH[i];
    const h = historyMap[status];

    // If terminal and this step is after current happy-path progress, skip
    if (isTerminal && !h) continue;

    steps.push({
      status,
      label: STATUS_META[status]?.label || status,
      time: h?.changedAt,
      note: h?.note,
      completed: !!h,
      current: status === currentStatus,
    });
  }

  // Add REJECTED or CANCELLED as the final step if applicable
  if (isRejected && historyMap.REJECTED) {
    steps.push({
      status: 'REJECTED',
      label: 'Rejected',
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
      label: 'Cancelled',
      time: historyMap.CANCELLED.changedAt,
      note: historyMap.CANCELLED.note,
      completed: true,
      current: true,
      isError: true,
    });
  }

  return (
    <div className="relative pl-6">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        let dotColor = 'bg-gray-300';
        let lineColor = 'bg-gray-200';
        let Icon = Circle;

        if (step.isError) {
          dotColor = 'bg-red-500';
          Icon = X;
        } else if (step.completed) {
          dotColor = 'bg-green-500';
          lineColor = 'bg-green-300';
          Icon = Check;
        } else if (step.current) {
          dotColor = 'bg-blue-500';
        }

        return (
          <div key={step.status} className="relative pb-6">
            {/* Connecting line */}
            {!isLast && (
              <div className={`absolute left-[-18px] top-6 w-0.5 h-full ${step.completed ? lineColor : 'bg-gray-200'}`} />
            )}

            {/* Dot/icon */}
            <div className={`absolute left-[-24px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${dotColor}`}>
              <Icon size={12} className="text-white" />
            </div>

            {/* Content */}
            <div>
              <p className={`font-medium text-sm ${step.isError ? 'text-red-700' : step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.label}
              </p>
              {step.time && (
                <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(step.time)}</p>
              )}
              {step.note && (
                <p className={`text-xs mt-1 px-2 py-1 rounded ${step.isError ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'}`}>
                  {step.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
