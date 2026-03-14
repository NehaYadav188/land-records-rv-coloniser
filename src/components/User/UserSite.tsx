import React, { useState, useEffect } from 'react';
import { LandRecord, PlotDetails } from '../../types';
import { mockLandRecords } from '../../data/mockData';
import { formatArea } from '../../utils/areaConversion';
import SiteVisitModal from './SiteVisitModal';
import Logo from '../Logo';
import { useNavigate } from 'react-router-dom';

const UserSite: React.FC = () => {
  const navigate = useNavigate();
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
  const [showMotivationalBanner, setShowMotivationalBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemsPerPage = 6;
  
  // Check if user has admin session
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        setIsAdminLoggedIn(!!parsed.user);
      } catch (error) {
        setIsAdminLoggedIn(false);
      }
    }
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
      window.open(whatsappUrl, '_blank');
      return;
    }

    if (type === 'call') {
      const callUrl = `tel:${callNumber}`;
      window.open(callUrl, '_self');
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
• User Site: ${window.location.origin}
• Admin Portal: ${window.location.origin}/#/admin`;
      
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              {isAdminLoggedIn ? (
                <button onClick={() => navigate('/#/admin')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Admin</span>
                </button>
              ) : (
                <button onClick={() => navigate('/#/admin')} className="hover:text-emerald-200 transition-colors">
                  Admin Portal
                </button>
              )}
              <a href={`https://wa.me/9415058167`} target="_blank" rel="noopener noreferrer" className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
                Contact Us
              </a>
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
              {isAdminLoggedIn ? (
                <button onClick={() => { navigate('/#/admin'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 px-4 bg-blue-600 text-white rounded font-semibold">
                  ← Back to Admin Portal
                </button>
              ) : (
                <button onClick={() => { navigate('/#/admin'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 px-4 hover:bg-emerald-700 rounded">
                  Admin Portal
                </button>
              )}
              <a href={`https://wa.me/9415058167`} target="_blank" rel="noopener noreferrer" className="block w-full text-left py-2 px-4 bg-white text-emerald-600 rounded font-semibold">
                Contact Us
              </a>
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

      {/* Deal Popup Modal */}
      {showDealPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-bounce-in">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-t-2xl relative">
              <button onClick={() => setShowDealPopup(false)} className="absolute top-4 right-4 text-white hover:text-gray-200">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-2">
                🔥 DON'T MISS THE DEAL! 🔥
              </h2>
              <p className="text-center text-lg">Freshly Added Premium Properties</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-gray-800 mb-2">⏰ Limited Time Offer!</p>
                <p className="text-gray-600">Check out our newest properties before they're gone</p>
              </div>

              {freshProperties.map((plot, index) => (
                <div key={plot.id} className="border-2 border-orange-300 rounded-lg p-4 bg-gradient-to-r from-orange-50 to-yellow-50 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{plot.plotNumber}</h3>
                      <p className="text-sm text-gray-600">{plot.location.gramSabha}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(plot.status)}`}>
                      {plot.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div><span className="text-gray-600">Area:</span> <span className="font-semibold">{plot.plotArea.value} {plot.plotArea.unit}</span></div>
                    <div><span className="text-gray-600">Size:</span> <span className="font-semibold">{plot.size.length}×{plot.size.width} {plot.size.unit}</span></div>
                  </div>
                  <button onClick={() => { setSelectedPlot(plot); setShowDealPopup(false); }} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-bold hover:from-orange-600 hover:to-red-600 transition-all">
                    View Details →
                  </button>
                </div>
              ))}

              <button onClick={() => setShowDealPopup(false)} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors mt-4">
                Browse All Properties
              </button>
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
          {paginatedPlots.map((plot) => (
            <div key={`${plot.landNumber}-${plot.id}`} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center relative">
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">{plot.plotNumber}</div>
                  <div className="text-sm opacity-90">{plot.landNumber}</div>
                </div>
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(plot.status)}`}>
                  {plot.status}
                </span>
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
          ))}
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
                <li><button onClick={() => navigate('/#/admin')} className="text-gray-400 hover:text-white transition-colors">🔐 Admin Portal</button></li>
                <li><button onClick={() => handleContact('financial')} className="text-gray-400 hover:text-white transition-colors">💼 Financial Advice</button></li>
                <li><a href={`https://wa.me/9415058167`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">💬 WhatsApp Support</a></li>
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
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserSite;
