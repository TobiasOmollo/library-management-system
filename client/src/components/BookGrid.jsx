import { BookCard } from './BookCard';
import './BookGrid.css';

export function BookGrid({ books = [], loading = false, className = '' }) {
  if (loading) {
    return (
      <div className="book-grid-skeleton" aria-label="Loading library catalogue">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-cover shimmer" />
            <div className="skeleton-line shimmer short" />
            <div className="skeleton-line shimmer" />
            <div className="skeleton-line shimmer medium" />
          </div>
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="book-grid-empty">
        <span className="empty-icon" aria-hidden="true">📖</span>
        <h3>No books found</h3>
        <p>Try refining your search keyword or clearing the genre filter.</p>
      </div>
    );
  }

  return (
    <div className={`mmu-book-grid ${className}`}>
      {books.map((book, idx) => (
        <BookCard key={book.id || idx} book={book} index={idx} />
      ))}
    </div>
  );
}
