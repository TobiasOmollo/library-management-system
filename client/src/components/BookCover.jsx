import './BookCover.css';

const COVER_THEMES = [
  { bg: 'linear-gradient(145deg, #0a2540 0%, #1e3a8a 100%)', text: '#e0f2fe', accent: '#38bdf8' },
  { bg: 'linear-gradient(145deg, #1e1b4b 0%, #3730a3 100%)', text: '#ede9fe', accent: '#a78bfa' },
  { bg: 'linear-gradient(145deg, #064e3b 0%, #047857 100%)', text: '#d1fae5', accent: '#34d399' },
  { bg: 'linear-gradient(145deg, #701a75 0%, #a21caf 100%)', text: '#fce7f3', accent: '#f472b6' },
  { bg: 'linear-gradient(145deg, #78350f 0%, #b45309 100%)', text: '#fef3c7', accent: '#fbbf24' },
  { bg: 'linear-gradient(145deg, #0f172a 0%, #334155 100%)', text: '#f1f5f9', accent: '#94a3b8' },
];

/**
 * Deterministic hash function for book ID to maintain 100% consistent cover styling.
 */
function getThemeForId(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COVER_THEMES.length;
  return COVER_THEMES[index];
}

export function BookCover({
  book = {},
  large = false,
  className = '',
}) {
  const theme = getThemeForId(book.id || book.title || 'mmu-book');

  return (
    <div
      className={`mmu-book-cover ${large ? 'cover-large' : ''} ${className}`}
      style={{
        background: theme.bg,
        color: theme.text,
      }}
      aria-hidden="true"
    >
      <div className="cover-spine" />
      <div className="cover-inner">
        <div className="cover-top-motif">
          <span className="motif-dot" style={{ backgroundColor: theme.accent }} />
          <span className="motif-line" style={{ backgroundColor: theme.accent }} />
        </div>
        <div className="cover-typography">
          <p className="cover-title-text">{book.title || 'Untitled Book'}</p>
          <p className="cover-author-text">{book.author ? `by ${book.author}` : 'MMU Collection'}</p>
        </div>
        <div className="cover-bottom-rule">
          <span className="cover-seal">MMU</span>
        </div>
      </div>
    </div>
  );
}
