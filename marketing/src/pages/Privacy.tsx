import { PageShell } from '../components/PageShell';
import { mailto, siteConfig } from '../config/site';

export function PrivacyPage() {
  return (
    <PageShell
      title="Privacy Policy"
      subtitle={`Effective date: ${siteConfig.effectiveDate}`}
    >
      <div className="prose card">
        <p>
          This Privacy Policy describes how {siteConfig.companyName} (&quot;we,&quot; &quot;us,&quot;
          or &quot;our&quot;) handles information when you use the SpaceFlip Pro mobile app and
          related services. This policy should be reviewed by qualified counsel before public
          launch.
        </p>

        <h2>Information we collect</h2>
        <p>When you use SpaceFlip Pro, we may collect and store:</p>
        <ul>
          <li>
            <strong>Property photos</strong> you upload for upgrade planning
          </li>
          <li>
            <strong>Project details</strong> such as project type, goal, budget range, and optional
            notes
          </li>
          <li>
            <strong>Generated plan content</strong> including summaries, checklists, materials, and
            related AI output
          </li>
          <li>
            <strong>Saved project records</strong> when you save a plan in the app
          </li>
          <li>
            <strong>Basic technical logs</strong> needed to operate, secure, and troubleshoot the
            service (for example, error messages and request metadata)
          </li>
        </ul>

        <h2>Information we do not collect in the MVP</h2>
        <ul>
          <li>No payment information</li>
          <li>No active subscription data</li>
          <li>No advertising tracking for targeted ads</li>
          <li>We do not sell your personal data</li>
        </ul>

        <h2>Third-party services</h2>
        <p>SpaceFlip Pro uses third-party infrastructure to operate:</p>
        <ul>
          <li>
            <strong>Supabase</strong> — database, file storage, and Edge Functions for backend
            operations
          </li>
          <li>
            <strong>Groq</strong> — AI text generation for upgrade plans (and related fallbacks
            managed server-side)
          </li>
          <li>
            <strong>Expo / EAS</strong> — mobile app build and update infrastructure
          </li>
        </ul>
        <p>
          These providers process data on our behalf according to their own terms and privacy
          practices. We configure the app so AI provider keys remain server-side.
        </p>

        <h2>How we use information</h2>
        <ul>
          <li>Generate upgrade plans from your uploaded photos and project inputs</li>
          <li>Save projects so you can revisit and manage planning drafts</li>
          <li>Export PDFs you request</li>
          <li>Improve reliability, monitor errors, and troubleshoot service issues</li>
        </ul>

        <h2>Your choices</h2>
        <ul>
          <li>
            <strong>Delete saved projects</strong> in the app from the project detail screen
          </li>
          <li>
            <strong>Request deletion by email</strong> at{' '}
            <a href={mailto('SpaceFlip Pro Data Deletion Request')}>
              {siteConfig.supportEmail}
            </a>
          </li>
        </ul>

        <h2>Data retention</h2>
        <p>
          We retain uploaded photos, project records, and generated plan content for as long as
          needed to provide the service and fulfill your requests. If you ask us to delete data,
          we will process reasonable deletion requests in accordance with applicable law and our
          operational capabilities.
        </p>

        <h2>Children</h2>
        <p>
          SpaceFlip Pro is not directed to children under 13, and we do not knowingly collect
          personal information from children.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will revise the effective date
          at the top of this page when changes are posted.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this Privacy Policy? Contact{' '}
          <a href={mailto('SpaceFlip Pro Privacy Question')}>{siteConfig.supportEmail}</a>.
        </p>

        <div className="notice" style={{ marginTop: '1.5rem' }}>
          <strong>Important disclaimer</strong>
          <p>
            This policy is provided for MVP and App Store Connect preparation. It should be
            reviewed and updated by legal counsel before public launch. The app stores uploaded
            property photos and project data — we do not claim &quot;Data Not Collected.&quot;
          </p>
        </div>
      </div>
    </PageShell>
  );
}
