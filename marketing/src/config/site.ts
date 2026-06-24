/** Central site config — update these before public launch. */
export const siteConfig = {
  name: 'SpaceFlip Pro',
  tagline: 'Turn property photos into practical upgrade plans',
  description:
    'Upload a property photo and get a budget, materials list, checklist, and PDF handoff for your next upgrade.',
  domain: 'https://spaceflippro.netlify.app',
  /** Replace when a dedicated support inbox is ready */
  supportEmail: 'bferrell514@gmail.com',
  /** Future: support@spaceflippro.com */
  supportEmailFuture: 'support@spaceflippro.com',
  appStoreUrl: 'https://apps.apple.com/app/id6781121807',
  /** Set to true when the app is live on the App Store */
  appStoreLive: false,
  effectiveDate: 'June 17, 2026',
  companyName: 'SpaceFlip Pro',
  supportResponseTime: 'usually within 2–3 business days',
} as const;

export function mailto(subject?: string): string {
  const base = `mailto:${siteConfig.supportEmail}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}

export function pageUrl(path = ''): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return path === '' || path === '/'
    ? `${siteConfig.domain}/`
    : `${siteConfig.domain}${normalized}`;
}
