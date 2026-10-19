import { STATUS_LABELS } from '../constants';

export default function TaskFilters({ search, onSearchChange, status, onStatusChange }) {
  return (
    <div className="card row">
      <div className="field">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="search"
          placeholder="Title or description"
          value={search}
          onChange={event => onSearchChange(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="status-filter">Status</label>
        <select
          id="status-filter"
          value={status}
          onChange={event => onStatusChange(event.target.value)}
        >
          <option value="">All</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}