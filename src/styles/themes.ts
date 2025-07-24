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
}

export const themeColors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    primary: '#2563eb',
    secondary: '#7c3aed',
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: '#1e293b',
    textSecondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  dark: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#0f172a',
    surface: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
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