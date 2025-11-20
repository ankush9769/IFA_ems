const COLORS = {
  Active: '#22c55e',
  Completed: '#0ea5e9',
  Cancelled: '#ef4444',
  Stalled: '#f97316',
  'Contact Made': '#8b5cf6',
};

const StatusBadge = ({ status }) => {
  const color = COLORS[status] ?? '#94a3b8';
  return (
    <span
      style={{
        background: `${color}15`,
        color,
        padding: '0.2rem 0.65rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;

