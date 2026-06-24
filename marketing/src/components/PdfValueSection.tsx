const pdfItems = [
  'Upgrade summary',
  'Business outcome',
  'Budget range',
  'Suggested materials',
  'Priority checklist',
  'Contractor / client notes',
  'Planning-draft disclaimer (verify with qualified professionals)',
];

export function PdfValueSection() {
  return (
    <section className="section">
      <div className="container pdf-section">
        <div className="pdf-copy">
          <h2 className="section-title">Export a client-ready upgrade plan</h2>
          <p className="section-lead">
            Share a structured PDF with clients, contractors, or stakeholders. Every export
            includes a clear planning-draft disclaimer.
          </p>
          <ul className="pdf-list">
            {pdfItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="pdf-note">
            Exports are generated in the app and include the sections listed above.
          </p>
        </div>
        <div className="pdf-preview card">
          <div className="pdf-preview-header">
            <span className="pdf-preview-badge">PDF preview</span>
            <strong>SpaceFlip Pro Upgrade Plan</strong>
          </div>
          <div className="pdf-preview-body">
            <p className="pdf-preview-line" />
            <p className="pdf-preview-line short" />
            <p className="pdf-preview-line" />
            <div className="pdf-preview-block">
              <span>Budget range</span>
              <span>Materials</span>
              <span>Checklist</span>
            </div>
            <p className="pdf-preview-disclaimer">
              Planning draft — verify pricing and design with qualified professionals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
