import { Link, NavLink, Outlet } from 'react-router-dom';
import { siteConfig } from '../config/site';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/support', label: 'Support' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
];

export function Layout() {
  return (
    <div className="site">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">SF</span>
            <span className="brand-text">{siteConfig.name}</span>
          </Link>
          <nav className="nav" aria-label="Main">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <p className="footer-brand">{siteConfig.name}</p>
            <p className="footer-note">MVP testing mode — payments are not active.</p>
          </div>
          <div className="footer-links">
            <Link to="/support">Support</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/delete-data">Delete Data</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>© {new Date().getFullYear()} {siteConfig.companyName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
