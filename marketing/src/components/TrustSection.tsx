import { Link } from 'react-router-dom';
import { mailto, siteConfig } from '../config/site';

const trustItems = [
  'No account or password required — start in a private guest workspace.',
  'No subscriptions or payments.',
  'Your original property photo is shown alongside the generated plan.',
  'Plans are AI-assisted planning drafts to verify with qualified professionals.',
  'Delete your guest workspace and data anytime in the app (Settings) or via the Delete Data page.',
  `Support is available at ${siteConfig.supportEmail}.`,
];

export function TrustSection() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Transparency</h2>
        <p className="section-lead">
          We prefer honest product copy over hype.
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
