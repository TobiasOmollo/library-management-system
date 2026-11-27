import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

/**
 * Spectacular Button component with animated shine sweep,
 * ambient glow, 3D lift, and dynamic click ripple.
 */
export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  type = 'button',
  to,
  href,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  icon,
  iconRight,
  ...rest
}) {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }

    const element = buttonRef.current;
    if (element) {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now() + Math.random();

      setRipples((prev) => [...prev, { x, y, id }]);

      // Remove ripple after animation finishes
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 650);
    }

    if (onClick) {
      onClick(e);
    }
  };

  const buttonClasses = [
    'spectacular-btn',
    `btn-${variant}`,
    `btn-${size}`,
    loading ? 'btn-loading' : '',
    disabled ? 'btn-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="btn-shine" aria-hidden="true" />
      <span className="btn-glow" aria-hidden="true" />
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="btn-ripple"
          style={{ left: ripple.x, top: ripple.y }}
          aria-hidden="true"
        />
      ))}
      <span className="btn-content">
        {loading && <span className="btn-spinner" aria-hidden="true" />}
        {icon && !loading && <span className="btn-icon-left">{icon}</span>}
        <span className="btn-text">{children}</span>
        {iconRight && <span className="btn-icon-right">{iconRight}</span>}
      </span>
    </>
  );

  if (to && !disabled) {
    return (
      <Link
        ref={buttonRef}
        to={to}
        className={buttonClasses}
        onClick={handleClick}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a
        ref={buttonRef}
        href={href}
        className={buttonClasses}
        onClick={handleClick}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...rest}
    >
      {content}
    </button>
  );
}
