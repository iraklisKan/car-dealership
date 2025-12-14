import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../NotFound';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('NotFound Component', () => {
  it('renders 404 error message', () => {
    renderWithRouter(<NotFound />);
    
    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });

  it('renders user-friendly message', () => {
    renderWithRouter(<NotFound />);
    
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });

  it('renders "Browse All Cars" button', () => {
    renderWithRouter(<NotFound />);
    
    const browseButton = screen.getByText(/Browse All Cars/i);
    expect(browseButton).toBeInTheDocument();
    expect(browseButton.closest('a')).toHaveAttribute('href', '/cars');
  });

  it('renders "Back to Home" button', () => {
    renderWithRouter(<NotFound />);
    
    const homeButton = screen.getByText(/Back to Home/i);
    expect(homeButton).toBeInTheDocument();
    expect(homeButton.closest('a')).toHaveAttribute('href', '/');
  });

  it('displays sad face icon', () => {
    renderWithRouter(<NotFound />);
    
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
});
