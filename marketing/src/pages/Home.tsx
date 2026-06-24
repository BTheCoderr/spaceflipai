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

const earlyAccessMailto = mailto('SpaceFlip Pro — Early Access');

export function HomePage() {
  usePageMeta({
    title: 'Turn property photos into upgrade plans',
    description: siteConfig.description,
    path: '/',
  });

  return (
    <>
      <section className="hero hero-strong">
        <div className="container hero-centered">
          <img
            className="hero-logo"
            src="/logo.png"
            alt={`${siteConfig.name} logo`}
            width={128}
            height={128}
          />
          <p className="hero-kicker">SpaceFlip Pro</p>
          <h1>Turn property photos into practical upgrade plans</h1>
          <p className="hero-subhead">
            Upload a property photo and get a budget, materials list, checklist, and PDF handoff
            for your next upgrade.
          </p>
          <p className="hero-audience">
            Built for Airbnb hosts, landlords, realtors, contractors, landscapers, and small
            business owners.
          </p>
          <div className="hero-actions hero-actions-centered">
            <a className="btn btn-primary" href={earlyAccessMailto}>
              Join Early Access
            </a>
            <a className="btn btn-secondary" href="#how-it-works">
              See How It Works
            </a>
          </div>
          <p className="hero-beta-note">
            SpaceFlip Pro is preparing for early access. We’re working with property owners and
            operators to improve practical upgrade planning workflows.
          </p>

          <div className="hero-card hero-card-accent hero-card-centered">
            <h2>What you get</h2>
            <ul>
              <li>A practical upgrade plan from a property photo</li>
              <li>Budget range, materials, and a priority checklist</li>
              <li>PDF handoff for clients, contractors, and assistants</li>
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
          <p className="section-lead">The practical building blocks behind every SpaceFlip Pro plan.</p>
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
