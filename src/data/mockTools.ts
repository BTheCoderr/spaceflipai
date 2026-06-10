import type { LoadingType } from '../lib/mockGenerationSteps';

export type ToolCategory = 'recommend' | 'interior' | 'exterior' | 'commercial';

export type DesignTool = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: ToolCategory;
  imageUrl: string;
  inputType: 'interior' | 'exterior' | 'floor_plan' | 'commercial' | 'messy' | 'furnished';
  loadingType: LoadingType;
  resultImageUrls: [string, string, string];
  promptPlaceholder: string;
};

const R = (a: string, b: string, c: string): [string, string, string] => [a, b, c];

const IMG = {
  modern: 'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600',
  scandi: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
  bedroom: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600',
  kitchen: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600',
  garden: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600',
  patio: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600',
  pool: 'https://images.unsplash.com/photo-1576011001623-21021eb2f3f5?w=600',
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
  retail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
  exterior: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
  staging: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
  empty: 'https://images.unsplash.com/photo-1598928506311-c55ded91a2c3?w=600',
  walls: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600',
  floor: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600',
  clean: 'https://images.unsplash.com/photo-1524758631624-e2822e3048f5?w=600',
  driveway: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
  storefront: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
};

export const designTools: DesignTool[] = [
  // Recommend
  { id: 'floor-plan', title: 'Floor Plan', subtitle: 'Turn a layout into real design', description: 'Upload a floor plan sketch or blueprint and preview a furnished layout with realistic styling.', category: 'recommend', imageUrl: IMG.office, inputType: 'floor_plan', loadingType: 'redesign', resultImageUrls: R(IMG.modern, IMG.office, IMG.scandi), promptPlaceholder: 'Describe the layout style you want…' },
  { id: 'style-transfer', title: 'Style Transfer', subtitle: 'Apply a style from a reference image', description: 'Upload your room photo and apply a design style inspired by reference aesthetics.', category: 'recommend', imageUrl: IMG.modern, inputType: 'interior', loadingType: 'redesign', resultImageUrls: R(IMG.modern, IMG.scandi, IMG.walls), promptPlaceholder: 'Describe the style mood you want…' },
  { id: 'interior-design', title: 'Interior Design', subtitle: 'Redesign your interior space', description: 'Transform any interior room with AI-guided furniture, color, and decor suggestions.', category: 'recommend', imageUrl: IMG.scandi, inputType: 'interior', loadingType: 'redesign', resultImageUrls: R(IMG.scandi, IMG.modern, IMG.bedroom), promptPlaceholder: 'What should change in this room?' },
  { id: 'garden-design', title: 'Garden Design', subtitle: 'Reimagine your outdoor space', description: 'Visualize new planting, pathways, and outdoor zones for your garden.', category: 'recommend', imageUrl: IMG.garden, inputType: 'exterior', loadingType: 'exterior', resultImageUrls: R(IMG.garden, IMG.patio, IMG.pool), promptPlaceholder: 'Describe your dream garden…' },
  { id: 'rearrange-layout', title: 'Rearrange Layout', subtitle: 'Get a new furniture layout', description: 'Keep your room but explore fresh furniture arrangements and traffic flow.', category: 'recommend', imageUrl: IMG.bedroom, inputType: 'interior', loadingType: 'redesign', resultImageUrls: R(IMG.bedroom, IMG.modern, IMG.scandi), promptPlaceholder: 'How should furniture be arranged?' },
  { id: 'magic-replace-add', title: 'Magic Replace & Add', subtitle: 'Replace or add items in your space', description: 'Swap furniture pieces or add new decor without changing the whole room.', category: 'recommend', imageUrl: IMG.walls, inputType: 'interior', loadingType: 'redesign', resultImageUrls: R(IMG.walls, IMG.modern, IMG.scandi), promptPlaceholder: 'What items should be replaced or added?' },
  { id: 'airbnb-staging', title: 'Airbnb Staging', subtitle: 'Make your listing photo-ready', description: 'Stage empty or dated rooms for high-converting rental photos.', category: 'recommend', imageUrl: IMG.staging, inputType: 'interior', loadingType: 'commercial', resultImageUrls: R(IMG.staging, IMG.modern, IMG.bedroom), promptPlaceholder: 'Describe the guest experience you want…' },
  { id: 'office-layout', title: 'Office Layout', subtitle: 'Plan desks, meeting rooms, and flow', description: 'Optimize desk clusters, meeting areas, and circulation for productivity.', category: 'recommend', imageUrl: IMG.office, inputType: 'floor_plan', loadingType: 'commercial', resultImageUrls: R(IMG.office, IMG.retail, IMG.modern), promptPlaceholder: 'Describe team size and workflow needs…' },
  { id: 'retail-layout', title: 'Retail Layout', subtitle: 'Improve displays and customer flow', description: 'Improve product zones, aisles, and checkout flow for retail spaces.', category: 'recommend', imageUrl: IMG.retail, inputType: 'commercial', loadingType: 'commercial', resultImageUrls: R(IMG.retail, IMG.office, IMG.staging), promptPlaceholder: 'Describe your store type and goals…' },

  // Interior
  { id: 'virtual-staging', title: 'Virtual Staging', subtitle: 'Preview new looks in seconds', description: 'Upload an empty room and preview staged furniture and decor instantly.', category: 'interior', imageUrl: IMG.empty, inputType: 'interior', loadingType: 'redesign', resultImageUrls: R(IMG.staging, IMG.modern, IMG.scandi), promptPlaceholder: 'Describe the staged look you want…' },
  { id: 'new-walls', title: 'New Walls', subtitle: 'Replace and display your new walls', description: 'Try new wall colors, textures, and accent treatments on your room photo.', category: 'interior', imageUrl: IMG.walls, inputType: 'interior', loadingType: 'new_walls', resultImageUrls: R(IMG.walls, IMG.scandi, IMG.modern), promptPlaceholder: 'Describe wall color or material…' },
  { id: 'new-window', title: 'New Window', subtitle: 'Replace and display your new window', description: 'Visualize updated window styles, frames, and natural light changes.', category: 'interior', imageUrl: IMG.modern, inputType: 'interior', loadingType: 'redesign', resultImageUrls: R(IMG.modern, IMG.scandi, IMG.bedroom), promptPlaceholder: 'Describe the window style you prefer…' },
  { id: 'new-flooring', title: 'New Flooring', subtitle: 'Replace and display your new flooring', description: 'Preview hardwood, tile, or carpet options matched to your room lighting.', category: 'interior', imageUrl: IMG.floor, inputType: 'interior', loadingType: 'new_flooring', resultImageUrls: R(IMG.floor, IMG.modern, IMG.scandi), promptPlaceholder: 'Describe flooring material and tone…' },
  { id: 'declutter', title: 'Declutter', subtitle: 'Clean and organize your space', description: 'Upload a messy room and preview a cleaner, organized version.', category: 'interior', imageUrl: IMG.clean, inputType: 'messy', loadingType: 'declutter_cleanup', resultImageUrls: R(IMG.clean, IMG.scandi, IMG.modern), promptPlaceholder: 'What clutter should be removed?' },
  { id: 'remove-furniture', title: 'Remove Furniture', subtitle: 'Empty your room with one tap', description: 'Remove existing furniture and preview an empty shell for replanning.', category: 'interior', imageUrl: IMG.empty, inputType: 'furnished', loadingType: 'remove_furniture', resultImageUrls: R(IMG.empty, IMG.clean, IMG.scandi), promptPlaceholder: 'Which furniture should be removed?' },
  { id: 'cleanup', title: 'Cleanup', subtitle: 'Remove unwanted objects', description: 'Erase distracting objects and visual noise from your room photo.', category: 'interior', imageUrl: IMG.scandi, inputType: 'interior', loadingType: 'declutter_cleanup', resultImageUrls: R(IMG.scandi, IMG.clean, IMG.modern), promptPlaceholder: 'What objects should disappear?' },
  { id: 'interior-style-transfer', title: 'Style Transfer', subtitle: 'Apply a style from a reference image', description: 'Apply a reference design style to your interior photo.', category: 'interior', imageUrl: IMG.modern, inputType: 'interior', loadingType: 'redesign', resultImageUrls: R(IMG.modern, IMG.walls, IMG.scandi), promptPlaceholder: 'Describe the reference style…' },
  { id: 'interior-floor-plan', title: 'Floor Plan', subtitle: 'Turn a layout into real design', description: 'Convert a layout sketch into a styled interior visualization.', category: 'interior', imageUrl: IMG.office, inputType: 'floor_plan', loadingType: 'redesign', resultImageUrls: R(IMG.office, IMG.modern, IMG.scandi), promptPlaceholder: 'Describe room functions and style…' },

  // Exterior
  { id: 'exterior-design', title: 'Exterior Design', subtitle: 'Redesign your exterior space', description: 'Refresh facades, materials, and outdoor styling for your home.', category: 'exterior', imageUrl: IMG.exterior, inputType: 'exterior', loadingType: 'exterior', resultImageUrls: R(IMG.exterior, IMG.driveway, IMG.patio), promptPlaceholder: 'Describe exterior style changes…' },
  { id: 'driveway', title: 'Driveway', subtitle: 'Upgrade your driveway design', description: 'Preview new driveway materials, edges, and landscaping.', category: 'exterior', imageUrl: IMG.driveway, inputType: 'exterior', loadingType: 'exterior', resultImageUrls: R(IMG.driveway, IMG.exterior, IMG.patio), promptPlaceholder: 'Describe driveway material and shape…' },
  { id: 'patio', title: 'Patio', subtitle: 'Create your perfect outdoor patio', description: 'Design seating, pavers, and outdoor living zones for your patio.', category: 'exterior', imageUrl: IMG.patio, inputType: 'exterior', loadingType: 'exterior', resultImageUrls: R(IMG.patio, IMG.garden, IMG.pool), promptPlaceholder: 'Describe patio layout and vibe…' },
  { id: 'exterior-painting-facade', title: 'Exterior Painting & Facade', subtitle: "Refresh your home's exterior look", description: 'Try new exterior paint colors and facade materials on your house photo.', category: 'exterior', imageUrl: IMG.exterior, inputType: 'exterior', loadingType: 'exterior', resultImageUrls: R(IMG.exterior, IMG.driveway, IMG.storefront), promptPlaceholder: 'Describe colors and facade details…' },
  { id: 'exterior-garden-design', title: 'Garden Design', subtitle: 'Reimagine your outdoor space', description: 'Plan beds, paths, and planting for your yard.', category: 'exterior', imageUrl: IMG.garden, inputType: 'exterior', loadingType: 'exterior', resultImageUrls: R(IMG.garden, IMG.patio, IMG.pool), promptPlaceholder: 'Describe plants and garden zones…' },
  { id: 'pool', title: 'Pool', subtitle: 'Design your ideal pool area', description: 'Visualize pool shape, decking, and surrounding lounge areas.', category: 'exterior', imageUrl: IMG.pool, inputType: 'exterior', loadingType: 'exterior', resultImageUrls: R(IMG.pool, IMG.patio, IMG.garden), promptPlaceholder: 'Describe pool style and surroundings…' },
  { id: 'outdoor-lighting', title: 'Outdoor Lighting', subtitle: 'Illuminate your outdoor space', description: 'Preview pathway, accent, and ambient lighting schemes outdoors.', category: 'exterior', imageUrl: IMG.exterior, inputType: 'exterior', loadingType: 'exterior', resultImageUrls: R(IMG.exterior, IMG.patio, IMG.driveway), promptPlaceholder: 'Describe lighting mood and zones…' },
  { id: 'backyard-lounge', title: 'Backyard Lounge', subtitle: 'Create a relaxing outdoor retreat', description: 'Design cozy seating, fire features, and shade for your backyard.', category: 'exterior', imageUrl: IMG.patio, inputType: 'exterior', loadingType: 'exterior', resultImageUrls: R(IMG.patio, IMG.garden, IMG.pool), promptPlaceholder: 'Describe lounge layout and materials…' },
  { id: 'front-yard', title: 'Front Yard', subtitle: 'Improve curb appeal', description: 'Enhance planting, walkways, and entry styling for curb appeal.', category: 'exterior', imageUrl: IMG.driveway, inputType: 'exterior', loadingType: 'exterior', resultImageUrls: R(IMG.driveway, IMG.exterior, IMG.garden), promptPlaceholder: 'Describe curb appeal goals…' },

  // Commercial
  { id: 'commercial-office-layout', title: 'Office Layout', subtitle: 'Plan desks, meeting rooms, and flow', description: 'Plan desk banks, collaboration zones, and meeting room placement.', category: 'commercial', imageUrl: IMG.office, inputType: 'floor_plan', loadingType: 'commercial', resultImageUrls: R(IMG.office, IMG.retail, IMG.modern), promptPlaceholder: 'Describe headcount and departments…' },
  { id: 'commercial-retail-layout', title: 'Retail Layout', subtitle: 'Improve displays and customer movement', description: 'Optimize aisles, displays, and customer paths in retail spaces.', category: 'commercial', imageUrl: IMG.retail, inputType: 'commercial', loadingType: 'commercial', resultImageUrls: R(IMG.retail, IMG.staging, IMG.office), promptPlaceholder: 'Describe product categories and flow…' },
  { id: 'commercial-airbnb-staging', title: 'Airbnb Staging', subtitle: 'Make your listing photo-ready', description: 'Stage rental interiors for booking-ready photography.', category: 'commercial', imageUrl: IMG.staging, inputType: 'interior', loadingType: 'commercial', resultImageUrls: R(IMG.staging, IMG.modern, IMG.bedroom), promptPlaceholder: 'Describe target guest profile…' },
  { id: 'restaurant-layout', title: 'Restaurant Layout', subtitle: 'Plan dining, waiting, and service zones', description: 'Arrange dining tables, bar, kitchen access, and guest flow.', category: 'commercial', imageUrl: IMG.restaurant, inputType: 'commercial', loadingType: 'commercial', resultImageUrls: R(IMG.restaurant, IMG.retail, IMG.office), promptPlaceholder: 'Describe seating count and service style…' },
  { id: 'salon-studio-layout', title: 'Salon / Studio Layout', subtitle: 'Organize stations and client flow', description: 'Plan stylist stations, waiting, and back-of-house zones.', category: 'commercial', imageUrl: IMG.salon, inputType: 'commercial', loadingType: 'commercial', resultImageUrls: R(IMG.salon, IMG.retail, IMG.office), promptPlaceholder: 'Describe stations and services…' },
  { id: 'real-estate-staging', title: 'Real Estate Staging', subtitle: 'Virtually stage empty listing photos', description: 'Virtually furnish empty listings for real estate marketing.', category: 'commercial', imageUrl: IMG.staging, inputType: 'interior', loadingType: 'commercial', resultImageUrls: R(IMG.staging, IMG.modern, IMG.scandi), promptPlaceholder: 'Describe buyer persona and price point…' },
  { id: 'commercial-exterior', title: 'Commercial Exterior', subtitle: 'Improve storefront and curb appeal', description: 'Refresh storefront signage, materials, and entry appeal.', category: 'commercial', imageUrl: IMG.storefront, inputType: 'exterior', loadingType: 'exterior', resultImageUrls: R(IMG.storefront, IMG.exterior, IMG.driveway), promptPlaceholder: 'Describe brand and storefront goals…' },
];

export type DesignFilter = ToolCategory;

export const designFilters: { key: DesignFilter; label: string }[] = [
  { key: 'recommend', label: 'Recommend' },
  { key: 'interior', label: 'Interior' },
  { key: 'exterior', label: 'Exterior' },
  { key: 'commercial', label: 'Commercial' },
];

export const sectionTitles: Record<Exclude<ToolCategory, 'recommend'>, string> = {
  interior: 'Interior',
  exterior: 'Exterior',
  commercial: 'Commercial',
};

export function getToolsByCategory(category: ToolCategory): DesignTool[] {
  return designTools.filter((t) => t.category === category);
}

export function getToolById(id: string): DesignTool | undefined {
  return designTools.find((t) => t.id === id);
}

/** @deprecated use DesignTool */
export type DesignCard = DesignTool;
export const getDesignCardsByFilter = getToolsByCategory;
