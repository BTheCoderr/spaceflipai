type FlowStep = {
  label: string;
  caption: string;
};

const steps: FlowStep[] = [
  {
    label: 'Photo',
    caption: 'Upload a property or space photo from your device.',
  },
  {
    label: 'AI Plan',
    caption: 'Generate a structured upgrade plan from your project goal.',
  },
  {
    label: 'Budget',
    caption: 'Review budget ranges to frame decisions — not final quotes.',
  },
  {
    label: 'Checklist',
    caption: 'Prioritize materials, tasks, and contractor notes.',
  },
  {
    label: 'PDF',
    caption: 'Export a client-ready planning PDF you can share.',
  },
];

export function ProductFlow() {
  return (
    <section className="section section-alt">
      <div className="container">
        <h2 className="section-title">How it works</h2>
        <p className="section-lead">
          From photo to handoff in five practical steps — built for business planning, not
          decorative mockups alone.
        </p>
        <ol className="flow-steps">
          {steps.map((step, index) => (
            <li key={step.label} className="flow-step">
              <div className="flow-step-icon" aria-hidden="true">
                {index + 1}
              </div>
              <div className="flow-step-body">
                <h3>{step.label}</h3>
                <p>{step.caption}</p>
              </div>
              {index < steps.length - 1 ? (
                <span className="flow-arrow" aria-hidden="true">
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
