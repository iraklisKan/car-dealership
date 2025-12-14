import React from 'react';

// Skeleton for car cards
export function CarCardSkeleton() {
  return (
    <div className="card animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-300"></div>
      
      {/* Content skeleton */}
      <div className="p-4">
        {/* Title */}
        <div className="h-6 bg-gray-300 rounded mb-2"></div>
        
        {/* Price */}
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-3"></div>
        
        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
        
        {/* Button */}
        <div className="h-10 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}

// Skeleton for horizontal car cards
export function CarCardHorizontalSkeleton() {
  return (
    <div className="card flex flex-col md:flex-row animate-pulse">
      {/* Image skeleton */}
      <div className="w-full md:w-80 h-56 bg-gray-300 flex-shrink-0"></div>
      
      {/* Content skeleton */}
      <div className="flex-1 p-6">
        <div className="h-8 bg-gray-300 rounded mb-4 w-3/4"></div>
        <div className="h-10 bg-gray-300 rounded mb-4 w-1/2"></div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="h-16 bg-gray-300 rounded"></div>
          <div className="h-16 bg-gray-300 rounded"></div>
          <div className="h-16 bg-gray-300 rounded"></div>
          <div className="h-16 bg-gray-300 rounded"></div>
        </div>
        
        <div className="h-4 bg-gray-300 rounded mb-4 w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
    </div>
  );
}

// Skeleton for car detail page
export function CarDetailSkeleton() {
  return (
    <div className="container-custom pb-12 animate-pulse">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image skeleton */}
          <div>
            <div className="h-96 bg-gray-300 rounded-2xl mb-4"></div>
            <div className="grid grid-cols-4 gap-2">
              <div className="h-20 bg-gray-300 rounded-lg"></div>
              <div className="h-20 bg-gray-300 rounded-lg"></div>
              <div className="h-20 bg-gray-300 rounded-lg"></div>
              <div className="h-20 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
          
          {/* Info skeleton */}
          <div>
            <div className="h-10 bg-gray-300 rounded mb-4"></div>
            <div className="h-12 bg-gray-300 rounded mb-6 w-1/2"></div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="h-24 bg-gray-300 rounded-xl"></div>
              <div className="h-24 bg-gray-300 rounded-xl"></div>
              <div className="h-24 bg-gray-300 rounded-xl"></div>
              <div className="h-24 bg-gray-300 rounded-xl"></div>
            </div>
            
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2 w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarCardSkeleton;
