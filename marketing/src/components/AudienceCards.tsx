type AudienceCard = {
  title: string;
  useCase: string;
};

const audiences: AudienceCard[] = [
  {
    title: 'Airbnb Hosts',
    useCase:
      'Improve listing photo appeal, guest confidence, and upgrade priorities before your next booking season.',
  },
  {
    title: 'Realtors',
    useCase:
      'Prepare vacant or dated listings with staging priorities and buyer-facing upgrade talking points.',
  },
  {
    title: 'Contractors',
    useCase:
      'Turn client ideas into scope-style notes, materials intent, and bid-ready checklists.',
  },
  {
    title: 'Landlords',
    useCase:
      'Plan tenant-ready upgrades, curb appeal fixes, and phased spending for rental properties.',
  },
  {
    title: 'Small Businesses',
    useCase:
      'Plan office, retail, and storefront upgrades with practical layout and presentation goals.',
  },
  {
    title: 'Landscapers / Exterior Planning',
    useCase:
      'Outline outdoor zones, low-maintenance upgrades, and curb appeal improvements before install.',
  },
];

export function AudienceCards() {
  return (
    <section className="section section-alt">
      <div className="container">
        <h2 className="section-title">Built for your business</h2>
        <p className="section-lead">
          SpaceFlip Pro is designed for operators and professionals who need actionable planning
          drafts — not generic decor inspiration.
        </p>
        <div className="grid-3 audience-grid">
          {audiences.map((item) => (
            <article key={item.title} className="card audience-card">
              <h3>{item.title}</h3>
              <p>{item.useCase}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
