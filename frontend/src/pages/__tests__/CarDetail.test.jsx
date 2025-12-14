import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CarDetail from '../CarDetail';
import { mockCar } from '../../test/mocks/carData';

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

const renderWithRouter = (initialRoute = '/cars/1') => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/cars/:id" element={<CarDetail />} />
      </Routes>
    </BrowserRouter>,
    { wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter> }
  );
};

describe('CarDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location for navigation tests
    delete window.location;
    window.location = { href: '/cars/1' };
  });

  it('shows loading skeleton while fetching car details', () => {
    const axios = require('../../api/axios').default;
    axios.get.mockReturnValue(new Promise(() => {}));

    renderWithRouter();
    
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('loads and displays car details', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValue({ data: mockCar });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('TOYOTA Camry')).toBeInTheDocument();
      expect(screen.getByText('€25,000')).toBeInTheDocument();
      expect(screen.getByText(/Well-maintained Toyota Camry/i)).toBeInTheDocument();
    });
  });

  it('displays car specifications', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValue({ data: mockCar });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/2022/i)).toBeInTheDocument();
      expect(screen.getByText(/automatic/i)).toBeInTheDocument();
      expect(screen.getByText(/petrol/i)).toBeInTheDocument();
      expect(screen.getByText(/15,000/i)).toBeInTheDocument();
    });
  });

  it('displays car features list', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValue({ data: mockCar });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/GPS/i)).toBeInTheDocument();
      expect(screen.getByText(/Leather Seats/i)).toBeInTheDocument();
      expect(screen.getByText(/Sunroof/i)).toBeInTheDocument();
    });
  });

  it('shows 404 page when car not found', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockRejectedValue({ response: { status: 404 } });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/404/i)).toBeInTheDocument();
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });

  it('displays image gallery', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValue({ data: mockCar });

    renderWithRouter();
    
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  it('shows contact/inquiry section', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockResolvedValue({ data: mockCar });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/Contact Us/i) || screen.getByText(/Inquire/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const axios = (await import('../../api/axios')).default;
    axios.get.mockRejectedValue(new Error('Network Error'));

    renderWithRouter();
    
    await waitFor(() => {
      // Should show error state or 404 page
      expect(screen.queryByText('TOYOTA Camry')).not.toBeInTheDocument();
    });
  });
});
