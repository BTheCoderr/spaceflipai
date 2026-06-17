const pdfItems = [
  'Upgrade summary',
  'Business outcome',
  'Budget range',
  'Suggested materials',
  'Priority checklist',
  'Contractor / client notes',
  'Concept reference disclaimer (planning reference, not a final render)',
];

export function PdfValueSection() {
  return (
    <section className="section">
      <div className="container pdf-section">
        <div className="pdf-copy">
          <h2 className="section-title">Export a client-ready upgrade plan</h2>
          <p className="section-lead">
            Share a structured PDF with clients, contractors, or stakeholders. Every export labels
            concept images as planning references.
          </p>
          <ul className="pdf-list">
            {pdfItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <button type="button" className="btn btn-secondary btn-disabled" disabled>
            Sample report coming soon
          </button>
          <p className="pdf-note">
            A downloadable sample PDF will be added before public launch. Exports in the app
            include the sections listed above.
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
              Concept reference — planning only. Verify pricing and design with professionals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
