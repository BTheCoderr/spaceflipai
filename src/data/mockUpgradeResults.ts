import type { ProjectTypeId } from '../data/mockProjectTypes';
import { getProjectTypeById } from '../data/mockProjectTypes';

export type UpgradePlanResult = {
  summary: string;
  budgetRange: string;
  priorityChecklist: string[];
  suggestedMaterials: string[];
  contractorNotes: string;
  resultImageUrls: [string, string, string];
};

const DEFAULT_CHECKLIST = [
  'Confirm scope and photo priorities',
  'Measure key zones and traffic paths',
  'Get trade quotes for priority items',
  'Schedule work in revenue-safe phases',
];

const PLAN_BY_TYPE: Partial<Record<ProjectTypeId, Omit<UpgradePlanResult, 'resultImageUrls'>>> = {
  'airbnb-unit': {
    summary:
      'Focus on photo-ready staging, layered lighting, and a clear sleep + lounge story to improve booking appeal.',
    budgetRange: '$2,500 – $7,500',
    priorityChecklist: [
      'Refresh bedding, pillows, and neutral textiles',
      'Add warm lighting at bed, sofa, and entry',
      'Clear surfaces for listing photos',
      'Define one focal wall or art moment',
      'Add practical guest amenities near entry',
    ],
    suggestedMaterials: ['Neutral duvet sets', 'Warm LED lamps', 'Removable wall art', 'Entry hooks and storage bench'],
    contractorNotes:
      'Prioritize reversible upgrades first. Document before/after photos by zone for listing updates.',
  },
  'office-space': {
    summary:
      'Rebalance desk density, meeting circulation, and reception visibility to support a more productive workspace.',
    budgetRange: '$7,500 – $20,000',
    priorityChecklist: [
      'Map desk clusters to window light',
      'Create one small huddle zone',
      'Improve reception sightlines',
      'Add storage along low-traffic walls',
      'Refresh paint in client-facing areas',
    ],
    suggestedMaterials: ['Modular bench desks', 'Acoustic panels', 'Reception signage', 'Task lighting'],
    contractorNotes:
      'Confirm electrical/data locations before moving workstations. Phase work to keep team operational.',
  },
  'retail-store': {
    summary:
      'Improve entry impact, loop traffic through featured categories, and simplify checkout visibility.',
    budgetRange: '$7,500 – $20,000',
    priorityChecklist: [
      'Redesign window display story',
      'Create feature table within entry zone',
      'Widen main loop path',
      'Move checkout off primary circulation',
      'Add vertical display at corners',
    ],
    suggestedMaterials: ['Modular display tables', 'Spot lighting', 'Wayfinding signage', 'Checkout counter refresh'],
    contractorNotes:
      'Install displays after flooring repair and paint. Confirm ADA path widths before fixture moves.',
  },
  'backyard-landscape': {
    summary:
      'Build curb appeal with defined paths, low-maintenance planting, and one usable outdoor seating zone.',
    budgetRange: '$2,500 – $7,500',
    priorityChecklist: [
      'Edge beds and refresh mulch',
      'Define path to entry or seating',
      'Add two focal planters',
      'Plan low-water planting near facade',
      'Install path and entry lighting',
    ],
    suggestedMaterials: ['Gravel or paver path', 'Planters', 'Drought-tolerant shrubs', 'Low-voltage lighting'],
    contractorNotes:
      'Check drainage before hardscape. Stage planting after irrigation review if applicable.',
  },
  'home-exterior': {
    summary:
      'Upgrade first impressions with entry refresh, trim paint, simplified landscaping, and better exterior lighting.',
    budgetRange: '$2,500 – $7,500',
    priorityChecklist: [
      'Clean entry and replace hardware',
      'Repaint trim and front door',
      'Simplify planting near facade',
      'Add entry and address lighting',
      'Repair visible walk path issues',
    ],
    suggestedMaterials: ['Exterior paint', 'Entry hardware kit', 'House numbers', 'Landscape edge materials'],
    contractorNotes:
      'Verify HOA or historic guidelines before color changes. Coordinate paint with weather window.',
  },
  'real-estate-listing': {
    summary:
      'Prepare the listing for faster showings with photo-priority staging and a buyer-friendly spatial story.',
    budgetRange: '$2,500 – $7,500',
    priorityChecklist: [
      'Declutter and depersonalize main rooms',
      'Stage primary living and bedroom zones',
      'Improve lighting for photo day',
      'Define one simple color palette',
      'Create showing-ready entry impression',
    ],
    suggestedMaterials: ['Rental staging furniture', 'Neutral rugs', 'Mirrors for light', 'Entry staging props'],
    contractorNotes:
      'Stage by photo order: exterior, entry, best room, kitchen, primary bed, supporting spaces.',
  },
  restaurant: {
    summary:
      'Improve guest flow, seating mix, and service paths while keeping the front-of-house brand clear.',
    budgetRange: '$20,000 – $50,000',
    priorityChecklist: [
      'Map host, wait, and server paths',
      'Rebalance 2-top and 4-top mix',
      'Improve bar or counter visibility',
      'Upgrade guest lighting levels',
      'Refresh focal brand wall or signage',
    ],
    suggestedMaterials: ['Banquette seating', 'Pendant lighting', 'Durable floor finish', 'Host stand refresh'],
    contractorNotes:
      'Confirm health code clearances and ventilation before layout changes. Sequence MEP before finishes.',
  },
  'salon-studio': {
    summary:
      'Increase station efficiency, reception flow, and client comfort with a clearer studio layout.',
    budgetRange: '$7,500 – $20,000',
    priorityChecklist: [
      'Align stations to mirror light',
      'Improve reception queue space',
      'Add retail display near checkout',
      'Define backwash and storage zones',
      'Refresh client seating area',
    ],
    suggestedMaterials: ['Station dividers', 'Retail shelving', 'Reception desk update', 'Salon-grade flooring'],
    contractorNotes:
      'Check plumbing locations before moving backwash stations. Plan work outside peak hours.',
  },
  'empty-commercial': {
    summary:
      'Turn the shell into a tenant-ready concept with defined zones, storefront appeal, and a phased fit-out plan.',
    budgetRange: '$20,000 – $50,000',
    priorityChecklist: [
      'Define entry and storefront story',
      'Plan main use zone and support area',
      'Identify base build requirements',
      'Create concept layout for leasing',
      'Estimate phased tenant improvements',
    ],
    suggestedMaterials: ['Temporary signage', 'Paint and flooring refresh', 'Concept lighting', 'Zone dividers'],
    contractorNotes:
      'Separate landlord base build from tenant fit-out in the client brief. Include photo-ready concept boards.',
  },
};

export function getUpgradePlanResult(
  projectTypeId: ProjectTypeId | string,
  goal?: string,
  budgetRange?: string
): UpgradePlanResult {
  const projectType = getProjectTypeById(projectTypeId);
  const base = PLAN_BY_TYPE[(projectTypeId as ProjectTypeId)] ?? PLAN_BY_TYPE['empty-commercial']!;
  const goalNote = goal ? ` Goal focus: ${goal}.` : '';

  return {
    ...base,
    summary: `${base.summary}${goalNote}`,
    budgetRange: budgetRange && budgetRange !== 'Not sure yet' ? budgetRange : base.budgetRange,
    priorityChecklist: base.priorityChecklist.length ? base.priorityChecklist : DEFAULT_CHECKLIST,
    resultImageUrls: projectType?.resultImageUrls ?? [
      'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600',
    ],
  };
}
