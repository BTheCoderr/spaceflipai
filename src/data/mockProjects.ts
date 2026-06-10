/**
 * Seed projects for demos. Live saves use in-memory store in generation.ts.
 */
export type MockProject = {
  id: string;
  title: string;
  roomType: string;
  designStyle: string;
  imageUrl: string;
  toolId?: string;
};

export const seedProjects: MockProject[] = [];
