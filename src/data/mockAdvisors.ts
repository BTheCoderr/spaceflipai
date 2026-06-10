export type Advisor = {
  id: string;
  name: string;
  role: string;
  tagline: string;
  icon: 'trending-up-outline' | 'grid-outline' | 'storefront-outline' | 'leaf-outline' | 'home-outline' | 'key-outline' | 'construct-outline' | 'calculator-outline' | 'shield-checkmark-outline';
  description: string;
  starterMessages: { role: 'assistant' | 'user'; text: string }[];
  mockResponses: string[];
};

export const advisors: Advisor[] = [
  {
    id: 'airbnb-revenue',
    name: 'Airbnb Revenue Advisor',
    role: 'Short-Term Rental Strategist',
    tagline: 'Improve booking appeal and nightly rate potential',
    icon: 'trending-up-outline',
    description: 'Helps hosts prioritize upgrades that improve photos, reviews, and occupancy.',
    starterMessages: [
      { role: 'assistant', text: 'Tell me about your rental unit and what you want guests to feel when they arrive.' },
      { role: 'user', text: 'I need this unit to look more bookable in listing photos.' },
    ],
    mockResponses: [
      'Start with bedding, lighting, and a clear focal wall — those three changes usually improve listing CTR the fastest.',
      'Remove personal clutter and add one local detail so the space feels intentional without looking generic.',
      'If budget is tight, prioritize the hero photo room first: living area, primary bedroom, or best natural light zone.',
    ],
  },
  {
    id: 'office-layout',
    name: 'Office Layout Advisor',
    role: 'Workspace Planner',
    tagline: 'Desks, zones, and meeting flow',
    icon: 'grid-outline',
    description: 'Plans productive office layouts for teams, reception areas, and hybrid work.',
    starterMessages: [
      { role: 'assistant', text: 'Share your team size, meeting needs, and any fixed walls or columns in the space.' },
      { role: 'user', text: 'How can I fit more desks in this office?' },
    ],
    mockResponses: [
      'Try a benching layout along the window wall and move collaboration tables to the center to preserve light.',
      'Add one small huddle room instead of a large conference table if meetings are mostly 3–4 people.',
      'Keep reception sightlines open and place storage along low-traffic walls to free desk zones.',
    ],
  },
  {
    id: 'retail-flow',
    name: 'Retail Flow Advisor',
    role: 'Store Layout Specialist',
    tagline: 'Customer paths, displays, and checkout',
    icon: 'storefront-outline',
    description: 'Improves product visibility, aisle flow, and conversion-focused store zones.',
    starterMessages: [
      { role: 'assistant', text: 'Describe your store format, best sellers, and where customers enter today.' },
      { role: 'user', text: 'What should I fix first on this storefront?' },
    ],
    mockResponses: [
      'Lead with a strong window story and one featured product zone within the first 8 feet of entry.',
      'Move checkout out of the main traffic path and create a clear loop through high-margin categories.',
      'Use vertical displays at corners to slow shoppers down and expose more SKUs without widening aisles.',
    ],
  },
  {
    id: 'landscape-planner',
    name: 'Landscape Planner',
    role: 'Outdoor Upgrade Strategist',
    tagline: 'Yard zones, seating, and planting',
    icon: 'leaf-outline',
    description: 'Plans low-maintenance outdoor upgrades for landlords and hospitality operators.',
    starterMessages: [
      { role: 'assistant', text: 'Tell me about sun exposure, maintenance budget, and whether guests or tenants will use the space.' },
      { role: 'user', text: 'What upgrades give the best curb appeal for the money?' },
    ],
    mockResponses: [
      'Fresh mulch, path edging, and two focal planters usually outperform large hardscape on a limited budget.',
      'Layer lighting at entry, path, and seating so the property reads well in evening photos too.',
      'Choose drought-tolerant planting near the facade and keep lawn only where it adds usable outdoor space.',
    ],
  },
  {
    id: 'curb-appeal',
    name: 'Curb Appeal Advisor',
    role: 'Exterior Presentation Expert',
    tagline: 'First impressions for listings and rentals',
    icon: 'home-outline',
    description: 'Prioritizes exterior upgrades that improve perceived property value.',
    starterMessages: [
      { role: 'assistant', text: 'Share a photo of the front elevation and whether this is for sale, rent, or guest bookings.' },
      { role: 'user', text: 'What exterior fixes should I do before listing photos?' },
    ],
    mockResponses: [
      'Clean the entry path, refresh the front door hardware, and simplify landscaping around the facade.',
      'Repaint trim and shutters before repainting full siding if budget is limited.',
      'Add one strong light at the entry and one at the address numbers for evening showing appeal.',
    ],
  },
  {
    id: 'listing-staging',
    name: 'Real Estate Staging Advisor',
    role: 'Listing Prep Specialist',
    tagline: 'Vacant and occupied listing strategy',
    icon: 'key-outline',
    description: 'Helps agents and investors prepare spaces for faster sales.',
    starterMessages: [
      { role: 'assistant', text: 'Is the unit vacant or occupied, and who is the likely buyer profile?' },
      { role: 'user', text: 'Turn this empty unit into a retail concept.' },
    ],
    mockResponses: [
      'For vacant units, define three zones first: entry impression, primary use area, and one supporting function.',
      'Use neutral finishes and one accent material so buyers can imagine their brand without visual noise.',
      'Budget staging by photo priority: storefront or window line, main floor, then support areas.',
    ],
  },
  {
    id: 'contractor-brief',
    name: 'Contractor Brief Advisor',
    role: 'Scope & Handoff Planner',
    tagline: 'Client-ready scope notes and trade checklists',
    icon: 'construct-outline',
    description: 'Turns visual concepts into contractor-friendly task lists.',
    starterMessages: [
      { role: 'assistant', text: 'Tell me what trades are involved and whether this is for a client presentation or bid request.' },
      { role: 'user', text: 'Give me a contractor checklist for this space.' },
    ],
    mockResponses: [
      'Break scope into demo, rough prep, finish trades, and punch list so bids stay comparable.',
      'Call out photo references, dimensions, and material intent for each zone to reduce change orders.',
      'Sequence paint, flooring, and fixture installs after layout confirmation to avoid rework.',
    ],
  },
  {
    id: 'budget-planner',
    name: 'Budget Planner',
    role: 'Upgrade ROI Analyst',
    tagline: 'Budget ranges and phased spending',
    icon: 'calculator-outline',
    description: 'Helps prioritize upgrades by budget, timeline, and business outcome.',
    starterMessages: [
      { role: 'assistant', text: 'What outcome matters most: revenue, speed to market, tenant appeal, or operating efficiency?' },
      { role: 'user', text: 'What should I fix first with a limited budget?' },
    ],
    mockResponses: [
      'Phase 1 should cover anything visible in photos or client walkthroughs; Phase 2 covers efficiency upgrades.',
      'If the property earns revenue now, prioritize guest or customer-facing zones before back-of-house improvements.',
      'Use a 60/30/10 split: critical fixes, visible upgrades, optional polish.',
    ],
  },
  {
    id: 'safety-code',
    name: 'Safety & Code Checklist Advisor',
    role: 'Compliance Review Assistant',
    tagline: 'Permits, safety, and operational checks',
    icon: 'shield-checkmark-outline',
    description: 'Flags common safety and compliance considerations before upgrades begin.',
    starterMessages: [
      { role: 'assistant', text: 'Tell me the property type and whether this is hospitality, retail, office, or residential rental.' },
      { role: 'user', text: 'What compliance issues should I check before renovating?' },
    ],
    mockResponses: [
      'Confirm egress paths, fire detection, and ADA access requirements before changing layout or seating counts.',
      'For commercial food or service spaces, verify ventilation, grease interceptors, and local health code clearances.',
      'Document existing electrical load before adding stations, desks, or kitchen equipment.',
    ],
  },
];

export const advisorPromptChips = [
  'How can I make this Airbnb photo look more bookable?',
  'What should I fix first on this storefront?',
  'How can I fit more desks in this office?',
  'What upgrades give the best curb appeal for the money?',
  'Turn this empty unit into a retail concept.',
  'Give me a contractor checklist for this space.',
];

export function getAdvisorById(id: string): Advisor | undefined {
  return advisors.find((a) => a.id === id);
}
