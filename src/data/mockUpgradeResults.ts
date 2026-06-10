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

export type ResultPanelCopy = {
  planSubtitle: string;
  budgetSubtitle: string;
  checklistSubtitle: string;
  visualSubtitle: string;
};

const DEFAULT_CHECKLIST = [
  'Confirm scope and photo priorities',
  'Measure key zones and traffic paths',
  'Get trade quotes for priority items',
  'Schedule work in revenue-safe phases',
];

const PANEL_COPY: Record<ProjectTypeId, ResultPanelCopy> = {
  'airbnb-unit': {
    visualSubtitle: 'Concept focused on booking appeal and listing photo quality.',
    planSubtitle: 'Prioritize guest confidence, sleep comfort, and photo-ready staging.',
    budgetSubtitle: 'Estimate reversible upgrades that improve occupancy and nightly rate.',
    checklistSubtitle: 'Start with items that show up in your hero listing photos.',
  },
  'office-space': {
    visualSubtitle: 'Concept focused on desk capacity, zones, and team movement.',
    planSubtitle: 'Improve workflow, meeting flow, and reception visibility.',
    budgetSubtitle: 'Balance desk count, collaboration zones, and client-facing polish.',
    checklistSubtitle: 'Sequence changes to keep the team working during upgrades.',
  },
  'retail-store': {
    visualSubtitle: 'Concept focused on customer flow and product visibility.',
    planSubtitle: 'Improve entry impact, display zones, and checkout clarity.',
    budgetSubtitle: 'Invest first where shoppers decide to enter and browse.',
    checklistSubtitle: 'Fix traffic loop and featured product visibility before decor.',
  },
  restaurant: {
    visualSubtitle: 'Concept focused on seating mix and service flow.',
    planSubtitle: 'Improve guest paths, waiting areas, and front-of-house clarity.',
    budgetSubtitle: 'Prioritize layout changes that increase covers without slowing service.',
    checklistSubtitle: 'Map host, server, and guest paths before finish upgrades.',
  },
  'salon-studio': {
    visualSubtitle: 'Concept focused on stations, client flow, and premium presentation.',
    planSubtitle: 'Improve station layout, reception queue, and retail visibility.',
    budgetSubtitle: 'Upgrade client-facing zones before back-of-house storage.',
    checklistSubtitle: 'Align stations to light, plumbing, and client comfort first.',
  },
  'backyard-landscape': {
    visualSubtitle: 'Concept focused on outdoor use, maintenance, and property value.',
    planSubtitle: 'Build low-maintenance zones, seating, and path clarity.',
    budgetSubtitle: 'Prioritize curb-facing improvements and durable outdoor materials.',
    checklistSubtitle: 'Start with drainage, paths, and planting near the entry.',
  },
  'home-exterior': {
    visualSubtitle: 'Concept focused on curb appeal and perceived property value.',
    planSubtitle: 'Improve entry presentation, trim, lighting, and facade clarity.',
    budgetSubtitle: 'Focus on first-impression upgrades with strong ROI.',
    checklistSubtitle: 'Handle entry, lighting, and walk path issues before accent work.',
  },
  'real-estate-listing': {
    visualSubtitle: 'Concept focused on buyer appeal and photo readiness.',
    planSubtitle: 'Prepare the listing for faster showings and stronger offers.',
    budgetSubtitle: 'Stage by photo priority to reduce days on market.',
    checklistSubtitle: 'Declutter and light the rooms buyers see first online.',
  },
  'empty-commercial': {
    visualSubtitle: 'Concept focused on tenant-ready zoning and storefront appeal.',
    planSubtitle: 'Turn the shell into a leasable concept with clear use zones.',
    budgetSubtitle: 'Separate landlord base build from tenant fit-out scope.',
    checklistSubtitle: 'Define entry story, main floor use, and support areas first.',
  },
};

