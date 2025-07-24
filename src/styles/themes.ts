export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  overlay: string;
}

export const themeColors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    primary: '#2563eb',
    secondary: '#3b82f6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    overlay: 'rgba(0,0,0,0.5)'
  },
  dark: {
    primary: '#3b82f6',
    secondary: '#60a5fa',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#374151',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    overlay: 'rgba(0,0,0,0.7)'
  }
};

// CSS Custom Properties for dynamic theming
export const setCSSVariables = (theme: 'light' | 'dark') => {
  const colors = themeColors[theme];
  const root = document.documentElement;
  
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
};

// Utility function to get Matn status colors
export const getMatnColor = (status: 'red' | 'orange' | 'green'): string => {
  switch (status) {
    case 'red': return '#ef4444';
    case 'orange': return '#f59e0b';
    case 'green': return '#10b981';
  }
};

// Utility function to get student status colors
export const getStatusColor = (status: 'not_available' | 'revising' | 'khatamat'): string => {
  switch (status) {
    case 'not_available': return '#ef4444';
    case 'revising': return '#f59e0b';
    case 'khatamat': return '#10b981';
  }
};