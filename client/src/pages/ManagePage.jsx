import { useState, useEffect } from 'react';
import { getGenres, createGenre } from '../api/genres';
import { createBook } from '../api/books';
import { Button } from '../components/Button';
import './ManagePage.css';

export function ManagePage() {
  const [genres, setGenres] = useState([]);
  const [genreName, setGenreName] = useState('');
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    genreId: '',
    isbn: '',
    description: '',
    publishedYear: '',
    copies: '1',
    available: '1',
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittingBook, setSubmittingBook] = useState(false);
  const [submittingGenre, setSubmittingGenre] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getGenres(controller.signal)
      .then((data) => {
        setGenres(data || []);
        if (data && data.length > 0 && !bookForm.genreId) {
          setBookForm((prev) => ({ ...prev, genreId: data[0].id }));
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [bookForm.genreId]);

  const handleCreateGenre = async (e) => {
    e.preventDefault();
    if (!genreName.trim()) return;

    setErrorMsg('');
    setSuccessMsg('');
    setSubmittingGenre(true);

    try {
      const newGenre = await createGenre(genreName.trim());
      setGenres((prev) => [...prev, newGenre]);
      setGenreName('');
      setSuccessMsg(`Discipline "${newGenre.name}" added successfully.`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create discipline.');
    } finally {
      setSubmittingGenre(false);
    }
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!bookForm.title.trim() || !bookForm.author.trim() || !bookForm.genreId) {
      setErrorMsg('Title, author, and genre are required.');
      return;
    }

    setSubmittingBook(true);

    const payload = {
      title: bookForm.title.trim(),
      author: bookForm.author.trim(),
      genreId: bookForm.genreId,
    };

    if (bookForm.isbn.trim()) payload.isbn = bookForm.isbn.trim();
    if (bookForm.description.trim()) payload.description = bookForm.description.trim();
    if (bookForm.publishedYear) payload.publishedYear = Number(bookForm.publishedYear);
    if (bookForm.copies) payload.copies = Number(bookForm.copies);
    if (bookForm.available) payload.available = Number(bookForm.available);

    try {
      const created = await createBook(payload);
      setSuccessMsg(`Book "${created.title}" successfully catalogued.`);
      setBookForm({
        title: '',
        author: '',
        genreId: genres[0]?.id || '',
        isbn: '',
        description: '',
        publishedYear: '',
        copies: '1',
        available: '1',
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to catalogue book.');
    } finally {
      setSubmittingBook(false);
    }
  };

  return (
    <div className="manage-page-container">
      <div className="manage-header">
        <span className="user-role-badge">Librarian Staff Access</span>
        <h1>Library Inventory & Catalog Management</h1>
        <p>Curate volumes, register ISBNs, and establish academic disciplines.</p>
      </div>

      {successMsg && (
        <div className="manage-alert alert-success" role="status">
          <span>✓</span> <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="manage-alert alert-error" role="alert">
          <span>!</span> <span>{errorMsg}</span>
        </div>
      )}

      <div className="manage-forms-grid">
        {/* Add Book Form */}
        <section className="manage-card" aria-label="Add Book Form">
          <h2>Catalogue New Volume</h2>
          <form onSubmit={handleCreateBook} className="manage-form">
            <div className="form-group">
              <label htmlFor="b-title">Book Title *</label>
              <input
                id="b-title"
                type="text"
                className="form-input"
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                required
                placeholder="e.g. Structure and Interpretation of Computer Programs"
              />
            </div>

            <div className="form-group">
              <label htmlFor="b-author">Author *</label>
              <input
                id="b-author"
                type="text"
                className="form-input"
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                required
                placeholder="e.g. Harold Abelson, Gerald Jay Sussman"
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="b-genre">Discipline / Genre *</label>
                <select
                  id="b-genre"
                  className="form-input"
                  value={bookForm.genreId}
                  onChange={(e) => setBookForm({ ...bookForm, genreId: e.target.value })}
                  required
                >
                  {genres.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="b-isbn">ISBN</label>
                <input
                  id="b-isbn"
                  type="text"
                  className="form-input"
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  placeholder="e.g. 978-0262510875"
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="b-year">Published Year</label>
                <input
                  id="b-year"
                  type="number"
                  className="form-input"
                  value={bookForm.publishedYear}
                  onChange={(e) => setBookForm({ ...bookForm, publishedYear: e.target.value })}
                  placeholder="1996"
                />
              </div>

              <div className="form-group">
                <label htmlFor="b-copies">Total Copies</label>
                <input
                  id="b-copies"
                  type="number"
                  min="1"
                  className="form-input"
                  value={bookForm.copies}
                  onChange={(e) => setBookForm({ ...bookForm, copies: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="b-avail">Available</label>
                <input
                  id="b-avail"
                  type="number"
                  min="0"
                  className="form-input"
                  value={bookForm.available}
                  onChange={(e) => setBookForm({ ...bookForm, available: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="b-desc">Description / Synopsis</label>
              <textarea
                id="b-desc"
                className="form-input form-textarea"
                rows="3"
                value={bookForm.description}
                onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                placeholder="Scholarly abstract or summary..."
              />
            </div>

            <Button type="submit" variant="primary" size="md" loading={submittingBook}>
              Add to Catalog
            </Button>
          </form>
        </section>

        {/* Add Genre Form */}
        <section className="manage-card" aria-label="Add Genre Form">
          <h2>Create New Discipline</h2>
          <form onSubmit={handleCreateGenre} className="manage-form">
            <div className="form-group">
              <label htmlFor="g-name">Discipline Name *</label>
              <input
                id="g-name"
                type="text"
                className="form-input"
                value={genreName}
                onChange={(e) => setGenreName(e.target.value)}
                required
                placeholder="e.g. Artificial Intelligence"
              />
            </div>

            <Button type="submit" variant="secondary" size="md" loading={submittingGenre}>
              Register Discipline
            </Button>
          </form>

          <div className="existing-genres-box">
            <h3>Registered Disciplines ({genres.length})</h3>
            <ul className="existing-genres-list">
              {genres.map((g) => (
                <li key={g.id}>
                  <span>{g.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
