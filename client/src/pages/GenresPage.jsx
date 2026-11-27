import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGenres } from '../api/genres';
import { MagicBento, BentoCard } from '../components/MagicBento';
import { Button } from '../components/Button';
import './GenresPage.css';

export function GenresPage() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getGenres(controller.signal)
      .then((data) => setGenres(data || []))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Unable to load disciplines.');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const handleGenreSelect = (genreId) => {
    navigate(`/#collection`, { state: { selectedGenreId: genreId } });
  };

  return (
    <div className="genres-page-container">
      <div className="genres-page-header">
        <span className="section-label">Classification System</span>
        <h1>Academic Disciplines & Genres</h1>
        <p>Explore specialized collections curated across academic faculties.</p>
      </div>

      {loading ? (
        <div className="genres-loading-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="genres-skeleton-card" />
          ))}
        </div>
      ) : error ? (
        <div className="genres-error-state" role="alert">
          <p>{error}</p>
          <Button variant="secondary" size="md" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : (
        <MagicBento columns="3">
          {genres.map((genre) => (
            <BentoCard
              key={genre.id}
              icon="🏷️"
              title={genre.name}
              subtitle="Discipline"
              badge="Explore"
              interactive
              onClick={() => handleGenreSelect(genre.id)}
            >
              <p className="genre-card-desc">
                Curated literature and reference works categorized under {genre.name}.
              </p>
              <div className="genre-card-action">
                <span>View titles in catalog</span>
                <span aria-hidden="true">→</span>
              </div>
            </BentoCard>
          ))}
        </MagicBento>
      )}
    </div>
  );
}
