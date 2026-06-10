import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LegacyAssistantRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/advisor/${id ?? 'airbnb-revenue'}`} />;
}
