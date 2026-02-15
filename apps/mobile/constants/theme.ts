import { Platform } from 'react-native';

export const theme = {
  background: "#121212",
  surface: "#1E1E1E",
  surfaceLight: "#2A2A2A",
  border: "#333333",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textTertiary: "#666666",
  accent: "#007AFF",
  danger: "#FF453A",
  success: "#30D158",
  overlay: "rgba(0,0,0,0.7)",
} as const;

export const stepColors = [
  "#FF3B30",
  "#FF6B2C",
  "#FFB800",
  "#34C759",
  "#30D158",
  "#00C7BE",
  "#32ADE6",
  "#007AFF",
  "#5856D6",
  "#AF52DE",
  "#FF2D55",
  "#FF375F",
] as const;

export function getStepColor(stepIndex: number): string {
  return stepColors[stepIndex % stepColors.length];
}

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
