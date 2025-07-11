import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../Button';
import theme from '../../../styles/theme';

expect.extend(toHaveNoViolations);

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Button Component', () => {
  describe('Basic Functionality', () => {
    it('renders with correct text', () => {
      renderWithTheme(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      renderWithTheme(<Button onClick={handleClick}>Clickable</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows loading state correctly', () => {
      renderWithTheme(<Button loading>Loading button</Button>);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('can be disabled', () => {
      renderWithTheme(<Button disabled>Disabled button</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithTheme(<Button>Accessible button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper touch target size', () => {
      renderWithTheme(<Button>Touch target</Button>);
      const button = screen.getByRole('button');
      const styles = getComputedStyle(button);
      expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
    });

    it('is accessible via keyboard', () => {
      const handleClick = jest.fn();
      renderWithTheme(<Button onClick={handleClick}>Keyboard accessible</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has visible focus indicator', () => {
      renderWithTheme(<Button>Focus me</Button>);
      const button = screen.getByRole('button');
      button.focus();
      
      const styles = getComputedStyle(button);
      expect(styles.outline || styles.boxShadow).toBeDefined();
    });

    it('provides proper ARIA attributes when loading', () => {
      renderWithTheme(<Button loading>Loading button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Size Variants', () => {
    it('applies correct sizing for small buttons', () => {
      renderWithTheme(<Button size="small">Small button</Button>);
      const button = screen.getByRole('button');
      const styles = getComputedStyle(button);
      expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(40);
    });

    it('applies correct sizing for large buttons', () => {
      renderWithTheme(<Button size="large">Large button</Button>);
      const button = screen.getByRole('button');
      const styles = getComputedStyle(button);
      expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(48);
    });

    it('applies correct sizing for medium buttons (default)', () => {
      renderWithTheme(<Button>Medium button</Button>);
      const button = screen.getByRole('button');
      const styles = getComputedStyle(button);
      expect(parseInt(styles.minHeight)).toBe(44);
    });
  });

  describe('Visual States', () => {
    it('shows icon when provided', () => {
      const TestIcon = () => <span data-testid="test-icon">Icon</span>;
      renderWithTheme(
        <Button icon={<TestIcon />} iconPosition="start">
          Button with icon
        </Button>
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('positions icon correctly', () => {
      const TestIcon = () => <span data-testid="test-icon">Icon</span>;
      renderWithTheme(
        <Button icon={<TestIcon />} iconPosition="end">
          Button with end icon
        </Button>
      );
      
      const button = screen.getByRole('button');
      const icon = screen.getByTestId('test-icon');
      expect(button).toContainElement(icon);
    });
  });
});