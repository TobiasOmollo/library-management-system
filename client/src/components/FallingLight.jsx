import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './FallingLight.css';

/**
 * FallingLight Component (React Bits style Light Rays / Falling Light)
 * Subtle, soft falling streaks of light rendered on a responsive canvas.
 * Optimized with DPR capping and tab visibility pausing.
 */
export function FallingLight({ className = '' }) {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let isTabVisible = !document.hidden;

    // Cap DPR to 1.5 for performance while maintaining crispness
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const isMobile = window.innerWidth < 480;
    const streakCount = isMobile ? 18 : 38;

    const handleResize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect() || {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initialize light streaks
    const streaks = Array.from({ length: streakCount }, () => ({
      x: Math.random() * (canvas.width / dpr),
      y: Math.random() * (canvas.height / dpr),
      length: 60 + Math.random() * 140,
      speed: 0.6 + Math.random() * 1.6,
      opacity: 0.03 + Math.random() * 0.12,
      width: 1 + Math.random() * 2.5,
      angle: 15 * (Math.PI / 180), // 15 degree gentle angle
    }));

    const render = () => {
      if (isTabVisible) {
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < streaks.length; i++) {
          const s = streaks[i];
          s.y += s.speed;
          s.x += s.speed * 0.25;

          if (s.y > height + s.length) {
            s.y = -s.length;
            s.x = Math.random() * width;
          }

          const endX = s.x - Math.sin(s.angle) * s.length;
          const endY = s.y - Math.cos(s.angle) * s.length;

          const gradient = ctx.createLinearGradient(s.x, s.y, endX, endY);
          gradient.addColorStop(0, `rgba(59, 130, 246, ${s.opacity * 1.5})`);
          gradient.addColorStop(0.5, `rgba(147, 197, 253, ${s.opacity})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = s.width;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return <div className={`falling-light-static ${className}`} aria-hidden="true" />;
  }

  return (
    <div className={`falling-light-container ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="falling-light-canvas" />
    </div>
  );
}
