import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
// import { ThemeProvider } from '@mui/material/styles';
// import { Provider } from 'react-redux';
// import { MemoryRouter } from 'react-router-dom';
// import { configureStore } from '@reduxjs/toolkit';
// import theme from '../styles/theme';
// import { rootReducer } from '../store/store';
import AllTheProviders from './TestProviders';
import { createMockStore } from './testStoreHelpers';

// Mock Redux store for testing (now imported from TestProviders)

interface CustomRenderOptions extends RenderOptions {
  preloadedState?: unknown;
  store?: ReturnType<typeof createMockStore>;
  initialEntries?: string[];
}

// AllTheProviders moved to separate file to avoid react-refresh issues

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createMockStore(preloadedState),
    initialEntries,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllTheProviders store={store} initialEntries={initialEntries}>
      {children}
    </AllTheProviders>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

export const renderWithTheme = (ui: React.ReactElement, options?: RenderOptions) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Mock implementations for common dependencies
export const mockNavigate = jest.fn();
export const mockLocation = { pathname: '/', search: '', hash: '', state: null };

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

// Mock Redux hooks
export const mockDispatch = jest.fn();
export const mockSelector = jest.fn();

// Accessibility test helpers
export const checkColorContrast = (backgroundColor: string, textColor: string) => {
  // This is a simplified contrast check - in production, use a proper library
  const bgLuminance = getLuminance(backgroundColor);
  const textLuminance = getLuminance(textColor);
  
  const lighter = Math.max(bgLuminance, textLuminance);
  const darker = Math.min(bgLuminance, textLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
};

const getLuminance = (color: string): number => {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Touch target size validation
export const checkTouchTargetSize = (element: HTMLElement) => {
  const styles = getComputedStyle(element);
  const minHeight = parseFloat(styles.minHeight || '0');
  const minWidth = parseFloat(styles.minWidth || '0');
  
  return {
    meetsMinimum: minHeight >= 44 && minWidth >= 44,
    height: minHeight,
    width: minWidth,
  };
};

// Mock performance API for testing
export const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn().mockReturnValue([]),
  getEntriesByType: jest.fn().mockReturnValue([]),
  now: jest.fn().mockReturnValue(Date.now()),
};

// Test data factories
export const createMockUser = () => ({
  id: 'test-user-id',
  email: 'test@example.com',
  isVerified: true,
  driverScore: 85,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const createMockIncident = () => ({
  id: 'test-incident-id',
  incidentType: 'SPEEDING',
  location: { lat: 40.7128, lng: -74.0060 },
  timestamp: new Date().toISOString(),
  description: 'Test incident description',
  licensePlateHash: 'test-hash',
  status: 'ACTIVE',
});

export const createMockVehicle = () => ({
  id: 'test-vehicle-id',
  make: 'Toyota',
  model: 'Camry',
  year: 2020,
  color: 'Blue',
  licensePlate: 'ABC123',
  isVerified: true,
  userId: 'test-user-id',
});

// Common test selectors
export const getByTestId = (testId: string) => `[data-testid="${testId}"]`;
export const getByRole = (role: string) => `[role="${role}"]`;
export const getByAriaLabel = (label: string) => `[aria-label="${label}"]`;

// Performance test utilities
export const measureRenderTime = <T,>(fn: () => T): { result: T; time: number } => {
  const start = performance.now();
  const result = fn();
  const time = performance.now() - start;
  return { result, time };
};

// Mock fetch for API testing
export const mockFetch = (response: unknown, options: { status?: number; ok?: boolean } = {}) => {
  const { status = 200, ok = true } = options;
  
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
};

// Cleanup utilities
export const cleanup = () => {
  jest.clearAllMocks();
  mockNavigate.mockClear();
  mockDispatch.mockClear();
  mockSelector.mockClear();
};

// Export specific functions to avoid react-refresh issues
export { renderWithProviders as render };
export { default as userEvent } from '@testing-library/user-event';