import { Link } from 'react-router-dom';
import { Card, FaqItem, PageShell } from '../components/PageShell';
import { mailto, siteConfig } from '../config/site';
import { usePageMeta } from '../hooks/usePageMeta';

export function SupportPage() {
  usePageMeta({
    title: 'Support',
    description:
      'SpaceFlip Pro support, FAQs, contact email, and help with upgrade plans, PDF export, and data deletion.',
    path: '/support',
  });

  return (
    <PageShell
      title="SpaceFlip Pro Support"
      subtitle="Help, FAQs, and contact information for the SpaceFlip Pro mobile app."
    >
      <Card className="contact-box contact-highlight">
        <h3>Contact support</h3>
        <p>
          Email{' '}
          <a href={mailto()}>{siteConfig.supportEmail}</a>{' '}
          for app help, bug reports, or account data questions.
        </p>
        <p className="contact-meta">
          Response time: {siteConfig.supportResponseTime}.
        </p>
        <p className="contact-meta">
          Planned support inbox: {siteConfig.supportEmailFuture}
        </p>
      </Card>

      <div className="legal-links-row">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Use</Link>
        <Link to="/delete-data">Delete Data</Link>
      </div>

      <h2 className="section-title faq-heading">Frequently asked questions</h2>
      <div className="faq-grid">
        {faqItems.map((item) => (
          <Card key={item.question} className="faq-card">
            <FaqItem question={item.question} answer={item.answer} />
          </Card>
        ))}
      </div>

      <div className="notice" style={{ marginTop: '1.5rem' }}>
        <strong>MVP transparency</strong>
        <p>
          Payments are not active yet. Advisor chat is preview-only. Concept images are planning
          references. AI generation may fall back to demo plans if a provider or network issue
          occurs.
        </p>
      </div>
    </PageShell>
  );
}

const faqItems = [
  {
    question: 'What is SpaceFlip Pro?',
    answer: (
      <p>
        SpaceFlip Pro is a mobile app for property and commercial upgrade planning. Upload a
        property photo, choose a project type and goal, and generate a structured upgrade plan
        you can save or export as a PDF.
      </p>
    ),
  },
  {
    question: 'How do I generate an upgrade plan?',
    answer: (
      <p>
        Open Visualize, choose a project type (Airbnb, office, retail, landscape, and more),
        upload a photo, select a goal, and continue to generate your plan. The app creates a
        structured result with budget ranges, materials, checklist items, and notes.
      </p>
    ),
  },
  {
    question: 'What does the PDF include?',
    answer: (
      <p>
        Exported PDFs include your project details, upgrade summary, budget range, materials,
        priority checklist, contractor notes, and labeled property photos. Concept images are
        marked as planning references.
      </p>
    ),
  },
  {
    question: 'Are concept images final designs?',
    answer: (
      <p>
        No. Concept images are planning references only — not final renders or guaranteed design
        outcomes. Final design, pricing, and construction should be verified with qualified
        professionals.
      </p>
    ),
  },
  {
    question: 'Is there a subscription?',
    answer: (
      <p>
        No. Payments and subscriptions are not active in the current MVP build. The app is in MVP
        testing mode.
      </p>
    ),
  },
  {
    question: 'How do I delete a saved project?',
    answer: (
      <p>
        Open Projects, tap a saved project, and use Delete Project on the project detail screen.
        This removes the saved project record from your data in the app backend.
      </p>
    ),
  },
  {
    question: 'How do I request data deletion?',
    answer: (
      <p>
        Email{' '}
        <a href={mailto('SpaceFlip Pro Data Deletion Request')}>
          {siteConfig.supportEmail}
        </a>{' '}
        with the subject line &quot;SpaceFlip Pro Data Deletion Request.&quot; See our{' '}
        <Link to="/delete-data">Delete Data page</Link> for details.
      </p>
    ),
  },
  {
    question: 'Why did I get a Demo/Fallback plan?',
    answer: (
      <p>
        If AI generation is temporarily unavailable (network issue, provider limit, or service
        error), the app may show a demo or fallback planning draft so you can still review the
        workflow. The Result screen notes when a fallback plan was used.
      </p>
    ),
  },
  {
    question: 'Who should use this app?',
    answer: (
      <p>
        SpaceFlip Pro is designed for Airbnb hosts, landlords, realtors, contractors, small
        businesses, offices, retail storefronts, and anyone planning practical property or space
        upgrades. It provides planning drafts — not licensed architectural, engineering, or legal
        advice.
      </p>
    ),
  },
];
