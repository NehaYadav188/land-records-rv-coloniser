import React from 'react';
import { PlotDetails } from '../../types';
import { formatArea } from '../../utils/areaConversion';

interface LandListProps {
  plots: PlotDetails[];
  onPlotSelect: (plot: PlotDetails) => void;
  onPlotEdit?: (plot: PlotDetails) => void;
  onPlotDelete?: (plotId: string) => void;
}

const LandList: React.FC<LandListProps> = ({ plots, onPlotSelect, onPlotEdit, onPlotDelete }) => {
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
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Plots ({plots.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plot Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Area
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Possession
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {plots.map((plot) => (
              <tr key={plot.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{plot.plotNumber}</div>
                    <div className="text-sm text-gray-500">{plot.privatePlotNumber}</div>
                    <div className="text-xs text-gray-500">{plot.location.gramSabha}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatArea(plot.plotArea.value, plot.plotArea.unit)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Land: {formatArea(plot.landArea.value, plot.landArea.unit)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {plot.size.length} × {plot.size.width} {plot.size.unit}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plot.status)}`}>
                    {plot.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    plot.possession ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {plot.possession ? 'Available' : 'Not Available'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMiscColor(plot.miscellaneous.type)}`}>
                    {plot.miscellaneous.type}
                  </span>
                  {plot.miscellaneous.description && (
                    <div className="text-xs text-gray-500 mt-1" title={plot.miscellaneous.description}>
                      {plot.miscellaneous.description.length > 20 
                        ? `${plot.miscellaneous.description.substring(0, 20)}...`
                        : plot.miscellaneous.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Sale: {new Date(plot.dateOfSale).toLocaleDateString()}</div>
                  <div>Purchase: {new Date(plot.dateOfPurchase).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onPlotSelect(plot)}
                      className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                    >
                      View
                    </button>
                    {onPlotEdit && (
                      <button
                        onClick={() => onPlotEdit(plot)}
                        className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                      >
                        Edit
                      </button>
                    )}
                    {onPlotDelete && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete plot ${plot.plotNumber}?`)) {
                            onPlotDelete(plot.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {plots.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No plots</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new plot to this land.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandList;
