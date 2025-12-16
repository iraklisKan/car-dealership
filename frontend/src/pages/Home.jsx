import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { trackPageView } from '../api/analytics';
import SearchBar from '../components/SearchBar';
import CarCard from '../components/CarCard';

function Home() {
  const [latestCars, setLatestCars] = useState([]);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: '/images/mainImage1.png',
      title: 'PERFECT CAR FOR YOU',
      subtitle: 'Possibility for direct financing without a bank',
    },
    {
      image: '/images/mainimage2.png',
      title: 'DRIVE EASY PAY EASY',
      subtitle: '35% advance only - 24 months flexibility',
    },
    {
      image: '/images/mainImage3.png',
      title: 'PREMIUM QUALITY CARS',
      subtitle: 'We accept pre-orders from Japan and England.',
    },
  ];

  useEffect(() => {
    trackPageView('home');
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
      // Fetch both featured and latest cars
      const [featuredResponse, latestResponse] = await Promise.all([
        axios.get('/cars/featured/'),
        axios.get('/cars/latest/')
      ]);
      
      const featured = featuredResponse.data || [];
      const latest = latestResponse.data || [];
      
      setFeaturedCars(featured);
      
      // If we have featured cars, fill remaining spots with latest (up to 10 total)
      if (featured.length > 0) {
        const remainingSlots = Math.max(0, 10 - featured.length);
        // Filter out any latest cars that are already in featured
        const featuredIds = new Set(featured.map(car => car.id));
        const filteredLatest = latest.filter(car => !featuredIds.has(car.id));
        setLatestCars(filteredLatest.slice(0, remainingSlots));
      } else {
        // No featured cars, show all latest
        setLatestCars(latest);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
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
              className="absolute inset-0 bg-cover bg-bottom"
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

      {/* Featured/Latest Cars Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12 fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {featuredCars.length > 0 ? 'Featured & Latest Vehicles' : 'Newest Releases'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {featuredCars.length > 0 
                ? `${featuredCars.length} featured vehicle${featuredCars.length > 1 ? 's' : ''} plus our newest additions!` 
                : 'Check out our newest additions!'}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Featured cars first */}
                {featuredCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
                {/* Then latest cars to fill remaining spots */}
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
