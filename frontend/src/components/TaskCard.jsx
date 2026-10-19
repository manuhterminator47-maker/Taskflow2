import { useState } from 'react';
import { STATUS_LABELS } from '../constants';
import { getErrorMessage, getFieldErrors } from '../utils/apiErrors';

function todayString() {
  // 'YYYY-MM-DD' in the user's local time zone
  return new Date().toLocaleDateString('en-CA');
}

export default function TaskCard({ task, onChangeStatus, onDelete, onRename }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const isOverdue =
    Boolean(task.due_date) && task.status !== 'done' && task.due_date < todayString();

  function startEditing() {
    setDraftTitle(task.title);
    setEditError('');
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setEditError('');
    try {
      await onRename(task.id, draftTitle.trim());
      setIsEditing(false);
    } catch (err) {
      setEditError(getFieldErrors(err).title ?? getErrorMessage(err, 'Could not save the title.'));
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (window.confirm(`Delete '${task.title}'?`)) {
      onDelete(task.id);
    }
  }

  return (
    <article className={task.status === 'done' ? 'card task-card done' : 'card task-card'}>
      <header>
        {isEditing ? (
          <form className="row" onSubmit={handleSave}>
            <input
              aria-label="Task title"
              value={draftTitle}
              onChange={event => setDraftTitle(event.target.value)}
              autoFocus
            />
            <button type="submit" className="primary" disabled={saving}>Save</button>
            <button type="button" onClick={cancelEditing}>Cancel</button>
          </form>
        ) : (
          <>
            <h3>{task.title}</h3>
            <button type="button" onClick={startEditing}>Edit</button>
          </>
        )}
      </header>

      {editError && <p className="error" role="alert">{editError}</p>}
      {task.description && <p>{task.description}</p>}

      <div className="meta">
        {task.category_detail && (
          <span className="chip" style={{ background: task.category_detail.color }}>
            {task.category_detail.name}
          </span>
        )}
        {task.due_date && (
          <span className={isOverdue ? 'overdue' : undefined}>
            Due {task.due_date}{isOverdue ? ' (overdue)' : ''}
          </span>
        )}
      </div>

      <div className="actions">
        <label htmlFor={`status-${task.id}`} className="status">Status</label>
        <select
          id={`status-${task.id}`}
          value={task.status}
          onChange={event => onChangeStatus(task.id, event.target.value)}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button type="button" className="danger" onClick={handleDelete}>Delete</button>
      </div>
    </article>
  );
}