export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
  revenueCatAndroidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '',
};

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isApiConfigured(): boolean {
  return Boolean(env.apiBaseUrl);
}

export function isRevenueCatConfigured(): boolean {
  return Boolean(env.revenueCatIosKey || env.revenueCatAndroidKey);
}

export function isBackendLive(): boolean {
  return isSupabaseConfigured() || isApiConfigured();
}
