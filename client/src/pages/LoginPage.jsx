import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { TextType } from '../components/TextType';
import { FallingLight } from '../components/FallingLight';
import { Button } from '../components/Button';
import { LIBRARY_QUOTES } from '../data/libraryQuotes';
import './LoginPage.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.registered
    ? 'Account created successfully! Please sign in.'
    : '';

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      if (err.status === 401) {
        setApiError('Invalid email or password.');
      } else if (err.status === 429) {
        setApiError('Too many attempts, try again in a minute.');
      } else {
        setApiError(err.message || 'Unable to sign in. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="split-auth-container">
      {/* Subtle Falling Light Canvas Animation */}
      <FallingLight />

      <div className="split-auth-shell">
        {/* Left Side: MMU Blue Gradient Showcase */}
        <section className="auth-left-panel" aria-label="MMU Library Inspiration">
          <div className="auth-left-header">
            <Link to="/" className="auth-brand-link" aria-label="MMU Library Home">
              <span className="auth-brand-badge">M.</span>
              <span className="auth-brand-title">MMU <em>Library</em></span>
            </Link>
          </div>

          <div className="auth-quote-showcase">
            <span className="auth-panel-eyebrow">Scholarly Inspiration</span>
            <TextType items={LIBRARY_QUOTES} />
          </div>

          <div className="auth-left-footer">
            <span className="auth-footer-tag">Research & Learning Hub</span>
            <span className="auth-footer-dot">•</span>
            <span>MMU Academic Network</span>
          </div>
        </section>

        {/* Right Side: Clean White Login Card */}
        <section className="auth-right-panel" aria-label="Sign In Form">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Welcome back</h2>
              <p>Sign in to your MMU Library patron or staff account.</p>
            </div>

            {successMessage && (
              <div className="auth-alert alert-success" role="status">
                <span className="alert-icon">✓</span>
                <span>{successMessage}</span>
              </div>
            )}

            {apiError && (
              <div className="auth-alert alert-error" role="alert">
                <span className="alert-icon">!</span>
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="scholar@mmu.edu"
                  autoComplete="email"
                  required
                />
                {fieldErrors.email && (
                  <span className="form-field-error" role="alert">{fieldErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="password-input-wrap">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${fieldErrors.password ? 'has-error' : ''}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className="form-field-error" role="alert">{fieldErrors.password}</span>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                className="auth-submit-btn"
              >
                Sign in to Library
              </Button>
            </form>

            <div className="auth-card-footer">
              <p>
                Don’t have an account?{' '}
                <Link to="/register" className="auth-link">
                  Register for access
                </Link>
              </p>
              <Link to="/" className="auth-back-link">
                ← Return to catalog
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
