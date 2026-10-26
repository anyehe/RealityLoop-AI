export const dashboardTheme = {
  colors: {
    canvas: '#041B2A',
    sidebar: '#061524',
    sidebarDeep: '#030D18',
    surface: '#072638',
    surfaceRaised: '#0A3044',
    surfaceSoft: '#0B354A',
    border: '#14536A',
    borderStrong: '#19B7D2',
    text: '#EAF8FC',
    textSecondary: '#9DC1CD',
    textMuted: '#6E98A8',
    cyan: '#22D3EE',
    sky: '#62C7FF',
    teal: '#2DD4BF',
    blue: '#5B8CFF',
    pink: '#FF6F9F',
    amber: '#F5B942',
    success: '#4ADE80',
    danger: '#FB7185',
  },
  radius: { sm: 4, md: 6, lg: 8 },
  spacing: { xs: 6, sm: 10, md: 16, lg: 22, xl: 30 },
} as const;

export type DashboardTheme = typeof dashboardTheme;
