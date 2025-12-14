import axios from 'axios';

export const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  create: vi.fn(() => mockAxios),
  defaults: {
    baseURL: 'http://localhost:8000',
    headers: {
      common: {},
    },
  },
};

export default mockAxios;
