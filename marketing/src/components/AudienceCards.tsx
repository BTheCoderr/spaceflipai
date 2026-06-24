const audiences: string[] = [
  'Airbnb hosts',
  'Landlords',
  'Realtors',
  'Contractors',
  'Landscapers',
  'Small business owners',
  'Office operators',
  'Retail operators',
];

export function AudienceCards() {
  return (
    <section className="section section-alt">
      <div className="container">
        <h2 className="section-title">Built for real property operators</h2>
        <p className="section-lead">
          SpaceFlip Pro is designed for the people who actually plan, budget, and hand off upgrade
          work.
        </p>
        <ul className="audience-badges">
          {audiences.map((item) => (
            <li key={item} className="audience-badge">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
