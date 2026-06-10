export const colors = {
  background: '#FAFAF8',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  pillActive: '#1B4332',
  pillInactive: '#F3F4F6',
  pillInactiveText: '#6B7280',
  shadow: 'rgba(17, 24, 39, 0.08)',
  proGradientStart: '#1B4332',
  proGradientEnd: '#2D6A4F',
  accent: '#1B4332',
  accentSecondary: '#B8860B',
  navy: '#1E3A5F',
  statusActive: '#1B4332',
  statusDraft: '#6B7280',
  statusCompleted: '#2D6A4F',
  skeleton: '#E5E7EB',
  imageFallback: '#F3F4F6',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  tabBarExtra: 12,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  subtle: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
};

export const interaction = {
  pressedOpacity: 0.65,
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
};

export const typography = {
  largeTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.3,
  },
  heading: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.text,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 18,
  },
};
