import { useState } from 'react';
import { STATUS_LABELS } from '../constants';
import { getErrorMessage, getFieldErrors } from '../utils/apiErrors';
import FormField from './FormField';

const EMPTY_FORM = { title: '', description: '', status: 'todo', due_date: '', category: '' };

export default function TaskForm({ categories, onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) return;

    setFieldErrors({});
    setFormError('');
    setSubmitting(true);
    try {
      await onAdd({
        title,
        description: form.description.trim(),
        status: form.status,
        due_date: form.due_date || null,
        category: form.category ? Number(form.category) : null,
      });
      setForm(EMPTY_FORM);
    } catch (err) {
      const errors = getFieldErrors(err);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      } else {
        setFormError(getErrorMessage(err, 'Could not add the task.'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>New task</h2>

      <FormField
        id="title"
        label="Title"
        value={form.title}
        onChange={handleChange}
        error={fieldErrors.title}
        required
      />

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={2}
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <FormField
          id="due_date"
          label="Due date"
          type="date"
          value={form.due_date}
          onChange={handleChange}
          error={fieldErrors.due_date}
        />

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            <option value="">None</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      {formError && <p className="error" role="alert">{formError}</p>}

      <button type="submit" className="primary" disabled={submitting}>
        {submitting ? 'Adding...' : 'Add task'}
      </button>
    </form>
  );
}
