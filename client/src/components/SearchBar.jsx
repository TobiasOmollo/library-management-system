import './SearchBar.css';

export function SearchBar({ value, onChange, placeholder = 'Search by title, author...', onClear }) {
  return (
    <div className="mmu-search-bar">
      <span className="search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </span>
      <input
        type="search"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={onClear}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
