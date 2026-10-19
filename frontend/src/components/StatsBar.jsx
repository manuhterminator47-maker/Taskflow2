import { STATUS_LABELS } from '../constants';

export default function StatsBar({ stats }) {
  // stats looks like [{ status: 'done', total: 4 }, { status: 'todo', total: 3 }]
  const totals = stats.reduce((result, row) => {
    result[row.status] = row.total;
    return result;
  }, {});

  return (
    <div className="stats">
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <div className="stat" key={value}>
          <strong>{totals[value] ?? 0}</strong>
          {label}
        </div>
      ))}
    </div>
  );
}