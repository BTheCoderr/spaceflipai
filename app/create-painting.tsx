import { Redirect } from 'expo-router';

export default function LegacyCreatePaintingRedirect() {
  return <Redirect href="/(tabs)/visualize" />;
}
