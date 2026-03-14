import React, { useState, useEffect } from 'react';
import { PersonInfo, BankDetails, AreaUnit, PlotDetails } from '../../types';
import { formatArea, getAllEquivalentAreas } from '../../utils/areaConversion';

interface LandFormProps {
  onSubmit: (plotData: PlotDetails) => void;
  onCancel: () => void;
  remainingArea?: number;
  initialData?: PlotDetails;
  isEdit?: boolean;
}

const LandForm: React.FC<LandFormProps> = ({ onSubmit, onCancel, remainingArea, initialData, isEdit = false }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState(initialData || {
    plotNumber: '',
    privatePlotNumber: '',
    landArea: { value: 0, unit: 'sqft' as AreaUnit },
    plotArea: { value: 0, unit: 'sqft' as AreaUnit },
    size: { length: 0, width: 0, unit: 'sqft' as AreaUnit },
    status: 'open' as 'sold' | 'booked' | 'open',
    transactionType: 'sold' as 'sold' | 'purchased' | 'both',
    possession: false,
    miscellaneous: { type: 'normal' as 'disputed' | 'normal' | 'optional', description: '' },
    dateOfSale: '',
    dateOfPurchase: '',
    sellerInfo: { name: '', address: '', mobileNumber: '' } as PersonInfo,
    purchaserInfo: { name: '', address: '', mobileNumber: '' } as PersonInfo,
    sellingDetails: {
      bankName: '',
      accountNumber: '',
      transactionNumber: '',
      value: 0,
      balance: 0,
      creditedAmount: 0
    } as BankDetails,
    purchaseDetails: {
      bankName: '',
      accountNumber: '',
      transactionNumber: '',
      value: 0,
      balance: 0,
      debitedAmount: 0
    } as BankDetails,
    location: { gramSabha: '', fullAddress: '' }
  });

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && isEdit) {
      setFormData(initialData);
    }
  }, [initialData, isEdit]);

  // Auto-calculate balance when selling details change
  useEffect(() => {
    const totalValue = formData.sellingDetails.value || 0;
    const credited = formData.sellingDetails.creditedAmount || 0;
    const calculatedBalance = totalValue - credited;
    
    if (calculatedBalance !== formData.sellingDetails.balance) {
      setFormData(prev => ({
        ...prev,
        sellingDetails: {
          ...prev.sellingDetails,
          balance: calculatedBalance
        }
      }));
    }
  }, [formData.sellingDetails.value, formData.sellingDetails.creditedAmount]);

  // Auto-calculate balance for purchase details
  useEffect(() => {
    const totalValue = formData.purchaseDetails.value || 0;
    const debited = formData.purchaseDetails.debitedAmount || 0;
    const calculatedBalance = totalValue - debited;
    
    if (calculatedBalance !== formData.purchaseDetails.balance) {
      setFormData(prev => ({
        ...prev,
        purchaseDetails: {
          ...prev.purchaseDetails,
          balance: calculatedBalance
        }
      }));
    }
  }, [formData.purchaseDetails.value, formData.purchaseDetails.debitedAmount]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validations
    if (!formData.plotNumber.trim()) {
      newErrors.plotNumber = 'Plot number is required';
    }
    if (formData.sellerInfo.name && !/^[a-zA-Z\s]+$/.test(formData.sellerInfo.name)) {
      newErrors.sellerName = 'Seller name should contain only letters';
    }
    if (formData.purchaserInfo.name && !/^[a-zA-Z\s]+$/.test(formData.purchaserInfo.name)) {
      newErrors.purchaserName = 'Purchaser name should contain only letters';
    }

    // Phone number validations
    if (formData.sellerInfo.mobileNumber && !/^[0-9]{10}$/.test(formData.sellerInfo.mobileNumber)) {
      newErrors.sellerPhone = 'Seller phone must be 10 digits';
    }
    if (formData.purchaserInfo.mobileNumber && !/^[0-9]{10}$/.test(formData.purchaserInfo.mobileNumber)) {
      newErrors.purchaserPhone = 'Purchaser phone must be 10 digits';
    }

    // Area validations
    if (formData.landArea.value <= 0) {
      newErrors.landArea = 'Land area must be greater than 0';
    }
    if (formData.plotArea.value <= 0) {
      newErrors.plotArea = 'Plot area must be greater than 0';
    }
    if (formData.size.length <= 0 || formData.size.width <= 0) {
      newErrors.size = 'Length and width must be greater than 0';
    }

    // Currency validations
    if (formData.sellingDetails.value < 0) {
      newErrors.sellingValue = 'Selling value cannot be negative';
    }
    if ((formData.sellingDetails.creditedAmount || 0) < 0) {
      newErrors.creditedAmount = 'Credited amount cannot be negative';
    }
    if ((formData.sellingDetails.creditedAmount || 0) > formData.sellingDetails.value) {
      newErrors.creditedAmount = 'Credited amount cannot exceed total value';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix the validation errors before submitting');
      return;
    }

    onSubmit({
      ...formData,
      id: isEdit && 'id' in formData ? formData.id : `plot-${Date.now()}`
    });
  };

  const AreaInput = ({ label, value, onChange, error }: { label: string; value: any; onChange: (val: any) => void; error?: string }) => {
    const equivalents = getAllEquivalentAreas(value.value, value.unit);
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            inputMode="decimal"
            value={value.value || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, '');
              onChange({ ...value, value: parseFloat(val) || 0 });
            }}
            placeholder="Enter area"
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <select
            value={value.unit}
            onChange={(e) => onChange({ ...value, unit: e.target.value as AreaUnit })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sqft">sqft</option>
            <option value="sqm">sqm</option>
            <option value="yard">yard</option>
          </select>
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="text-xs text-gray-500">
          Equivalents: {formatArea(equivalents.sqft, 'sqft')} | {formatArea(equivalents.sqm, 'sqm')} | {formatArea(equivalents.yard, 'yard')}
        </div>
      </div>
    );
  };

  const CurrencyInput = ({ label, value, onChange, placeholder, error, readOnly = false }: { 
    label: string; 
    value: number; 
    onChange: (val: number) => void; 
    placeholder?: string;
    error?: string;
    readOnly?: boolean;
  }) => {
    const [displayValue, setDisplayValue] = useState(value ? value.toString() : '');

    useEffect(() => {
      setDisplayValue(value ? value.toString() : '');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) return;
      
      const inputValue = e.target.value;
      const cleanValue = inputValue.replace(/[^0-9.]/g, '');
      
      setDisplayValue(cleanValue);
      onChange(parseFloat(cleanValue) || 0);
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder || 'Enter amount'}
          readOnly={readOnly}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        {value > 0 && (
          <p className="text-xs text-gray-500">Rs {value.toLocaleString('en-IN')}</p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Plot Details' : 'Add New Plot Details'}
      </h2>
      
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Plot Number</label>
          <input
            type="text"
            value={formData.plotNumber}
            onChange={(e) => handleInputChange('plotNumber', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Private Plot Number</label>
          <input
            type="text"
            value={formData.privatePlotNumber}
            onChange={(e) => handleInputChange('privatePlotNumber', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Sale</label>
          <input
            type="date"
            value={formData.dateOfSale}
            onChange={(e) => handleInputChange('dateOfSale', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Purchase</label>
          <input
            type="date"
            value={formData.dateOfPurchase}
            onChange={(e) => handleInputChange('dateOfPurchase', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Area Information */}
      <div className="space-y-4">
        <AreaInput
          label="Land Area"
          value={formData.landArea}
          onChange={(val) => {
            handleNestedChange('landArea', 'value', val.value);
            handleNestedChange('landArea', 'unit', val.unit);
          }}
          error={errors.landArea}
        />
        <AreaInput
          label="Plot Area"
          value={formData.plotArea}
          onChange={(val) => {
            handleNestedChange('plotArea', 'value', val.value);
            handleNestedChange('plotArea', 'unit', val.unit);
          }}
          error={errors.plotArea}
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Size (Length x Width)</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              inputMode="decimal"
              value={formData.size.length || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                handleNestedChange('size', 'length', parseFloat(val) || 0);
              }}
              placeholder="Length"
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.size ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <span className="text-gray-500">×</span>
            <input
              type="text"
              inputMode="decimal"
              value={formData.size.width || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                handleNestedChange('size', 'width', parseFloat(val) || 0);
              }}
              placeholder="Width"
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.size ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <select
              value={formData.size.unit}
              onChange={(e) => handleNestedChange('size', 'unit', e.target.value as AreaUnit)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sqft">ft</option>
              <option value="sqm">m</option>
              <option value="yard">yard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Gram Sabha Location</label>
          <input
            type="text"
            value={formData.location.gramSabha}
            onChange={(e) => handleNestedChange('location', 'gramSabha', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Address</label>
          <textarea
            value={formData.location.fullAddress}
            onChange={(e) => handleNestedChange('location', 'fullAddress', e.target.value)}
            rows={2}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Status, Transaction Type and Possession */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="open">Open</option>
            <option value="booked">Booked</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
          <select
            value={formData.transactionType || 'sold'}
            onChange={(e) => handleInputChange('transactionType', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sold">Sold</option>
            <option value="purchased">Purchased</option>
            <option value="both">Both (Sold & Purchased)</option>
          </select>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="possession"
            checked={formData.possession}
            onChange={(e) => handleInputChange('possession', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="possession" className="ml-2 block text-sm text-gray-700">
            Possession Available
          </label>
        </div>
      </div>

      {/* Miscellaneous */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Miscellaneous Type</label>
          <select
            value={formData.miscellaneous.type}
            onChange={(e) => handleNestedChange('miscellaneous', 'type', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="disputed">Disputed</option>
            <option value="optional">Optional</option>
          </select>
        </div>
        {formData.miscellaneous.type === 'optional' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.miscellaneous.description}
              onChange={(e) => handleNestedChange('miscellaneous', 'description', e.target.value)}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional details for optional status..."
            />
          </div>
        )}
      </div>

      {/* Seller Information */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800">Seller Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.sellerInfo.name}
              onChange={(e) => handleNestedChange('sellerInfo', 'name', e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.sellerName ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.sellerName && <p className="text-red-500 text-xs mt-1">{errors.sellerName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="tel"
              value={formData.sellerInfo.mobileNumber}
              onChange={(e) => handleNestedChange('sellerInfo', 'mobileNumber', e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={10}
              placeholder="10 digit number"
              className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.sellerPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.sellerPhone && <p className="text-red-500 text-xs mt-1">{errors.sellerPhone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={formData.sellerInfo.address}
              onChange={(e) => handleNestedChange('sellerInfo', 'address', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Purchaser Information */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800">Purchaser Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.purchaserInfo.name}
              onChange={(e) => handleNestedChange('purchaserInfo', 'name', e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.purchaserName ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.purchaserName && <p className="text-red-500 text-xs mt-1">{errors.purchaserName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="tel"
              value={formData.purchaserInfo.mobileNumber}
              onChange={(e) => handleNestedChange('purchaserInfo', 'mobileNumber', e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={10}
              placeholder="10 digit number"
              className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.purchaserPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.purchaserPhone && <p className="text-red-500 text-xs mt-1">{errors.purchaserPhone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={formData.purchaserInfo.address}
              onChange={(e) => handleNestedChange('purchaserInfo', 'address', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Selling Details */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800">Selling Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
            <input
              type="text"
              value={formData.sellingDetails.bankName}
              onChange={(e) => handleNestedChange('sellingDetails', 'bankName', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Number</label>
            <input
              type="text"
              value={formData.sellingDetails.accountNumber}
              onChange={(e) => handleNestedChange('sellingDetails', 'accountNumber', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Transaction Number</label>
            <input
              type="text"
              value={formData.sellingDetails.transactionNumber}
              onChange={(e) => handleNestedChange('sellingDetails', 'transactionNumber', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <CurrencyInput
            label="Total Value"
            value={formData.sellingDetails.value}
            onChange={(val) => handleNestedChange('sellingDetails', 'value', val)}
            placeholder="Enter total amount"
            error={errors.sellingValue}
          />
          <CurrencyInput
            label="Credited Amount"
            value={formData.sellingDetails.creditedAmount || 0}
            onChange={(val) => handleNestedChange('sellingDetails', 'creditedAmount', val)}
            placeholder="Enter credited amount"
            error={errors.creditedAmount}
          />
          <CurrencyInput
            label="Balance (Auto-calculated)"
            value={formData.sellingDetails.balance}
            onChange={(val) => handleNestedChange('sellingDetails', 'balance', val)}
            placeholder="Auto-calculated"
            readOnly={true}
          />
        </div>
      </div>

      {/* Purchase Details */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800">Purchase Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
            <input
              type="text"
              value={formData.purchaseDetails.bankName}
              onChange={(e) => handleNestedChange('purchaseDetails', 'bankName', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Number</label>
            <input
              type="text"
              value={formData.purchaseDetails.accountNumber}
              onChange={(e) => handleNestedChange('purchaseDetails', 'accountNumber', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Transaction Number</label>
            <input
              type="text"
              value={formData.purchaseDetails.transactionNumber}
              onChange={(e) => handleNestedChange('purchaseDetails', 'transactionNumber', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <CurrencyInput
              label="Value"
              value={formData.purchaseDetails.value}
              onChange={(val) => handleNestedChange('purchaseDetails', 'value', val)}
              placeholder="Rs 0"
            />
          </div>
          <div>
            <CurrencyInput
              label="Balance"
              value={formData.purchaseDetails.balance}
              onChange={(val) => handleNestedChange('purchaseDetails', 'balance', val)}
              placeholder="Rs 0"
            />
          </div>
          <div>
            <CurrencyInput
              label="Debited Amount"
              value={formData.purchaseDetails.debitedAmount || 0}
              onChange={(val) => handleNestedChange('purchaseDetails', 'debitedAmount', val)}
              placeholder="Rs 0"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Plot
        </button>
      </div>
    </form>
  );
};

export default LandForm;
