import { Link } from 'react-router-dom';
import { siteConfig } from '../config/site';

const audiences = [
  'Airbnb hosts',
  'Landlords',
  'Realtors',
  'Contractors',
  'Small businesses',
  'Offices',
  'Retail and storefronts',
  'Landscapers / exterior upgrade planning',
];

const features = [
  {
    title: 'AI-generated upgrade plans',
    body: 'Practical planning drafts based on your property photo and project goals.',
  },
  {
    title: 'Budget ranges',
    body: 'Helpful budget bands to frame decisions — not final contractor quotes.',
  },
  {
    title: 'Materials list',
    body: 'Suggested materials to discuss with trades and suppliers.',
  },
  {
    title: 'Priority checklist',
    body: 'Ordered next steps for staging, renovation, or tenant-ready upgrades.',
  },
  {
    title: 'Contractor / client notes',
    body: 'Scope-style notes you can share in planning conversations.',
  },
  {
    title: 'PDF export',
    body: 'Export a client-ready planning PDF from saved results.',
  },
  {
    title: 'Saved projects',
    body: 'Keep plans organized for repeat visits and handoffs.',
  },
  {
    title: 'Business advisor agents',
    body: 'Preview-only business advisors that route into Visualize workflows.',
  },
];

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="gold-accent" style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>
              SpaceFlip Pro
            </p>
            <h1>AI upgrade plans for properties and spaces</h1>
            <p>
              Upload a property photo, generate a practical upgrade plan, and export a
              client-ready PDF.
            </p>
            <div className="hero-actions">
              {siteConfig.appStoreLive ? (
                <a
                  className="btn btn-primary"
                  href={siteConfig.appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download on the App Store
                </a>
              ) : (
                <span className="btn btn-disabled" aria-disabled="true">
                  Coming soon on the App Store
                </span>
              )}
              <Link className="btn btn-secondary" to="/support">
                Get Support
              </Link>
            </div>
            {!siteConfig.appStoreLive ? (
              <p className="coming-soon-note">
                App Store listing is in preparation. Support and legal pages are available now
                for App Store Connect.
              </p>
            ) : null}
          </div>

          <div className="hero-card">
            <h2>Built for business use</h2>
            <ul>
              <li>Property and commercial upgrade planning</li>
              <li>Honest MVP labeling for concept references</li>
              <li>No payments active in the current build</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Who it is for</h2>
          <p className="section-lead">
            SpaceFlip Pro helps operators and professionals turn property photos into
            actionable planning drafts.
          </p>
          <div className="chips">
            {audiences.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <p className="section-lead">
            Core MVP capabilities available in the mobile app today.
          </p>
          <div className="grid-2">
            {features.map((feature) => (
              <div key={feature.title} className="card">
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="notice">
            <strong>Honest MVP note</strong>
            <p>
              Concept images are planning references, not final renders. Final pricing, safety,
              permits, and design decisions should be verified with qualified professionals.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              Payments are not active in the current MVP build. Advisor chat is preview-only and
              routes into Visualize planning workflows.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card contact-box">
            <h3>Need help?</h3>
            <p>
              Visit our{' '}
              <Link to="/support">Support page</Link> or email{' '}
              <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
