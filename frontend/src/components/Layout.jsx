import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Layout() {
  const { user, isAuthed, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand">TaskFlow</Link>
        <nav>
          {isAuthed ? (
            <>
              <NavLink to="/tasks">My tasks</NavLink>
              <span className="status">Hi, {user.username}</span>
              <button type="button" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </>
  );
}