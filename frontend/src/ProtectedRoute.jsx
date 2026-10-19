import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthed, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <p className="status">Checking your session...</p>;
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}