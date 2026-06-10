export type LoadingType =
  | 'redesign'
  | 'declutter_cleanup'
  | 'remove_furniture'
  | 'new_walls'
  | 'new_flooring'
  | 'exterior'
  | 'commercial';

const STEP_SETS: Record<LoadingType, string[]> = {
  redesign: [
    'Reading your space',
    'Preserving structure',
    'Applying selected design',
    'Creating final render',
  ],
  declutter_cleanup: [
    'Detecting objects',
    'Identifying clutter',
    'Cleaning visual space',
    'Creating organized result',
  ],
  remove_furniture: [
    'Detecting furniture',
    'Removing selected objects',
    'Rebuilding background',
    'Creating empty room',
  ],
  new_walls: [
    'Detecting wall surfaces',
    'Testing wall styles',
    'Applying material',
    'Creating final wall preview',
  ],
  new_flooring: [
    'Detecting floor plane',
    'Applying flooring material',
    'Matching lighting',
    'Creating final flooring preview',
  ],
  exterior: [
    'Detecting facade and yard',
    'Preserving home structure',
    'Applying exterior improvements',
    'Creating final curb appeal render',
  ],
  commercial: [
    'Reading layout',
    'Finding movement paths',
    'Optimizing zones',
    'Creating commercial plan',
  ],
};

export function getStepsForLoadingType(loadingType: LoadingType): string[] {
  return STEP_SETS[loadingType] ?? STEP_SETS.redesign;
}

export function getStepDurationMs(_loadingType: LoadingType): number {
  return 900;
}
