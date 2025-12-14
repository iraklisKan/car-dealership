import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Footer Component', () => {
  it('renders company name', () => {
    renderWithRouter(<Footer />);
    
    expect(screen.getByText(/EL AUTOMOVIL DEALER LTD/i)).toBeInTheDocument();
  });

  it('renders copyright notice with current year', () => {
    renderWithRouter(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithRouter(<Footer />);
    
    const homeLinks = screen.getAllByText('Home');
    const browseLinks = screen.getAllByText(/Browse Cars/i);
    const contactLinks = screen.getAllByText(/Contact/i);
    
    expect(homeLinks.length).toBeGreaterThan(0);
    expect(browseLinks.length).toBeGreaterThan(0);
    expect(contactLinks.length).toBeGreaterThan(0);
  });

  it('renders contact information', () => {
    renderWithRouter(<Footer />);
    
    expect(screen.getByText(/Nicosia/i)).toBeInTheDocument();
    expect(screen.getByText(/Cyprus/i)).toBeInTheDocument();
  });

  it('renders social media links', () => {
    renderWithRouter(<Footer />);
    
    const socialLinks = screen.getAllByRole('link').filter(link => 
      link.href.includes('facebook') || 
      link.href.includes('instagram') || 
      link.href.includes('twitter')
    );
    
    expect(socialLinks.length).toBeGreaterThan(0);
  });

  it('has proper link attributes for external links', () => {
    renderWithRouter(<Footer />);
    
    const externalLinks = screen.getAllByRole('link').filter(link => 
      link.href.includes('facebook') || link.href.includes('instagram')
    );
    
    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });
  });
});
