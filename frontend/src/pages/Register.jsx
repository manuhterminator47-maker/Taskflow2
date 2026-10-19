import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import FormField from '../components/FormField';
import { getErrorMessage, getFieldErrors } from '../utils/apiErrors';

export default function Register() {
  const { register, isAuthed } = useAuth();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFieldErrors({});
    setFormError('');
    setSubmitting(true);
    try {
      await register(form.username.trim(), form.email.trim(), form.password);
    } catch (err) {
      const errors = getFieldErrors(err);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      } else {
        setFormError(getErrorMessage(err, 'Could not create the account.'));
      }
      setSubmitting(false);
    }
  }

  if (isAuthed) {
    return <Navigate to="/tasks" replace />;
  }

  return (
    <section className="card">
      <h2>Create an account</h2>
      <form className="form" onSubmit={handleSubmit}>
        <FormField
          id="username"
          label="Username"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          error={fieldErrors.username}
          required
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
        />
        <FormField
          id="password"
          label="Password (at least 8 characters)"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          required
        />
        {(formError || fieldErrors.non_field_errors) && (
          <p className="error" role="alert">{formError || fieldErrors.non_field_errors}</p>
        )}
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="status">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}