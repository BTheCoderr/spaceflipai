export type ProjectTypeId =
  | 'airbnb-unit'
  | 'office-space'
  | 'retail-store'
  | 'restaurant'
  | 'salon-studio'
  | 'backyard-landscape'
  | 'home-exterior'
  | 'real-estate-listing'
  | 'empty-commercial';

export type ProjectType = {
  id: ProjectTypeId;
  label: string;
  shortLabel: string;
  description: string;
  imageUrl: string;
  stepCategory: 'airbnb' | 'office' | 'retail' | 'landscape' | 'listing' | 'restaurant' | 'salon' | 'exterior' | 'commercial';
  resultImageUrls: [string, string, string];
};

const R = (a: string, b: string, c: string): [string, string, string] => [a, b, c];

const IMG = {
  airbnb: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
  retail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
  garden: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600',
  exterior: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
  listing: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
  commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
  staging: 'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600',
};

export const projectTypes: ProjectType[] = [
  {
    id: 'airbnb-unit',
    label: 'Airbnb Unit',
    shortLabel: 'Airbnb',
    description: 'Stage and upgrade short-term rental units for better bookings.',
    imageUrl: IMG.airbnb,
    stepCategory: 'airbnb',
    resultImageUrls: R(IMG.airbnb, IMG.staging, IMG.listing),
  },
  {
    id: 'office-space',
    label: 'Office Space',
    shortLabel: 'Office',
    description: 'Improve desk layout, meeting flow, and professional appearance.',
    imageUrl: IMG.office,
    stepCategory: 'office',
    resultImageUrls: R(IMG.office, IMG.commercial, IMG.staging),
  },
  {
    id: 'retail-store',
    label: 'Retail Store',
    shortLabel: 'Retail',
    description: 'Optimize customer flow, displays, and checkout zones.',
    imageUrl: IMG.retail,
    stepCategory: 'retail',
    resultImageUrls: R(IMG.retail, IMG.commercial, IMG.staging),
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    shortLabel: 'Restaurant',
    description: 'Plan seating, service flow, and guest-facing upgrades.',
    imageUrl: IMG.restaurant,
    stepCategory: 'restaurant',
    resultImageUrls: R(IMG.restaurant, IMG.commercial, IMG.staging),
  },
  {
    id: 'salon-studio',
    label: 'Salon / Studio',
    shortLabel: 'Salon',
    description: 'Improve stations, reception, and client experience zones.',
    imageUrl: IMG.salon,
    stepCategory: 'salon',
    resultImageUrls: R(IMG.salon, IMG.commercial, IMG.staging),
  },
  {
    id: 'backyard-landscape',
    label: 'Backyard / Landscape',
    shortLabel: 'Landscape',
    description: 'Plan outdoor seating, planting, lighting, and curb appeal.',
    imageUrl: IMG.garden,
    stepCategory: 'landscape',
    resultImageUrls: R(IMG.garden, IMG.exterior, IMG.staging),
  },
  {
    id: 'home-exterior',
    label: 'Home Exterior',
    shortLabel: 'Exterior',
    description: 'Upgrade curb appeal, entryways, and exterior presentation.',
    imageUrl: IMG.exterior,
    stepCategory: 'exterior',
    resultImageUrls: R(IMG.exterior, IMG.garden, IMG.listing),
  },
  {
    id: 'real-estate-listing',
    label: 'Real Estate Listing',
    shortLabel: 'Listing',
    description: 'Prepare vacant or dated listings for faster sales.',
    imageUrl: IMG.listing,
    stepCategory: 'listing',
    resultImageUrls: R(IMG.listing, IMG.staging, IMG.airbnb),
  },
  {
    id: 'empty-commercial',
    label: 'Empty Commercial Unit',
    shortLabel: 'Commercial',
    description: 'Turn blank commercial shells into client-ready concepts.',
    imageUrl: IMG.commercial,
    stepCategory: 'commercial',
    resultImageUrls: R(IMG.commercial, IMG.retail, IMG.office),
  },
];

