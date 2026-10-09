import { STATUS_META } from '../utils/orderStatus';

// Badge that shows order status with appropriate color
export default function OrderStatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.PLACED;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.bg} ${meta.text} ${meta.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
