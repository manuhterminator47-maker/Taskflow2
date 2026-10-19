import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Home() {
  const { isAuthed, user, initializing } = useAuth();

  if (initializing) return <p className="status">Loading...</p>;

  return (
    <section className="hero">
      <h1>TaskFlow</h1>
      <p className="status">A small task manager built with Django and React.</p>
      {isAuthed ? (
        <p>
          Welcome back, {user.username}. <Link to="/tasks">Go to your tasks</Link>
        </p>
      ) : (
        <p>
          <Link to="/login">Log in</Link> or <Link to="/register">create an account</Link> to start.
        </p>
      )}
    </section>
  );
}