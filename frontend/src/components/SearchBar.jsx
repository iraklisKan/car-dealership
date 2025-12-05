import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

function SearchBar({ initialFilters = {}, compact = false }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    brand: initialFilters.brand || '',
    model: initialFilters.model || '',
    year: initialFilters.year || '',
    price_min: initialFilters.price_min || '',
    price_max: initialFilters.price_max || '',
    fuel_type: initialFilters.fuel_type || '',
    body_type: initialFilters.body_type || '',
    transmission: initialFilters.transmission || '',
    mileage_max: initialFilters.mileage_max || '',
  });

  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [availableFuelTypes, setAvailableFuelTypes] = useState([]);
  const [availableBodyTypes, setAvailableBodyTypes] = useState([]);
  const [availableTransmissions, setAvailableTransmissions] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    updateAvailableModels();
  }, [filters.brand, allCars]);

  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/cars/');
      const cars = response.data.results || response.data;
      setAllCars(cars);
      
      // Extract unique brands
      const brands = [...new Set(cars.map(car => car.brand))].sort();
      setAvailableBrands(brands);
      
      // Extract all unique models
      const models = [...new Set(cars.map(car => car.model))].sort();
      setAvailableModels(models);
      
      // Extract unique fuel types
      const fuelTypes = [...new Set(cars.map(car => car.fuel_type).filter(Boolean))].sort();
      setAvailableFuelTypes(fuelTypes);
      
      // Extract unique body types (if exists in your data)
      const bodyTypes = [...new Set(cars.map(car => car.body_type).filter(Boolean))].sort();
      setAvailableBodyTypes(bodyTypes);
      
      // Extract unique transmissions
      const transmissions = [...new Set(cars.map(car => car.transmission).filter(Boolean))].sort();
      setAvailableTransmissions(transmissions);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Failed to load filter options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateAvailableModels = () => {
    if (filters.brand) {
      // Filter models by selected brand
      const models = [...new Set(
        allCars
          .filter(car => car.brand === filters.brand)
          .map(car => car.model)
      )].sort();
      setAvailableModels(models);
    } else {
      // Show all models if no brand selected
      const models = [...new Set(allCars.map(car => car.model))].sort();
      setAvailableModels(models);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      // Clear model if brand changes
      ...(name === 'brand' && { model: '' })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    // Navigate to cars page with filters
    navigate(`/cars?${queryParams.toString()}`);
  };

  const handleReset = () => {
    setFilters({
      brand: '',
      model: '',
      year: '',
      price_min: '',
      price_max: '',
      fuel_type: '',
      body_type: '',
      transmission: '',
      mileage_max: '',
    });
    navigate('/cars');
  };

  // Compact sidebar layout
  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Make */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Make
          </label>
          <select
            name="brand"
            value={filters.brand}
            onChange={handleChange}
            className="input"
          >
            <option value="">All Makes</option>
            {availableBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <select
            name="model"
            value={filters.model}
            onChange={handleChange}
            className="input"
          >
            <option value="">All Models</option>
            {availableModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year
          </label>
          <select
            name="year"
            value={filters.year}
            onChange={handleChange}
            className="input"
          >
            <option value="">All Years</option>
            {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price
          </label>
          <div className="space-y-2">
            <input
              type="number"
              name="price_min"
              value={filters.price_min}
              onChange={handleChange}
              placeholder="Min: 9800"
              className="input text-sm"
            />
            <input
              type="number"
              name="price_max"
              value={filters.price_max}
              onChange={handleChange}
              placeholder="Max: 34000"
              className="input text-sm"
            />
          </div>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuel Type
          </label>
          <select
            name="fuel_type"
            value={filters.fuel_type}
            onChange={handleChange}
            className="input"
          >
            <option value="">All Types</option>
            {availableFuelTypes.map(fuelType => (
              <option key={fuelType} value={fuelType}>
                {fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Body Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Body
          </label>
          <select
            name="body_type"
            value={filters.body_type}
            onChange={handleChange}
            className="input"
          >
            <option value="">All Types</option>
            {availableBodyTypes.map(bodyType => (
              <option key={bodyType} value={bodyType}>
                {bodyType.charAt(0).toUpperCase() + bodyType.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Transmission */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transmission
          </label>
          <select
            name="transmission"
            value={filters.transmission}
            onChange={handleChange}
            className="input"
          >
            <option value="">All Types</option>
            {availableTransmissions.map(transmission => (
              <option key={transmission} value={transmission}>
                {transmission.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
              </option>
            ))}
          </select>
        </div>

        {/* Max Mileage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Mileage
          </label>
          <input
            type="number"
            name="mileage_max"
            value={filters.mileage_max}
            onChange={handleChange}
            placeholder="km"
            className="input"
          />
        </div>

        {/* Reset Button */}
        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2 mb-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          SEARCH
        </button>
        
        <button
          type="button"
          onClick={handleReset}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          RESET ALL
        </button>
      </form>
    );
  }

  // Original horizontal layout for home page
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Brand */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
            Brand
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={filters.brand}
            onChange={handleChange}
            placeholder="e.g., Toyota"
            className="input"
          />
        </div>

        {/* Model */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={filters.model}
            onChange={handleChange}
            placeholder="e.g., Camry"
            className="input"
          />
        </div>

        {/* Year */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="number"
            id="year"
            name="year"
            value={filters.year}
            onChange={handleChange}
            placeholder="2024"
            min="1900"
            max="2030"
            className="input"
          />
        </div>

        {/* Max Price */}
        <div>
          <label htmlFor="price_max" className="block text-sm font-medium text-gray-700 mb-1">
            Max Price
          </label>
          <input
            type="number"
            id="price_max"
            name="price_max"
            value={filters.price_max}
            onChange={handleChange}
            placeholder="50000"
            min="0"
            step="1000"
            className="input"
          />
        </div>

        {/* Transmission */}
        <div>
          <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
            Transmission
          </label>
          <select
            id="transmission"
            name="transmission"
            value={filters.transmission}
            onChange={handleChange}
            className="input"
          >
            <option value="">Any</option>
            {availableTransmissions.map(transmission => (
              <option key={transmission} value={transmission}>
                {transmission.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
              </option>
            ))}
          </select>
        </div>

        {/* Max Mileage */}
        <div>
          <label htmlFor="mileage_max" className="block text-sm font-medium text-gray-700 mb-1">
            Max Mileage (km)
          </label>
          <input
            type="number"
            id="mileage_max"
            name="mileage_max"
            value={filters.mileage_max}
            onChange={handleChange}
            placeholder="50000"
            min="0"
            step="1000"
            className="input"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-end gap-2">
          <button type="submit" className="btn btn-primary flex-1">
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary flex-1"
          >
            Reset
          </button>
        </div>
      </div>
    </form>
  );
}

export default SearchBar;
