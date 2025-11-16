import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import SearchBar from '../components/SearchBar';
import CarCard from '../components/CarCard';

function Home() {
  const [latestCars, setLatestCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1920&q=80',
      title: 'PERFECT CAR FOR YOU',
      subtitle: 'We have more than a thousand cars for you to choose.',
    },
    {
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1920&q=80',
      title: 'DRIVE EASY PAY EASY',
      subtitle: '35% advance only - 24 months flexibility',
    },
    {
      image: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=1920&q=80',
      title: 'PREMIUM QUALITY CARS',
      subtitle: 'Find your dream car at the best price',
    },
  ];

  useEffect(() => {
    fetchLatestCars();
    
    // Auto-advance slider every 5 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const fetchLatestCars = async () => {
    try {
      const response = await axios.get('/cars/latest/');
      setLatestCars(response.data);
    } catch (error) {
      console.error('Error fetching latest cars:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Slider Section */}
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        {/* Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center justify-center text-center">
              <div className="container-custom px-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 fade-in tracking-tight">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-white mb-8 slide-up" style={{ animationDelay: '0.2s' }}>
                  {slide.subtitle}
                </p>
                <Link 
                  to="/cars" 
                  className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ animationDelay: '0.4s' }}
                >
                  Read More →
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm border border-white border-opacity-40 text-white transition-all duration-300 z-10"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm border border-white border-opacity-40 text-white transition-all duration-300 z-10"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Latest Cars Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12 fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Newest Releases
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Check out our newest additions to the showroom. These premium
              vehicles just arrived and are ready for you.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {latestCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>

              {/* View All Button */}
              <div className="text-center mt-12">
                <Link to="/cars" className="btn btn-primary inline-block">
                  View All Vehicles
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
