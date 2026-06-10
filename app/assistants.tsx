import { Redirect } from 'expo-router';

export default function LegacyAssistantsRedirect() {
  return <Redirect href="/(tabs)/advisors" />;
}
