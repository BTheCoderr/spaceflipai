export type PaintingStyle = {
  id: string;
  name: string;
  imageUrl: string;
};

export const paintingStyles: PaintingStyle[] = [
  { id: 'minimal-abstract', name: 'Minimal abstract', imageUrl: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=200' },
  { id: 'silhouette', name: 'Black silhouette art', imageUrl: 'https://images.unsplash.com/photo-1549490349-8643362244b8?w=200' },
  { id: 'renaissance', name: 'Renaissance portrait', imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200' },
  { id: 'pet-portrait', name: 'Pet portrait', imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200' },
  { id: 'coastal', name: 'Coastal landscape', imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200' },
  { id: 'line-art', name: 'Modern line art', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200' },
];

export type AspectRatio = '1:1' | '4:5' | '16:9' | '3:4';

export const aspectRatios: { key: AspectRatio; label: string }[] = [
  { key: '1:1', label: '1:1' },
  { key: '4:5', label: '4:5' },
  { key: '16:9', label: '16:9' },
  { key: '3:4', label: '3:4' },
];

export type FrameOption = 'none' | 'black' | 'white' | 'gold' | 'wood';

export const frameOptions: { key: FrameOption; label: string }[] = [
  { key: 'none', label: 'No Frame' },
  { key: 'black', label: 'Black' },
  { key: 'white', label: 'White' },
  { key: 'gold', label: 'Gold' },
  { key: 'wood', label: 'Wood' },
];

export const mockPaintingResultUrls = [
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600',
  'https://images.unsplash.com/photo-1549490349-8643362244b8?w=600',
  'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
];

export const mockPaintingResultUrl = mockPaintingResultUrls[0];
