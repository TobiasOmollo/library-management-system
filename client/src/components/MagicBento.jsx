import { useState, useRef, useEffect } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './MagicBento.css';

/**
 * MagicBento Container Component
 */
export function MagicBento({ children, className = '', columns = 'auto' }) {
  return (
    <div
      className={`magic-bento-grid ${className}`}
      data-columns={columns}
    >
      {children}
    </div>
  );
}

/**
 * BentoCard Component with spotlight, border glow, 3D tilt, and particle effects.
 * Automatically disables tilt and particles on touch devices and for reduced-motion users.
 */
export function BentoCard({
  children,
  className = '',
  title,
  subtitle,
  icon,
  badge,
  span = '1',
  onClick,
  interactive = false,
}) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(hover: none)').matches);
  }, []);

  const handleMouseMove = (e) => {
    if (isTouchDevice || reducedMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y, active: true });

    // Calculate subtle 3D tilt (-5deg to +5deg)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * -5;
    const tiltY = ((x - centerX) / centerX) * 5;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, active: false }));
    setTilt({ x: 0, y: 0 });
  };

  const cardStyle = {
    gridColumn: span === '2' ? 'span 2' : span === '3' ? 'span 3' : undefined,
    transform:
      !isTouchDevice && !reducedMotion && mousePos.active
        ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-2px)`
        : undefined,
  };

  return (
    <div
      ref={cardRef}
      className={`bento-card ${interactive ? 'bento-interactive' : ''} ${className}`}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Spotlight highlight */}
      {!isTouchDevice && !reducedMotion && (
        <div
          className="bento-spotlight"
          style={{
            opacity: mousePos.active ? 1 : 0,
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.12), transparent 75%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Dynamic Border Glow */}
      {!isTouchDevice && !reducedMotion && (
        <div
          className="bento-border-glow"
          style={{
            opacity: mousePos.active ? 1 : 0,
            background: `radial-gradient(250px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.5), transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Card Header if title or icon provided */}
      {(title || icon || badge) && (
        <div className="bento-card-header">
          {icon && <div className="bento-icon">{icon}</div>}
          <div className="bento-titles">
            {subtitle && <span className="bento-subtitle">{subtitle}</span>}
            {title && <h3 className="bento-title">{title}</h3>}
          </div>
          {badge && <span className="bento-badge">{badge}</span>}
        </div>
      )}

      {/* Card Content */}
      <div className="bento-card-content">{children}</div>
    </div>
  );
}
