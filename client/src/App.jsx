import { Link, NavLink, Route, Routes } from 'react-router-dom';
import FlashMessage from './components/FlashMessage.jsx';
import TicketListPage from './pages/TicketListPage.jsx';
import NewTicketPage from './pages/NewTicketPage.jsx';
import TicketDetailPage from './pages/TicketDetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="brand">
            Support Desk
          </Link>
          <nav className="site-nav" aria-label="Main">
            <NavLink to="/" end className="nav-link">
              All tickets
            </NavLink>
            <Link to="/tickets/new" className="button button--primary">
              New ticket
            </Link>
          </nav>
        </div>
      </header>

      <main className="container main">
        <FlashMessage />
        <Routes>
          <Route path="/" element={<TicketListPage />} />
          <Route path="/tickets/new" element={<NewTicketPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
