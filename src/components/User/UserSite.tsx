import React, { useState } from 'react';
import { LandRecord, PlotDetails } from '../../types';
import { mockLandRecords } from '../../data/mockData';
import { formatArea } from '../../utils/areaConversion';
import SiteVisitModal from './SiteVisitModal';
import Logo from '../Logo';

const UserSite: React.FC = () => {
  const [landRecords] = useState<LandRecord[]>(mockLandRecords);
  const [selectedPlot, setSelectedPlot] = useState<PlotDetails | null>(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'booked' | 'sold'>('all');

  const getAllPlots = () => {
    return landRecords.flatMap(land => 
      land.plots.map(plot => ({ ...plot, landNumber: land.landNumber }))
    );
  };

  const filteredPlots = getAllPlots().filter(plot => {
    const matchesSearch = searchTerm === '' || 
      plot.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plot.location.gramSabha.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plot.landNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || plot.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'booked':
        return 'bg-yellow-100 text-yellow-800';
      case 'open':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePlotClick = (plot: PlotDetails & { landNumber: string }) => {
    setSelectedPlot(plot);
  };

  const handleContact = (type: 'whatsapp' | 'call', plot: PlotDetails) => {
    // Use the specified numbers for all contacts
    const whatsappNumber = '9415058167';
    const callNumber = '9161811113';
    
    if (type === 'whatsapp') {
      window.open(`https://wa.me/${whatsappNumber}`, '_blank');
    } else {
      window.open(`tel:${callNumber}`);
    }
  };

  const handleSiteVisit = (plot: PlotDetails) => {
    setSelectedPlot(plot);
    setShowVisitModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Available Land Properties</h1>
        <p className="text-lg text-gray-600">RV Coloniser - Browse our available land plots and book your site visit</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Properties</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by plot number, location, or land number..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Properties</option>
              <option value="open">Available</option>
              <option value="booked">Booked</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlots.map((plot) => (
          <div key={`${plot.landNumber}-${plot.id}`} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Property Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-2xl font-bold">{plot.plotNumber}</div>
                <div className="text-sm opacity-90">{plot.landNumber}</div>
              </div>
            </div>

            {/* Property Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plot.plotNumber}</h3>
                  <p className="text-sm text-gray-500">{plot.location.gramSabha}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plot.status)}`}>
                  {plot.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plot Area:</span>
                  <span className="font-medium">{formatArea(plot.plotArea.value, plot.plotArea.unit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{plot.size.length} × {plot.size.width} {plot.size.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Possession:</span>
                  <span className={`font-medium ${plot.possession ? 'text-green-600' : 'text-red-600'}`}>
                    {plot.possession ? 'Available' : 'Not Available'}
                  </span>
                </div>
                {plot.miscellaneous.type === 'optional' && plot.miscellaneous.description && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    {plot.miscellaneous.description}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handlePlotClick(plot)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  View Details
                </button>
                
                {plot.status === 'open' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleContact('whatsapp', plot)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleContact('call', plot)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      Call
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => handleSiteVisit(plot)}
                  className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Book Site Visit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredPlots.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        </div>
      )}

      {/* Plot Details Modal */}
      {selectedPlot && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Property Details - {selectedPlot.plotNumber}
              </h3>
              <button
                onClick={() => setSelectedPlot(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Property Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Plot Number:</span>
                      <span className="font-medium">{selectedPlot.plotNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Land Number:</span>
                      <span className="font-medium">{(selectedPlot as any).landNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPlot.status)}`}>
                        {selectedPlot.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Plot Area:</span>
                      <span className="font-medium">{formatArea(selectedPlot.plotArea.value, selectedPlot.plotArea.unit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Size:</span>
                      <span className="font-medium">{selectedPlot.size.length} × {selectedPlot.size.width} {selectedPlot.size.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Location</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gram Sabha:</span>
                      <span className="font-medium">{selectedPlot.location.gramSabha}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Full Address:</span>
                      <span className="font-medium text-right">{selectedPlot.location.fullAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Possession:</span>
                      <span className={`font-medium ${selectedPlot.possession ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedPlot.possession ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Seller Information</h5>
                    <div className="space-y-1">
                      <p className="text-sm"><span className="text-gray-600">Name:</span> {selectedPlot.sellerInfo.name}</p>
                      <p className="text-sm"><span className="text-gray-600">Mobile:</span> {selectedPlot.sellerInfo.mobileNumber}</p>
                      <p className="text-sm"><span className="text-gray-600">Address:</span> {selectedPlot.sellerInfo.address}</p>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Purchaser Information</h5>
                    <div className="space-y-1">
                      <p className="text-sm"><span className="text-gray-600">Name:</span> {selectedPlot.purchaserInfo.name}</p>
                      <p className="text-sm"><span className="text-gray-600">Mobile:</span> {selectedPlot.purchaserInfo.mobileNumber}</p>
                      <p className="text-sm"><span className="text-gray-600">Address:</span> {selectedPlot.purchaserInfo.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                {selectedPlot.status === 'open' && (
                  <>
                    <button
                      onClick={() => handleContact('whatsapp', selectedPlot)}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleContact('call', selectedPlot)}
                      className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      Call
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleSiteVisit(selectedPlot)}
                  className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
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
    </div>
  );
};

export default UserSite;
