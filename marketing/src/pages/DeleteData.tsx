import { PageShell } from '../components/PageShell';
import { mailto, siteConfig } from '../config/site';

export function DeleteDataPage() {
  return (
    <PageShell
      title="Delete Your Data"
      subtitle="How to remove saved projects and request account-related data deletion."
    >
      <div className="prose card">
        <h2>Delete saved projects in the app</h2>
        <ol>
          <li>Open the SpaceFlip Pro app.</li>
          <li>Go to the Projects tab.</li>
          <li>Open a saved project.</li>
          <li>Tap <strong>Delete Project</strong> on the project detail screen.</li>
        </ol>
        <p>
          This removes the saved project record associated with that item. Related generation job
          data may remain for service reliability unless you also request deletion by email.
        </p>

        <h2>Request data deletion by email</h2>
        <p>
          To request deletion of uploaded photos, saved projects, generation records, or other
          data associated with your use of SpaceFlip Pro, email:
        </p>
        <p>
          <a href={mailto('SpaceFlip Pro Data Deletion Request')}>
            {siteConfig.supportEmail}
          </a>
        </p>
        <p>
          Use the subject line: <strong>SpaceFlip Pro Data Deletion Request</strong>
        </p>

        <h2>What to include in your request</h2>
        <ul>
          <li>The email address or identifier you used in the app (if applicable)</li>
          <li>Approximate dates you used the app</li>
          <li>Project types or titles you want deleted (if known)</li>
          <li>Any additional context that helps us locate your records</li>
        </ul>

        <h2>What we can delete</h2>
        <ul>
          <li>Uploaded property photos stored for your projects</li>
          <li>Saved project records and associated plan content</li>
          <li>Generation job records linked to your requests, where applicable</li>
        </ul>

        <h2>Expected response time</h2>
        <p>
          We aim to respond to verified deletion requests within <strong>30 days</strong>.
          Complex requests may take longer; we will acknowledge receipt and provide an estimated
          timeline when possible.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about data deletion? Email{' '}
          <a href={mailto('SpaceFlip Pro Data Deletion Question')}>
            {siteConfig.supportEmail}
          </a>
          .
        </p>
      </div>
    </PageShell>
  );
}
