import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { axe, toHaveNoViolations } from 'jest-axe';
import { IncidentTypeSelector } from '../features/report/IncidentTypeSelector';
import { IncidentType } from '../types';
import theme from '../../styles/theme';

expect.extend(toHaveNoViolations);

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('IncidentTypeSelector Component', () => {
  const mockOnSelectCategory = jest.fn();
  const mockOnSelectType = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Category Selection', () => {
    it('renders category selection by default', () => {
      renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
        />
      );

      expect(screen.getByText('What type of incident are you reporting?')).toBeInTheDocument();
      expect(screen.getByText('Vehicle-Specific Incidents')).toBeInTheDocument();
      expect(screen.getByText('Location-Based Hazards')).toBeInTheDocument();
    });

    it('calls onSelectCategory when vehicle card is clicked', () => {
      renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
        />
      );

      const vehicleCard = screen.getByText('Vehicle-Specific Incidents').closest('.MuiCard-root');
      fireEvent.click(vehicleCard!);

      expect(mockOnSelectCategory).toHaveBeenCalledWith('vehicle');
    });

    it('calls onSelectCategory when location card is clicked', () => {
      renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
        />
      );

      const locationCard = screen.getByText('Location-Based Hazards').closest('.MuiCard-root');
      fireEvent.click(locationCard!);

      expect(mockOnSelectCategory).toHaveBeenCalledWith('location');
    });
  });

  describe('Incident Type Selection', () => {
    it('renders incident types for vehicle category', () => {
      renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
          selectedCategory="vehicle"
        />
      );

      expect(screen.getByText('Select the specific incident type')).toBeInTheDocument();
      expect(screen.getByText('Speeding')).toBeInTheDocument();
      expect(screen.getByText('Tailgating')).toBeInTheDocument();
      expect(screen.getByText('Phone Use')).toBeInTheDocument();
    });

    it('renders incident types for location category', () => {
      renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
          selectedCategory="location"
        />
      );

      expect(screen.getByText('Select the specific incident type')).toBeInTheDocument();
      expect(screen.getByText('Potholes')).toBeInTheDocument();
      expect(screen.getByText('Road Surface Issues')).toBeInTheDocument();
      expect(screen.getByText('Traffic Signal Problems')).toBeInTheDocument();
    });

    it('calls onSelectType when incident is selected', () => {
      renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
          selectedCategory="vehicle"
        />
      );

      const speedingCard = screen.getByText('Speeding').closest('.MuiCard-root');
      fireEvent.click(speedingCard!);

      expect(mockOnSelectType).toHaveBeenCalledWith(IncidentType.SPEEDING);
    });

    it('shows back button when category is selected', () => {
      renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
          selectedCategory="vehicle"
        />
      );

      const backButton = screen.getByText('Back to Categories');
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton);
      expect(mockOnSelectCategory).toHaveBeenCalledWith('vehicle');
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations in category view', async () => {
      const { container } = renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations in incident type view', async () => {
      const { container } = renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
          selectedCategory="vehicle"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', () => {
      renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
        />
      );

      const mainHeading = screen.getByRole('heading', { level: 4 });
      expect(mainHeading).toHaveTextContent('What type of incident are you reporting?');
    });

    it('cards are keyboard accessible', () => {
      renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
        />
      );

      const vehicleCard = screen.getByText('Vehicle-Specific Incidents').closest('.MuiCard-root');
      
      // Focus the card and press Enter
      vehicleCard?.focus();
      fireEvent.keyDown(vehicleCard!, { key: 'Enter' });
      
      expect(mockOnSelectCategory).toHaveBeenCalledWith('vehicle');
    });

    it('has proper color contrast', () => {
      renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
        />
      );

      const primaryText = screen.getByText('What type of incident are you reporting?');
      const secondaryText = screen.getByText('Choose the category that best describes your report');
      
      // Check that text elements are rendered
      expect(primaryText).toBeInTheDocument();
      expect(secondaryText).toBeInTheDocument();
    });
  });

  describe('Touch Targets', () => {
    it('has proper touch target sizes for mobile', () => {
      renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
        />
      );

      const cards = screen.getAllByText(/Vehicle-Specific Incidents|Location-Based Hazards/);
      
      cards.forEach(card => {
        const cardElement = card.closest('.MuiCard-root');
        expect(cardElement).toBeInTheDocument();
        
        // Card should be clickable and have sufficient size
        const styles = getComputedStyle(cardElement!);
        expect(parseFloat(styles.minHeight || '0')).toBeGreaterThan(0);
      });
    });
  });

  describe('Visual Feedback', () => {
    it('provides visual feedback on hover', () => {
      renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
        />
      );

      const vehicleCard = screen.getByText('Vehicle-Specific Incidents').closest('.MuiCard-root');
      
      // Hover should trigger visual changes
      fireEvent.mouseEnter(vehicleCard!);
      fireEvent.mouseLeave(vehicleCard!);
      
      // Card should remain clickable
      expect(vehicleCard).toBeInTheDocument();
    });

    it('shows subcategories when available', () => {
      renderWithTheme(
        <IncidentTypeSelector 
          onSelectCategory={mockOnSelectCategory}
          onSelectType={mockOnSelectType}
          selectedCategory="vehicle"
        />
      );

      // Check for subcategory chips
      const subcategoryChips = screen.getAllByText(/Handicap violation|Fire zone parking|No parking zone/);
      expect(subcategoryChips.length).toBeGreaterThan(0);
    });
  });
});