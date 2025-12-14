import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../api/axios';
import SearchBar from '../components/SearchBar';
import CarCard from '../components/CarCard';
import { CarCardSkeleton, CarCardHorizontalSkeleton } from '../components/LoadingSkeleton';

function CarList() {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest');
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  useEffect(() => {
    fetchCars();
  }, [searchParams]);

  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query string from search params
      const queryString = searchParams.toString();
      const url = queryString ? `/cars/search/?${queryString}` : '/cars/';
      
      const response = await axios.get(url);
      
      let fetchedCars = [];
      if (response.data.results) {
        fetchedCars = response.data.results;
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
      } else {
        fetchedCars = response.data;
      }
      
      // Apply sorting
      setCars(sortCars(fetchedCars, sortBy));
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Failed to load cars. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const sortCars = (carsToSort, sortOption) => {
    const sorted = [...carsToSort];
    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => b.year - a.year);
      case 'oldest':
        return sorted.sort((a, b) => a.year - b.year);
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted;
    }
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    setCars(sortCars(cars, newSort));
  };

  const handlePageChange = async (url) => {
    if (!url) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(url);
      setCars(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching page:', error);
      setError('Failed to load page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get initial filters from URL
  const initialFilters = {};
  searchParams.forEach((value, key) => {
    initialFilters[key] = value;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Browse Our Collection</h1>
              <p className="text-sm text-gray-600 mt-1">
                {pagination.count > 0
                  ? `${pagination.count} ${pagination.count === 1 ? 'vehicle' : 'vehicles'} available`
                  : 'No vehicles found'}
              </p>
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">SORT BY:</label>
              <select 
                className="input text-sm"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="newest">Date: newest first</option>
                <option value="oldest">Date: oldest first</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
              
              {/* View Toggle */}
              <div className="flex gap-2 ml-4">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="container-custom py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Search Options */}
          <aside className="w-80 flex-shrink-0">
            <div className="bg-gray-800 text-white p-6 rounded-t-lg">
              <h2 className="text-xl font-bold">Search Options</h2>
            </div>
            <div className="bg-white rounded-b-lg shadow-lg">
              <SearchBar initialFilters={initialFilters} compact={true} />
            </div>
          </aside>

          {/* Right Content - Car Grid */}
          <main className="flex-1">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}
            
            {/* Results */}
            {loading ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <CarCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {[...Array(4)].map((_, i) => (
                      <CarCardHorizontalSkeleton key={i} />
                    ))}
                  </div>
                )}
              </>
            ) : cars.length > 0 ? (
              <>
                {/* Car Grid/List */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {cars.map((car) => (
                      <CarCard key={car.id} car={car} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6 mb-8">
                    {cars.map((car) => (
                      <CarCard key={car.id} car={car} horizontal={true} />
                    ))}
                  </div>
                )}            {/* Pagination */}
            {(pagination.previous || pagination.next) && (
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={() => handlePageChange(pagination.previous)}
                  disabled={!pagination.previous}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5 mr-2 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>

                <button
                  onClick={() => handlePageChange(pagination.next)}
                  disabled={!pagination.next}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <svg
                    className="w-5 h-5 ml-2 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No vehicles found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search filters to find what you're looking for
            </p>
            <button
              onClick={() => window.location.href = '/cars'}
              className="btn btn-primary"
            >
              Reset Filters
            </button>
          </div>
        )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default CarList;
