import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import { mockCarList } from '../../test/mocks/carData';

// Mock axios
vi.mock('../../api/axios', async () => {
  const actual = await vi.importActual('../../api/axios');
  return {
    ...actual,
    default: {
      get: vi.fn(),
      defaults: { baseURL: 'http://localhost:8000' },
    },
    getMediaUrl: (url) => url || '/placeholder.jpg',
  };
});

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero section', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValueOnce({ data: { results: mockCarList.slice(0, 3) } });

    renderWithRouter(<Home />);
    
    expect(screen.getByText(/Find Your Dream Car/i)).toBeInTheDocument();
  });

  it('renders search bar in hero section', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValueOnce({ data: { results: mockCarList.slice(0, 3) } });

    renderWithRouter(<Home />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by brand or model/i)).toBeInTheDocument();
    });
  });

  it('displays latest cars section', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValueOnce({ data: { results: mockCarList.slice(0, 3) } });

    renderWithRouter(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText(/Latest Arrivals/i)).toBeInTheDocument();
    });
  });

  it('loads and displays latest cars', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValueOnce({ data: { results: mockCarList.slice(0, 3) } });

    renderWithRouter(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('TOYOTA Camry')).toBeInTheDocument();
      expect(screen.getByText('HONDA Accord')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching cars', () => {
    const axios = require('../../api/axios').default;
    axios.get.mockReturnValueOnce(new Promise(() => {})); // Never resolves

    renderWithRouter(<Home />);
    
    // Should show loading skeletons or spinner
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders call-to-action button', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValueOnce({ data: { results: mockCarList.slice(0, 3) } });

    renderWithRouter(<Home />);
    
    const viewAllButton = await screen.findByText(/View All Cars/i);
    expect(viewAllButton).toBeInTheDocument();
    expect(viewAllButton.closest('a')).toHaveAttribute('href', '/cars');
  });
});
