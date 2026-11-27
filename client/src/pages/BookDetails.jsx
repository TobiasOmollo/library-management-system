import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBookById } from '../api/books';
import { BookCover } from '../components/BookCover';
import { MagicBento, BentoCard } from '../components/MagicBento';
import { Button } from '../components/Button';
import './BookDetails.css';

export function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setNotFound(false);
    setError('');

    getBookById(id, controller.signal)
      .then((data) => {
        if (!data) {
          setNotFound(true);
        } else {
          setBook(data);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;

        // Missing book (404) or invalid UUID format (400) -> Book not found
        if (err.status === 404 || err.status === 400) {
          setNotFound(true);
        } else {
          setError(err.message || 'Unable to connect to the library catalog.');
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <div className="book-detail-loading" role="status" aria-live="polite">
        <div className="loading-spinner" />
        <p>Retrieving volume from archives…</p>
      </div>
    );
  }

  // 404 / 400: Book Not Found State
  if (notFound) {
    return (
      <div className="book-not-found-card" role="alert">
        <span className="not-found-icon">📖</span>
        <h2>Book not found</h2>
        <p>
          The volume you requested does not exist in the MMU Library catalog or may have been relocated.
        </p>
        <Button to="/#collection" variant="primary" size="md">
          ← Back to the Collection
        </Button>
      </div>
    );
  }

  // General Network / Server Error
  if (error || !book) {
    return (
      <div className="book-not-found-card" role="alert">
        <span className="not-found-icon">!</span>
        <h2>Connection issue</h2>
        <p>{error || 'This page is taking a moment to load.'}</p>
        <Button to="/#collection" variant="secondary" size="md">
          ← Back to the Collection
        </Button>
      </div>
    );
  }

  const availabilityText =
    book.available === null || book.available === undefined
      ? 'Unknown'
      : book.available > 0
      ? `${book.available} ${book.available === 1 ? 'copy' : 'copies'} available`
      : 'All copies checked out';

  const isAvailable =
    book.available === null || book.available === undefined
      ? 'unknown'
      : book.available > 0;

  return (
    <div className="book-detail-container">
      {/* Breadcrumb Navigation */}
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <Link to="/#collection" className="breadcrumb-link">
          ← Back to collection
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{book.title}</span>
      </nav>

      {/* Main Showcase Grid */}
      <div className="detail-showcase-grid">
        {/* Cover Column */}
        <div className="detail-cover-column">
          <BookCover book={book} large />
          <span className="detail-curation-note">MMU ACADEMIC SHELF</span>
        </div>

        {/* Narrative & Info Column */}
        <div className="detail-narrative-column">
          <div className="detail-meta-row">
            <span className="detail-genre-pill">
              {book.genre?.name || 'General Collection'}
            </span>
            {book.publishedYear && (
              <span className="detail-year-text">Published in {book.publishedYear}</span>
            )}
          </div>

          <h1 className="detail-book-title">{book.title}</h1>
          <p className="detail-book-author">by {book.author}</p>

          <div className="detail-divider" />

          <div className="detail-synopsis">
            <h3>Overview & Abstract</h3>
            <p>
              {book.description ||
                'This volume is part of the MMU Library research collection. Consult library staff or digital archives for extended indices.'}
            </p>
          </div>

          {/* Availability Status Card */}
          <div className={`detail-availability-card status-${isAvailable}`}>
            <span className="availability-dot" />
            <div className="availability-details">
              <strong>Circulation Status:</strong> {availabilityText}
            </div>
          </div>
        </div>
      </div>

      {/* Magic Bento Metadata Grid */}
      <section className="detail-bento-section" aria-label="Book Metadata & Specifications">
        <h2 className="section-heading">Volume Specifications</h2>
        <MagicBento columns="3">
          <BentoCard
            icon="🏷️"
            title={book.isbn || 'N/A'}
            subtitle="ISBN Identifier"
            badge="Standard"
          >
            <p>International Standard Book Number registered in catalogue records.</p>
          </BentoCard>

          <BentoCard
            icon="📦"
            title={`${book.copies ?? 'Unknown'}`}
            subtitle="Total Holdings"
            badge="Copies"
          >
            <p>Physical copies catalogued across MMU campus library facilities.</p>
          </BentoCard>

          <BentoCard
            icon="🏛️"
            title={book.genre?.name || 'Unassigned'}
            subtitle="Academic Discipline"
            badge="Classification"
          >
            <p>Indexed under the university discipline classification scheme.</p>
          </BentoCard>
        </MagicBento>
      </section>
    </div>
  );
}
