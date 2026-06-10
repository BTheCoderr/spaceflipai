export type ExploreImage = {
  id: string;
  imageUrl: string;
  roomType: string;
  designStyle: string;
};

export type ExploreCategory = {
  id: string;
  name: string;
  images: ExploreImage[];
};

const makeImages = (
  category: string,
  styles: { style: string; url: string }[]
): ExploreImage[] =>
  styles.map((s, i) => ({
    id: `${category.toLowerCase().replace(/\s/g, '-')}-${i}`,
    imageUrl: s.url,
    roomType: category,
    designStyle: s.style,
  }));

const interiorCategories: ExploreCategory[] = [
  {
    id: 'living-room',
    name: 'Living Room',
    images: makeImages('Living Room', [
      { style: 'Modern Minimalist', url: 'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=400' },
      { style: 'Scandinavian', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400' },
      { style: 'Mid-Century Modern', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' },
      { style: 'Bohemian', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400' },
    ]),
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    images: makeImages('Bedroom', [
      { style: 'Cozy Neutral', url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400' },
      { style: 'Luxury Suite', url: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400' },
      { style: 'Japandi', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400' },
      { style: 'Industrial Loft', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400' },
    ]),
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    images: makeImages('Kitchen', [
      { style: 'Farmhouse', url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400' },
      { style: 'Contemporary', url: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=400' },
      { style: 'Open Concept', url: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=400' },
      { style: 'Classic White', url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400' },
    ]),
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    images: makeImages('Bathroom', [
      { style: 'Spa Retreat', url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400' },
      { style: 'Marble Luxe', url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400' },
      { style: 'Modern Zen', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa0a6a3?w=400' },
    ]),
  },
  {
    id: 'dining-room',
    name: 'Dining Room',
    images: makeImages('Dining Room', [
      { style: 'Elegant Formal', url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400' },
      { style: 'Rustic Charm', url: 'https://images.unsplash.com/photo-1617103996702-96c034ebb605?w=400' },
      { style: 'Contemporary', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
    ]),
  },
  {
    id: 'baby-room',
    name: 'Baby Room',
    images: makeImages('Baby Room', [
      { style: 'Soft Pastels', url: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400' },
      { style: 'Woodland Theme', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400' },
      { style: 'Modern Nursery', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400' },
    ]),
  },
  {
    id: 'home-office',
    name: 'Home Office',
    images: makeImages('Home Office', [
      { style: 'Productive Minimal', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a2c3?w=400' },
      { style: 'Creative Studio', url: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400' },
      { style: 'Executive', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400' },
    ]),
  },
  {
    id: 'gaming-room',
    name: 'Gaming Room',
    images: makeImages('Gaming Room', [
      { style: 'RGB Setup', url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400' },
      { style: 'Streamer Den', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400' },
      { style: 'Retro Arcade', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400' },
    ]),
  },
  {
    id: 'study-room',
    name: 'Study Room',
    images: makeImages('Study Room', [
      { style: 'Library Classic', url: 'https://images.unsplash.com/photo-1524758631624-e2822e3048f5?w=400' },
      { style: 'Bright Study', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400' },
      { style: 'Compact Nook', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a2c3?w=400' },
    ]),
  },
  {
    id: 'other',
    name: 'Other',
    images: makeImages('Other', [
      { style: 'Eclectic Mix', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400' },
      { style: 'Creative Loft', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400' },
      { style: 'Art Studio', url: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400' },
      { style: 'Multi-Use', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400' },
    ]),
  },
];

const exteriorCategories: ExploreCategory[] = [
  {
    id: 'driveway',
    name: 'Driveway',
    images: makeImages('Driveway', [
      { style: 'Modern Paver', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400' },
      { style: 'Gravel Classic', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
      { style: 'Circular Entry', url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400' },
    ]),
  },
  {
    id: 'patio',
    name: 'Patio',
    images: makeImages('Patio', [
      { style: 'Cozy Lounge', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400' },
      { style: 'Mediterranean', url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400' },
      { style: 'Modern Outdoor', url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400' },
    ]),
  },
  {
    id: 'garden',
    name: 'Garden',
    images: makeImages('Garden', [
      { style: 'English Garden', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400' },
      { style: 'Zen Garden', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
      { style: 'Tropical Paradise', url: 'https://images.unsplash.com/photo-1598902109542-37e6b9c56669?w=400' },
    ]),
  },
  {
    id: 'pool',
    name: 'Pool',
    images: makeImages('Pool', [
      { style: 'Resort Style', url: 'https://images.unsplash.com/photo-1576011001623-21021eb2f3f5?w=400' },
      { style: 'Infinity Edge', url: 'https://images.unsplash.com/photo-1512918728670-06b655de58d4?w=400' },
      { style: 'Family Pool', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400' },
    ]),
  },
  {
    id: 'outdoor-lighting',
    name: 'Outdoor Lighting',
    images: makeImages('Outdoor Lighting', [
      { style: 'Warm Ambient', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
      { style: 'Pathway Lights', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400' },
      { style: 'Festive Glow', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400' },
    ]),
  },
  {
    id: 'front-yard',
    name: 'Front Yard',
    images: makeImages('Front Yard', [
      { style: 'Curb Appeal', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
      { style: 'Modern Landscape', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400' },
      { style: 'Classic Colonial', url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400' },
    ]),
  },
  {
    id: 'backyard',
    name: 'Backyard',
    images: makeImages('Backyard', [
      { style: 'Lush Green', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
      { style: 'Entertainment Zone', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
      { style: 'Family Friendly', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400' },
    ]),
  },
  {
    id: 'modern-exterior',
    name: 'Modern Exterior',
    images: makeImages('Modern Exterior', [
      { style: 'Minimal Facade', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
      { style: 'Glass & Steel', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa0a6a3?w=400' },
      { style: 'Contemporary Entry', url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400' },
    ]),
  },
  {
    id: 'commercial-exterior',
    name: 'Commercial Exterior',
    images: makeImages('Commercial Exterior', [
      { style: 'Retail Front', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400' },
      { style: 'Office Building', url: 'https://images.unsplash.com/photo-1486325212027-808482e5f5c0?w=400' },
      { style: 'Restaurant Facade', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
    ]),
  },
];

export const exploreData = {
  interior: interiorCategories,
  exterior: exteriorCategories,
};

export type ExploreSegment = 'interior' | 'exterior';
