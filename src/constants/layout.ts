import { Dimensions } from 'react-native';
import { spacing } from './theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenPadding: spacing.md,
  /** Two-column card width with gutter — avoids horizontal overflow */
  gridCardWidth: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm) / 2,
  /** Three-column style grid with two gutters */
  styleGridCardWidth: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm * 2) / 3,
  inspirationCardSize: Math.min(148, SCREEN_WIDTH * 0.38),
  tabBarHeight: 56,
};

/** Ensure Unsplash URLs load reliably on device */
export function normalizeImageUrl(url: string): string {
  if (!url) return url;
  if (url.includes('images.unsplash.com') && !url.includes('auto=format')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}auto=format&fit=crop&q=80`;
  }
  return url;
}
