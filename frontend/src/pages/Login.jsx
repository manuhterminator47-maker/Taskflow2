import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import FormField from '../components/FormField';
import { getErrorMessage } from '../utils/apiErrors';

export default function Login() {
  const { login, isAuthed } = useAuth();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? '/tasks';

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.username.trim(), form.password);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not log in. Check your username and password.'));
      setSubmitting(false);
    }
  }

  if (isAuthed) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <section className="card">
      <h2>Log in</h2>
      <form className="form" onSubmit={handleSubmit}>
        <FormField
          id="username"
          label="Username"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="status">
        No account yet? <Link to="/register">Register</Link>
      </p>
    </section>
  );
}