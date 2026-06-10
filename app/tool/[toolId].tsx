import { Redirect, useLocalSearchParams } from 'expo-router';

const TOOL_TO_PROJECT: Record<string, string> = {
  'airbnb-staging': 'airbnb-unit',
  'office-layout': 'office-space',
  'retail-layout': 'retail-store',
  'garden-design': 'backyard-landscape',
  'style-transfer': 'real-estate-listing',
  'virtual-staging': 'real-estate-listing',
};

export default function LegacyToolRedirect() {
  const { toolId } = useLocalSearchParams<{ toolId: string }>();
  const projectType = TOOL_TO_PROJECT[toolId ?? ''] ?? 'empty-commercial';
  return <Redirect href={`/project-intake/${projectType}`} />;
}
