import React from 'react';
import { PlotDetails } from '../../types';
import { formatArea } from '../../utils/areaConversion';

interface PlotDetailsModalProps {
  plot: PlotDetails;
  onClose: () => void;
}

const PlotDetailsModal: React.FC<PlotDetailsModalProps> = ({ plot, onClose }) => {
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

  const getMiscColor = (type: string) => {
    switch (type) {
      case 'disputed':
        return 'bg-red-100 text-red-800';
      case 'optional':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Plot Details - {plot.plotNumber}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 max-h-96 overflow-y-auto">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Plot Number:</span>
                <p className="text-gray-900">{plot.plotNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Private Plot Number:</span>
                <p className="text-gray-900">{plot.privatePlotNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plot.status)}`}>
                    {plot.status}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Possession:</span>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    plot.possession ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {plot.possession ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Date of Sale:</span>
                <p className="text-gray-900">{new Date(plot.dateOfSale).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Date of Purchase:</span>
                <p className="text-gray-900">{new Date(plot.dateOfPurchase).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Area Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Area Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Land Area:</span>
                <p className="text-gray-900">{formatArea(plot.landArea.value, plot.landArea.unit)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Plot Area:</span>
                <p className="text-gray-900">{formatArea(plot.plotArea.value, plot.plotArea.unit)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Size:</span>
                <p className="text-gray-900">
                  {plot.size.length} × {plot.size.width} {plot.size.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Location</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Gram Sabha:</span>
                <p className="text-gray-900">{plot.location.gramSabha}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Full Address:</span>
                <p className="text-gray-900">{plot.location.fullAddress}</p>
              </div>
            </div>
          </div>

          {/* Miscellaneous */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Miscellaneous</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Type:</span>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMiscColor(plot.miscellaneous.type)}`}>
                    {plot.miscellaneous.type}
                  </span>
                </div>
              </div>
              {plot.miscellaneous.description && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Description:</span>
                  <p className="text-gray-900">{plot.miscellaneous.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Seller Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Seller Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <p className="text-gray-900">{plot.sellerInfo.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Mobile Number:</span>
                <p className="text-gray-900">{plot.sellerInfo.mobileNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Address:</span>
                <p className="text-gray-900">{plot.sellerInfo.address}</p>
              </div>
            </div>
          </div>

          {/* Purchaser Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Purchaser Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <p className="text-gray-900">{plot.purchaserInfo.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Mobile Number:</span>
                <p className="text-gray-900">{plot.purchaserInfo.mobileNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Address:</span>
                <p className="text-gray-900">{plot.purchaserInfo.address}</p>
              </div>
            </div>
          </div>

          {/* Selling Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Selling Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Bank Name:</span>
                <p className="text-gray-900">{plot.sellingDetails.bankName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Account Number:</span>
                <p className="text-gray-900">{plot.sellingDetails.accountNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Transaction Number:</span>
                <p className="text-gray-900">{plot.sellingDetails.transactionNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Value:</span>
                <p className="text-gray-900">${plot.sellingDetails.value.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Balance:</span>
                <p className="text-gray-900">${plot.sellingDetails.balance.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Credited Amount:</span>
                <p className="text-gray-900">${plot.sellingDetails.creditedAmount?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          {/* Purchase Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Purchase Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Bank Name:</span>
                <p className="text-gray-900">{plot.purchaseDetails.bankName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Account Number:</span>
                <p className="text-gray-900">{plot.purchaseDetails.accountNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Transaction Number:</span>
                <p className="text-gray-900">{plot.purchaseDetails.transactionNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Value:</span>
                <p className="text-gray-900">${plot.purchaseDetails.value.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Balance:</span>
                <p className="text-gray-900">${plot.purchaseDetails.balance.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Debited Amount:</span>
                <p className="text-gray-900">${plot.purchaseDetails.debitedAmount?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlotDetailsModal;
