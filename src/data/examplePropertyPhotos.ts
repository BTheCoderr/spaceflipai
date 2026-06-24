/**
 * Example Property Photos — bundled, local sample input photos.
 *
 * These are NOT generated output. They are example *input* photos a user can
 * pick (instead of taking/choosing their own) to try the upgrade-plan flow.
 * All images are bundled in the app (assets/example-photos/) — there is no
 * remote stock imagery loaded at runtime.
 */
export type ExamplePropertyCategory =
  | 'interior'
  | 'exterior'
  | 'floor_plan'
  | 'commercial'
  | 'messy'
  | 'furnished';

export type ExamplePropertyPhoto = {
  id: string;
  label: string;
  /** Bundled local asset (require module id), used for display and as upload input. */
  asset: number;
};

const livingRoom = require('../../assets/example-photos/living-room.jpg');
const bedroom = require('../../assets/example-photos/bedroom.jpg');
const kitchen = require('../../assets/example-photos/kitchen.jpg');
const interiorOffice = require('../../assets/example-photos/interior-office.jpg');
const houseFront = require('../../assets/example-photos/house-front.jpg');
const driveway = require('../../assets/example-photos/driveway.jpg');
const patio = require('../../assets/example-photos/patio.jpg');
const garden = require('../../assets/example-photos/garden.jpg');
const openPlan = require('../../assets/example-photos/open-plan.jpg');
const retailFloor = require('../../assets/example-photos/retail-floor.jpg');
const officeLayout = require('../../assets/example-photos/office-layout.jpg');
const restaurant = require('../../assets/example-photos/restaurant.jpg');
const clutteredRoom = require('../../assets/example-photos/cluttered-room.jpg');
const busyKitchen = require('../../assets/example-photos/busy-kitchen.jpg');
const furnishedLiving = require('../../assets/example-photos/furnished-living.jpg');
const furnishedBedroom = require('../../assets/example-photos/furnished-bedroom.jpg');

const photos: Record<ExamplePropertyCategory, ExamplePropertyPhoto[]> = {
  interior: [
    { id: 'int-1', label: 'Living room', asset: livingRoom },
    { id: 'int-2', label: 'Bedroom', asset: bedroom },
    { id: 'int-3', label: 'Kitchen', asset: kitchen },
    { id: 'int-4', label: 'Office', asset: interiorOffice },
  ],
  exterior: [
    { id: 'ext-1', label: 'House front', asset: houseFront },
    { id: 'ext-2', label: 'Driveway', asset: driveway },
    { id: 'ext-3', label: 'Patio', asset: patio },
    { id: 'ext-4', label: 'Garden', asset: garden },
  ],
  floor_plan: [
    { id: 'fp-1', label: 'Open plan', asset: openPlan },
    { id: 'fp-2', label: 'Retail floor', asset: retailFloor },
    { id: 'fp-3', label: 'Office layout', asset: officeLayout },
  ],
  commercial: [
    { id: 'com-1', label: 'Office', asset: openPlan },
    { id: 'com-2', label: 'Retail store', asset: retailFloor },
    { id: 'com-3', label: 'Restaurant', asset: restaurant },
  ],
  messy: [
    { id: 'messy-1', label: 'Cluttered room', asset: clutteredRoom },
    { id: 'messy-2', label: 'Busy kitchen', asset: busyKitchen },
  ],
  furnished: [
    { id: 'fur-1', label: 'Furnished living', asset: furnishedLiving },
    { id: 'fur-2', label: 'Furnished bedroom', asset: furnishedBedroom },
  ],
};

export function getExamplePropertyPhotos(inputType: string): ExamplePropertyPhoto[] {
  const key = inputType as ExamplePropertyCategory;
  return photos[key] ?? photos.interior;
}
