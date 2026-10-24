import React from 'react';
import { useTranslation } from 'react-i18next';
import { STATUS_META, getOrderStatusLabel } from '../utils/orderStatus';

export default function OrderStatusBadge({ status, size = 'md' }) {
  const { t } = useTranslation();
  const meta = STATUS_META[status] || STATUS_META.PLACED;
  const label = getOrderStatusLabel(status, t);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-2xs',
    md: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-2xs ${sizeClasses[size] || sizeClasses.md} ${meta.bg} ${meta.text} ${meta.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
      <span>{label}</span>
    </span>
  );
}
