import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import theme from '../styles/theme';
import { createMockStore } from './testStoreHelpers';

interface AllTheProvidersProps {
  children: React.ReactNode;
  store: ReturnType<typeof createMockStore>;
  initialEntries?: string[];
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ 
  children, 
  store, 
  initialEntries = ['/'] 
}) => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
};

export default AllTheProviders;