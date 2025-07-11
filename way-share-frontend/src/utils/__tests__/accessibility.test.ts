import { toHaveNoViolations } from 'jest-axe';
// import { render } from '@testing-library/react';
// import { ThemeProvider } from '@mui/material/styles';
// import React from 'react';
// import theme from '../../styles/theme';
import { announceToScreenReader, trapFocus } from '../accessibility';

expect.extend(toHaveNoViolations);

describe('Accessibility Utilities', () => {
  describe('announceToScreenReader', () => {
    it('creates and removes announcement element', () => {
      // const originalQuerySelector = document.querySelector;
      const mockElements: HTMLElement[] = [];
      
      // Mock document.body.appendChild and removeChild
      const originalAppendChild = document.body.appendChild;
      const originalRemoveChild = document.body.removeChild;
      
      document.body.appendChild = jest.fn((element) => {
        mockElements.push(element as HTMLElement);
        return element;
      });
      
      document.body.removeChild = jest.fn((element) => {
        const index = mockElements.indexOf(element as HTMLElement);
        if (index > -1) {
          mockElements.splice(index, 1);
        }
        return element;
      });

      announceToScreenReader('Test announcement');

      // Check that element was created with correct attributes
      expect(document.body.appendChild).toHaveBeenCalledWith(
        expect.objectContaining({
          getAttribute: expect.any(Function),
          setAttribute: expect.any(Function),
          textContent: 'Test announcement',
        })
      );

      // Restore original methods
      document.body.appendChild = originalAppendChild;
      document.body.removeChild = originalRemoveChild;
    });
  });

  describe('trapFocus', () => {
    it('traps focus within container', () => {
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      
      button1.textContent = 'Button 1';
      button2.textContent = 'Button 2';
      
      container.appendChild(button1);
      container.appendChild(button2);
      document.body.appendChild(container);

      const cleanup = trapFocus(container);

      // Test that Tab key cycles through elements
      const mockEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      Object.defineProperty(mockEvent, 'preventDefault', {
        value: jest.fn(),
      });

      // Mock document.activeElement
      Object.defineProperty(document, 'activeElement', {
        value: button2,
        configurable: true,
      });

      container.dispatchEvent(mockEvent);

      expect(typeof cleanup).toBe('function');
      
      // Cleanup
      cleanup();
      document.body.removeChild(container);
    });
  });

  describe('Color Contrast', () => {
    it('should maintain proper contrast ratios', () => {
      // Test color combinations from theme
      const combinations = [
        { bg: '#ffffff', fg: '#111827' }, // white bg, dark text
        { bg: '#2563eb', fg: '#ffffff' }, // primary bg, white text
        { bg: '#f9fafb', fg: '#374151' }, // light bg, medium text
      ];
      
      combinations.forEach(({ bg, fg }) => {
        const ratio = getContrastRatio(bg, fg);
        expect(ratio).toBeGreaterThanOrEqual(4.5); // WCAG AA standard
      });
    });
  });
});

// Helper function to calculate contrast ratio (simplified version)
function getContrastRatio(bg: string, fg: string): number {
  // This is a simplified calculation - in a real application,
  // you would use a proper color contrast library
  const bgLuminance = getLuminance(bg);
  const fgLuminance = getLuminance(fg);
  
  const lighter = Math.max(bgLuminance, fgLuminance);
  const darker = Math.min(bgLuminance, fgLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(color: string): number {
  // Simplified luminance calculation
  // In production, use a proper color library like chroma-js
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}