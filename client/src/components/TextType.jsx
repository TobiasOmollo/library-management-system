import { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './TextType.css';

/**
 * TextType component — Typewriter effect for motivational quotes and facts.
 * Rendered in Instrument Serif typography with a pulsing cursor.
 */
export function TextType({
  items = [],
  typingSpeed = 45,
  deletingSpeed = 25,
  pauseDuration = 2800,
  className = '',
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const reducedMotion = useReducedMotion();
  const timerRef = useRef(null);

  const currentItem = items[currentIndex] || { text: '', author: '' };
  const fullText = currentItem.text || '';

  useEffect(() => {
    if (reducedMotion || items.length === 0) {
      setDisplayedText(fullText);
      return;
    }

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing forward
        if (displayedText.length < fullText.length) {
          setDisplayedText(fullText.slice(0, displayedText.length + 1));
          timerRef.current = setTimeout(handleTyping, typingSpeed);
        } else {
          // Finished typing full line -> pause before deleting
          timerRef.current = setTimeout(() => {
            setIsDeleting(true);
          }, pauseDuration);
        }
      } else {
        // Deleting backwards
        if (displayedText.length > 0) {
          setDisplayedText(fullText.slice(0, displayedText.length - 1));
          timerRef.current = setTimeout(handleTyping, deletingSpeed);
        } else {
          // Finished deleting -> advance to next item
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % items.length);
        }
      }
    };

    timerRef.current = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayedText, isDeleting, currentIndex, fullText, items.length, typingSpeed, deletingSpeed, pauseDuration, reducedMotion]);

  return (
    <div className={`text-type-wrapper ${className}`}>
      <blockquote className="text-type-quote">
        “<span className="text-type-content">{displayedText}</span>
        <span className="text-type-cursor" aria-hidden="true">|</span>”
      </blockquote>
      {currentItem.author && (
        <cite className="text-type-author">
          — {currentItem.author}
        </cite>
      )}
    </div>
  );
}
