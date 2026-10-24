import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { STATUS_META, getOrderStatusLabel } from '../utils/orderStatus';

const STATUS_ICONS = {
  PLACED: Clock,
  ACCEPTED: CheckCircle2,
  PACKED: Package,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
  REJECTED: AlertCircle
};

export default function OrderStatusBadge({ status, size = 'md', showIcon = true }) {
  const { t } = useTranslation();
  const meta = STATUS_META[status] || STATUS_META.PLACED;
  const label = getOrderStatusLabel(status, t);
  const Icon = STATUS_ICONS[status] || Clock;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-2xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-bold'
  };

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-2xs ${
        sizeClasses[size] || sizeClasses.md
      } ${meta.bg} ${meta.text} ${meta.border}`}
    >
      {showIcon && <Icon size={iconSizes[size] || 13} className="shrink-0" />}
      <span>{label}</span>
    </span>
  );
}

export { OrderStatusBadge as StatusPill };
