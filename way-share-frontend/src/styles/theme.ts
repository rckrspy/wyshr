import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { colors, spacing, typography, elevation, borderRadius } from './designTokens';

// Extend the theme to include custom properties
declare module '@mui/material/styles' {
  interface Theme {
    customSpacing: typeof spacing;
    customElevation: typeof elevation;
    driverScore: {
      excellent: string;
      good: string;
      fair: string;
      poor: string;
      veryPoor: string;
    };
    layout: {
      flexContainer: {
        display: string;
        flexDirection: string;
        flexGrow: number;
        minHeight: number;
      };
      flexItem: {
        flexGrow: number;
        minHeight: number;
      };
    };
  }
  
  interface ThemeOptions {
    customSpacing?: typeof spacing;
    customElevation?: typeof elevation;
    driverScore?: {
      excellent?: string;
      good?: string;
      fair?: string;
      poor?: string;
      veryPoor?: string;
    };
    layout?: {
      flexContainer?: {
        display?: string;
        flexDirection?: string;
        flexGrow?: number;
        minHeight?: number;
      };
      flexItem?: {
        flexGrow?: number;
        minHeight?: number;
      };
    };
  }
}

// Create a theme instance
let theme = createTheme({
  palette: {
    primary: {
      main: colors.primary[500],
      light: colors.primary[100],
      dark: colors.primary[900],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary[500],
      light: colors.secondary[100],
      dark: colors.secondary[900],
      contrastText: '#ffffff',
    },
    error: {
      main: colors.error[500],
      light: colors.error[100],
      dark: colors.error[900],
    },
    warning: {
      main: colors.warning[500],
      light: colors.warning[100],
      dark: colors.warning[900],
    },
    success: {
      main: colors.success[500],
      light: colors.success[100],
      dark: colors.success[900],
    },
    background: {
      default: colors.gray[50],
      paper: '#ffffff',
    },
    text: {
      primary: colors.gray[900],
      secondary: colors.gray[600],
    },
    divider: colors.gray[200],
  },
  customSpacing: spacing,
  customElevation: elevation,
  driverScore: {
    excellent: colors.success[500],
    good: colors.success[600],
    fair: colors.warning[500],
    poor: colors.error[500],
    veryPoor: colors.error[600],
  },
  layout: {
    flexContainer: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      minHeight: 0,
    },
    flexItem: {
      flexGrow: 1,
      minHeight: 0,
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // Enhanced typography scale
    h1: {
      fontWeight: typography.fontWeights.bold,
      fontSize: typography.fontSizes['4xl'],
      lineHeight: typography.lineHeights.tight,
    },
    h2: {
      fontWeight: typography.fontWeights.semibold,
      fontSize: typography.fontSizes['3xl'],
      lineHeight: typography.lineHeights.tight,
    },
    h3: {
      fontWeight: typography.fontWeights.semibold,
      fontSize: typography.fontSizes['2xl'],
      lineHeight: typography.lineHeights.normal,
    },
    h4: {
      fontWeight: typography.fontWeights.semibold,
      fontSize: typography.fontSizes.xl,
      lineHeight: typography.lineHeights.normal,
    },
    h5: {
      fontWeight: typography.fontWeights.medium,
      fontSize: typography.fontSizes.lg,
      lineHeight: typography.lineHeights.normal,
    },
    h6: {
      fontWeight: typography.fontWeights.medium,
      fontSize: typography.fontSizes.base,
      lineHeight: typography.lineHeights.normal,
    },
    body1: {
      fontSize: typography.fontSizes.base,
      lineHeight: typography.lineHeights.normal,
    },
    body2: {
      fontSize: typography.fontSizes.sm,
      lineHeight: typography.lineHeights.normal,
    },
    button: {
      textTransform: 'none',
      fontWeight: typography.fontWeights.medium,
      fontSize: typography.fontSizes.base,
    },
  },
  shape: {
    borderRadius: 8,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  components: {
    MuiGrid: {
      defaultProps: {
        spacing: 2, // Standardize Grid spacing to 2 (16px)
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: borderRadius.lg,
          padding: `${spacing.sm}px ${spacing.md}px`,
          minHeight: '44px', // Touch target
          fontSize: typography.fontSizes.base,
          fontWeight: typography.fontWeights.medium,
          transition: `all ${theme.transitions.duration.short}ms ${theme.transitions.easing.easeInOut}`,
          
          // Touch device optimizations
          '@media (hover: none)': {
            '&:hover': {
              backgroundColor: 'inherit',
            },
          },
        }),
        sizeLarge: {
          padding: `${spacing.md}px ${spacing.lg}px`,
          minHeight: '48px',
          fontSize: typography.fontSizes.lg,
        },
        sizeSmall: {
          padding: `${spacing.xs}px ${spacing.sm}px`,
          minHeight: '40px',
          fontSize: typography.fontSizes.sm,
        },
      },
      defaultProps: {
        disableElevation: true,
        disableRipple: false, // Keep ripple for touch feedback
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.xl,
          boxShadow: elevation.sm,
          border: `1px solid ${colors.gray[200]}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          boxShadow: elevation.sm,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.lg,
            minHeight: '44px', // Touch target
          },
        },
      },
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: elevation.sm,
          borderBottom: `1px solid ${colors.gray[200]}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          fontWeight: typography.fontWeights.medium,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: '44px',
          minHeight: '44px',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: elevation.lg,
        },
      },
    },
  },
});

// Apply responsive typography
theme = responsiveFontSizes(theme, {
  breakpoints: ['sm', 'md', 'lg'],
  factor: 2,
});

export default theme;