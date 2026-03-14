import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LandRecord, PlotDetails } from '../../types';
import { mockLandRecords } from '../../data/mockData';
import LandForm from './LandForm';
import PlotDetailsModal from './PlotDetailsModal';
import { convertArea, formatArea } from '../../utils/areaConversion';
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
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'sold' | 'purchased' | 'both'>('all');
  const [newLandData, setNewLandData] = useState({ landNumber: '', totalArea: 0, roadArea: 0, unit: 'sqft' as const });
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [showExtendSuccess, setShowExtendSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'architecture'>('dashboard');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('landRecords');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setLandRecords(parsedData);
      } catch (error) {
        console.error('Error parsing land records from localStorage:', error);
        setLandRecords(mockLandRecords);
        localStorage.setItem('landRecords', JSON.stringify(mockLandRecords));
      }
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

  const handleLogout = () => {
    logout();
    window.location.href = '/#/admin/login';
  };

  const handleExtendSession = () => {
    extendSession();
    setShowExtendSuccess(true);
    setTimeout(() => setShowExtendSuccess(false), 3000);
  };

  const handleAddPlot = (landId: string) => {
    setSelectedLand(landRecords.find(land => land.id === landId) || null);
    setSelectedPlot(null); // Clear selected plot for new plot
    setShowForm(true);
  };

  const handleEditPlot = (plot: PlotDetails, landId: string) => {
    setSelectedPlot(plot);
    setSelectedLand(landRecords.find(land => land.id === landId) || null);
    setShowForm(true);
  };

  const handleDeletePlot = (plotId: string, landId: string) => {
    if (window.confirm('Are you sure you want to delete this plot?')) {
      setLandRecords(prev => prev.map(land => {
        if (land.id === landId) {
          return {
            ...land,
            plots: land.plots?.filter(plot => plot.id !== plotId) || []
          };
        }
        return land;
      }));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPlot(null);
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
      roadArea: {
        value: newLandData.roadArea,
        unit: newLandData.unit
      },
      plots: []
    };

    setLandRecords(prev => [...prev, newLand]);
    setNewLandData({ landNumber: '', totalArea: 0, roadArea: 0, unit: 'sqft' });
    setShowNewLandForm(false);
    alert('New land record created successfully!');
  };

  const calculateRemainingArea = (land: LandRecord) => {
    try {
      if (!land.totalArea?.value || !land.totalArea?.unit) {
        return 0;
      }
      const totalAreaInSqft = convertArea(land.totalArea.value, land.totalArea.unit, 'sqft');
      const usedArea = (land.plots || [])
        .filter(plot => plot.status === 'sold')
        .reduce((sum, plot) => {
          try {
            if (!plot.plotArea?.value || !plot.plotArea?.unit) {
              return sum;
            }
            return sum + convertArea(plot.plotArea.value, plot.plotArea.unit, 'sqft');
          } catch (error) {
            console.error('Error converting plot area:', error);
            return sum;
          }
        }, 0);
      return totalAreaInSqft - usedArea;
    } catch (error) {
      console.error('Error calculating remaining area:', error);
      return 0;
    }
  };

  const getArchitectureStats = () => {
    const totalLands = landRecords.length;
    const totalPlots = landRecords.reduce((sum, land) => sum + (land.plots?.length || 0), 0);
    const soldPlots = landRecords.reduce((sum, land) => 
      sum + (land.plots?.filter(plot => plot.status === 'sold').length || 0), 0);
    const bookedPlots = landRecords.reduce((sum, land) => 
      sum + (land.plots?.filter(plot => plot.status === 'booked').length || 0), 0);
    const openPlots = landRecords.reduce((sum, land) => 
      sum + (land.plots?.filter(plot => plot.status === 'open').length || 0), 0);
    
    const totalRevenue = landRecords.reduce((sum, land) => 
      sum + (land.plots?.filter(plot => plot.status === 'sold')
        .reduce((revenue, plot) => revenue + (plot.sellingDetails?.value || 0), 0) || 0), 0);
    
    const pendingBalance = landRecords.reduce((sum, land) => 
      sum + (land.plots?.filter(plot => plot.status === 'sold')
        .reduce((balance, plot) => balance + (plot.sellingDetails?.balance || 0), 0) || 0), 0);

    return {
      totalLands,
      totalPlots,
      soldPlots,
      bookedPlots,
      openPlots,
      totalRevenue,
      pendingBalance,
      occupancyRate: totalPlots > 0 ? ((soldPlots + bookedPlots) / totalPlots * 100).toFixed(1) : '0'
    };
  };

  const stats = getArchitectureStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Logo size="sm" showText={false} className="bg-white rounded-lg p-1" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm opacity-90">RV Coloniser Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Prominent User Site Button */}
              <button
                onClick={() => window.location.href = window.location.origin}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-lg font-bold hover:from-emerald-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Visit User Site</span>
              </button>
              
              <div className="text-right">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs opacity-90">Session: {Math.floor(remainingTime / 60)}m {remainingTime % 60}s</p>
              </div>
              
              <button
                onClick={handleExtendSession}
                className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-semibold"
              >
                Extend
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Session Extension Success Message */}
      {showExtendSuccess && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          Session extended successfully!
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'architecture'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🏗️ Architecture
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          /* Dashboard Content */
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Lands</p>
                    <p className="text-2xl font-bold text-gray-900">{landRecords.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Plots</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {landRecords.reduce((sum, land) => sum + (land.plots?.length || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sold Plots</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {landRecords.reduce((sum, land) => sum + (land.plots?.filter(plot => plot.status === 'sold').length || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Available Plots</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {landRecords.reduce((sum, land) => sum + (land.plots?.filter(plot => plot.status === 'open').length || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="open">Available</option>
                      <option value="booked">Booked</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Possession</label>
                    <select
                      value={possessionFilter}
                      onChange={(e) => setPossessionFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="available">Available</option>
                      <option value="not_available">Not Available</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                    <select
                      value={balanceFilter}
                      onChange={(e) => setBalanceFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="pending">Pending</option>
                      <option value="cleared">Cleared</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction</label>
                    <select
                      value={transactionFilter}
                      onChange={(e) => setTransactionFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="sold">Sold Only</option>
                      <option value="purchased">Purchased Only</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNewLandForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Add New Land
                  </button>
                </div>
              </div>
            </div>

            
            {/* Land Records Display */}
            <div className="space-y-6">
              {landRecords.map((land) => (
                <div key={land.id} className="bg-white rounded-lg shadow-md">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{land.landNumber}</h3>
                        <p className="text-sm text-gray-600">
                          Total Area: {land.totalArea?.value} {land.totalArea?.unit} | 
                          Road Area: {land.roadArea?.value || 0} {land.roadArea?.unit || land.totalArea?.unit} | 
                          Plots: {land.plots?.length || 0}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddPlot(land.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        Add Plot
                      </button>
                    </div>
                  </div>
                  
                  {(land.plots || []).length > 0 && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {land.plots?.filter((plot) => {
                          const matchesStatus = statusFilter === 'all' || plot.status === statusFilter;
                          const matchesPossession = possessionFilter === 'all' || 
                            (possessionFilter === 'available' && plot.possession) ||
                            (possessionFilter === 'not_available' && !plot.possession);
                          const matchesBalance = balanceFilter === 'all' || 
                            (balanceFilter === 'pending' && plot.sellingDetails.balance > 0) ||
                            (balanceFilter === 'cleared' && plot.sellingDetails.balance === 0);
                          const matchesTransaction = transactionFilter === 'all' ||
                            (transactionFilter === 'sold' && plot.transactionType === 'sold') ||
                            (transactionFilter === 'purchased' && plot.transactionType === 'purchased') ||
                            (transactionFilter === 'both' && plot.transactionType === 'both');
                          
                          return matchesStatus && matchesPossession && matchesBalance && matchesTransaction;
                        }).map((plot) => (
                          <div key={plot.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">{plot.plotNumber}</h4>
                                <p className="text-sm text-gray-600">{plot.location.gramSabha}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                plot.status === 'sold' ? 'bg-red-100 text-red-800' :
                                plot.status === 'booked' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {plot.status}
                              </span>
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                              <div>Area: {formatArea(plot.plotArea.value, plot.plotArea.unit)}</div>
                              <div>Size: {plot.size.length}×{plot.size.width} {plot.size.unit}</div>
                              <div>Possession: {plot.possession ? 'Available' : 'Not Available'}</div>
                              <div>Price: ₹{plot.sellingDetails.value.toLocaleString('en-IN')}</div>
                              {plot.sellingDetails.balance > 0 && (
                                <div className="text-orange-600">Balance: ₹{plot.sellingDetails.balance.toLocaleString('en-IN')}</div>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditPlot(plot, land.id)}
                                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePlot(plot.id, land.id)}
                                className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm font-semibold"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Architecture Content */
          <div className="space-y-6">
            {/* Architecture Overview */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold mb-4">🏗️ Architecture Overview</h2>
              <p className="text-lg opacity-90">Comprehensive analysis of your land development projects</p>
            </div>

            {/* Architecture Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{stats.totalLands}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Total Lands</h3>
                <p className="text-sm text-gray-600">Active land parcels</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{stats.totalPlots}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Total Plots</h3>
                <p className="text-sm text-gray-600">Individual plots created</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">₹{(stats.totalRevenue / 100000).toFixed(1)}L</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
                <p className="text-sm text-gray-600">From sold plots</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">{stats.occupancyRate}%</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Occupancy Rate</h3>
                <p className="text-sm text-gray-600">Sold + Booked plots</p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Status Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">Sold Plots</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{stats.soldPlots}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">Booked Plots</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-600">{stats.bookedPlots}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">Available Plots</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{stats.openPlots}</span>
                  </div>
                </div>
              </div>

              {/* Financial Overview */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Financial Overview</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Total Revenue</span>
                      <span className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Pending Balance</span>
                      <span className="text-2xl font-bold text-red-600">₹{stats.pendingBalance.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Average Plot Price</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{stats.soldPlots > 0 ? Math.round(stats.totalRevenue / stats.soldPlots).toLocaleString('en-IN') : '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Land Details */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🏞️ Land Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Land Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Area</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Plots</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Area</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {landRecords.map((land) => {
                      const landPlots = land.plots || [];
                      const soldCount = landPlots.filter(plot => plot.status === 'sold').length;
                      const availableCount = landPlots.filter(plot => plot.status === 'open').length;
                      const remainingArea = calculateRemainingArea(land);
                      
                      return (
                        <tr key={land.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{land.landNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {land.totalArea?.value} {land.totalArea?.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{landPlots.length}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{soldCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{availableCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {remainingArea > 0 ? `${Math.round(remainingArea)} sqft` : 'Fully utilized'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Plot Details Modal */}
      {showPlotModal && selectedPlot && (
        <PlotDetailsModal
          plot={selectedPlot}
          onClose={() => setShowPlotModal(false)}
        />
      )}

      {/* Add/Edit Plot Form Modal */}
      {showForm && selectedLand && (
        <LandForm
          onSubmit={(plot: PlotDetails) => {
            if (selectedPlot) {
              // Edit existing plot
              setLandRecords(prev => prev.map(land => {
                if (land.id === selectedLand.id) {
                  return {
                    ...land,
                    plots: land.plots?.map(p => p.id === plot.id ? plot : p) || []
                  };
                }
                return land;
              }));
            } else {
              // Add new plot
              setLandRecords(prev => prev.map(land => {
                if (land.id === selectedLand.id) {
                  return {
                    ...land,
                    plots: [...(land.plots || []), plot]
                  };
                }
                return land;
              }));
            }
            handleCloseForm();
          }}
          onCancel={handleCloseForm}
          remainingArea={calculateRemainingArea(selectedLand)}
          initialData={selectedPlot || undefined}
          isEdit={!!selectedPlot}
        />
      )}

      {/* New Land Form Modal */}
      {showNewLandForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Add New Land</h3>
                <button
                  onClick={() => setShowNewLandForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Land Number</label>
                  <input
                    type="text"
                    value={newLandData.landNumber}
                    onChange={(e) => setNewLandData(prev => ({ ...prev, landNumber: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., LAND-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Area</label>
                  <input
                    type="number"
                    value={newLandData.totalArea}
                    onChange={(e) => setNewLandData(prev => ({ ...prev, totalArea: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Road Area</label>
                  <input
                    type="number"
                    value={newLandData.roadArea}
                    onChange={(e) => setNewLandData(prev => ({ ...prev, roadArea: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select
                    value={newLandData.unit}
                    onChange={(e) => setNewLandData(prev => ({ ...prev, unit: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sqft">Square Feet</option>
                    <option value="sqm">Square Meters</option>
                    <option value="yard">Square Yards</option>
                    <option value="acre">Acres</option>
                    <option value="kanal">Kanal</option>
                    <option value="bigha">Bigha</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setShowNewLandForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewLand}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Add Land
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
