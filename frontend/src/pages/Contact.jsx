import React, { useState } from 'react';
import axios from '../api/axios';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (optional but must be valid if provided)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('/contact/', formData);
      setSubmitStatus({ type: 'success', message: 'Thank you! Your message has been sent successfully.' });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
      setSubmitStatus({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: 'location',
      title: 'Visit Us',
      info: 'Τεύκρου Ανθία 1, 2480 Τσέρι, Nicosia, Cyprus',
      link: 'https://maps.google.com/?q=Τεύκρου+Ανθία+1,+2480+Τσέρι,+Nicosia,+Cyprus',
      linkText: 'Get Directions',
      color: 'primary'
    },
    {
      icon: 'phone',
      title: 'Call Us',
      info: '99 022802',
      link: 'tel:99022802',
      linkText: 'Call Now',
      color: 'green'
    },
    {
      icon: 'email',
      title: 'Email Us',
      info: 'autodealercy@gmail.com',
      link: 'mailto:autodealercy@gmail.com',
      linkText: 'Send Email',
      color: 'blue'
    },
    {
      icon: 'facebook',
      title: 'Facebook',
      info: 'Follow us on Facebook',
      link: 'https://www.facebook.com/profile.php?id=100063609997112',
      linkText: 'Visit Facebook',
      color: 'blue'
    }
  ];

  const getIcon = (type) => {
    const icons = {
      location: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      ),
      phone: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      ),
      email: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      ),
      facebook: (
        <path
          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        />
      )
    };
    return icons[type];
  };

  return (
    <div className="min-h-screen">
      {/* Hero Background Section */}
      <div 
        className="relative bg-cover bg-center bg-fixed py-16 sm:py-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1563720360172-67b8f3dce741?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/75"></div>
        
        <div className="relative container-custom">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 sm:mb-16 fade-in">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Get In <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">Touch</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto px-4">
                Have questions or ready to schedule a test drive? Choose your preferred way to reach us!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">

            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {contactInfo.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target={item.icon === 'location' || item.icon === 'facebook' ? '_blank' : undefined}
                rel={item.icon === 'location' || item.icon === 'facebook' ? 'noopener noreferrer' : undefined}
                className="scale-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`bg-white rounded-2xl shadow-lg p-6 sm:p-8 h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-2 border-transparent hover:border-${item.color}-500`}>
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-${item.color}-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-300 group-hover:rotate-6`}>
                    <svg
                      className={`w-7 h-7 sm:w-8 sm:h-8 text-${item.color}-600`}
                      fill={item.icon === 'facebook' ? 'currentColor' : 'none'}
                      stroke={item.icon === 'facebook' ? 'none' : 'currentColor'}
                      viewBox="0 0 24 24"
                    >
                      {getIcon(item.icon)}
                    </svg>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-gray-600 mb-4 min-h-[3rem] sm:min-h-[3.5rem]">
                    {item.info}
                  </p>
                  
                  <div className={`flex items-center text-${item.color}-600 font-semibold text-sm sm:text-base group-hover:translate-x-2 transition-transform duration-300`}>
                    {item.linkText}
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Business Hours Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 fade-in mb-12" style={{ animationDelay: '0.5s' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-2xl flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Business Hours
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-4 sm:p-6 bg-gray-50 rounded-xl hover:bg-primary-50 transition-all duration-300 hover:shadow-md">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">Monday - Friday</span>
                  <span className="text-primary-600 font-bold text-sm sm:text-base">9:00 AM - 7:00 PM</span>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 bg-gray-50 rounded-xl hover:bg-primary-50 transition-all duration-300 hover:shadow-md">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">Saturday</span>
                  <span className="text-primary-600 font-bold text-sm sm:text-base">10:00 AM - 6:00 PM</span>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">Sunday</span>
                  <span className="text-gray-500 font-bold text-sm sm:text-base">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-accent-100 rounded-2xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-accent-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Send Us a Message
              </h2>
            </div>

            {submitStatus && (
              <div className={`mb-6 p-4 rounded-lg ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="99 123456"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Inquiry about..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tell us how we can help you..."
                ></textarea>
                {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold py-4 px-8 rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
