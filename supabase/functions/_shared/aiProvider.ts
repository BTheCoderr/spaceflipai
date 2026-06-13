const MOCK_RESULTS: Record<string, string> = {
  'airbnb-unit': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
  'office-space': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
  'retail-store': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
  'salon-studio': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
  'backyard-landscape': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600',
  'home-exterior': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
  'real-estate-listing': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
  'empty-commercial': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
};

const DEFAULT_MOCK =
  'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600';

export type GenerateUpgradeImageInput = {
  imageUrl: string;
  prompt: string;
  projectType: string;
};

export type GenerateUpgradeImageResult = {
  resultImageUrl: string;
  estimatedCostCents: number;
};

/**
 * Placeholder AI provider — returns a mock result URL by project type.
 * Replace with real provider call in Phase 10.
 */
export async function generateUpgradeImage(
  input: GenerateUpgradeImageInput
): Promise<GenerateUpgradeImageResult> {
  return mockGenerateUpgradeImage(input);
}

export async function mockGenerateUpgradeImage(
  input: GenerateUpgradeImageInput
): Promise<GenerateUpgradeImageResult> {
  const resultImageUrl = MOCK_RESULTS[input.projectType] ?? DEFAULT_MOCK;

  // Simulate provider latency without calling external AI.
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    resultImageUrl,
    estimatedCostCents: 0,
  };
}
