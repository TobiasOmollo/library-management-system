import { Link } from 'react-router-dom';
import { BookCover } from './BookCover';
import './BookCard.css';

export function BookCard({ book }) {
  if (!book) return null;

  const isAvailable = book.available === null || book.available === undefined
    ? 'unknown'
    : book.available > 0;

  return (
    <Link
      to={`/books/${book.id}`}
      className="mmu-book-card"
      aria-label={`${book.title} by ${book.author}`}
    >
      <div className="card-cover-container">
        <BookCover book={book} />
      </div>

      <div className="card-details">
        <div className="card-genre-row">
          <span className="card-genre-tag">{book.genre?.name || 'General Collection'}</span>
          {book.publishedYear && (
            <span className="card-year">{book.publishedYear}</span>
          )}
        </div>

        <h3 className="card-title">{book.title}</h3>
        <p className="card-author">by {book.author}</p>

        <div className="card-footer-row">
          <span className="card-status-badge">
            <span
              className={`status-indicator ${
                isAvailable === true
                  ? 'is-available'
                  : isAvailable === false
                  ? 'is-unavailable'
                  : 'is-unknown'
              }`}
            />
            {isAvailable === true
              ? 'Available'
              : isAvailable === false
              ? 'Checked out'
              : 'Unknown'}
          </span>
          <span className="card-arrow-icon" aria-hidden="true">↗</span>
        </div>
      </div>
    </Link>
  );
}
