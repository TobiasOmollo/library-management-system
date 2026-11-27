import { useState, useEffect } from 'react';
import { getBooks } from '../api/books';
import { getGenres } from '../api/genres';
import { MagicBento, BentoCard } from '../components/MagicBento';
import { BookGrid } from '../components/BookGrid';
import { SearchBar } from '../components/SearchBar';
import { Button } from '../components/Button';
import './HomePage.css';

const PAGE_SIZE = 12;

export function HomePage() {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Fetch genres
  useEffect(() => {
    const controller = new AbortController();
    getGenres(controller.signal)
      .then((data) => setGenres(data || []))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Fetch books with debounced search
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    const debounceTimer = setTimeout(() => {
      getBooks({ page, limit: PAGE_SIZE, q: search, genreId: selectedGenre }, controller.signal)
        .then((result) => {
          setBooks(result.data || []);
          setTotalBooks(result.total || 0);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setError(err.message || 'Unable to load books.');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }, 350);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [page, search, selectedGenre, retryCount]);

  const pageCount = Math.max(1, Math.ceil(totalBooks / PAGE_SIZE));

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="mmu-hero">
        <div className="mmu-hero-copy">
          <span className="hero-eyebrow">
            <span className="hero-dot" /> MMU Library Academic Collection
          </span>
          <h1>
            Discover ideas<br />that <em>shape</em> tomorrow.
          </h1>
          <p className="hero-description">
            A sanctuary of knowledge, curated academic resources, and literature
            dedicated to scholars, researchers, and lifelong readers.
          </p>
          <div className="hero-actions">
            <Button href="#collection" variant="primary" size="lg">
              Explore the Collection ↓
            </Button>
            <Button to="/genres" variant="secondary" size="lg">
              Browse Disciplines
            </Button>
          </div>
        </div>

        <div className="mmu-hero-visual" aria-hidden="true">
          <div className="hero-glow-sphere" />
          <div className="hero-floating-book book-left">
            <span>DISCOVERY & ARCHIVE</span>
          </div>
          <div className="hero-floating-book book-right">
            <span>SCHOLARLY INQUIRY</span>
          </div>
        </div>
      </section>

      {/* Magic Bento Feature Grid */}
      <section className="home-bento-section" aria-label="Library Services & Features">
        <div className="section-title-wrap">
          <span className="section-label">Academic Excellence</span>
          <h2>The MMU Scholarly Advantage</h2>
        </div>

        <MagicBento columns="3">
          <BentoCard
            icon="🏛️"
            title="Curated Archives"
            subtitle="Rich Heritage"
            badge="Physical & Digital"
          >
            <p>Thousands of peer-reviewed journals, archival manuscripts, and foundational texts.</p>
          </BentoCard>

          <BentoCard
            icon="⚡"
            title="Live Catalog Search"
            subtitle="Real-Time Systems"
            badge="Instant Access"
          >
            <p>Instant index filtering across authors, ISBN identifiers, and subject disciplines.</p>
          </BentoCard>

          <BentoCard
            icon="🌱"
            title="Open Borrowing"
            subtitle="Patron Circulation"
            badge="Community"
          >
            <p>Seamless borrowing records for all faculty and registered university scholars.</p>
          </BentoCard>
        </MagicBento>
      </section>

      {/* Catalog Collection Section */}
      <section className="mmu-catalog-section" id="collection" aria-label="Library Catalog">
        <div className="catalog-header-wrap">
          <div>
            <span className="section-label">Browse Shelf Inventory</span>
            <h2>The Book Collection</h2>
          </div>
          <span className="collection-count-badge">
            {totalBooks} {totalBooks === 1 ? 'Volume' : 'Volumes'} Available
          </span>
        </div>

        {/* Search & Genre Controls */}
        <div className="catalog-controls-bar">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            onClear={() => {
              setSearch('');
              setPage(1);
            }}
            placeholder="Search by title, author, or keyword..."
          />

          <div className="catalog-genre-chips" role="group" aria-label="Filter by genre">
            <button
              type="button"
              className={`genre-chip ${selectedGenre === '' ? 'is-active' : ''}`}
              onClick={() => {
                setSelectedGenre('');
                setPage(1);
              }}
            >
              All Shelves
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                className={`genre-chip ${selectedGenre === genre.id ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedGenre(genre.id);
                  setPage(1);
                }}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results / Grid / Error */}
        {error ? (
          <div className="catalog-error-state" role="alert">
            <span className="error-badge">!</span>
            <h3>We couldn’t access the shelves.</h3>
            <p>{error} Make sure the library backend API is active.</p>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setRetryCount((c) => c + 1)}
            >
              Retry Connection
            </Button>
          </div>
        ) : (
          <>
            <BookGrid books={books} loading={loading} />

            {/* Pagination Controls */}
            {pageCount > 1 && (
              <nav className="catalog-pagination" aria-label="Catalog pages">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← Previous
                </Button>
                <span className="page-status-text">
                  Page <strong>{page}</strong> of {pageCount}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                >
                  Next →
                </Button>
              </nav>
            )}
          </>
        )}
      </section>

      {/* Quote Banner */}
      <section className="library-proverb-banner">
        <span className="proverb-star" aria-hidden="true">✳</span>
        <blockquote>
          “The library is the temple of learning, and learning has liberated more people than all the wars in history.”
        </blockquote>
        <cite>— Carl T. Rowan</cite>
      </section>
    </div>
  );
}
