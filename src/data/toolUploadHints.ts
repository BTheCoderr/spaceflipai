/** Tool-specific upload guidance shown on the upload screen. */
export const toolUploadHints: Record<string, string> = {
  'virtual-staging': 'Upload an empty or outdated room photo',
  'new-walls': 'Upload a room photo with visible walls',
  'new-flooring': 'Upload a room photo with visible floor',
  declutter: 'Upload a messy room photo',
  'remove-furniture': 'Upload a furnished room photo',
  'exterior-design': 'Upload your home exterior',
  driveway: 'Upload your driveway or front approach',
  patio: 'Upload your patio or backyard space',
  'commercial-office-layout': 'Upload your office or floor plan',
  'office-layout': 'Upload your office or floor plan',
  'commercial-retail-layout': 'Upload your store or display area',
  'retail-layout': 'Upload your store or display area',
};

export function getToolUploadHint(toolId: string, fallback: string): string {
  return toolUploadHints[toolId] ?? fallback;
}
