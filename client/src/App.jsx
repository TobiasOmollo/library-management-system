import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const PAGE_SIZE = 12

async function fetchApi(path, signal) {
  const response = await fetch(`${API_URL}${path}`, { signal })
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}). Please try again.`)
  }
  return response.json()
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  )
}

function BookMark({ number = 0, large = false }) {
  return (
    <div className={`book-mark cover-${number % 5}${large ? ' book-mark-large' : ''}`} aria-hidden="true">
      <span className="cover-rule" />
      <span className="cover-sun" />
      <span className="cover-lines">
        <i />
        <i />
        <i />
      </span>
      <span className="cover-spine" />
    </div>
  )
}

function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" to="/" aria-label="Folio home">
        <span className="wordmark-icon" aria-hidden="true">f.</span>
        <span>folio<span className="wordmark-period">.</span></span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link className="nav-active" to="/">Discover</Link>
        <a href="#collection">The collection</a>
      </nav>
      <a className="header-note" href="#collection">
        <span className="status-dot" />
        Your next great read awaits
      </a>
    </header>
  )
}

function BookCard({ book, index }) {
  return (
    <Link className="book-card" to={`/books/${book.id}`}>
      <BookMark number={index} />
      <div className="book-card-body">
        <div className="book-meta">
          <span>{book.genre?.name || 'From the collection'}</span>
          {book.publishedYear && <span>{book.publishedYear}</span>}
        </div>
        <h3>{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        <div className="card-footer">
          <span className="availability">
            <span className={`availability-dot${book.available === 0 ? ' unavailable' : ''}`} />
            {book.available === 0 ? 'Checked out' : 'Available to borrow'}
          </span>
          <span className="card-arrow" aria-hidden="true">↗</span>
        </div>
      </div>
    </Link>
  )
}

function CatalogPage() {
  const [genres, setGenres] = useState([])
  const [genreError, setGenreError] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [page, setPage] = useState(1)
  const [catalogResult, setCatalogResult] = useState(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()
    fetchApi('/genres', controller.signal)
      .then(setGenres)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setGenreError(requestError.message)
      })
    return () => controller.abort()
  }, [])

  const requestKey = JSON.stringify([debouncedSearch, selectedGenre, page, retry])

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    })
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (selectedGenre) params.set('genreId', selectedGenre)

    fetchApi(`/books?${params}`, controller.signal)
      .then((result) => setCatalogResult({ key: requestKey, books: result.data, total: result.total }))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setCatalogResult({ key: requestKey, books: [], total: 0, error: requestError.message })
        }
      })
    return () => controller.abort()
  }, [debouncedSearch, page, requestKey, selectedGenre])

  const loading = catalogResult?.key !== requestKey
  const error = loading ? '' : catalogResult?.error || ''
  const books = loading ? [] : catalogResult?.books || []
  const total = loading ? 0 : catalogResult?.total || 0

  function chooseGenre(genreId) {
    setSelectedGenre(genreId)
    setPage(1)
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> A little more wonder, one page at a time</p>
          <h1>Find a story<br />that <em>stays</em> with you.</h1>
          <p className="hero-description">
            Thoughtfully collected books for curious minds, quiet afternoons, and everywhere in between.
          </p>
          <a className="hero-link" href="#collection">Explore the shelves <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-sun" />
          <div className="hero-book hero-book-back"><span>THE<br />WILD<br />PLACES</span></div>
          <div className="hero-book hero-book-front"><span>A FIELD<br />GUIDE TO<br /><b>WONDER</b></span></div>
          <span className="hero-spark spark-one">✳</span>
          <span className="hero-spark spark-two">✳</span>
          <span className="art-caption">a world between<br />the covers</span>
        </div>
        <div className="hero-index"><span>01</span><i /> THE LIBRARY, REIMAGINED</div>
      </section>

      <section className="catalog" id="collection">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">A good place to begin</p>
            <h2>Explore the collection<span>.</span></h2>
          </div>
          <span className="collection-count">{total} {total === 1 ? 'book' : 'books'} to discover</span>
        </div>

        <div className="catalog-controls">
          <div className="genre-list" aria-label="Filter by genre">
            <button
              className={`genre-chip${selectedGenre === '' ? ' selected' : ''}`}
              onClick={() => chooseGenre('')}
              type="button"
            >
              All books
            </button>
            {genres.map((genre) => (
              <button
                className={`genre-chip${selectedGenre === genre.id ? ' selected' : ''}`}
                key={genre.id}
                onClick={() => chooseGenre(genre.id)}
                type="button"
              >
                {genre.name}
              </button>
            ))}
          </div>
          <label className="search-box">
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search title or author"
              aria-label="Search books by title or author"
            />
            {search && (
              <button className="clear-search" type="button" onClick={() => setSearch('')} aria-label="Clear search">
                ×
              </button>
            )}
          </label>
        </div>
        {genreError && <p className="inline-notice" role="status">{genreError} Genre filters may be unavailable.</p>}

        {error ? (
          <div className="state-panel error-panel" role="alert">
            <span className="state-icon">!</span>
            <h3>We couldn’t load the shelves.</h3>
            <p>{error} Make sure the library API is running, then try again.</p>
            <button className="text-button" type="button" onClick={() => setRetry((current) => current + 1)}>Try again <span>↗</span></button>
          </div>
        ) : loading ? (
          <div className="loading-grid" aria-label="Loading books">
            {Array.from({ length: 6 }, (_, index) => <div className="loading-card" key={index}><span /><div /></div>)}
          </div>
        ) : books.length ? (
          <>
            <div className="book-grid">
              {books.map((book, index) => <BookCard book={book} index={(page - 1) * PAGE_SIZE + index} key={book.id} />)}
            </div>
            {pageCount > 1 && (
              <nav className="pagination" aria-label="Catalog pages">
                <button type="button" onClick={() => setPage((current) => current - 1)} disabled={page === 1}>← Previous</button>
                <span>Page <b>{page}</b> of {pageCount}</span>
                <button type="button" onClick={() => setPage((current) => current + 1)} disabled={page === pageCount}>Next →</button>
              </nav>
            )}
          </>
        ) : (
          <div className="state-panel empty-panel">
            <span className="state-icon">⌕</span>
            <h3>No stories found.</h3>
            <p>Try a different title, author, or genre and we’ll look again.</p>
            <button className="text-button" type="button" onClick={() => { setSearch(''); chooseGenre('') }}>Clear filters <span>↗</span></button>
          </div>
        )}
      </section>

      <section className="closing-note">
        <span className="closing-asterisk">✳</span>
        <p>Take your time. The right book has a way of finding you.</p>
        <span className="closing-caption">A NOTE FROM THE LIBRARY</span>
      </section>
    </>
  )
}

function BookDetailPage() {
  const { id } = useParams()
  const [detailResult, setDetailResult] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchApi(`/books/${encodeURIComponent(id)}`, controller.signal)
      .then((book) => setDetailResult({ id, book }))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setDetailResult({ id, error: requestError.message })
      })
    return () => controller.abort()
  }, [id])

  const loading = detailResult?.id !== id
  const book = loading ? null : detailResult?.book
  const error = loading ? '' : detailResult?.error || ''

  if (loading) {
    return <main className="detail-state"><div className="detail-loading" /><p>Finding your book…</p></main>
  }

  if (error || !book) {
    return (
      <main className="detail-state">
        <span className="state-icon">!</span>
        <h1>{error ? 'This page is taking a moment.' : 'We couldn’t find that book.'}</h1>
        <p>{error || 'It may have moved to another shelf.'}</p>
        <Link className="back-link" to="/">← Back to the collection</Link>
      </main>
    )
  }

  return (
    <main className="book-detail">
      <Link className="back-link" to="/">← Back to the collection</Link>
      <div className="detail-layout">
        <div className="detail-cover-wrap">
          <BookMark number={(book.title.length + book.author.length) % 5} large />
          <span className="detail-cover-note">PICKED FOR THE CURIOUS</span>
        </div>
        <article className="detail-copy">
          <p className="eyebrow">{book.genre?.name || 'From the collection'}{book.publishedYear ? ` · ${book.publishedYear}` : ''}</p>
          <h1>{book.title}</h1>
          <p className="detail-author">by {book.author}</p>
          <div className="detail-divider" />
          <p className="detail-description">{book.description || 'A new story is waiting between these covers. Visit the library to discover where it takes you.'}</p>
          <div className="detail-facts">
            {book.isbn && <div><span>ISBN</span><b>{book.isbn}</b></div>}
            {book.publishedYear && <div><span>Published</span><b>{book.publishedYear}</b></div>}
            {book.copies != null && <div><span>In the library</span><b>{book.copies} {book.copies === 1 ? 'copy' : 'copies'}</b></div>}
          </div>
          <div className={`detail-availability${book.available === 0 ? ' is-unavailable' : ''}`}>
            <span className="availability-dot" />
            {book.available === 0 ? 'All copies are currently borrowed' : `${book.available ?? 1} ${book.available === 1 ? 'copy' : 'copies'} available to borrow`}
          </div>
        </article>
      </div>
      <div className="detail-footnote"><span>FOLIO LIBRARY</span><i /> GOOD BOOKS, GOOD COMPANY</div>
    </main>
  )
}

function AppLayout() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="*" element={<main className="detail-state"><h1>That page isn’t on our shelves.</h1><Link className="back-link" to="/">← Back to the collection</Link></main>} />
      </Routes>
      <footer className="site-footer">
        <Link className="wordmark footer-wordmark" to="/"><span className="wordmark-icon" aria-hidden="true">f.</span><span>folio<span className="wordmark-period">.</span></span></Link>
        <span>Made for the love of reading.</span>
        <a href="#collection">Find your next read ↑</a>
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
