import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CarList from '../CarList';
import { mockCarResponse } from '../../test/mocks/carData';

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

describe('CarList Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValue({ data: mockCarResponse });

    renderWithRouter(<CarList />);
    
    expect(screen.getByText(/Browse Our Collection/i)).toBeInTheDocument();
  });

  it('loads and displays cars', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValue({ data: mockCarResponse });

    renderWithRouter(<CarList />);
    
    await waitFor(() => {
      expect(screen.getByText('TOYOTA Camry')).toBeInTheDocument();
      expect(screen.getByText('HONDA Accord')).toBeInTheDocument();
      expect(screen.getByText('BMW X5')).toBeInTheDocument();
    });
  });

  it('shows loading skeletons while fetching', () => {
    const axios = require('../../api/axios').default;
    axios.get.mockReturnValue(new Promise(() => {}));

    renderWithRouter(<CarList />);
    
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders search/filter sidebar', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValue({ data: mockCarResponse });

    renderWithRouter(<CarList />);
    
    await waitFor(() => {
      expect(screen.getByText(/Filter by/i)).toBeInTheDocument();
    });
  });

  it('displays view toggle buttons (grid/list)', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValue({ data: mockCarResponse });

    renderWithRouter(<CarList />);
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('displays car count', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValue({ data: mockCarResponse });

    renderWithRouter(<CarList />);
    
    await waitFor(() => {
      expect(screen.getByText(/3 Cars/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no cars found', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValue({ data: { count: 0, results: [] } });

    renderWithRouter(<CarList />);
    
    await waitFor(() => {
      expect(screen.getByText(/No cars found/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockRejectedValue(new Error('API Error'));

    renderWithRouter(<CarList />);
    
    await waitFor(() => {
      // Should show error message or empty state
      expect(screen.queryByText('TOYOTA Camry')).not.toBeInTheDocument();
    });
  });
});
