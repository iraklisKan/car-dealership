import axiosInstance from './axios';

/**
 * Track a page view
 * @param {string} pageType - Type of page: 'home', 'car_list', 'car_detail', 'contact'
 */
export const trackPageView = async (pageType) => {
  try {
    await axiosInstance.post('/analytics/track/page/', {
      page_type: pageType
    });
  } catch (error) {
    // Silently fail - don't break user experience if analytics fails
    console.debug('Analytics tracking failed:', error);
  }
};

/**
 * Track a car view
 * @param {number} carId - ID of the car
 * @param {string} viewType - Type of view: 'card_click' or 'detail_view'
 */
export const trackCarView = async (carId, viewType = 'detail_view') => {
  try {
    await axiosInstance.post('/analytics/track/car/', {
      car: carId,
      view_type: viewType
    });
  } catch (error) {
    // Silently fail - don't break user experience if analytics fails
    console.debug('Analytics tracking failed:', error);
  }
};
