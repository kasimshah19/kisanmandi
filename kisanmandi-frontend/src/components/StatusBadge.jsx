const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    NOT_SUBMITTED: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const style = styles[status] || styles.NOT_SUBMITTED;
  const label = status?.replace('_', ' ') || 'NOT SUBMITTED';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
