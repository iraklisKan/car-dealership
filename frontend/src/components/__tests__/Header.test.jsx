import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Header Component', () => {
  it('renders the logo and company name', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByAltText('EL AUTOMOVIL DEALER LTD')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Browse Cars')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('navigation links have correct hrefs', () => {
    renderWithRouter(<Header />);
    
    const homeLink = screen.getAllByText('Home')[0].closest('a');
    const browseCarsLink = screen.getByText('Browse Cars').closest('a');
    const contactLink = screen.getByText('Contact Us').closest('a');
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(browseCarsLink).toHaveAttribute('href', '/cars');
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('shows mobile menu button on small screens', () => {
    renderWithRouter(<Header />);
    
    const mobileMenuButton = screen.getByRole('button');
    expect(mobileMenuButton).toBeInTheDocument();
  });

  it('toggles mobile menu when button is clicked', () => {
    renderWithRouter(<Header />);
    
    const mobileMenuButton = screen.getByRole('button');
    
    // Mobile menu should be closed initially
    expect(screen.queryByText('Home')).toBeInTheDocument();
    
    // Click to open
    fireEvent.click(mobileMenuButton);
    
    // Click to close
    fireEvent.click(mobileMenuButton);
  });

  it('logo links to home page', () => {
    renderWithRouter(<Header />);
    
    const logoLink = screen.getByAltText('EL AUTOMOVIL DEALER LTD').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });
});
