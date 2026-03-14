import React, { useState, useEffect } from 'react';
import { LandRecord, PlotDetails } from '../../types';
import { mockLandRecords } from '../../data/mockData';
import { formatArea } from '../../utils/areaConversion';
import SiteVisitModal from './SiteVisitModal';
import Logo from '../Logo';
import { useAuth } from '../../contexts/AuthContext';

const UserSite: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [landRecords] = useState<LandRecord[]>(() => {
    const saved = localStorage.getItem('landRecords');
    return saved ? JSON.parse(saved) : mockLandRecords;
  });
  const [selectedPlot, setSelectedPlot] = useState<(PlotDetails & { landNumber: string }) | null>(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'booked' | 'sold'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDealPopup, setShowDealPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHomeAnimation, setShowHomeAnimation] = useState(false);
  const [showMotivationalBanner, setShowMotivationalBanner] = useState(true);
  const itemsPerPage = 6;
  
  // Show home animation periodically
  useEffect(() => {
    const showAnimation = () => {
      setShowHomeAnimation(true);
      setTimeout(() => setShowHomeAnimation(false), 5000); // Show for 5 seconds
    };

    // Show animation every 20 seconds
    const interval = setInterval(showAnimation, 20000);
    
    // Show first animation after 5 seconds
    const timer = setTimeout(showAnimation, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  // Show deal popup after 2 seconds, but only 3 times total
  useEffect(() => {
    const popupCount = parseInt(localStorage.getItem('dealPopupCount') || '0');
    const maxPopupShows = 3;
    
    if (popupCount < maxPopupShows) {
      const timer = setTimeout(() => {
        setShowDealPopup(true);
        localStorage.setItem('dealPopupCount', (popupCount + 1).toString());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const getAllPlots = () => {
    return landRecords.flatMap(land => 
      (land.plots || []).map(plot => ({ ...plot, landNumber: land.landNumber }))
    );
  };

  const filteredPlots = getAllPlots().filter(plot => {
    const matchesSearch = searchTerm === '' || 
      plot.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plot.location?.gramSabha || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      plot.landNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || plot.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPlots.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPlots = filteredPlots.slice(startIndex, startIndex + itemsPerPage);

  // Get fresh properties (last 3 added)
  const freshProperties = getAllPlots().slice(-3);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sold': return 'bg-red-100 text-red-800';
      case 'booked': return 'bg-yellow-100 text-yellow-800';
      case 'open': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleContact = (type: 'whatsapp' | 'call' | 'financial', plot?: PlotDetails & { landNumber: string }) => {
    const whatsappNumber = '9415058167';
    const callNumber = '9161811113';
    
    if (type === 'financial') {
      const message = `*RV Coloniser - Financial Advice Request* 💰

*👤 User Information:*
• Date: ${new Date().toLocaleDateString('en-IN')}
• Time: ${new Date().toLocaleTimeString('en-IN')}
• Source: Website
• Page: ${window.location.href}

*📋 Request Type:*
Financial Advice & Loan Information

*📞 Contact Information:*
• WhatsApp: ${whatsappNumber}
• Call: ${callNumber}

---
*I would like to discuss financial options and loan facilities for property purchase.*`;
      
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.location.href = whatsappUrl;
      return;
    }

    if (type === 'call') {
      const callUrl = `tel:${callNumber}`;
      window.location.href = callUrl;
      return;
    }

    if (!plot) return;

    if (type === 'whatsapp') {
      const message = `*RV Coloniser - Property Inquiry* 🏘️

*🏠 Property Details:*
• Land: ${plot.landNumber}
• Plot: ${plot.plotNumber}
• Status: ${plot.status.toUpperCase()}
• Area: ${plot.plotArea.value} ${plot.plotArea.unit}
• Location: ${plot.location.gramSabha}

*📞 Contact:*
• WhatsApp: ${whatsappNumber}
• Call: ${callNumber}

*🌐 Links:*
• User Site: /land-records-rv-coloniser/
• Admin Portal: /land-records-rv-coloniser/#/admin`;
      
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.location.href = whatsappUrl;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Building Formation Animation */}
      {showHomeAnimation && (
        <div className="fixed bottom-4 right-4 z-50 animate-home-formation">
          <div className="relative w-28 h-28">
            {/* Foundation Glow */}
            <div className="absolute bottom-0 w-28 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-foundation-glow"></div>
            
            {/* Building Structure */}
            <div className="absolute bottom-2 w-28 h-20">
              {/* Main Building */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-700 rounded-lg animate-building-rise opacity-80"></div>
              
              {/* Windows */}
              <div className="absolute top-2 left-2 w-3 h-3 bg-yellow-300 rounded animate-window-float" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-300 rounded animate-window-float" style={{animationDelay: '0.7s'}}></div>
              <div className="absolute top-6 left-2 w-3 h-3 bg-yellow-300 rounded animate-window-float" style={{animationDelay: '0.9s'}}></div>
              <div className="absolute top-6 right-2 w-3 h-3 bg-yellow-300 rounded animate-window-float" style={{animationDelay: '1.1s'}}></div>
              
              {/* Door */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gradient-to-b from-amber-700 to-amber-900 rounded-t animate-door-slide"></div>
              
              {/* Roof */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-b-[16px] border-b-gray-800 animate-roof-place"></div>
              
              {/* Antenna */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-600 animate-antenna-grow"></div>
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-signal-pulse"></div>
            </div>
            
            {/* Construction Cranes */}
            <div className="absolute -top-6 left-0 text-lg animate-crane-swing" style={{animationDelay: '0.3s'}}>🏗️</div>
            <div className="absolute -top-6 right-0 text-lg animate-crane-swing" style={{animationDelay: '0.6s'}}>🏗️</div>
            
            {/* Floating Elements */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-sm animate-float-up">🏢</div>
            <div className="absolute bottom-24 left-2 text-xs animate-float-up" style={{animationDelay: '0.4s'}}>🏘️</div>
            <div className="absolute bottom-24 right-2 text-xs animate-float-up" style={{animationDelay: '0.8s'}}>🏛️</div>
            
            {/* Ground Details */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-green-600 animate-plant-spring">�</div>
            <div className="absolute bottom-0 left-4 text-xs text-green-500 animate-plant-spring" style={{animationDelay: '0.3s'}}>�</div>
            <div className="absolute bottom-0 right-4 text-xs text-green-500 animate-plant-spring" style={{animationDelay: '0.6s'}}>🌲</div>
          </div>
        </div>
      )}

      {/* Mobile-Friendly Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Logo size="sm" showText={false} className="bg-white rounded-lg p-1" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">RV Coloniser</h1>
                <p className="text-xs sm:text-sm opacity-90">Dream Home to Reality</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-200 transition-colors">
                Properties
              </button>
              <button onClick={() => handleContact('financial')} className="hover:text-emerald-200 transition-colors">
                Financial Advice
              </button>
              {isAuthenticated && (
                <button onClick={() => window.location.href = '/land-records-rv-coloniser/#/admin'} className="hover:text-emerald-200 transition-colors">
                  Admin Portal
                </button>
              )}
              <button onClick={() => window.location.href = 'https://wa.me/9415058167'} className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
                Contact Us
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }} className="block w-full text-left py-2 px-4 hover:bg-emerald-700 rounded">
                Properties
              </button>
              <button onClick={() => { handleContact('financial'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 px-4 hover:bg-emerald-700 rounded">
                Financial Advice
              </button>
              {isAuthenticated && (
                <button onClick={() => { window.location.href = '/land-records-rv-coloniser/#/admin'; setMobileMenuOpen(false); }} className="block w-full text-left py-2 px-4 hover:bg-emerald-700 rounded">
                  Admin Portal
                </button>
              )}
              <button onClick={() => { window.location.href = 'https://wa.me/9415058167'; setMobileMenuOpen(false); }} className="block w-full text-left py-2 px-4 bg-white text-emerald-600 rounded font-semibold">
                Contact Us
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Motivational Banner */}
      {showMotivationalBanner && (
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-8 relative overflow-hidden">
          <button onClick={() => setShowMotivationalBanner(false)} className="absolute top-2 right-2 text-white hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-pulse">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
                🏡 Make Your Dream Home Come True! 🏡
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl mb-4">
                Invest in Your Future Today - Premium Land Plots Available
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="bg-white text-purple-600 px-6 py-3 rounded-full font-bold text-lg hover:bg-purple-50 transition-all transform hover:scale-105">
                  View Properties
                </button>
                <button onClick={() => handleContact('financial')} className="bg-yellow-400 text-purple-900 px-6 py-3 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all transform hover:scale-105">
                  Get Financial Advice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Real Estate Popup */}
      {showDealPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-premium-popup">
            {/* Premium Header with Building Animation */}
            <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 text-white">
              <div className="absolute top-6 right-6">
                <button 
                  onClick={() => setShowDealPopup(false)} 
                  className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center animate-building-glow">
                      <div className="text-2xl">🏢</div>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold mb-1">RV Coloniser Premium</h1>
                      <p className="text-blue-200 text-sm">Exclusive Properties • Prime Locations • Luxury Living</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>New Listings Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>Premium Locations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span>Ready to Move</span>
                    </div>
                  </div>
                </div>
                
                {/* Premium Building Animation */}
                <div className="relative w-32 h-32 animate-building-float">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl opacity-20 animate-building-pulse"></div>
                  <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-700 rounded-xl opacity-40 animate-building-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute inset-4 bg-gradient-to-br from-blue-600 to-purple-800 rounded-lg opacity-60 animate-building-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl animate-building-rise">🏗️</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Premium Content */}
            <div className="p-8 bg-gradient-to-b from-white to-gray-50">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Properties</h2>
                <p className="text-gray-600">Handpicked premium plots in exclusive locations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {freshProperties.slice(0, 2).map((plot, index) => (
                  <div key={plot.id} className="group">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                      {/* Property Image Placeholder */}
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="text-3xl font-bold mb-2">{plot.plotNumber}</div>
                            <div className="text-sm opacity-90">{plot.location.gramSabha}</div>
                          </div>
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(plot.status)} backdrop-blur-sm`}>
                            {plot.status}
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-white bg-opacity-90 backdrop-blur-sm px-3 py-2 rounded-lg">
                            <div className="text-xs text-gray-600">Size</div>
                            <div className="text-sm font-semibold">{plot.plotArea.value} {plot.plotArea.unit}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{plot.plotNumber}</h3>
                            <p className="text-sm text-gray-500">{plot.location.gramSabha}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">₹{(plot.sellingDetails.value / 100000).toFixed(1)}L</div>
                            <div className="text-xs text-gray-500">Negotiable</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600">📐</span>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Area</div>
                              <div className="font-medium">{plot.plotArea.value} {plot.plotArea.unit}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-green-600">🏠</span>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Type</div>
                              <div className="font-medium">Residential</div>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => { setSelectedPlot(plot); setShowDealPopup(false); }} 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Why Choose RV Coloniser?</h3>
                  <p className="text-sm text-gray-600">Trusted by thousands of happy homeowners</p>
                </div>
                <button 
                  onClick={() => setShowDealPopup(false)} 
                  className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl font-semibold hover:from-gray-800 hover:to-black transition-all duration-300"
                >
                  Explore All Properties
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Properties</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by plot, location..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Properties</option>
                <option value="open">Available</option>
                <option value="booked">Booked</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Advice CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">💼 Need Financial Advice?</h3>
              <p className="text-sm sm:text-base">Get expert guidance on loans and payment plans for your dream property</p>
            </div>
            <button onClick={() => handleContact('financial')} className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all whitespace-nowrap">
              Contact Financial Advisor
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedPlots.map((plot) => {
            const landRecord = landRecords.find(land => land.landNumber === plot.landNumber);
            const hasRoadArea = landRecord && landRecord.roadArea && landRecord.roadArea.value > 0;
            
            return (
            <div key={`${plot.landNumber}-${plot.id}`} className={`relative ${hasRoadArea ? 'p-2 bg-gray-300 rounded-lg' : ''} hover:shadow-2xl transition-all transform hover:-translate-y-1`}>
              {hasRoadArea && (
                <div className="absolute inset-0 border-4 border-gray-400 rounded-lg animate-road-pulse"></div>
              )}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden relative z-10">
                <div className="h-48 bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center relative">
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold">{plot.plotNumber}</div>
                    <div className="text-sm opacity-90">{plot.landNumber}</div>
                  </div>
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(plot.status)}`}>
                    {plot.status}
                  </span>
                  {hasRoadArea && (
                    <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium text-gray-700">
                      🛣️ Road: {landRecord.roadArea.value} {landRecord.roadArea.unit}
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{plot.plotNumber}</h3>
                  <p className="text-sm text-gray-500 mb-4">{plot.location.gramSabha}</p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-medium">{formatArea(plot.plotArea.value, plot.plotArea.unit)}</span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{plot.size.length}×{plot.size.width} {plot.size.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Possession:</span>
                    <span className={`font-medium ${plot.possession ? 'text-green-600' : 'text-red-600'}`}>
                      {plot.possession ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button onClick={() => setSelectedPlot(plot)} className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold">
                    View Details
                  </button>
                  
                  {plot.status === 'open' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleContact('whatsapp', plot)} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold">
                        WhatsApp
                      </button>
                      <button onClick={() => handleContact('call', plot)} className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold">
                        Call
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mb-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* No Results */}
        {filteredPlots.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </main>

      {/* Plot Details Modal */}
      {selectedPlot && !showVisitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50 p-4">
          <div className="relative top-10 mx-auto border w-full max-w-4xl shadow-2xl rounded-lg bg-white mb-10">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white p-4 sm:p-6 rounded-t-lg flex justify-between items-center z-10">
              <h3 className="text-xl sm:text-2xl font-bold">
                {selectedPlot.plotNumber}
              </h3>
              <button onClick={() => setSelectedPlot(null)} className="text-white hover:text-gray-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Property Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Plot:</span> <span className="font-medium">{selectedPlot.plotNumber}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Land:</span> <span className="font-medium">{selectedPlot.landNumber}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedPlot.status)}`}>{selectedPlot.status}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Area:</span> <span className="font-medium">{formatArea(selectedPlot.plotArea.value, selectedPlot.plotArea.unit)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Size:</span> <span className="font-medium">{selectedPlot.size.length}×{selectedPlot.size.width} {selectedPlot.size.unit}</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Location</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Gram Sabha:</span> <p className="font-medium">{selectedPlot.location.gramSabha}</p></div>
                    <div><span className="text-gray-600">Address:</span> <p className="font-medium">{selectedPlot.location.fullAddress}</p></div>
                    <div><span className="text-gray-600">Possession:</span> <span className={`font-medium ${selectedPlot.possession ? 'text-green-600' : 'text-red-600'}`}>{selectedPlot.possession ? 'Available' : 'Not Available'}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                {selectedPlot.status === 'open' && (
                  <>
                    <button onClick={() => handleContact('whatsapp', selectedPlot)} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                      WhatsApp
                    </button>
                    <button onClick={() => handleContact('call', selectedPlot)} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">
                      Call
                    </button>
                  </>
                )}
                <button onClick={() => setShowVisitModal(true)} className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 font-semibold">
                  Book Site Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Site Visit Modal */}
      {showVisitModal && selectedPlot && (
        <SiteVisitModal
          plot={selectedPlot}
          onClose={() => setShowVisitModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo size="sm" showText={false} />
                <h3 className="text-xl font-bold">RV Coloniser</h3>
              </div>
              <p className="text-gray-400 text-sm">Your trusted partner for land investments. Make your dream home come true!</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors">🏠 Properties</button></li>
                {isAuthenticated && (
                  <li><button onClick={() => window.location.href = '/land-records-rv-coloniser/#/admin'} className="text-gray-400 hover:text-white transition-colors">🔐 Admin Portal</button></li>
                )}
                <li><button onClick={() => handleContact('financial')} className="text-gray-400 hover:text-white transition-colors">💼 Financial Advice</button></li>
                <li><button onClick={() => window.location.href = 'https://wa.me/9415058167'} className="text-gray-400 hover:text-white transition-colors">💬 WhatsApp Support</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <div className="space-y-2 text-sm">
                <p><span className="mr-2">📞</span><a href="tel:9161811113" className="text-gray-400 hover:text-white">9161811113</a></p>
                <p><span className="mr-2">💬</span><a href="https://wa.me/9415058167" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">9415058167</a></p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 RV Coloniser. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-down {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes elegant-popup {
          0% { transform: scale(0.9) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes icon-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        /* Enhanced Home Formation Animations */
        @keyframes dig-ground {
          0% { width: 0; opacity: 0; }
          100% { width: 100%; opacity: 1; }
        }
        @keyframes concrete-pour {
          0% { height: 0; opacity: 0; }
          100% { height: 100%; opacity: 1; }
        }
        @keyframes concrete-flow {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(0); }
        }
        @keyframes brick-lay {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes roof-build {
          0% { transform: scale(0) rotate(180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes door-install {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes window-install {
          0% { transform: scale(0) rotate(45deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes chimney-build {
          0% { height: 0; opacity: 0; }
          100% { height: 100%; opacity: 1; }
        }
        @keyframes smoke-rise {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-20px) scale(1.5); opacity: 0; }
        }
        @keyframes plant-grow {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes knob-appear {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes tool-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(10deg); }
        }
        @keyframes road-pulse {
          0%, 100% { border-color: rgb(156 163 175); opacity: 0.8; }
          50% { border-color: rgb(107 114 128); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.7s ease-out;
        }
        .animate-elegant-popup {
          animation: elegant-popup 0.4s ease-out;
        }
        .animate-icon-bounce {
          animation: icon-bounce 2s ease-in-out infinite;
        }
        .animate-home-formation {
          animation: fade-in 0.5s ease-out;
        }
        .animate-dig-ground {
          animation: dig-ground 0.3s ease-out;
        }
        .animate-concrete-pour {
          animation: concrete-pour 0.5s ease-out 0.2s both;
        }
        .animate-concrete-flow {
          animation: concrete-flow 1s ease-in-out infinite;
        }
        .animate-brick-lay {
          animation: brick-lay 0.3s ease-out both;
        }
        .animate-roof-build {
          animation: roof-build 0.4s ease-out 0.8s both;
        }
        .animate-door-install {
          animation: door-install 0.3s ease-out 1s both;
        }
        .animate-window-install {
          animation: window-install 0.3s ease-out 1.2s both;
        }
        .animate-chimney-build {
          animation: chimney-build 0.3s ease-out 1.4s both;
        }
        .animate-smoke-rise {
          animation: smoke-rise 2s ease-out 1.6s infinite;
        }
        .animate-plant-grow {
          animation: plant-grow 0.4s ease-out 1.8s both;
        }
        .animate-knob-appear {
          animation: knob-appear 0.2s ease-out 1.5s both;
        }
        .animate-tool-float {
          animation: tool-float 3s ease-in-out infinite;
        }
        .animate-road-pulse {
          animation: road-pulse 2s ease-in-out infinite;
        }
        
        /* Premium Popup Animations */
        @keyframes premium-popup {
          0% { transform: scale(0.9) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes building-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.8); }
        }
        @keyframes building-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes building-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes building-rise {
          0% { transform: translateY(20px) scale(0.8); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        /* Enhanced Building Animations */
        @keyframes foundation-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.8); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 1); }
        }
        @keyframes window-float {
          0% { transform: scale(0) rotate(180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes door-slide {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes roof-place {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes antenna-grow {
          0% { height: 0; opacity: 0; }
          100% { height: 16px; opacity: 1; }
        }
        @keyframes signal-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
        @keyframes crane-swing {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes float-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(-10px); opacity: 1; }
        }
        @keyframes plant-spring {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        .animate-premium-popup {
          animation: premium-popup 0.5s ease-out;
        }
        .animate-building-glow {
          animation: building-glow 2s ease-in-out infinite;
        }
        .animate-building-float {
          animation: building-float 3s ease-in-out infinite;
        }
        .animate-building-pulse {
          animation: building-pulse 2s ease-in-out infinite;
        }
        .animate-building-rise {
          animation: building-rise 1s ease-out;
        }
        .animate-foundation-glow {
          animation: foundation-glow 2s ease-in-out infinite;
        }
        .animate-window-float {
          animation: window-float 0.5s ease-out both;
        }
        .animate-door-slide {
          animation: door-slide 0.6s ease-out both;
        }
        .animate-roof-place {
          animation: roof-place 0.4s ease-out both;
        }
        .animate-antenna-grow {
          animation: antenna-grow 0.3s ease-out both;
        }
        .animate-signal-pulse {
          animation: signal-pulse 1.5s ease-in-out infinite;
        }
        .animate-crane-swing {
          animation: crane-swing 2s ease-in-out infinite;
        }
        .animate-float-up {
          animation: float-up 1s ease-out both;
        }
        .animate-plant-spring {
          animation: plant-spring 0.4s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default UserSite;
