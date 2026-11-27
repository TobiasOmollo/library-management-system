import { Button } from '../components/Button';
import './NotFoundPage.css';

export function NotFoundPage() {
  return (
    <div className="notfound-page-container">
      <div className="notfound-card">
        <span className="notfound-badge">404</span>
        <h1>Page not on our shelves</h1>
        <p>
          The page or academic archive you were looking for could not be located.
          It may have been moved, updated, or removed from the catalog.
        </p>
        <div className="notfound-actions">
          <Button to="/" variant="primary" size="md">
            Return to Library Home
          </Button>
          <Button to="/#collection" variant="secondary" size="md">
            Explore Collection
          </Button>
        </div>
      </div>
    </div>
  );
}