const PLAN_BY_TYPE: Partial<Record<ProjectTypeId, Omit<UpgradePlanResult, 'resultImageUrls'>>> = {
  'airbnb-unit': {
    summary:
      'Improve booking appeal with photo-ready staging, guest confidence cues, and a clear sleep + lounge story for listing photos.',
    budgetRange: '$2,500 – $7,500',
    priorityChecklist: [
      'Refresh bedding and pillows for listing hero shots',
      'Add warm lighting at bed, sofa, and entry for guest confidence',
      'Clear surfaces and personal items before photo day',
      'Define one focal wall that reads well on mobile listing photos',
      'Add practical guest amenities visible near entry',
    ],
    suggestedMaterials: ['Neutral duvet sets', 'Warm LED lamps', 'Removable wall art', 'Entry hooks and storage bench'],
    contractorNotes:
      'Prioritize reversible upgrades first. Capture before/after photos by zone for listing updates and guest messaging.',
  },
  'office-space': {
    summary:
      'Increase usable desk count while improving team movement, meeting flow, and reception visibility for a more productive workspace.',
    budgetRange: '$7,500 – $20,000',
    priorityChecklist: [
      'Map desk clusters to window light and power/data drops',
      'Add huddle or focus zones without blocking circulation',
      'Improve reception sightlines and client-first impression',
      'Place storage along low-traffic walls to free desk zones',
      'Refresh paint in client-facing and collaboration areas',
    ],
    suggestedMaterials: ['Modular bench desks', 'Acoustic panels', 'Reception signage', 'Task lighting'],
    contractorNotes:
      'Confirm electrical and data locations before moving workstations. Phase work to keep teams operational.',
  },
  'retail-store': {
    summary:
      'Improve customer flow, product visibility, and checkout clarity to support higher conversion and easier merchandising.',
    budgetRange: '$7,500 – $20,000',
    priorityChecklist: [
      'Refresh window display for stronger street visibility',
      'Create a feature table within the first 8 feet of entry',
      'Widen the main shopping loop through high-margin categories',
      'Move checkout off the primary traffic path',
      'Add vertical display at corners to expose more SKUs',
    ],
    suggestedMaterials: ['Modular display tables', 'Spot lighting', 'Wayfinding signage', 'Checkout counter refresh'],
    contractorNotes:
      'Install displays after flooring repair and paint. Confirm ADA path widths before moving fixtures.',
  },
  'backyard-landscape': {
    summary:
      'Increase property value and outdoor usability with low-maintenance planting, defined paths, and a usable seating zone.',
    budgetRange: '$2,500 – $7,500',
    priorityChecklist: [
      'Edge beds and refresh mulch for immediate curb impact',
      'Define a path to entry, seating, or outdoor use area',
      'Add focal planters near the facade or patio edge',
      'Choose low-maintenance planting for long-term upkeep',
      'Install path and seating-area lighting for evening use',
    ],
    suggestedMaterials: ['Gravel or paver path', 'Planters', 'Drought-tolerant shrubs', 'Low-voltage lighting'],
    contractorNotes:
      'Check drainage before hardscape. Confirm irrigation capacity before final planting plan.',
  },
  'home-exterior': {
    summary:
      'Boost curb appeal and perceived property value with entry refresh, trim updates, simplified landscaping, and exterior lighting.',
    budgetRange: '$2,500 – $7,500',
    priorityChecklist: [
      'Clean entry and upgrade door hardware for first impressions',
      'Repaint trim and front door for photo-ready curb appeal',
      'Simplify planting near the facade for maintenance ease',
      'Add entry and address lighting for evening showings',
      'Repair visible walk path and edge details',
    ],
    suggestedMaterials: ['Exterior paint', 'Entry hardware kit', 'House numbers', 'Landscape edge materials'],
    contractorNotes:
      'Verify HOA or historic guidelines before color changes. Coordinate exterior paint with weather window.',
  },
  'real-estate-listing': {
    summary:
      'Prepare the listing for buyer appeal with photo-ready staging, depersonalization, and a clear spatial story for showings.',
    budgetRange: '$2,500 – $7,500',
    priorityChecklist: [
      'Declutter and depersonalize rooms shown in listing photos',
      'Stage primary living and bedroom zones for buyer appeal',
      'Improve lighting levels for photo day and open houses',
      'Use one neutral palette across main sightlines',
      'Create a strong entry impression for in-person showings',
    ],
    suggestedMaterials: ['Rental staging furniture', 'Neutral rugs', 'Mirrors for light', 'Entry staging props'],
    contractorNotes:
      'Stage by photo order: exterior, entry, best room, kitchen, primary bed, then supporting spaces.',
  },
  restaurant: {
    summary:
      'Improve seating capacity, service flow, and waiting-area clarity while keeping the guest experience on-brand.',
    budgetRange: '$20,000 – $50,000',
    priorityChecklist: [
      'Map host, wait, and server paths during peak service',
      'Rebalance 2-top and 4-top mix for covers and turnover',
      'Improve bar or counter visibility from entry',
      'Upgrade guest-area lighting for ambiance and safety',
      'Refresh brand wall or signage seen from the door',
    ],
    suggestedMaterials: ['Banquette seating', 'Pendant lighting', 'Durable floor finish', 'Host stand refresh'],
    contractorNotes:
      'Confirm health code clearances and ventilation before layout changes. Sequence MEP before finishes.',
  },
  'salon-studio': {
    summary:
      'Improve station efficiency, client flow, and premium presentation with clearer reception and service zones.',
    budgetRange: '$7,500 – $20,000',
    priorityChecklist: [
      'Align stations to mirror light and service workflow',
      'Improve reception queue space and first impression',
      'Add retail display near checkout for add-on revenue',
      'Define backwash and storage zones away from client paths',
      'Refresh client seating for a more premium look',
    ],
    suggestedMaterials: ['Station dividers', 'Retail shelving', 'Reception desk update', 'Salon-grade flooring'],
    contractorNotes:
      'Check plumbing locations before moving backwash stations. Schedule work outside peak client hours.',
  },
  'empty-commercial': {
    summary:
      'Turn the shell into a tenant-ready concept with storefront appeal, defined zones, and a phased fit-out plan for leasing.',
    budgetRange: '$20,000 – $50,000',
    priorityChecklist: [
      'Define entry and storefront story for leasing photos',
      'Plan main use zone and support/back-of-house area',
      'Identify landlord base build vs tenant improvements',
      'Create concept layout boards for broker presentations',
      'Estimate phased fit-out for investor or tenant review',
    ],
    suggestedMaterials: ['Temporary signage', 'Paint and flooring refresh', 'Concept lighting', 'Zone dividers'],
    contractorNotes:
      'Separate landlord base build from tenant fit-out in the client brief. Include photo-ready concept boards for leasing.',
  },
};

export function getResultPanelCopy(projectTypeId: ProjectTypeId | string): ResultPanelCopy {
  return PANEL_COPY[projectTypeId as ProjectTypeId] ?? PANEL_COPY['empty-commercial'];
}

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