export type VisualizeAction = {
  id: string;
  projectTypeId: ProjectTypeId;
  title: string;
  subtitle: string;
  icon: 'bed-outline' | 'business-outline' | 'storefront-outline' | 'leaf-outline' | 'home-outline' | 'key-outline' | 'restaurant-outline' | 'cut-outline' | 'build-outline';
};

export const visualizeActions: VisualizeAction[] = [
  { id: 'stage-airbnb', projectTypeId: 'airbnb-unit', title: 'Stage an Airbnb', subtitle: 'Boost booking appeal and photo quality', icon: 'bed-outline' },
  { id: 'plan-office', projectTypeId: 'office-space', title: 'Plan an Office', subtitle: 'Desks, zones, and meeting flow', icon: 'business-outline' },
  { id: 'improve-retail', projectTypeId: 'retail-store', title: 'Improve a Retail Store', subtitle: 'Displays, flow, and checkout', icon: 'storefront-outline' },
  { id: 'redesign-backyard', projectTypeId: 'backyard-landscape', title: 'Plan a Backyard Upgrade', subtitle: 'Outdoor use, seating, and maintenance', icon: 'leaf-outline' },
  { id: 'upgrade-curb', projectTypeId: 'home-exterior', title: 'Upgrade Curb Appeal', subtitle: 'Exterior presentation and entry', icon: 'home-outline' },
  { id: 'stage-listing', projectTypeId: 'real-estate-listing', title: 'Stage an Empty Listing', subtitle: 'Listing prep and buyer appeal', icon: 'key-outline' },
  { id: 'plan-restaurant', projectTypeId: 'restaurant', title: 'Plan a Restaurant Layout', subtitle: 'Seating and service paths', icon: 'restaurant-outline' },
  { id: 'plan-salon', projectTypeId: 'salon-studio', title: 'Plan a Salon / Studio', subtitle: 'Stations and client flow', icon: 'cut-outline' },
  { id: 'improve-storefront', projectTypeId: 'empty-commercial', title: 'Improve a Storefront', subtitle: 'Commercial shell to concept', icon: 'build-outline' },
];

export const projectGoals: Record<ProjectTypeId, string[]> = {
  'airbnb-unit': [
    'Increase booking appeal',
    'Make photos look better',
    'Add sleeping capacity',
    'Make it feel luxury',
    'Make it family-friendly',
  ],
  'office-space': [
    'Add more desks',
    'Improve meeting flow',
    'Create private work zones',
    'Improve reception area',
    'Modernize the look',
  ],
  'retail-store': [
    'Improve customer flow',
    'Highlight featured products',
    'Create checkout zone',
    'Improve window display',
    'Seasonal display setup',
  ],
  restaurant: [
    'Improve seating capacity',
    'Optimize service flow',
    'Upgrade guest ambiance',
    'Improve bar or counter zone',
    'Refresh brand look',
  ],
  'salon-studio': [
    'Add more stations',
    'Improve reception flow',
    'Upgrade client comfort',
    'Improve retail display',
    'Modernize studio look',
  ],
  'backyard-landscape': [
    'Improve curb appeal',
    'Low-maintenance yard',
    'Outdoor seating',
    'Lighting plan',
    'Privacy improvement',
  ],
  'home-exterior': [
    'Improve curb appeal',
    'Upgrade entryway',
    'Refresh paint and trim',
    'Improve outdoor lighting',
    'Increase perceived value',
  ],
  'real-estate-listing': [
    'Prepare for photos',
    'Increase buyer appeal',
    'Suggest staging priorities',
    'Highlight best features',
    'Reduce time on market',
  ],
  'empty-commercial': [
    'Create tenant-ready concept',
    'Improve storefront appeal',
    'Plan basic layout zones',
    'Estimate fit-out scope',
    'Prepare investor presentation',
  ],
};

export const budgetRangeOptions = [
  'Under $2,500',
  '$2,500 – $7,500',
  '$7,500 – $20,000',
  '$20,000 – $50,000',
  '$50,000+',
  'Not sure yet',
];

export function getProjectTypeById(id: string): ProjectType | undefined {
  return projectTypes.find((p) => p.id === id);
}

export function getProjectTypeLabel(id: string): string {
  return getProjectTypeById(id)?.label ?? 'Property Project';
}
