export type Assistant = {
  id: string;
  name: string;
  role: string;
  tagline: string;
  emoji: string;
  avatarUrl?: string;
  description: string;
  starterMessages: { role: 'assistant' | 'user'; text: string }[];
  mockResponses: string[];
};

export const assistants: Assistant[] = [
  {
    id: 'designer',
    name: 'Designer',
    role: 'Interior Designer',
    tagline: 'Generate smart space concepts',
    emoji: '🎨',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    description: 'Expert in interior design trends and room layouts.',
    starterMessages: [
      { role: 'assistant', text: "Hi! I'm your interior design assistant. What space would you like to transform today?" },
      { role: 'user', text: 'I want to redesign my living room.' },
    ],
    mockResponses: [
      "Great choice! For a living room refresh, I'd suggest starting with a neutral base and adding one statement piece.",
      "Consider the natural light in your room — lighter colors will make it feel more spacious.",
      "A cohesive color palette of 3-4 colors works best for a polished look.",
    ],
  },
  {
    id: 'landscape-gardener',
    name: 'Landscape Gardener',
    role: 'Landscape Gardener',
    tagline: 'Specializes in plant care and outdoor design',
    emoji: '🌿',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    description: 'Outdoor spaces, gardens, and landscaping advice.',
    starterMessages: [
      { role: 'assistant', text: "Hello! Ready to beautify your outdoor space? Tell me about your yard." },
      { role: 'user', text: 'I have a small backyard I want to improve.' },
    ],
    mockResponses: [
      "For small backyards, vertical gardens and multi-functional furniture are your best friends.",
      "Native plants require less maintenance and attract local wildlife.",
      "A focal point like a water feature can make even a small yard feel luxurious.",
    ],
  },
  {
    id: 'office-planner',
    name: 'Office Planner',
    role: 'Office Planner',
    tagline: 'Optimizes desk layouts and meeting rooms',
    emoji: '💼',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    description: 'Commercial and home office layout optimization.',
    starterMessages: [
      { role: 'assistant', text: "Let's design a productive workspace! What's your office setup like?" },
      { role: 'user', text: 'I need help organizing my home office.' },
    ],
    mockResponses: [
      "Position your desk near natural light but avoid glare on your screen.",
      "Ergonomic seating is the best investment for a home office.",
      "Keep frequently used items within arm's reach to minimize distractions.",
    ],
  },
  {
    id: 'airbnb-stager',
    name: 'Airbnb Stager',
    role: 'Airbnb Stager',
    tagline: 'Improves rental appeal and photo readiness',
    emoji: '🏠',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    description: 'Staging tips to maximize rental appeal and bookings.',
    starterMessages: [
      { role: 'assistant', text: "I'll help you stage your property for maximum guest appeal!" },
      { role: 'user', text: 'How do I make my rental stand out?' },
    ],
    mockResponses: [
      "First impressions matter — invest in quality bedding and fresh towels.",
      "Add local touches like artwork or guidebooks to create a memorable experience.",
      "Good lighting and neutral decor photograph well for listing photos.",
    ],
  },
  {
    id: 'retail-planner',
    name: 'Retail Planner',
    role: 'Retail Planner',
    tagline: 'Improves product displays and customer flow',
    emoji: '🛍️',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    description: 'Retail store layout and visual merchandising.',
    starterMessages: [
      { role: 'assistant', text: "Let's optimize your retail space for better customer flow and sales!" },
      { role: 'user', text: 'I have a small boutique to redesign.' },
    ],
    mockResponses: [
      "Create a clear path through your store — customers should naturally flow to key products.",
      "Eye-level displays get the most attention. Place bestsellers there.",
      "Consistent branding colors throughout the space builds trust.",
    ],
  },
  {
    id: 'craftsman',
    name: 'Craftsman',
    role: 'Craftsman',
    tagline: 'Provides precise tile, fabric, and installation guidance',
    emoji: '🔨',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
    description: 'DIY projects, materials, and craftsmanship tips.',
    starterMessages: [
      { role: 'assistant', text: "Ready for a DIY project? I can guide you through materials and techniques." },
      { role: 'user', text: 'I want to build a custom shelf.' },
    ],
    mockResponses: [
      "For floating shelves, use a French cleat system for maximum stability.",
      "Always pre-drill holes to prevent wood from splitting.",
      "Sand between coats of finish for a professional result.",
    ],
  },
  {
    id: 'safety-assistant',
    name: 'Safety Assistant',
    role: 'Safety Assistant',
    tagline: 'Detects and flags renovation safety hazards',
    emoji: '🛡️',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
    description: 'Home safety, childproofing, and hazard prevention.',
    starterMessages: [
      { role: 'assistant', text: "Safety first! Let me help you identify and fix potential hazards." },
      { role: 'user', text: 'How do I childproof my home?' },
    ],
    mockResponses: [
      "Secure heavy furniture to walls to prevent tipping.",
      "Install outlet covers and cabinet locks in kitchens and bathrooms.",
      "Keep cleaning supplies and medications in locked cabinets.",
    ],
  },
  {
    id: 'pet-care',
    name: 'Pet Care',
    role: 'Pet Care',
    tagline: 'Creates pet-safe home design solutions',
    emoji: '🐾',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
    description: 'Pet-friendly home design and care tips.',
    starterMessages: [
      { role: 'assistant', text: "Let's create a home that's comfortable for you and your pets!" },
      { role: 'user', text: 'I need a pet-friendly living room.' },
    ],
    mockResponses: [
      "Choose durable, stain-resistant fabrics like microfiber or leather.",
      "Designate a cozy corner with a pet bed away from high-traffic areas.",
      "Keep houseplants pet-safe — avoid lilies, pothos, and sago palms.",
    ],
  },
  {
    id: 'sleep-expert',
    name: 'Sleep Expert',
    role: 'Sleep Expert',
    tagline: 'Designs sleep-enhancing bedroom layouts',
    emoji: '😴',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    description: 'Bedroom design for better sleep quality.',
    starterMessages: [
      { role: 'assistant', text: "A well-designed bedroom can transform your sleep quality. Tell me about yours." },
      { role: 'user', text: 'I struggle to sleep well.' },
    ],
    mockResponses: [
      "Keep your bedroom cool — around 65°F (18°C) is ideal for sleep.",
      "Blackout curtains and minimal blue light exposure help regulate melatonin.",
      "A clutter-free bedroom reduces mental stimulation before bed.",
    ],
  },
  {
    id: 'home-organizer',
    name: 'Home Organizer',
    role: 'Home Organizer',
    tagline: 'Delivers compact home storage strategies',
    emoji: '📦',
    avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100',
    description: 'Decluttering and organization systems.',
    starterMessages: [
      { role: 'assistant', text: "Let's get your space organized! Which area needs the most help?" },
      { role: 'user', text: 'My closet is a disaster.' },
    ],
    mockResponses: [
      "Start with the one-in-one-out rule to prevent clutter from returning.",
      "Use vertical space with shelf dividers and hanging organizers.",
      "Group items by category and frequency of use for easy access.",
    ],
  },
  {
    id: 'cleaning-crew',
    name: 'Cleaning Crew',
    role: 'Cleaning Crew',
    tagline: 'Creates post-renovation cleaning checklists',
    emoji: '✨',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
    description: 'Cleaning schedules and maintenance routines.',
    starterMessages: [
      { role: 'assistant', text: "I'll help you build an efficient cleaning routine for your home!" },
      { role: 'user', text: 'What should I clean weekly?' },
    ],
    mockResponses: [
      "Focus on high-touch surfaces: doorknobs, light switches, and countertops.",
      "Vacuum and mop floors weekly, and dust surfaces from top to bottom.",
      "A 15-minute daily tidy prevents weekend cleaning marathons.",
    ],
  },
];

export const aiPromptSuggestions = [
  'Design a modern kitchen renovation for my old house.',
  'What wall paints resist pet stains?',
  'How to make a balcony feel bigger?',
  'I want to decorate a princess-style room for my daughter.',
  'What colors make a bedroom feel calmer?',
  'How should I arrange furniture in a small office?',
];

export const getAssistantById = (id: string): Assistant | undefined =>
  assistants.find((a) => a.id === id);
