import React from 'react';
import { useTranslation } from 'react-i18next';

export default function StatusBadge({ status, size = 'md' }) {
  const { t } = useTranslation();

  const styles = {
    APPROVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
    REJECTED: 'bg-red-50 text-red-800 border-red-200',
    NOT_SUBMITTED: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  };

  const dots = {
    APPROVED: 'bg-emerald-600',
    PENDING: 'bg-amber-500 animate-pulse',
    REJECTED: 'bg-red-600',
    NOT_SUBMITTED: 'bg-neutral-400',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-2xs',
    md: 'px-2.5 py-1 text-xs',
  };

  const style = styles[status] || styles.NOT_SUBMITTED;
  const dotColor = dots[status] || dots.NOT_SUBMITTED;
  const label =
    status && t(`status.${status}`) !== `status.${status}`
      ? t(`status.${status}`)
      : status?.replace('_', ' ') || 'NOT SUBMITTED';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-2xs ${sizeClasses[size] || sizeClasses.md} ${style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}
