import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LandRecord, PlotDetails } from '../../types';
import { mockLandRecords } from '../../data/mockData';
import LandForm from './LandForm';
import LandList from './LandList';
import PlotDetailsModal from './PlotDetailsModal';
import { convertArea } from '../../utils/areaConversion';
import Logo from '../Logo';

const AdminDashboard: React.FC = () => {
  const { user, logout, remainingTime, extendSession } = useAuth();
  const [landRecords, setLandRecords] = useState<LandRecord[]>([]);
  const [selectedLand, setSelectedLand] = useState<LandRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showNewLandForm, setShowNewLandForm] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<PlotDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'sold' | 'booked' | 'open'>('all');
  const [possessionFilter, setPossessionFilter] = useState<'all' | 'available' | 'not_available'>('all');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'pending' | 'cleared'>('all');
  const [newLandData, setNewLandData] = useState({ landNumber: '', totalArea: 0, unit: 'sqft' as const });
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [showExtendSuccess, setShowExtendSuccess] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('landRecords');
    if (savedData) {
      setLandRecords(JSON.parse(savedData));
    } else {
      setLandRecords(mockLandRecords);
      localStorage.setItem('landRecords', JSON.stringify(mockLandRecords));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (landRecords.length > 0) {
      localStorage.setItem('landRecords', JSON.stringify(landRecords));
    }
  }, [landRecords]);

  const handleExtendSession = () => {
    extendSession();
    setShowExtendSuccess(true);
    setTimeout(() => setShowExtendSuccess(false), 3000);
  };

  const handleAddPlot = (plotData: PlotDetails) => {
    if (!selectedLand) return;

    const newPlot = {
      ...plotData,
      id: `plot-${Date.now()}`
    };

    setLandRecords(prev => prev.map(land => 
      land.id === selectedLand.id
        ? { ...land, plots: [...land.plots, newPlot] }
        : land
    ));

    // Update selected land to reflect changes
    setSelectedLand(prev => prev ? { ...prev, plots: [...prev.plots, newPlot] } : null);
    setShowForm(false);
  };

  const handleAddNewLand = () => {
    if (!newLandData.landNumber || newLandData.totalArea <= 0) {
      alert('Please provide valid land number and total area');
      return;
    }

    const newLand: LandRecord = {
      id: `land-${Date.now()}`,
      landNumber: newLandData.landNumber,
      totalArea: {
        value: newLandData.totalArea,
        unit: newLandData.unit
      },
      plots: []
    };

    setLandRecords(prev => [...prev, newLand]);
    setNewLandData({ landNumber: '', totalArea: 0, unit: 'sqft' });
    setShowNewLandForm(false);
    alert('New land record created successfully!');
  };

  const calculateRemainingArea = (land: LandRecord) => {
    const totalAreaInSqft = convertArea(land.totalArea.value, land.totalArea.unit, 'sqft');
    const usedArea = land.plots
      .filter(plot => plot.status === 'sold')
      .reduce((sum, plot) => sum + convertArea(plot.plotArea.value, plot.plotArea.unit, 'sqft'), 0);
    return totalAreaInSqft - usedArea;
  };

  const getFilteredPlots = (plots: PlotDetails[]) => {
    return plots.filter(plot => {
      const matchesStatus = statusFilter === 'all' || plot.status === statusFilter;
      const matchesPossession = possessionFilter === 'all' || 
        (possessionFilter === 'available' ? plot.possession : !plot.possession);
      const hasBalance = plot.sellingDetails.balance > 0 || plot.purchaseDetails.balance > 0;
      const matchesBalance = balanceFilter === 'all' || 
        (balanceFilter === 'pending' ? hasBalance : !hasBalance);
      
      return matchesStatus && matchesPossession && matchesBalance;
    });
  };

  const handlePlotSelect = (plot: PlotDetails) => {
    setSelectedPlot(plot);
    setShowPlotModal(true);
  };

  const handlePlotEdit = (plot: PlotDetails) => {
    setSelectedPlot(plot);
    // TODO: Implement edit modal
    alert('Edit functionality coming soon! For now, you can delete and recreate plots.');
  };

  const handlePlotDelete = (plotId: string) => {
    if (!selectedLand) return;
    
    const updatedLand = {
      ...selectedLand,
      plots: selectedLand.plots.filter(plot => plot.id !== plotId)
    };
    
    setLandRecords(prev => prev.map(land => 
      land.id === selectedLand.id ? updatedLand : land
    ));
    setSelectedLand(updatedLand);
    
    alert('Plot deleted successfully!');
  };

  return (
    <div className="space-y-6">
      {showExtendSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Session extended successfully! You now have 1 more hour.
        </div>
      )}
      {remainingTime > 0 && remainingTime <= 5 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center animate-pulse">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          ⚠️ Session expiring in {remainingTime} minutes! Please extend your session or save your work.
        </div>
      )}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Logo size="md" showText={false} />
            <div>
              <h1 className="text-3xl font-bold mb-2">RV Coloniser Admin</h1>
              <p className="text-blue-100">Manage land records and plot information</p>
              <p className="text-blue-200 text-sm mt-1">Welcome, {user?.username}</p>
              <div className={`flex items-center space-x-2 mt-2 ${remainingTime < 10 ? 'animate-pulse' : ''}`}>
                <svg className={`w-4 h-4 ${remainingTime < 10 ? 'text-yellow-300' : 'text-blue-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`${remainingTime < 10 ? 'text-yellow-300 font-semibold' : 'text-blue-200'} text-sm`}>
                  {remainingTime < 10 ? '⚠️ Session expiring soon! ' : ''}
                  Session expires in {remainingTime} minutes
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNewLandForm(true)}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold shadow-lg transition-all transform hover:scale-105"
            >
              + Add New Land
            </button>
            {remainingTime < 15 && (
              <button
                onClick={handleExtendSession}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold shadow-lg transition-all transform hover:scale-105 animate-pulse"
              >
                Extend Session (+1hr)
              </button>
            )}
            <button
              onClick={logout}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold shadow-lg transition-all transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Land Records List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Land Records ({landRecords.length})
            </h2>
            <div className="space-y-3">
              {landRecords.map(land => {
                const remainingArea = calculateRemainingArea(land);
                const usagePercentage = ((land.totalArea.value * convertArea(1, land.totalArea.unit, 'sqft') - remainingArea) / (land.totalArea.value * convertArea(1, land.totalArea.unit, 'sqft'))) * 100;
                
                return (
                  <div
                    key={land.id}
                    onClick={() => setSelectedLand(land)}
                    className={`p-5 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                      selectedLand?.id === land.id
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{land.landNumber}</h3>
                        <p className="text-sm text-gray-500">{land.plots.length} plots</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedLand?.id === land.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {selectedLand?.id === land.id ? 'Selected' : 'Select'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Area:</span>
                        <span className="font-semibold text-gray-900">{land.totalArea.value} {land.totalArea.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Remaining:</span>
                        <span className="font-semibold text-green-600">{remainingArea.toFixed(2)} sqft</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Usage</span>
                          <span>{usagePercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {landRecords.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-lg font-medium">No land records yet</p>
                <p className="text-sm">Click "Add New Land" to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Land Details */}
        <div className="lg:col-span-2">
          {selectedLand ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedLand.landNumber} Details
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Land Number:</span>
                      <p className="text-lg font-semibold text-gray-900">{selectedLand.landNumber}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Total Area:</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedLand.totalArea.value} {selectedLand.totalArea.unit}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Total Plots:</span>
                      <p className="text-lg font-semibold text-gray-900">{selectedLand.plots.length}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Remaining Area:</span>
                      <p className="text-lg font-semibold text-green-600">
                        {calculateRemainingArea(selectedLand).toFixed(2)} sqft
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              {selectedLand.plots.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filter Plots
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="booked">Booked</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Possession</label>
                      <select
                        value={possessionFilter}
                        onChange={(e) => setPossessionFilter(e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All</option>
                        <option value="available">Available</option>
                        <option value="not_available">Not Available</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Balance</label>
                      <select
                        value={balanceFilter}
                        onChange={(e) => setBalanceFilter(e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All</option>
                        <option value="pending">Pending Balance</option>
                        <option value="cleared">Cleared</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Plots List with Add Button */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Plots ({selectedLand.plots.length})</h3>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg transition-all transform hover:scale-105"
                  >
                    + Add Plot
                  </button>
                </div>
                <LandList
                  plots={getFilteredPlots(selectedLand.plots)}
                  onPlotSelect={handlePlotSelect}
                  onPlotEdit={handlePlotEdit}
                  onPlotDelete={handlePlotDelete}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No land selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a land record from the list to view details and manage plots.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Land Form Modal */}
      {showNewLandForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Land Record</h3>
              <button
                onClick={() => setShowNewLandForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Land Number *</label>
                <input
                  type="text"
                  value={newLandData.landNumber}
                  onChange={(e) => setNewLandData(prev => ({ ...prev, landNumber: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., LAND-001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Area *</label>
                <input
                  type="number"
                  value={newLandData.totalArea || ''}
                  onChange={(e) => setNewLandData(prev => ({ ...prev, totalArea: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter total area"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <select
                  value={newLandData.unit}
                  onChange={(e) => setNewLandData(prev => ({ ...prev, unit: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sqft">Square Feet</option>
                  <option value="sqm">Square Meters</option>
                  <option value="yard">Square Yards</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowNewLandForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewLand}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Land
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Plot Form Modal */}
      {showForm && selectedLand && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-lg bg-white">
            <LandForm
              onSubmit={handleAddPlot}
              onCancel={() => setShowForm(false)}
              remainingArea={calculateRemainingArea(selectedLand)}
            />
          </div>
        </div>
      )}

      {/* Plot Details Modal */}
      {showPlotModal && selectedPlot && (
        <PlotDetailsModal
          plot={selectedPlot}
          onClose={() => setShowPlotModal(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
