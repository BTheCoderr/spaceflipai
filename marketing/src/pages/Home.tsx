import { Link } from 'react-router-dom';
import { AudienceCards } from '../components/AudienceCards';
import { PdfValueSection } from '../components/PdfValueSection';
import { PositioningSection } from '../components/PositioningSection';
import { ProductFlow } from '../components/ProductFlow';
import { ScreenshotMockups } from '../components/ScreenshotMockups';
import { TrustSection } from '../components/TrustSection';
import { mailto, siteConfig } from '../config/site';
import { usePageMeta } from '../hooks/usePageMeta';

const features = [
  {
    title: 'AI-generated upgrade plans',
    body: 'Practical planning drafts based on your property photo and project goals.',
  },
  {
    title: 'Project guides',
    body: 'Guides that route you into the Visualize workflow by project type.',
  },
  {
    title: 'Saved projects',
    body: 'Keep plans organized for repeat visits, exports, and handoffs.',
  },
  {
    title: 'Clear, honest plans',
    body: 'Practical upgrade plans, budgets, and checklists you can hand to clients and contractors.',
  },
];

export function HomePage() {
  usePageMeta({
    title: 'AI Property Upgrade Plans',
    description: siteConfig.description,
    path: '/',
  });

  return (
    <>
      <section className="hero hero-strong">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="hero-kicker">SpaceFlip Pro</p>
            <h1>AI upgrade plans for properties and spaces</h1>
            <p className="hero-subhead">
              Upload a property photo, generate a practical upgrade plan, and export a
              client-ready PDF with budget, materials, checklist, and contractor notes.
            </p>
            <p className="hero-audience">
              Built for Airbnb hosts, landlords, realtors, contractors, and small businesses.
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
              <a className="btn btn-secondary" href={mailto()}>
                Contact support
              </a>
            </div>
            {!siteConfig.appStoreLive ? (
              <p className="coming-soon-note">
                App Store listing is in preparation. Support, privacy, and terms pages are live
                for App Store Connect.
              </p>
            ) : null}
          </div>

          <div className="hero-card hero-card-accent">
            <h2>What you get</h2>
            <ul>
              <li>Structured upgrade plan from a property photo</li>
              <li>Budget range, materials, and priority checklist</li>
              <li>PDF export for client and contractor handoff</li>
              <li>Your original property photo shown alongside the plan</li>
            </ul>
            <p className="hero-card-note">No subscriptions or payments.</p>
          </div>
        </div>
      </section>

      <ProductFlow />
      <ScreenshotMockups />
      <AudienceCards />
      <PdfValueSection />
      <PositioningSection />

      <section className="section">
        <div className="container">
          <h2 className="section-title">Core capabilities</h2>
          <p className="section-lead">Available in the SpaceFlip Pro mobile app today.</p>
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

      <TrustSection />

      <section className="section section-cta">
        <div className="container">
          <div className="card cta-card">
            <h2>Questions before launch?</h2>
            <p>
              Visit <Link to="/support">Support</Link> or email{' '}
              <a href={mailto()}>{siteConfig.supportEmail}</a>.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/support">
                Go to Support
              </Link>
              <Link className="btn btn-secondary" to="/privacy">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
