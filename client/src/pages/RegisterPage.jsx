import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { TextType } from '../components/TextType';
import { FallingLight } from '../components/FallingLight';
import { Button } from '../components/Button';
import { LIBRARY_QUOTES } from '../data/libraryQuotes';
import './LoginPage.css'; // Shared split-screen styling

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid academic or personal email.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
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
      await register(email.trim(), password, name.trim());
      // On success, redirect to login with success state
      navigate('/login', {
        state: { registered: true },
        replace: true,
      });
    } catch (err) {
      if (err.status === 409) {
        setApiError('An account with this email address already exists.');
      } else if (err.status === 400) {
        setApiError(err.message || 'Validation failed. Check your information.');
      } else if (err.status === 429) {
        setApiError('Too many attempts. Please try again in a minute.');
      } else {
        setApiError(err.message || 'Unable to complete registration. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="split-auth-container">
      <FallingLight />

      <div className="split-auth-shell">
        {/* Left Side: Inspiration */}
        <section className="auth-left-panel" aria-label="MMU Academic Community">
          <div className="auth-left-header">
            <Link to="/" className="auth-brand-link" aria-label="MMU Library Home">
              <span className="auth-brand-badge">M.</span>
              <span className="auth-brand-title">MMU <em>Library</em></span>
            </Link>
          </div>

          <div className="auth-quote-showcase">
            <span className="auth-panel-eyebrow">Join the Community</span>
            <TextType items={LIBRARY_QUOTES} />
          </div>

          <div className="auth-left-footer">
            <span className="auth-footer-tag">Patron Registration</span>
            <span className="auth-footer-dot">•</span>
            <span>Knowledge Without Boundaries</span>
          </div>
        </section>

        {/* Right Side: Register Card */}
        <section className="auth-right-panel" aria-label="Registration Form">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Join MMU Library</h2>
              <p>Create your free patron account to explore and borrow titles.</p>
            </div>

            {apiError && (
              <div className="auth-alert alert-error" role="alert">
                <span className="alert-icon">!</span>
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="reg-name">
                  Full name <span className="optional-label">(optional)</span>
                </label>
                <input
                  id="reg-name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Email address</label>
                <input
                  id="reg-email"
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
                <label htmlFor="reg-password">Password (min 8 characters)</label>
                <div className="password-input-wrap">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${fieldErrors.password ? 'has-error' : ''}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="Create a secure password"
                    autoComplete="new-password"
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
                Create Patron Account
              </Button>
            </form>

            <div className="auth-card-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in here
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
