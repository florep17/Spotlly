import { createContext, useContext, useMemo } from 'react';

export const lightColors = {
  surface: '#ffffff',
  background: '#f9fafb',
  mutedSurface: '#f3f4f6',
  controlSurface: '#f1f5f9',
  border: '#e5e7eb',
  subtleBorder: '#f3f4f6',
  strongBorder: '#d1d5db',
  text: '#111827',
  heading: '#1f2937',
  secondary: '#4b5563',
  label: '#374151',
  muted: '#6b7280',
  subdued: '#64748b',
  placeholder: '#9ca3af',
  disabled: '#9ca3af',
  brand: '#1b5e3a',
  accent: '#1b5e3a',
  accentText: '#065f46',
  accentSurface: '#ecfdf5',
  successSurface: '#d1fae5',
  successPanel: '#f0fdf4',
  success: '#059669',
  mapBackground: '#e5eae8',
  mapControl: '#1e4620',
  danger: '#ef4444',
  dangerText: '#b91c1c',
  dangerSurface: '#fff5f5',
  errorSurface: '#fef2f2',
  dangerTint: '#fee2e2',
  dangerBorder: '#fecaca',
};

export type ThemeColors = typeof lightColors;

const darkColors: ThemeColors = {
  surface: '#141d19',
  background: '#0e1512',
  mutedSurface: '#202c26',
  controlSurface: '#202c26',
  border: '#34443b',
  subtleBorder: '#293831',
  strongBorder: '#4c6155',
  text: '#edf7f0',
  heading: '#e4f0e8',
  secondary: '#b8c9be',
  label: '#c9d8cf',
  muted: '#a5b8ac',
  subdued: '#a5b8ac',
  placeholder: '#91a69a',
  disabled: '#52635a',
  brand: '#226944',
  accent: '#81dfab',
  accentText: '#9ce6bc',
  accentSurface: '#1b3a2a',
  successSurface: '#204834',
  successPanel: '#152d21',
  success: '#71dca1',
  mapBackground: '#1a2420',
  mapControl: '#9ce6bc',
  danger: '#ff9292',
  dangerText: '#ffacac',
  dangerSurface: '#301d20',
  errorSurface: '#321e21',
  dangerTint: '#48262b',
  dangerBorder: '#754348',
};

export const DarkModeContext = createContext(false);

export function useDarkMode() {
  return useContext(DarkModeContext);
}

export function useThemeColors() {
  return useDarkMode() ? darkColors : lightColors;
}

export function useThemedStyles<T>(createStyles: (colors: ThemeColors) => T) {
  const colors = useThemeColors();
  return useMemo(() => createStyles(colors), [createStyles, colors]);
}
