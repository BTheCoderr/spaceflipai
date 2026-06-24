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
        <strong>How it works</strong>
        <p>
          SpaceFlip Pro generates AI-assisted upgrade plans, budgets, materials, checklists, and
          PDF exports from your property photo. There are no subscriptions or payments. Plans are
          planning drafts to verify with qualified professionals.
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
        priority checklist, contractor notes, and your original property photo.
      </p>
    ),
  },
  {
    question: 'Does the app generate design images?',
    answer: (
      <p>
        The current version focuses on practical upgrade plans, budgets, materials, checklists, and
        PDF handoff documents. Your original property photo is shown alongside the plan. Final
        design, pricing, and construction should be verified with qualified professionals.
      </p>
    ),
  },
  {
    question: 'Is there a subscription?',
    answer: (
      <p>
        No. SpaceFlip Pro has no subscriptions, payments, or in-app purchases.
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
    question: 'What if AI generation is briefly unavailable?',
    answer: (
      <p>
        If a provider or network issue occurs, the app still prepares an upgrade plan from your
        project details so you can review every tab and export a PDF. Your original property photo
        is always shown alongside the plan.
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
