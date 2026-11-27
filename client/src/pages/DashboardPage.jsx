import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { getBooks } from '../api/books';
import { getGenres } from '../api/genres';
import { MagicBento, BentoCard } from '../components/MagicBento';
import { AccordionGallery } from '../components/AccordionGallery';
import { SearchBar } from '../components/SearchBar';
import { Button } from '../components/Button';
import './DashboardPage.css';

export function DashboardPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const limit = 10;

  // Load genres once
  useEffect(() => {
    const controller = new AbortController();
    getGenres(controller.signal)
      .then((data) => setGenres(data || []))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Load paginated books with search and genre filter
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    const debounceTimer = setTimeout(() => {
      getBooks({ page, limit, q: search, genreId: selectedGenre }, controller.signal)
        .then((result) => {
          setBooks(result.data || []);
          setTotalBooks(result.total || 0);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setError(err.message || 'Unable to retrieve books.');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [page, search, selectedGenre]);

  const totalPages = Math.max(1, Math.ceil(totalBooks / limit));
  const availableBooksCount = books.filter((b) => b.available > 0).length;

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="dashboard-user-greeting">
            <span className="user-role-badge">
              {user?.role === 'LIBRARIAN' ? 'Staff Portal' : 'Patron Account'}
            </span>
            <h1>
              Welcome, <em>{user?.name || user?.email?.split('@')[0]}</em>.
            </h1>
            <p className="dashboard-subtitle">
              Browse the library inventory, reserve titles, or view your collection status.
            </p>
          </div>
        </div>
      </section>

      {/* Magic Bento: Quick Stats Grid */}
      <section className="dashboard-section" aria-label="Library Overview Stats">
        <h2 className="section-heading">Library At A Glance</h2>
        <MagicBento columns="4">
          <BentoCard
            icon="📚"
            title={`${totalBooks}`}
            subtitle="Catalog Inventory"
            badge="Total"
          >
            <p className="bento-stat-description">Total books indexed in this active query view.</p>
          </BentoCard>

          <BentoCard
            icon="✨"
            title={`${availableBooksCount} / ${books.length}`}
            subtitle="Shelf Availability"
            badge="Live"
          >
            <p className="bento-stat-description">Titles ready for immediate borrowing on this page.</p>
          </BentoCard>

          <BentoCard
            icon="🏷️"
            title={`${genres.length}`}
            subtitle="Disciplines & Genres"
            badge="Categories"
          >
            <p className="bento-stat-description">Academic fields and literary genres preserved.</p>
          </BentoCard>

          <BentoCard
            icon="🛡️"
            title={user?.role === 'LIBRARIAN' ? 'Librarian' : 'Member'}
            subtitle="Circulation Status"
            badge="Active"
          >
            <p className="bento-stat-description">
              {user?.role === 'LIBRARIAN'
                ? 'Full administrative privileges enabled.'
                : 'Standard patron borrowing privileges enabled.'}
            </p>
          </BentoCard>
        </MagicBento>
      </section>

      {/* Accordion Gallery Section */}
      <section className="dashboard-section" aria-label="Featured Accordion Gallery">
        <div className="section-header-row">
          <div>
            <h2 className="section-heading">Interactive Book Showcase</h2>
            <p className="section-subtext">Hover or focus to expand individual book panels.</p>
          </div>
          <span className="gallery-count-pill">{books.length} Shown</span>
        </div>

        {loading ? (
          <div className="gallery-loading-placeholder">
            <div className="gallery-skeleton-pulse" />
          </div>
        ) : error ? (
          <div className="dashboard-error-card" role="alert">
            <span className="error-icon">!</span>
            <p>{error}</p>
          </div>
        ) : (
          <AccordionGallery books={books} />
        )}
      </section>

      {/* Filter and Search Controls */}
      <section className="dashboard-section" aria-label="Catalogue Controls and Pagination">
        <div className="catalog-toolbar">
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
            placeholder="Search by title or author in gallery..."
          />

          <div className="genre-filter-cluster">
            <button
              type="button"
              className={`genre-bubble-btn ${selectedGenre === '' ? 'is-selected' : ''}`}
              onClick={() => {
                setSelectedGenre('');
                setPage(1);
              }}
            >
              All Genres
            </button>
            {genres.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`genre-bubble-btn ${selectedGenre === g.id ? 'is-selected' : ''}`}
                onClick={() => {
                  setSelectedGenre(g.id);
                  setPage(1);
                }}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <nav className="dashboard-pagination" aria-label="Gallery Pagination">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </Button>
            <span className="page-indicator">
              Page <strong>{page}</strong> of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </Button>
          </nav>
        )}
      </section>
    </div>
  );
}
