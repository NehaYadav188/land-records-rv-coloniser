import React, { useState } from 'react';
import { PlotDetails } from '../../types';
import Logo from '../Logo';

interface SiteVisitModalProps {
  plot: PlotDetails & { landNumber: string };
  onClose: () => void;
}

const SiteVisitModal: React.FC<SiteVisitModalProps> = ({ plot, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    requestedDate: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Send WhatsApp notification with detailed information
    const whatsappNumber = '9415058167';
    const currentDate = new Date().toLocaleDateString('en-IN');
    const currentTime = new Date().toLocaleTimeString('en-IN');
    
    const message = `*RV Coloniser - Site Visit Request* 🏘️

*👤 User Information:*
• Name: ${formData.name}
• Email: ${formData.email}
• Phone: ${formData.phone}
• Date: ${currentDate}
• Time: ${currentTime}
• Requested Visit Date: ${formData.requestedDate}
• Message: ${formData.message}

*🏠 Property Details:*
• Land Number: ${plot.landNumber}
• Plot Number: ${plot.plotNumber}
• Private Plot Number: ${plot.privatePlotNumber}
• Status: ${plot.status.toUpperCase()}
• Possession: ${plot.possession ? 'Available' : 'Not Available'}

*📏 Area Information:*
• Land Area: ${plot.landArea.value} ${plot.landArea.unit}
• Plot Area: ${plot.plotArea.value} ${plot.plotArea.unit}
• Dimensions: ${plot.size.length} x ${plot.size.width} ${plot.size.unit}

*📍 Location:*
• Gram Sabha: ${plot.location.gramSabha}
• Full Address: ${plot.location.fullAddress}

*💰 Pricing:*
• Selling Price: Rs ${plot.sellingDetails.value.toLocaleString('en-IN')}
• Balance: Rs ${plot.sellingDetails.balance.toLocaleString('en-IN')}

*📞 Contact Information:*
• WhatsApp: ${whatsappNumber}
• Call: 9161811113

*🌐 Quick Links:*
• User Site: /land-records-rv-coloniser/
• Admin Portal: /land-records-rv-coloniser/#/admin

---
*This is a site visit request from RV Coloniser website. Please contact the customer to schedule the visit.*`;

    // URL encode the message
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with pre-filled message
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // Log for debugging
    console.log('Site visit request:', { plot: plot.plotNumber, ...formData });
    
    alert('Site visit request submitted successfully! We will contact you soon.');
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Logo size="sm" />
            <h3 className="text-lg font-bold text-gray-900">Book Site Visit</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900">{plot.plotNumber}</h4>
          <p className="text-sm text-blue-700">{plot.location.gramSabha}</p>
          <p className="text-sm text-blue-700">Area: {plot.plotArea.value} {plot.plotArea.unit}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Visit Date *
            </label>
            <input
              type="date"
              value={formData.requestedDate}
              onChange={(e) => handleInputChange('requestedDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any specific questions or requirements..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteVisitModal;
