type Mockup = {
  title: string;
  subtitle: string;
};

const mockups: Mockup[] = [
  { title: 'Visualize', subtitle: 'Choose project type and upload a photo' },
  { title: 'AI-generated plan', subtitle: 'Structured upgrade summary and notes' },
  { title: 'Budget & checklist', subtitle: 'Budget range, materials, and priorities' },
  { title: 'PDF export', subtitle: 'Client-ready planning document' },
  { title: 'Saved project', subtitle: 'Revisit, export, or delete saved plans' },
];

export function ScreenshotMockups() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Inside the app</h2>
        <p className="section-lead">
          App Store screenshots are coming soon. These frames show the core workflows SpaceFlip
          Pro supports today.
        </p>
        <div className="mockup-grid">
          {mockups.map((mockup) => (
            <figure key={mockup.title} className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-notch" aria-hidden="true" />
                <div className="phone-screen">
                  <span className="phone-placeholder-label">Screenshot placeholder</span>
                  <strong>{mockup.title}</strong>
                  <p>{mockup.subtitle}</p>
                </div>
              </div>
              <figcaption>{mockup.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
