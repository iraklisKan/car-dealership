import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CarCard from '../CarCard';
import { mockCar } from '../../test/mocks/carData';

// Mock the axios module
vi.mock('../../api/axios', () => ({
  getMediaUrl: (url) => url || '/placeholder.jpg',
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CarCard Component', () => {
  it('renders car information correctly in grid view', () => {
    renderWithRouter(<CarCard car={mockCar} />);
    
    expect(screen.getByText('TOYOTA Camry')).toBeInTheDocument();
    expect(screen.getByText('€25,000')).toBeInTheDocument();
    expect(screen.getByText('15,000 km')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText(/automatic/i)).toBeInTheDocument();
    expect(screen.getByText(/petrol/i)).toBeInTheDocument();
  });

  it('renders car information correctly in horizontal/list view', () => {
    renderWithRouter(<CarCard car={mockCar} horizontal={true} />);
    
    expect(screen.getByText('TOYOTA Camry')).toBeInTheDocument();
    expect(screen.getByText('€25,000')).toBeInTheDocument();
  });

  it('displays car condition badge', () => {
    renderWithRouter(<CarCard car={mockCar} />);
    
    expect(screen.getByText(/used/i)).toBeInTheDocument();
  });

  it('formats price correctly', () => {
    renderWithRouter(<CarCard car={mockCar} />);
    
    expect(screen.getByText('€25,000')).toBeInTheDocument();
  });

  it('formats mileage correctly', () => {
    renderWithRouter(<CarCard car={mockCar} />);
    
    expect(screen.getByText('15,000 km')).toBeInTheDocument();
  });

  it('renders link to car detail page', () => {
    renderWithRouter(<CarCard car={mockCar} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cars/1');
  });

  it('displays placeholder image when no images available', () => {
    const carWithoutImages = { ...mockCar, images: [] };
    renderWithRouter(<CarCard car={carWithoutImages} />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
  });

  it('shows featured badge when car is featured', () => {
    const featuredCar = { ...mockCar, is_featured: true };
    renderWithRouter(<CarCard car={featuredCar} />);
    
    expect(screen.getByText(/featured/i)).toBeInTheDocument();
  });

  it('displays car specs in horizontal view', () => {
    renderWithRouter(<CarCard car={mockCar} horizontal={true} />);
    
    expect(screen.getByText(/sedan/i)).toBeInTheDocument();
    expect(screen.getByText('203')).toBeInTheDocument(); // horsepower
  });
});
