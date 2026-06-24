import { Link, NavLink, Outlet } from 'react-router-dom';
import { mailto, siteConfig } from '../config/site';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/support', label: 'Support' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
];

const footerLinks = [
  { to: '/', label: 'Home' },
  { to: '/support', label: 'Support' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/delete-data', label: 'Delete Data' },
];

export function Layout() {
  return (
    <div className="site">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label={`${siteConfig.name} home`}>
            <img
              className="brand-logo"
              src="/logo.png"
              alt={`${siteConfig.name} logo`}
              width={56}
              height={56}
            />
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
          <div className="footer-about">
            <p className="footer-brand">{siteConfig.name}</p>
            <p className="footer-note">{siteConfig.tagline}</p>
            <p className="footer-note">No subscriptions or payments.</p>
            <a className="footer-email" href={mailto()}>
              {siteConfig.supportEmail}
            </a>
          </div>
          <div className="footer-links">
            {footerLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
            <a href={mailto()}>Contact</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>
            © {new Date().getFullYear()} {siteConfig.companyName}. Generated plans are planning
            drafts. Verify pricing, permits, and safety with qualified professionals.
          </p>
        </div>
      </footer>
    </div>
  );
}
