import { useTranslation } from 'react-i18next';
import { STATUS_META, getOrderStatusLabel } from '../utils/orderStatus';

// Badge that shows order status with appropriate color
export default function OrderStatusBadge({ status }) {
  const { t } = useTranslation();
  const meta = STATUS_META[status] || STATUS_META.PLACED;
  const label = getOrderStatusLabel(status, t);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.bg} ${meta.text} ${meta.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${meta.dot}`} />
      {label}
    </span>
  );
}

