/** Central site config — update these before public launch. */
export const siteConfig = {
  name: 'SpaceFlip Pro',
  tagline: 'AI upgrade plans for properties and spaces',
  /** Replace with your custom domain after deploy, e.g. https://spaceflippro.com */
  domain: 'https://YOUR_DEPLOYED_DOMAIN',
  /** Replace when a dedicated support inbox is ready */
  supportEmail: 'bferrell514@gmail.com',
  /** Future: support@spaceflippro.com */
  supportEmailFuture: 'support@spaceflippro.com',
  appStoreUrl: 'https://apps.apple.com/app/id6781121807',
  /** Set to true when the app is live on the App Store */
  appStoreLive: false,
  effectiveDate: 'June 17, 2026',
  companyName: 'SpaceFlip Pro',
} as const;

export function mailto(subject?: string): string {
  const base = `mailto:${siteConfig.supportEmail}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
