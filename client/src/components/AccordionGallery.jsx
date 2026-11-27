import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookCover } from './BookCover';
import './AccordionGallery.css';

/**
 * AccordionGallery Component for Dashboard & Catalog
 * Expands hovered/focused panel to reveal book details.
 * Supports touch devices with vertical accordion/snap layout.
 */
export function AccordionGallery({ books = [], className = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  if (!books || books.length === 0) {
    return (
      <div className="accordion-gallery-empty">
        <p>No books currently available in this view.</p>
      </div>
    );
  }

  const getAvailabilityInfo = (available) => {
    if (available === null || available === undefined) {
      return { status: 'unknown', text: 'Unknown', dotClass: 'dot-unknown' };
    }
    if (available > 0) {
      return {
        status: 'available',
        text: `${available} Available`,
        dotClass: 'dot-available',
      };
    }
    return { status: 'checked-out', text: 'Checked out', dotClass: 'dot-unavailable' };
  };

  const handleCardClick = (index, bookId) => {
    if (activeIndex === index) {
      navigate(`/books/${bookId}`);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <div
      className={`accordion-gallery ${className}`}
      role="region"
      aria-label="Books Accordion Gallery"
    >
      <div className="accordion-track">
        {books.map((book, index) => {
          const isExpanded = activeIndex === index;
          const availability = getAvailabilityInfo(book.available);

          return (
            <div
              key={book.id || index}
              className={`accordion-panel ${isExpanded ? 'is-expanded' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => handleCardClick(index, book.id)}
              tabIndex={0}
              role="button"
              aria-expanded={isExpanded}
              aria-label={`${book.title} by ${book.author}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(index, book.id);
                }
              }}
            >
              {/* Cover Art in Panel */}
              <div className="panel-cover-wrapper">
                <BookCover book={book} />
              </div>

              {/* Panel Details & Metadata */}
              <div className="panel-overlay">
                <div className="panel-meta-header">
                  <span className="panel-genre-chip">
                    {book.genre?.name || 'MMU Collection'}
                  </span>
                  <span className={`panel-availability ${availability.dotClass}`}>
                    <span className="availability-dot" />
                    <span className="availability-text">{availability.text}</span>
                  </span>
                </div>

                <div className="panel-content">
                  <h4 className="panel-title">{book.title}</h4>
                  <p className="panel-author">by {book.author}</p>
                  {isExpanded && (
                    <div className="panel-cta">
                      <span>View details & borrow</span>
                      <span className="panel-cta-arrow" aria-hidden="true">→</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
