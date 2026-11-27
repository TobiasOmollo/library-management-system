import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Button } from './Button';
import './BubbleMenu.css';

/**
 * BubbleMenu Component — Dynamic floating menu with expandable bubble pill,
 * active route indicators, librarian privileges, and accessible controls.
 */
export function BubbleMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isLibrarian } = useAuth();
  const location = useLocation();
  const menuRef = useRef(null);

  // Close menu on route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  // Handle escape key and outside click to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isActive = (path, hash) => {
    if (hash) {
      return location.pathname === path && location.hash === hash;
    }
    return location.pathname === path && (!location.hash || location.hash === '');
  };

  return (
    <header className="bubble-header" ref={menuRef}>
      <div className="bubble-header-inner">
        {/* Brand Logo */}
        <Link to="/" className="bubble-brand" aria-label="MMU Library Home">
          <span className="bubble-brand-badge" aria-hidden="true">M.</span>
          <span className="bubble-brand-text">
            MMU <em>Library</em>
          </span>
        </Link>

        {/* Desktop Quick Nav */}
        <nav className="bubble-desktop-nav" aria-label="Main Navigation">
          <Link
            to="/#collection"
            className={`bubble-nav-link ${isActive('/', '#collection') ? 'active' : ''}`}
          >
            Catalog
          </Link>
          <Link
            to="/genres"
            className={`bubble-nav-link ${isActive('/genres') ? 'active' : ''}`}
          >
            Genres
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className={`bubble-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          )}
          {isLibrarian && (
            <Link
              to="/manage"
              className={`bubble-nav-link librarian-badge-link ${isActive('/manage') ? 'active' : ''}`}
            >
              Manage
            </Link>
          )}
        </nav>

        {/* Bubble Menu Action & Trigger */}
        <div className="bubble-action-cluster">
          {user ? (
            <div className="bubble-user-pill">
              <span className="bubble-user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </span>
              <span className="bubble-user-name">{user.name || user.email.split('@')[0]}</span>
              {user.role === 'LIBRARIAN' && <span className="bubble-librarian-tag">Staff</span>}
            </div>
          ) : (
            <div className="bubble-auth-shortcuts">
              <Button to="/login" variant="ghost" size="sm">
                Sign in
              </Button>
              <Button to="/register" variant="primary" size="sm">
                Join
              </Button>
            </div>
          )}

          {/* Bubble Menu Toggle Button */}
          <button
            type="button"
            className={`bubble-toggle-btn ${isOpen ? 'is-active' : ''}`}
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
            aria-controls="bubble-dropdown-menu"
          >
            <span className="bubble-toggle-dot" />
            <span className="bubble-toggle-dot" />
            <span className="bubble-toggle-dot" />
          </button>
        </div>
      </div>

      {/* Floating Expanded Bubble Menu */}
      <div
        id="bubble-dropdown-menu"
        className={`bubble-dropdown ${isOpen ? 'is-open' : ''}`}
        role="region"
        aria-label="Expanded Menu"
      >
        <div className="bubble-dropdown-content">
          <div className="bubble-dropdown-section">
            <span className="bubble-section-label">Navigation</span>
            <Link
              to="/#collection"
              className={`bubble-dropdown-item ${isActive('/', '#collection') ? 'active' : ''}`}
            >
              <span className="bubble-item-icon">📚</span>
              <span>Catalog & Shelves</span>
            </Link>
            <Link
              to="/genres"
              className={`bubble-dropdown-item ${isActive('/genres') ? 'active' : ''}`}
            >
              <span className="bubble-item-icon">🏷️</span>
              <span>Browse Genres</span>
            </Link>
            <Link
              to="/dashboard"
              className={`bubble-dropdown-item ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <span className="bubble-item-icon">📊</span>
              <span>My Dashboard & Gallery</span>
            </Link>
            {isLibrarian && (
              <Link
                to="/manage"
                className={`bubble-dropdown-item librarian-item ${isActive('/manage') ? 'active' : ''}`}
              >
                <span className="bubble-item-icon">⚡</span>
                <span>Librarian Management</span>
              </Link>
            )}
          </div>

          <div className="bubble-dropdown-divider" />

          {/* Auth Section in Bubble */}
          <div className="bubble-dropdown-section">
            <span className="bubble-section-label">Account</span>
            {user ? (
              <div className="bubble-account-card">
                <div className="bubble-account-info">
                  <p className="bubble-account-email">{user.email}</p>
                  <p className="bubble-account-role">Role: {user.role}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="bubble-logout-btn"
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="bubble-guest-actions">
                <Button to="/login" variant="secondary" size="md" className="full-width">
                  Sign in to MMU Library
                </Button>
                <Button to="/register" variant="primary" size="md" className="full-width">
                  Create a Member Account
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
