import { PageShell } from '../components/PageShell';
import { mailto, siteConfig } from '../config/site';
import { usePageMeta } from '../hooks/usePageMeta';

export function TermsPage() {
  usePageMeta({
    title: 'Terms of Use',
    description:
      'SpaceFlip Pro Terms of Use — MVP testing mode, planning drafts, concept references, and user responsibilities.',
    path: '/terms',
  });

  return (
    <PageShell
      title="Terms of Use"
      subtitle={`Effective date: ${siteConfig.effectiveDate}`}
    >
      <div className="prose card">
        <p>
          These Terms of Use (&quot;Terms&quot;) govern your use of the SpaceFlip Pro mobile app
          and related services provided by {siteConfig.companyName}. By using the app, you agree to
          these Terms.
        </p>

        <h2>MVP testing mode</h2>
        <p>
          SpaceFlip Pro is currently offered in MVP testing mode. Features, availability, and
          output quality may change. Payments and subscriptions are not active in the current
          build.
        </p>

        <h2>No payments or subscriptions</h2>
        <p>
          The current MVP build does not process payments or manage active subscriptions. Any
          future paid features will be disclosed separately before activation.
        </p>

        <h2>Planning drafts, not professional advice</h2>
        <p>
          AI-generated upgrade plans are planning drafts for discussion and organization. They are
          not architectural, engineering, legal, financial, or construction advice. You are
          responsible for verifying pricing, permits, safety requirements, and code compliance
          with qualified professionals before starting work.
        </p>

        <h2>Concept images</h2>
        <p>
          Concept images shown in the app and exported PDFs are planning references only. They are
          not final designs, guaranteed outcomes, or real AI renders of finished work.
        </p>

        <h2>Your content</h2>
        <p>
          You are responsible for the photos and information you upload. You represent that you
          have the right to use and upload that content for planning purposes. Do not upload
          unlawful, infringing, or harmful content.
        </p>

        <h2>Service availability</h2>
        <p>
          We strive to keep SpaceFlip Pro available, but service may be interrupted, limited, or
          changed without notice. AI generation may fall back to demo or fallback plans when a
          provider or network issue occurs. Advisor chat is preview-only in the current MVP.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>Use the app for lawful property and business planning purposes</li>
          <li>Do not attempt to reverse engineer, abuse, or disrupt the service</li>
          <li>Do not rely on the app as a substitute for licensed professional review</li>
        </ul>

        <h2>Disclaimer of warranties</h2>
        <p>
          The app and all outputs are provided &quot;as is&quot; and &quot;as available&quot;
          without warranties of any kind, express or implied, including fitness for a particular
          purpose or accuracy of AI-generated content.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {siteConfig.companyName} will not be liable for
          indirect, incidental, special, consequential, or punitive damages arising from your use
          of the app or reliance on generated plans or concept references.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these Terms from time to time. Continued use after changes are posted
          constitutes acceptance of the updated Terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these Terms? Contact{' '}
          <a href={mailto('SpaceFlip Pro Terms Question')}>{siteConfig.supportEmail}</a>.
        </p>

        <div className="notice" style={{ marginTop: '1.5rem' }}>
          <strong>Review before launch</strong>
          <p>
            These Terms are provided for MVP and App Store Connect preparation and should be
            reviewed by legal counsel before public launch.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
