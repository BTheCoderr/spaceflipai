type FlowStep = {
  title: string;
  caption: string;
};

const steps: FlowStep[] = [
  {
    title: 'Upload a property photo',
    caption:
      'Start with a room, backyard, storefront, office, rental unit, or property exterior.',
  },
  {
    title: 'Get an upgrade plan',
    caption:
      'Receive practical recommendations with budget ranges, materials, and action steps.',
  },
  {
    title: 'Export a PDF handoff',
    caption:
      'Save the plan, share it, or hand it to a contractor, assistant, landlord, or client.',
  },
];

export function ProductFlow() {
  return (
    <section id="how-it-works" className="section section-alt">
      <div className="container">
        <h2 className="section-title">How it works</h2>
        <p className="section-lead">
          From photo to handoff in three simple steps — practical planning, not decorative
          mockups.
        </p>
        <ol className="how-steps">
          {steps.map((step, index) => (
            <li key={step.title} className="card how-step">
              <div className="how-step-num" aria-hidden="true">
                {index + 1}
              </div>
              <h3>{step.title}</h3>
              <p>{step.caption}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
