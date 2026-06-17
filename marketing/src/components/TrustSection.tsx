import { Link } from 'react-router-dom';
import { mailto, siteConfig } from '../config/site';

const trustItems = [
  'No subscription is active in the MVP build.',
  'Concept images are planning references, not final renders.',
  'AI generation may fall back to demo plans if a provider or network issue occurs.',
  'You can delete saved projects in the app or request data deletion by email.',
  `Support is available at ${siteConfig.supportEmail}.`,
];

export function TrustSection() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Transparency</h2>
        <p className="section-lead">
          SpaceFlip Pro is in MVP testing. We prefer honest product copy over hype.
        </p>
        <ul className="trust-list">
          {trustItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="trust-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Use</Link>
          <Link to="/delete-data">Delete Data</Link>
          <a href={mailto()}>Contact support</a>
        </div>
      </div>
    </section>
  );
}
