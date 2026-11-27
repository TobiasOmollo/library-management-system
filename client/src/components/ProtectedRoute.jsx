import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * Route wrapper that requires authentication.
 * Optional requiredRole ('LIBRARIAN' or 'MEMBER').
 */
export function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen" role="status" aria-live="polite">
        <div className="auth-spinner" />
        <p>Verifying credentials…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * Route wrapper that redirects logged-in users away from /login and /register.
 */
export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen" role="status" aria-live="polite">
        <div className="auth-spinner" />
      </div>
    );
  }

  if (user) {
    const destination = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
}
