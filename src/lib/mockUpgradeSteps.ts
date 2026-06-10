import type { ProjectTypeId } from '../data/mockProjectTypes';
import { getProjectTypeById } from '../data/mockProjectTypes';

const STEP_SETS = {
  airbnb: [
    'Reading room photo',
    'Finding guest appeal opportunities',
    'Creating staging concept',
    'Building upgrade plan',
  ],
  office: [
    'Reading layout',
    'Checking flow and zones',
    'Planning furniture placement',
    'Building workspace plan',
  ],
  retail: [
    'Reading storefront/store layout',
    'Finding customer flow paths',
    'Planning display zones',
    'Building retail improvement plan',
  ],
  landscape: [
    'Reading outdoor space',
    'Finding curb appeal opportunities',
    'Planning zones and planting areas',
    'Building outdoor upgrade plan',
  ],
  listing: [
    'Reading listing space',
    'Identifying buyer appeal gaps',
    'Creating staging concept',
    'Building listing prep plan',
  ],
  restaurant: [
    'Reading dining layout',
    'Mapping service flow',
    'Planning seating zones',
    'Building restaurant upgrade plan',
  ],
  salon: [
    'Reading studio layout',
    'Planning station flow',
    'Improving client zones',
    'Building salon upgrade plan',
  ],
  exterior: [
    'Reading exterior photo',
    'Finding curb appeal opportunities',
    'Planning facade improvements',
    'Building exterior upgrade plan',
  ],
  commercial: [
    'Reading commercial shell',
    'Planning tenant-ready zones',
    'Creating concept layout',
    'Building fit-out plan',
  ],
} as const;

export type ProjectStepCategory = keyof typeof STEP_SETS;

export function getStepsForProjectType(projectTypeId: ProjectTypeId | string): string[] {
  const projectType = getProjectTypeById(projectTypeId);
  const category: ProjectStepCategory = projectType?.stepCategory ?? 'commercial';
  return [...STEP_SETS[category]];
}

export function getStepDurationMs(): number {
  return 900;
}
