import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Contact from '../Contact';

// Mock axios
vi.mock('../../api/axios', async () => {
  const actual = await vi.importActual('../../api/axios');
  return {
    ...actual,
    default: {
      post: vi.fn(),
      defaults: { baseURL: 'http://localhost:8000' },
    },
  };
});

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Contact Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', () => {
    renderWithRouter(<Contact />);
    
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
  });

  it('displays location contact card', () => {
    renderWithRouter(<Contact />);
    
    expect(screen.getByText(/Location/i)).toBeInTheDocument();
    expect(screen.getByText(/Nicosia/i)).toBeInTheDocument();
    expect(screen.getByText(/Cyprus/i)).toBeInTheDocument();
  });

  it('displays phone contact card', () => {
    renderWithRouter(<Contact />);
    
    expect(screen.getByText(/Phone/i)).toBeInTheDocument();
  });

  it('displays email contact card', () => {
    renderWithRouter(<Contact />);
    
    expect(screen.getByText(/Email/i)).toBeInTheDocument();
  });

  it('displays Facebook contact card', () => {
    renderWithRouter(<Contact />);
    
    expect(screen.getByText(/Facebook/i)).toBeInTheDocument();
  });

  it('displays Instagram contact card', () => {
    renderWithRouter(<Contact />);
    
    expect(screen.getByText(/Instagram/i)).toBeInTheDocument();
  });

  it('displays business hours', () => {
    renderWithRouter(<Contact />);
    
    expect(screen.getByText(/Business Hours/i)).toBeInTheDocument();
    expect(screen.getByText(/Monday - Friday/i)).toBeInTheDocument();
  });

  it('all contact cards have proper links', () => {
    renderWithRouter(<Contact />);
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    
    // Check that external links have proper attributes
    const externalLinks = links.filter(link => 
      link.href.includes('facebook') || link.href.includes('instagram')
    );
    
    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });
  });

  it('renders all 5 contact cards', () => {
    const { container } = renderWithRouter(<Contact />);
    
    // There should be 5 contact info cards
    const cards = container.querySelectorAll('.card, [class*="card"]');
    expect(cards.length).toBeGreaterThan(4);
  });

  it('contact cards are responsive', () => {
    const { container } = renderWithRouter(<Contact />);
    
    // Check for responsive grid classes
    const grid = container.querySelector('[class*="grid"]');
    expect(grid).toBeInTheDocument();
  });
});
