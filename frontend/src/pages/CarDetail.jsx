import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios, { getMediaUrl } from '../api/axios';
import { CarDetailSkeleton } from '../components/LoadingSkeleton';
import NotFound from '../components/NotFound';

function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchCarDetail();
  }, [id]);

  const fetchCarDetail = async () => {
    try {
      const response = await axios.get(`/cars/${id}/`);
      setCar(response.data);
    } catch (error) {
      console.error('Error fetching car details:', error);
      setError('Car not found');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="relative bg-cover bg-center bg-fixed py-8" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80"></div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 -mt-4">
          <CarDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !car) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <div 
        className="relative bg-cover bg-center bg-fixed py-8"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80"></div>
        
        <div className="relative container-custom">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-primary-400 mb-6 transition-colors fade-in"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 -mt-4">
        <div className="container-custom pb-12">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 pt-8">
          {/* Image Gallery Section */}
          <div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Main Image */}
              <img
                src={(() => {
                  const url = car.images && car.images.length > 0
                    ? getMediaUrl(car.images[selectedImage].image)
                    : getMediaUrl(car.get_image_url) || 'https://via.placeholder.com/800x600?text=No+Image';
                  return url;
                })()}
                alt={car.full_name}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x600?text=No+Image';
                }}
              />
              
              {/* Thumbnail Gallery */}
              {car.images && car.images.length > 1 && (
                <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto">
                  {car.images.map((image, index) => (
                    <img
                      key={image.id}
                      src={getMediaUrl(image.image)}
                      alt={`${car.full_name} - ${index + 1}`}
                      className={`w-20 h-20 object-cover rounded cursor-pointer border-2 transition-all ${
                        selectedImage === index
                          ? 'border-primary-600 scale-105'
                          : 'border-gray-300 hover:border-primary-400'
                      }`}
                      onClick={() => setSelectedImage(index)}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Title and Price */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {car.full_name}
                  </h1>
                  {car.condition === 'new' && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      New
                    </span>
                  )}
                </div>
                <p className="text-4xl font-bold text-primary-600">
                  {formatPrice(car.price)}
                </p>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Year</p>
                  <p className="text-lg font-semibold text-gray-900">{car.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mileage</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatMileage(car.mileage)} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Transmission</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {car.transmission}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fuel Type</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {car.fuel_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Engine</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {car.engine_size}L
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Horsepower</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {car.horsepower} HP
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Color</p>
                  <p className="text-lg font-semibold text-gray-900">{car.color}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Doors</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {car.doors} Doors
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                to={`/contact?car=${car.id}&name=${encodeURIComponent(car.full_name)}`}
                className="btn btn-primary w-full text-center block"
              >
                Contact About This Car
              </Link>
            </div>
          </div>
        </div>

        {/* Description and Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {car.description}
              </p>

              {car.vin && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-500">VIN</p>
                  <p className="text-gray-900 font-mono">{car.vin}</p>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
              {car.features_list && car.features_list.length > 0 ? (
                <ul className="space-y-2">
                  {car.features_list.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No additional features listed</p>
              )}

              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex items-center text-sm">
                  <svg
                    className="w-5 h-5 text-gray-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-gray-600">{car.seats} Seats</span>
                </div>
                <div className="flex items-center text-sm">
                  <svg
                    className="w-5 h-5 text-gray-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span className="text-gray-600 capitalize">{car.condition}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetail;
