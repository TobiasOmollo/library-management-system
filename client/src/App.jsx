import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BubbleMenu } from './components/BubbleMenu';
import { ScrollToHash } from './components/ScrollToHash';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import './styles/variables.css';
import './App.css';

// Lazy-loaded pages for fast initial bundle load
const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const BookDetails = lazy(() =>
  import('./pages/BookDetails').then((m) => ({ default: m.BookDetails }))
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const GenresPage = lazy(() =>
  import('./pages/GenresPage').then((m) => ({ default: m.GenresPage }))
);
const ManagePage = lazy(() =>
  import('./pages/ManagePage').then((m) => ({ default: m.ManagePage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

function AppLoadingFallback() {
  return (
    <div className="page-suspense-fallback" role="status" aria-live="polite">
      <div className="page-spinner" />
      <span className="sr-only">Loading page content…</span>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mmu-site-footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <Link to="/" className="footer-wordmark">
            <span className="footer-wordmark-icon" aria-hidden="true">M.</span>
            <span>MMU <em>Library</em></span>
          </Link>
          <p className="footer-tagline">
            Dedicated to advancing scholarship, critical inquiry, and the love of reading.
          </p>
        </div>

        <div className="footer-links-grid">
          <div className="footer-links-col">
            <h4>Collections</h4>
            <Link to="/#collection">General Catalog</Link>
            <Link to="/genres">Academic Disciplines</Link>
            <Link to="/dashboard">Patron Dashboard</Link>
          </div>

          <div className="footer-links-col">
            <h4>Access & Services</h4>
            <Link to="/login">Patron Sign In</Link>
            <Link to="/register">Register Account</Link>
            <a href="#collection">Reserve Borrowing</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span>© {new Date().getFullYear()} MMU Library Systems. All rights reserved.</span>
        <a href="#root" className="footer-back-to-top">
          Return to top ↑
        </a>
      </div>
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToHash />
        <div className="mmu-app-shell">
          <BubbleMenu />
          <main id="main-content" className="mmu-main-content">
            <Suspense fallback={<AppLoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <LoginPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicOnlyRoute>
                      <RegisterPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/books/:id" element={<BookDetails />} />
                <Route path="/genres" element={<GenresPage />} />
                <Route
                  path="/manage"
                  element={
                    <ProtectedRoute requiredRole="LIBRARIAN">
                      <ManagePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
          <SiteFooter />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
