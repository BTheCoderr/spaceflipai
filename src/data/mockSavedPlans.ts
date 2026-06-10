import type { ProjectTypeId } from './mockProjectTypes';

export type SavedPlanTemplate = {
  id: string;
  title: string;
  projectTypeId: ProjectTypeId;
  projectTypeLabel: string;
  section: 'airbnb' | 'office' | 'retail' | 'landscape' | 'listing';
  estimatedBudget: string;
  checklistCount: number;
  summary: string;
};

export const planSections = [
  { id: 'airbnb', title: 'Airbnb Staging Plans' },
  { id: 'office', title: 'Office Layout Plans' },
  { id: 'retail', title: 'Retail Layout Plans' },
  { id: 'landscape', title: 'Landscape Plans' },
  { id: 'listing', title: 'Listing Prep Plans' },
] as const;

export const savedPlanTemplates: SavedPlanTemplate[] = [
  {
    id: 'plan-airbnb-1',
    title: 'Weekend Rental Refresh',
    projectTypeId: 'airbnb-unit',
    projectTypeLabel: 'Airbnb Unit',
    section: 'airbnb',
    estimatedBudget: '$2,500 – $7,500',
    checklistCount: 12,
    summary: 'Photo-ready staging, bedding refresh, and lighting upgrades for higher booking appeal.',
  },
  {
    id: 'plan-airbnb-2',
    title: 'Luxury Guest Experience Pack',
    projectTypeId: 'airbnb-unit',
    projectTypeLabel: 'Airbnb Unit',
    section: 'airbnb',
    estimatedBudget: '$7,500 – $20,000',
    checklistCount: 16,
    summary: 'Premium finishes, focal wall, and amenity zones for higher nightly rates.',
  },
  {
    id: 'plan-office-1',
    title: 'Hybrid Team Layout',
    projectTypeId: 'office-space',
    projectTypeLabel: 'Office Space',
    section: 'office',
    estimatedBudget: '$7,500 – $20,000',
    checklistCount: 14,
    summary: 'Desk clusters, huddle zones, and reception refresh for a 12-person team.',
  },
  {
    id: 'plan-office-2',
    title: 'Reception + Meeting Flow',
    projectTypeId: 'office-space',
    projectTypeLabel: 'Office Space',
    section: 'office',
    estimatedBudget: '$2,500 – $7,500',
    checklistCount: 10,
    summary: 'Client-facing upgrades with improved meeting circulation.',
  },
  {
    id: 'plan-retail-1',
    title: 'Boutique Flow Reset',
    projectTypeId: 'retail-store',
    projectTypeLabel: 'Retail Store',
    section: 'retail',
    estimatedBudget: '$7,500 – $20,000',
    checklistCount: 13,
    summary: 'Entry display, aisle loop, and checkout zone improvements.',
  },
  {
    id: 'plan-retail-2',
    title: 'Seasonal Window Campaign',
    projectTypeId: 'retail-store',
    projectTypeLabel: 'Retail Store',
    section: 'retail',
    estimatedBudget: 'Under $2,500',
    checklistCount: 8,
    summary: 'Window storytelling, feature table, and quick traffic-path fixes.',
  },
  {
    id: 'plan-landscape-1',
    title: 'Low-Maintenance Curb Upgrade',
    projectTypeId: 'backyard-landscape',
    projectTypeLabel: 'Backyard / Landscape',
    section: 'landscape',
    estimatedBudget: '$2,500 – $7,500',
    checklistCount: 11,
    summary: 'Entry planting, path lighting, and seating zone plan.',
  },
  {
    id: 'plan-landscape-2',
    title: 'Outdoor Revenue Patio',
    projectTypeId: 'backyard-landscape',
    projectTypeLabel: 'Backyard / Landscape',
    section: 'landscape',
    estimatedBudget: '$7,500 – $20,000',
    checklistCount: 15,
    summary: 'Seating layout, shade strategy, and hospitality-ready outdoor zones.',
  },
  {
    id: 'plan-listing-1',
    title: 'Vacant Listing Photo Prep',
    projectTypeId: 'real-estate-listing',
    projectTypeLabel: 'Real Estate Listing',
    section: 'listing',
    estimatedBudget: '$2,500 – $7,500',
    checklistCount: 9,
    summary: 'Priority staging list for faster listing photos and showings.',
  },
  {
    id: 'plan-listing-2',
    title: 'Investor Flip Presentation',
    projectTypeId: 'real-estate-listing',
    projectTypeLabel: 'Real Estate Listing',
    section: 'listing',
    estimatedBudget: '$20,000 – $50,000',
    checklistCount: 18,
    summary: 'Scope, budget phases, and buyer-facing visual concept package.',
  },
];

export function getPlanById(id: string): SavedPlanTemplate | undefined {
  return savedPlanTemplates.find((p) => p.id === id);
}

export function getPlansBySection(section: SavedPlanTemplate['section']): SavedPlanTemplate[] {
  return savedPlanTemplates.filter((p) => p.section === section);
}
