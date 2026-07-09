/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Primary/colors taken from the frontend web `:root` CSS variables to keep
// colorimetry consistent between web and mobile apps.
const PRIMARY = '#7d2181';
const PRIMARY_DARK = '#ff0080';
const PRIMARY_LIGHT = '#c72f9f';
const SECONDARY = '#ffd700';
const SUCCESS = '#10b981';
const WARNING = '#f59e0b';
const DANGER = '#ef4444';
const BACKGROUND_LIGHT = '#f8f2ff';
const TEXT_DARK = '#1f2937';
const ICON_GRAY = '#4b5563';
const ICON_GRAY_DARK = '#9BA1A6';
const BACKGROUND_DARK = '#000000';
const TEXT_LIGHT = '#f8fafc';
const SURFACE_LIGHT = '#ffffff';
const SURFACE_SOFT_LIGHT = '#f3f4f6';
const SURFACE_DARK = 'rgba(255,255,255,0.12)';
const SURFACE_SOFT_DARK = 'rgba(255,255,255,0.08)';
const BORDER_LIGHT = '#e5e7eb';
const BORDER_DARK = 'rgba(255,255,255,0.10)';

export const Colors = {
  light: {
    text: TEXT_DARK,
    background: BACKGROUND_LIGHT,
    tint: PRIMARY,
    primary: PRIMARY,
    primaryDark: PRIMARY_DARK,
    primaryLight: PRIMARY_LIGHT,
    secondary: SECONDARY,
    success: SUCCESS,
    warning: WARNING,
    danger: DANGER,
    icon: ICON_GRAY,
    tabIconDefault: ICON_GRAY,
    tabIconSelected: PRIMARY,
    surface: SURFACE_LIGHT,
    surfaceSoft: SURFACE_SOFT_LIGHT,
    surfaceTransparent: 'rgba(255,255,255,0.15)',
    border: BORDER_LIGHT,
    shadow: 'rgba(0,0,0,0.05)',
  },
  dark: {
    text: TEXT_LIGHT,
    background: BACKGROUND_DARK,
    tint: '#ffffff',
    primary: PRIMARY,
    primaryDark: PRIMARY_DARK,
    primaryLight: PRIMARY_LIGHT,
    secondary: SECONDARY,
    success: SUCCESS,
    warning: WARNING,
    danger: DANGER,
    icon: ICON_GRAY_DARK,
    tabIconDefault: ICON_GRAY_DARK,
    tabIconSelected: '#ffffff',
    surface: SURFACE_DARK,
    surfaceSoft: SURFACE_SOFT_DARK,
    surfaceTransparent: 'rgba(255,255,255,0.20)',
    border: BORDER_DARK,
    shadow: 'rgba(0,0,0,0.30)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
