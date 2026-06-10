export type DemoPhotoCategory =
  | 'interior'
  | 'exterior'
  | 'floor_plan'
  | 'commercial'
  | 'messy'
  | 'furnished';

export type DemoPhoto = {
  id: string;
  imageUrl: string;
  label: string;
};

const photos: Record<DemoPhotoCategory, DemoPhoto[]> = {
  interior: [
    { id: 'int-1', label: 'Living room', imageUrl: 'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=400' },
    { id: 'int-2', label: 'Bedroom', imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400' },
    { id: 'int-3', label: 'Kitchen', imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400' },
    { id: 'int-4', label: 'Office', imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a2c3?w=400' },
  ],
  exterior: [
    { id: 'ext-1', label: 'House front', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
    { id: 'ext-2', label: 'Driveway', imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400' },
    { id: 'ext-3', label: 'Patio', imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400' },
    { id: 'ext-4', label: 'Garden', imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400' },
  ],
  floor_plan: [
    { id: 'fp-1', label: 'Open plan', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400' },
    { id: 'fp-2', label: 'Retail floor', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400' },
    { id: 'fp-3', label: 'Office layout', imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400' },
  ],
  commercial: [
    { id: 'com-1', label: 'Office', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400' },
    { id: 'com-2', label: 'Retail store', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400' },
    { id: 'com-3', label: 'Restaurant', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
  ],
  messy: [
    { id: 'messy-1', label: 'Cluttered room', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400' },
    { id: 'messy-2', label: 'Busy kitchen', imageUrl: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=400' },
  ],
  furnished: [
    { id: 'fur-1', label: 'Furnished living', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' },
    { id: 'fur-2', label: 'Furnished bedroom', imageUrl: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400' },
  ],
};

export function getDemoPhotosForInputType(inputType: string): DemoPhoto[] {
  const key = inputType as DemoPhotoCategory;
  return photos[key] ?? photos.interior;
}
